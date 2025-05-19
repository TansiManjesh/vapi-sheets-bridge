import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Step 1: Get credentials
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsString) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set",
      })
    }

    // Step 2: Parse credentials
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

    // Step 3: Get sheet ID
    const sheetId = process.env.GOOGLE_SHEET_ID
    if (!sheetId) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable is not set",
      })
    }

    // Step 4: Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Step 5: Create sheets client
    const sheets = google.sheets({ version: "v4", auth })

    // Step 6: Try to get spreadsheet info
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      // Step 7: Try to write a test value to verify write permissions
      try {
        const writeResponse = await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "Sheet1!A1",
          valueInputOption: "RAW",
          requestBody: {
            values: [["Test value", new Date().toISOString()]],
          },
        })

        return NextResponse.json({
          success: true,
          message: "Successfully connected to and wrote to Google Sheet",
          spreadsheetTitle: response.data.properties?.title,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
          writeResponse: {
            updatedRange: writeResponse.data.updates?.updatedRange,
            updatedCells: writeResponse.data.updates?.updatedCells,
          },
        })
      } catch (writeError) {
        return NextResponse.json({
          success: false,
          stage: "write-test",
          error: "Could read the spreadsheet but failed to write to it",
          details: writeError instanceof Error ? writeError.message : String(writeError),
          apiError: writeError.response?.data?.error || "No API error details available",
          message: "This is likely a permissions issue. Make sure the service account has Editor access to the sheet.",
        })
      }
    } catch (readError) {
      return NextResponse.json({
        success: false,
        stage: "read-test",
        error: "Failed to access the spreadsheet",
        details: readError instanceof Error ? readError.message : String(readError),
        apiError: readError.response?.data?.error || "No API error details available",
        message: "This could be due to an incorrect sheet ID or the service account doesn't have access to the sheet.",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      stage: "unknown",
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
