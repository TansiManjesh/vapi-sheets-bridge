import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    if (!action) {
      return NextResponse.json({
        success: false,
        error: "No action specified",
      })
    }

    // Get credentials from environment variables
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsString) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set",
      })
    }

    // Get sheet ID from environment variables
    const sheetId = process.env.GOOGLE_SHEET_ID
    if (!sheetId) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable is not set",
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

    // Fix private key format
    const cleanCredentials = { ...credentials }
    if (credentials.private_key) {
      cleanCredentials.private_key = credentials.private_key.replace(/\\n/g, "\n")
    }

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: cleanCredentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create sheets client
    const sheets = google.sheets({ version: "v4", auth })

    // Perform the requested action
    switch (action) {
      case "test-connection":
        try {
          const response = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
          })

          return NextResponse.json({
            success: true,
            message: "Successfully connected to Google Sheets",
            spreadsheetTitle: response.data.properties?.title,
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: "Failed to connect to Google Sheets",
            details: error instanceof Error ? error.message : String(error),
          })
        }

      case "test-submission":
        try {
          const writeResponse = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: "Calls!A2",
            valueInputOption: "RAW",
            requestBody: {
              values: [
                [
                  "",
                  "Test User",
                  "1234567890",
                  "TEST123",
                  "Test Branch",
                  "yes",
                  "good",
                  "yes",
                  "yes",
                  "good",
                  "Test Location",
                  "good",
                  "yes",
                  "yes",
                  "yes",
                  "yes",
                  "Test feedback",
                  "NO",
                  new Date().toISOString(),
                  "Test",
                ],
              ],
            },
          })

          return NextResponse.json({
            success: true,
            message: "Successfully submitted test data to Google Sheets",
            updatedRange: writeResponse.data.updates?.updatedRange,
            updatedCells: writeResponse.data.updates?.updatedCells,
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: "Failed to submit test data to Google Sheets",
            details: error instanceof Error ? error.message : String(error),
          })
        }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
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
