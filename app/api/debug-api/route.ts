import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const logs = []

  try {
    logs.push("Starting API debug process")

    // Step 1: Check if credentials are available
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsString) {
      logs.push("ERROR: GOOGLE_SHEETS_CREDENTIALS environment variable is not set")
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set",
        logs,
      })
    }
    logs.push("Credentials environment variable exists")

    // Step 2: Try to parse credentials
    let credentials
    try {
      credentials = JSON.parse(credentialsString)
      logs.push("Successfully parsed credentials JSON")

      // Check if essential fields exist
      if (!credentials.client_email) {
        logs.push("ERROR: client_email is missing from credentials")
        return NextResponse.json({
          success: false,
          error: "client_email is missing from credentials",
          logs,
        })
      }
      logs.push(`Service account email: ${credentials.client_email}`)

      if (!credentials.private_key) {
        logs.push("ERROR: private_key is missing from credentials")
        return NextResponse.json({
          success: false,
          error: "private_key is missing from credentials",
          logs,
        })
      }
      logs.push("Private key exists in credentials")
    } catch (e) {
      logs.push(`ERROR: Failed to parse credentials as JSON: ${e instanceof Error ? e.message : String(e)}`)
      return NextResponse.json({
        success: false,
        error: "Failed to parse GOOGLE_SHEETS_CREDENTIALS as JSON",
        details: e instanceof Error ? e.message : String(e),
        logs,
      })
    }

    // Step 3: Check if sheet ID is available
    const sheetId = process.env.GOOGLE_SHEET_ID
    if (!sheetId) {
      logs.push("ERROR: GOOGLE_SHEET_ID environment variable is not set")
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable is not set",
        logs,
      })
    }
    logs.push(`Sheet ID: ${sheetId}`)

    // Step 4: Try to authenticate
    logs.push("Creating GoogleAuth instance")
    let auth
    try {
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
      logs.push("GoogleAuth instance created successfully")
    } catch (e) {
      logs.push(`ERROR: Failed to create GoogleAuth instance: ${e instanceof Error ? e.message : String(e)}`)
      return NextResponse.json({
        success: false,
        error: "Failed to create GoogleAuth instance",
        details: e instanceof Error ? e.message : String(e),
        logs,
      })
    }

    // Step 5: Try to create sheets client
    logs.push("Creating Google Sheets client")
    let sheets
    try {
      sheets = google.sheets({ version: "v4", auth })
      logs.push("Google Sheets client created successfully")
    } catch (e) {
      logs.push(`ERROR: Failed to create Google Sheets client: ${e instanceof Error ? e.message : String(e)}`)
      return NextResponse.json({
        success: false,
        error: "Failed to create Google Sheets client",
        details: e instanceof Error ? e.message : String(e),
        logs,
      })
    }

    // Step 6: Try to get spreadsheet info
    logs.push(`Attempting to access spreadsheet with ID: ${sheetId}`)
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      logs.push(`Successfully accessed spreadsheet: "${response.data.properties?.title}"`)

      // Step 7: Try to write a test value
      logs.push("Attempting to write test data to spreadsheet")
      try {
        const writeResponse = await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "Sheet1!A1",
          valueInputOption: "RAW",
          requestBody: {
            values: [["API Test", new Date().toISOString()]],
          },
        })

        logs.push(`Successfully wrote to spreadsheet at range: ${writeResponse.data.updates?.updatedRange}`)

        return NextResponse.json({
          success: true,
          message: "Successfully connected to and wrote to Google Sheet",
          spreadsheetTitle: response.data.properties?.title,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
          logs,
        })
      } catch (writeError) {
        logs.push(
          `ERROR: Failed to write to spreadsheet: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
        )

        // Try to extract more detailed error information
        if (writeError.response && writeError.response.data && writeError.response.data.error) {
          logs.push(`API error details: ${JSON.stringify(writeError.response.data.error)}`)
        }

        return NextResponse.json({
          success: false,
          error: "Could read the spreadsheet but failed to write to it",
          details: writeError instanceof Error ? writeError.message : String(writeError),
          message: "This is likely a permissions issue. Make sure the service account has Editor access to the sheet.",
          logs,
        })
      }
    } catch (readError) {
      logs.push(
        `ERROR: Failed to access spreadsheet: ${readError instanceof Error ? readError.message : String(readError)}`,
      )

      // Try to extract more detailed error information
      if (readError.response && readError.response.data && readError.response.data.error) {
        logs.push(`API error details: ${JSON.stringify(readError.response.data.error)}`)
      }

      return NextResponse.json({
        success: false,
        error: "Failed to access the spreadsheet",
        details: readError instanceof Error ? readError.message : String(readError),
        message: "This could be due to an incorrect sheet ID or the service account doesn't have access to the sheet.",
        logs,
      })
    }
  } catch (error) {
    logs.push(`FATAL ERROR: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
      logs,
    })
  }
}
