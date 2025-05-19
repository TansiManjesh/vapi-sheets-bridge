import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Create a new spreadsheet
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

    const spreadsheetId = spreadsheet.data.spreadsheetId

    if (!spreadsheetId) {
      throw new Error("Failed to create spreadsheet")
    }

    // Add headers to the spreadsheet
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

    // Format the header row
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

    return NextResponse.json({
      success: true,
      message: "Google Sheet created successfully",
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    })
  } catch (error) {
    console.error("Error creating Google Sheet:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Google Sheet",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
