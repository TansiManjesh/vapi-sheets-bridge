import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const { userMessage, aiResponse, timestamp, intent, company, sheetName } = await request.json()

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

    // Use the provided sheet name or default to "Conversations"
    const targetSheet = sheetName || "Conversations"

    // Format the data for Google Sheets
    const row = [
      timestamp || new Date().toISOString(),
      company || "Honda",
      intent || "general",
      userMessage,
      aiResponse,
    ]

    try {
      // Append the data to the specified sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${targetSheet}!A:E`, // Using a separate sheet based on intent
        valueInputOption: "RAW",
        requestBody: {
          values: [row],
        },
      })
    } catch (error) {
      // If the sheet doesn't exist, create it and try again
      console.error("Error appending to sheet, attempting to create sheet:", error)

      try {
        // Add the sheet if it doesn't exist
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: targetSheet,
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: 10,
                    },
                  },
                },
              },
            ],
          },
        })

        // Add headers to the new sheet
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${targetSheet}!A1:E1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [["Timestamp", "Company", "Intent", "User Message", "AI Response"]],
          },
        })

        // Try appending the data again
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${targetSheet}!A:E`,
          valueInputOption: "RAW",
          requestBody: {
            values: [row],
          },
        })
      } catch (createError) {
        console.error("Error creating sheet:", createError)
        // If we still can't append, fall back to the Conversations sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Conversations!A:E",
          valueInputOption: "RAW",
          requestBody: {
            values: [row],
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording chat:", error)
    return NextResponse.json({ error: "Failed to record chat" }, { status: 500 })
  }
}
