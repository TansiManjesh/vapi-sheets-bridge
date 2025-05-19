import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Get the sheet ID
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!sheetId) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable is not set",
      })
    }

    // Get the credentials
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsString) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set",
      })
    }

    // Parse credentials
    let credentials
    try {
      credentials = JSON.parse(credentialsString)
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials as JSON",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create sheets client
    const sheets = google.sheets({ version: "v4", auth })

    // Try to get spreadsheet info
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      // Check if we can access the sheet
      const sheetInfo = {
        title: response.data.properties?.title,
        sheets: response.data.sheets?.map((sheet) => ({
          title: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
        })),
      }

      // Try to check if the "Calls" sheet exists
      const callsSheet = sheetInfo.sheets?.find((sheet) => sheet.title === "Calls")

      // Try to write a test value to verify write permissions
      try {
        // Determine which sheet to write to
        const writeToSheet = callsSheet ? "Calls" : sheetInfo.sheets?.[0]?.title || "Sheet1"

        const writeResponse = await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${writeToSheet}!A1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [["Sheet Access Test", new Date().toISOString()]],
          },
        })

        return NextResponse.json({
          success: true,
          message: "Successfully accessed and wrote to Google Sheet",
          sheetInfo,
          writeResponse: {
            updatedRange: writeResponse.data.updates?.updatedRange,
            updatedCells: writeResponse.data.updates?.updatedCells,
            sheetWrittenTo: writeToSheet,
          },
        })
      } catch (writeError) {
        return NextResponse.json({
          success: false,
          error: "Could read the spreadsheet but failed to write to it",
          details: writeError instanceof Error ? writeError.message : String(writeError),
          apiError: writeError.response?.data?.error || "No API error details available",
          message: "This is likely a permissions issue. Make sure the service account has Editor access to the sheet.",
          sheetInfo,
        })
      }
    } catch (readError) {
      return NextResponse.json({
        success: false,
        error: "Failed to access the spreadsheet",
        details: readError instanceof Error ? readError.message : String(readError),
        apiError: readError.response?.data?.error || "No API error details available",
        message: "This could be due to an incorrect sheet ID or the service account doesn't have access to the sheet.",
        sheetId,
        serviceAccountEmail: credentials.client_email,
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
