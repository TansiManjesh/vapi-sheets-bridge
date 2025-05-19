import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const logs = []

  try {
    logs.push("Starting sheet structure check")

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

      // Check if "Calls" sheet exists
      const hasCallsSheet = sheetNames.includes("Calls")
      logs.push(`"Calls" sheet exists: ${hasCallsSheet}`)

      // If Calls sheet exists, check its headers
      let headersMatch = false
      let headers = []

      if (hasCallsSheet) {
        logs.push("Checking headers in Calls sheet")
        try {
          const headersResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "Calls!A1:T1",
          })

          headers = headersResponse.data.values?.[0] || []
          logs.push(`Found headers: ${headers.join(", ")}`)

          // Expected headers
          const expectedHeaders = [
            "S.no",
            "Customer Name",
            "Phone Number",
            "Vehicle Number",
            "Branch",
            "Q1 - Job Card",
            "Q2 - Advisor",
            "Q3 - Add Work",
            "Q4 - Estimate",
            "Q5 - Service",
            "Q6 - Location",
            "Q7 - Clean",
            "Q8 - Bill Explain",
            "Q9 - On-Time",
            "Q10 - Job Conf",
            "Q11 - Delivery C",
            "Q12 - Response",
            "Escalation Flag",
            "Timestamp",
            "Status",
          ]

          // Check if headers match
          headersMatch = JSON.stringify(headers) === JSON.stringify(expectedHeaders)
          logs.push(`Headers match expected format: ${headersMatch}`)
        } catch (headersError) {
          logs.push(
            `ERROR getting headers: ${headersError instanceof Error ? headersError.message : String(headersError)}`,
          )
        }
      }

      // Try to write a test value to the Calls sheet
      let writeSuccess = false
      let writeResponse = null

      if (hasCallsSheet) {
        logs.push("Attempting to write test data to Calls sheet")
        try {
          writeResponse = await sheets.spreadsheets.values.append({
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

          logs.push(`Successfully wrote to Calls sheet at range: ${writeResponse.data.updates?.updatedRange}`)
          writeSuccess = true
        } catch (writeError) {
          logs.push(
            `ERROR writing to Calls sheet: ${writeError instanceof Error ? writeError.message : String(writeError)}`,
          )
        }
      }

      return NextResponse.json({
        success: true,
        spreadsheetTitle: response.data.properties?.title,
        sheetNames,
        hasCallsSheet,
        headers,
        headersMatch,
        writeSuccess,
        writeResponse: writeSuccess
          ? {
              updatedRange: writeResponse.data.updates?.updatedRange,
              updatedCells: writeResponse.data.updates?.updatedCells,
            }
          : null,
        logs,
        issues: !hasCallsSheet
          ? ["Missing 'Calls' sheet"]
          : !headersMatch
            ? ["Headers in 'Calls' sheet don't match expected format"]
            : !writeSuccess
              ? ["Cannot write to 'Calls' sheet"]
              : [],
        fixInstructions:
          !hasCallsSheet || !headersMatch
            ? [
                "Use the 'Create New Sheet' tool to create a properly structured Google Sheet",
                "Update your GOOGLE_SHEET_ID environment variable with the new sheet ID",
                "Redeploy your application",
              ]
            : !writeSuccess
              ? [
                  "Make sure your service account has Editor access to the sheet",
                  "Try using the 'Check Sheet Permissions' tool to diagnose permission issues",
                ]
              : [],
      })
    } catch (readError) {
      logs.push(`ERROR accessing spreadsheet: ${readError instanceof Error ? readError.message : String(readError)}`)

      return NextResponse.json({
        success: false,
        error: "Failed to access the spreadsheet",
        details: readError instanceof Error ? readError.message : String(readError),
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
