import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST() {
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

    // First, check if the Conversations sheet already exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const sheetExists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === "Conversations")

    if (!sheetExists) {
      // Add a new sheet named "Conversations"
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Conversations",
                },
              },
            },
          ],
        },
      })

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Conversations!A1:C1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["Timestamp", "Customer Query", "AI Response"]],
        },
      })

      // Format the header row
      const conversationsSheet = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === "Conversations")

      if (conversationsSheet?.properties?.sheetId) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: conversationsSheet.properties.sheetId,
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
                    sheetId: conversationsSheet.properties.sheetId,
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
      }
    }

    return NextResponse.json({
      success: true,
      message: "Conversations sheet is ready",
    })
  } catch (error) {
    console.error("Error creating Conversations sheet:", error)
    return NextResponse.json({ error: "Failed to create Conversations sheet" }, { status: 500 })
  }
}
