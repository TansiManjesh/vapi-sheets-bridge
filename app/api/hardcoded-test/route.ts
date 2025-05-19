import { NextResponse } from "next/server"
import { google } from "googleapis"

// This is a last resort test that uses hardcoded credentials
// IMPORTANT: Replace these with your actual credentials before using
const HARDCODED_CREDENTIALS = {
  type: "service_account",
  project_id: "voice-ai-460305",
  private_key_id: "your-private-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  client_email: "voice-ai@voice-ai-460305.iam.gserviceaccount.com",
  client_id: "your-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/voice-ai%40voice-ai-460305.iam.gserviceaccount.com",
}

// Replace with your actual sheet ID
const HARDCODED_SHEET_ID = "1pOfoLkCKzDa3T9GtcxiQ1erUevUYLm4FIClz3dm-lQw"

export async function GET() {
  const logs = []

  try {
    logs.push("Starting hardcoded test")

    // Try to authenticate with hardcoded credentials
    try {
      logs.push("Creating auth client with hardcoded credentials")
      const auth = new google.auth.GoogleAuth({
        credentials: HARDCODED_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
      logs.push("Auth client created successfully")

      // Create sheets client
      logs.push("Creating sheets client")
      const sheets = google.sheets({ version: "v4", auth })
      logs.push("Sheets client created successfully")

      // Try to get spreadsheet info
      logs.push(`Attempting to access spreadsheet with ID: ${HARDCODED_SHEET_ID}`)
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: HARDCODED_SHEET_ID,
        })

        logs.push(`Successfully accessed spreadsheet: "${response.data.properties?.title}"`)

        // Try to write a test value
        logs.push("Attempting to write test data to spreadsheet")
        try {
          const writeResponse = await sheets.spreadsheets.values.append({
            spreadsheetId: HARDCODED_SHEET_ID,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            requestBody: {
              values: [["Hardcoded Test", new Date().toISOString()]],
            },
          })

          logs.push(`Successfully wrote to spreadsheet at range: ${writeResponse.data.updates?.updatedRange}`)

          return NextResponse.json({
            success: true,
            message: "Successfully connected to and wrote to Google Sheet with hardcoded credentials",
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
