import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Create auth client using the separate environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    // Get data from the "Conversations" sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Conversations!A:C",
    })

    const rows = response.data.values || []

    // Skip the header row if it exists
    const dataRows = rows.length > 0 && rows[0][0] === "Timestamp" ? rows.slice(1) : rows

    // Format the data
    const conversations = dataRows.map((row) => ({
      timestamp: row[0] || "",
      userMessage: row[1] || "",
      aiResponse: row[2] || "",
    }))

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
