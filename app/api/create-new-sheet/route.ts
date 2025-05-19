import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
  const logs = []

  try {
    logs.push("Starting sheet creation process")

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

    // Fix private key format
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

    // Create a new spreadsheet
    logs.push("Attempting to create new spreadsheet")
    try {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: "Honda Customer Feedback",
          },
          sheets: [
            {
              properties: {
                title: "Calls",
              },
            },
          ],
        },
      })
      logs.push("Spreadsheet created successfully")

      const spreadsheetId = spreadsheet.data.spreadsheetId
      if (!spreadsheetId) {
        logs.push("ERROR: Created spreadsheet but ID is missing")
        throw new Error("Failed to get spreadsheet ID")
      }
      logs.push(`Spreadsheet ID: ${spreadsheetId}`)

      // Add headers to the spreadsheet
      logs.push("Adding headers to spreadsheet")
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Calls!A1:T1",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
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
            ],
          ],
        },
      })
      logs.push("Headers added successfully")

      // Format the header row
      logs.push("Formatting header row")
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9,
                    },
                    horizontalAlignment: "CENTER",
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
              },
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: "gridProperties.frozenRowCount",
              },
            },
          ],
        },
      })
      logs.push("Header row formatted successfully")

      // Add test data to verify write access
      logs.push("Adding test data to verify write access")
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Calls!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "1",
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
      logs.push("Test data added successfully")

      return NextResponse.json({
        success: true,
        message: "Google Sheet created and configured successfully",
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        logs,
        instructions: [
          "1. Open the spreadsheet using the link below",
          "2. Update your GOOGLE_SHEET_ID environment variable with this new ID",
          "3. Redeploy your application",
        ],
      })
    } catch (error) {
      logs.push(`ERROR during sheet creation: ${error instanceof Error ? error.message : String(error)}`)

      // Try to extract more detailed error information
      let apiErrorDetails = "No API error details available"
      if (error.response && error.response.data && error.response.data.error) {
        apiErrorDetails = JSON.stringify(error.response.data.error)
        logs.push(`API error details: ${apiErrorDetails}`)
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create Google Sheet",
          details: error instanceof Error ? error.message : String(error),
          apiError: apiErrorDetails,
          logs,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    logs.push(`FATAL ERROR: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
        logs,
      },
      { status: 500 },
    )
  }
}
