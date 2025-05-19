import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const logs = []

  try {
    logs.push("Starting direct test")

    // Get environment variables
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!credentialsString) {
      logs.push("ERROR: GOOGLE_SHEETS_CREDENTIALS is not set")
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS is not set",
        logs,
      })
    }

    if (!sheetId) {
      logs.push("ERROR: GOOGLE_SHEET_ID is not set")
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEET_ID is not set",
        logs,
      })
    }

    logs.push(`Sheet ID: ${sheetId}`)

    // Try to parse credentials
    let credentials
    try {
      logs.push("Parsing credentials")
      credentials = JSON.parse(credentialsString)
      logs.push("Credentials parsed successfully")
      logs.push(`Service account email: ${credentials.client_email}`)
    } catch (e) {
      logs.push(`ERROR parsing credentials: ${e instanceof Error ? e.message : String(e)}`)
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials",
        details: e instanceof Error ? e.message : String(e),
        logs,
      })
    }

    // Create a completely new credentials object with proper formatting
    const cleanCredentials = {
      type: credentials.type,
      project_id: credentials.project_id,
      private_key_id: credentials.private_key_id,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
      client_email: credentials.client_email,
      client_id: credentials.client_id,
      auth_uri: credentials.auth_uri,
      token_uri: credentials.token_uri,
      auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url,
      client_x509_cert_url: credentials.client_x509_cert_url,
    }

    logs.push("Created clean credentials object")

    // Try to authenticate
    try {
      logs.push("Creating auth client")
      const auth = new google.auth.GoogleAuth({
        credentials: cleanCredentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
      logs.push("Auth client created successfully")

      // Create sheets client
      logs.push("Creating sheets client")
      const sheets = google.sheets({ version: "v4", auth })
      logs.push("Sheets client created successfully")

      // Try to get spreadsheet info
      logs.push(`Attempting to access spreadsheet with ID: ${sheetId}`)
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
        })

        logs.push(`Successfully accessed spreadsheet: "${response.data.properties?.title}"`)

        // Try to write a test value
        logs.push("Attempting to write test data to spreadsheet")
        try {
          const writeResponse = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            requestBody: {
              values: [["Direct Test", new Date().toISOString()]],
            },
          })

          logs.push(`Successfully wrote to spreadsheet at range: ${writeResponse.data.updates?.updatedRange}`)

          return NextResponse.json({
            success: true,
            message: "Successfully connected to and wrote to Google Sheet",
            spreadsheetTitle: response.data.properties?.title,
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
            message:
              "This is likely a permissions issue. Make sure the service account has Editor access to the sheet.",
            logs,
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
          message:
            "This could be due to an incorrect sheet ID or the service account doesn't have access to the sheet.",
          logs,
        })
      }
    } catch (authError) {
      logs.push(`ERROR creating auth client: ${authError instanceof Error ? authError.message : String(authError)}`)
      return NextResponse.json({
        success: false,
        error: "Failed to create auth client",
        details: authError instanceof Error ? authError.message : String(authError),
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
