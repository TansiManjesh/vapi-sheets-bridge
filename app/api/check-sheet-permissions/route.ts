import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const logs = []

  try {
    logs.push("Starting sheet permissions check")

    // Get credentials from environment variables
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

    // Get sheet ID from environment variables
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

    // Parse credentials
    let credentials
    try {
      credentials = JSON.parse(credentialsString)
      logs.push("Successfully parsed credentials JSON")
    } catch (e) {
      logs.push(`ERROR: Failed to parse credentials as JSON: ${e instanceof Error ? e.message : String(e)}`)
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials as JSON",
        details: e instanceof Error ? e.message : String(e),
        logs,
      })
    }

    // Extract service account email
    const serviceAccountEmail = credentials.client_email
    if (!serviceAccountEmail) {
      logs.push("ERROR: No client_email found in credentials")
      return NextResponse.json({
        success: false,
        error: "No client_email found in credentials",
        logs,
      })
    }
    logs.push(`Service account email: ${serviceAccountEmail}`)

    // Fix private key format if needed
    const cleanCredentials = { ...credentials }
    if (credentials.private_key) {
      cleanCredentials.private_key = credentials.private_key.replace(/\\n/g, "\n")
      logs.push("Fixed private key format")
    }

    // Create auth client
    logs.push("Creating GoogleAuth instance")
    const auth = new google.auth.GoogleAuth({
      credentials: cleanCredentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    logs.push("GoogleAuth instance created")

    // Create sheets client
    logs.push("Creating Google Sheets client")
    const sheets = google.sheets({ version: "v4", auth })
    logs.push("Google Sheets client created")

    // Try to get spreadsheet info
    logs.push(`Attempting to access spreadsheet with ID: ${sheetId}`)
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      logs.push(`Successfully accessed spreadsheet: "${response.data.properties?.title}"`)

      // Get sheet names
      const sheetNames = response.data.sheets?.map((sheet) => sheet.properties?.title) || []
      logs.push(`Sheet names: ${sheetNames.join(", ")}`)

      // Try to write a test value
      logs.push("Attempting to write test data to spreadsheet")
      try {
        // Try to write to the first sheet
        const firstSheet = sheetNames[0] || "Sheet1"
        const writeResponse = await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${firstSheet}!A1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [["Permission Test", new Date().toISOString()]],
          },
        })

        logs.push(`Successfully wrote to spreadsheet at range: ${writeResponse.data.updates?.updatedRange}`)

        return NextResponse.json({
          success: true,
          message: "Successfully connected to and wrote to Google Sheet",
          spreadsheetTitle: response.data.properties?.title,
          sheetNames,
          serviceAccountEmail,
          writeResponse: {
            updatedRange: writeResponse.data.updates?.updatedRange,
            updatedCells: writeResponse.data.updates?.updatedCells,
          },
          logs,
        })
      } catch (writeError) {
        logs.push(
          `ERROR writing to spreadsheet: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
        )

        // Try to extract more detailed error information
        if (writeError.response && writeError.response.data && writeError.response.data.error) {
          logs.push(`API error details: ${JSON.stringify(writeError.response.data.error)}`)
        }

        return NextResponse.json({
          success: false,
          error: "Could read the spreadsheet but failed to write to it",
          details: writeError instanceof Error ? writeError.message : String(writeError),
          message: "This is a permissions issue. The service account can read the spreadsheet but cannot write to it.",
          spreadsheetTitle: response.data.properties?.title,
          sheetNames,
          serviceAccountEmail,
          logs,
          fixInstructions: [
            "1. Open your Google Sheet",
            "2. Click the 'Share' button in the top right",
            `3. Add the service account email: ${serviceAccountEmail}`,
            "4. Make sure to give it 'Editor' access (not just Viewer)",
            "5. Uncheck 'Notify people'",
            "6. Click 'Share'",
          ],
        })
      }
    } catch (readError) {
      logs.push(`ERROR accessing spreadsheet: ${readError instanceof Error ? readError.message : String(readError)}`)

      // Try to extract more detailed error information
      if (readError.response && readError.response.data && readError.response.data.error) {
        logs.push(`API error details: ${JSON.stringify(readError.response.data.error)}`)
      }

      return NextResponse.json({
        success: false,
        error: "Failed to access the spreadsheet",
        details: readError instanceof Error ? readError.message : String(readError),
        message: "The service account doesn't have access to the sheet or the sheet ID is incorrect.",
        serviceAccountEmail,
        sheetId,
        logs,
        fixInstructions: [
          "1. Verify that your sheet ID is correct",
          "2. Open your Google Sheet",
          "3. Click the 'Share' button in the top right",
          `4. Add the service account email: ${serviceAccountEmail}`,
          "5. Give it 'Editor' access",
          "6. Uncheck 'Notify people'",
          "7. Click 'Share'",
        ],
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
