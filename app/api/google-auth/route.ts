import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // This endpoint can be used to verify Google Sheets API connection
    // It doesn't expose credentials but confirms if the connection works

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Just check if we can access the spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    })

    return NextResponse.json({
      status: "Connected",
      spreadsheetTitle: spreadsheet.data.properties?.title,
      message: "Successfully connected to Google Sheets API",
    })
  } catch (error) {
    console.error("Error connecting to Google Sheets:", error)
    return NextResponse.json(
      {
        status: "Error",
        message: "Failed to connect to Google Sheets API. Check your credentials.",
      },
      { status: 500 },
    )
  }
}
