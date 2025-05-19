import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Step 1: Check if credentials are available
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsString) {
      return NextResponse.json({
        success: false,
        stage: "credentials-check",
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set or empty",
      })
    }

    // Step 2: Try to parse credentials
    let credentials
    try {
      credentials = JSON.parse(credentialsString)
    } catch (e) {
      return NextResponse.json({
        success: false,
        stage: "credentials-parse",
        error: "Failed to parse GOOGLE_SHEETS_CREDENTIALS as JSON",
        details: e instanceof Error ? e.message : String(e),
        credentialsPreview:
          credentialsString.substring(0, 20) + "..." + credentialsString.substring(credentialsString.length - 20),
      })
    }

    // Step 3: Check if sheet ID is available
    const sheetId = process.env.GOOGLE_SHEET_ID
    if (!sheetId) {
      return NextResponse.json({
        success: false,
        stage: "sheet-id-check",
        error: "GOOGLE_SHEET_ID environment variable is not set or empty",
      })
    }

    // Step 4: Try to authenticate
    let auth
    try {
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })
    } catch (e) {
      return NextResponse.json({
        success: false,
        stage: "auth-creation",
        error: "Failed to create GoogleAuth instance",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Step 5: Try to create sheets client
    let sheets
    try {
      sheets = google.sheets({ version: "v4", auth })
    } catch (e) {
      return NextResponse.json({
        success: false,
        stage: "sheets-client-creation",
        error: "Failed to create Google Sheets client",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Step 6: Try to get spreadsheet info
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })

      return NextResponse.json({
        success: true,
        spreadsheetTitle: response.data.properties?.title,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
        sheets: response.data.sheets?.map((sheet) => ({
          title: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
        })),
      })
    } catch (e) {
      return NextResponse.json({
        success: false,
        stage: "spreadsheet-access",
        error: "Failed to access spreadsheet",
        details: e instanceof Error ? e.message : String(e),
        message: "This could be due to incorrect sheet ID or the service account doesn't have access to the sheet",
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
