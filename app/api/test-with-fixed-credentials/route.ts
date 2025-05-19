import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const { credentials, sheetId } = await request.json()

    if (!credentials) {
      return NextResponse.json({
        success: false,
        error: "No credentials provided",
      })
    }

    if (!sheetId) {
      return NextResponse.json({
        success: false,
        error: "No sheet ID provided",
      })
    }

    // Parse credentials if they're a string
    let parsedCredentials
    try {
      parsedCredentials = typeof credentials === "string" ? JSON.parse(credentials) : credentials
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials as JSON",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Create auth client
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: parsedCredentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })

      // Create sheets client
      const sheets = google.sheets({ version: "v4", auth })

      // Try to get spreadsheet info
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      // Try to write a test value
      const writeResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["Test with fixed credentials", new Date().toISOString()]],
        },
      })

      return NextResponse.json({
        success: true,
        message: "Successfully connected to and wrote to Google Sheet with fixed credentials",
        spreadsheetTitle: response.data.properties?.title,
        writeResponse: {
          updatedRange: writeResponse.data.updates?.updatedRange,
          updatedCells: writeResponse.data.updates?.updatedCells,
        },
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: "Failed to connect to Google Sheets with fixed credentials",
        details: error instanceof Error ? error.message : String(error),
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
