import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const { userMessage, aiResponse, timestamp } = await request.json()

    if (!userMessage || !aiResponse) {
      return NextResponse.json({ error: "Message and response are required" }, { status: 400 })
    }

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

    // Format the data for Google Sheets
    const row = [timestamp || new Date().toISOString(), userMessage, aiResponse]

    // Append the data to the "Conversations" sheet
    // If the sheet doesn't exist, you may need to create it first
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Conversations!A:C", // Using a separate sheet for conversations
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording chat:", error)
    return NextResponse.json({ error: "Failed to record chat" }, { status: 500 })
  }
}
