import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Format the data to match the spreadsheet columns
    const formattedData = {
      customerName: data.name || "Test User",
      phoneNumber: data.phone || "1234567890",
      vehicleNumber: data.vehicleNumber || "TEST123",
      branch: data.location || "Test Branch",
      // Service quality questions
      q1_jobCard: data.jobCardExplained || "yes",
      q2_advisor: data.advisorBehavior || "good",
      q3_addWork: data.additionalWorkExplained || "yes",
      q4_estimate: data.estimateProvided || "yes",
      q5_service: data.serviceQuality || "good",
      q6_location: data.location || "Test Location",
      q7_clean: data.vehicleCleanliness || "good",
      q8_billExplain: data.billExplained || "yes",
      q9_onTime: data.deliveredOnTime || "yes",
      q10_jobConf: data.jobConfirmation || "yes",
      q11_deliveryC: data.deliveryCall || "yes",
      q12_response: data.additionalFeedback || "Test feedback",
      // Metadata
      escalationFlag: data.needsEscalation ? "YES" : "NO",
      timestamp: new Date().toISOString(),
      status: "Test",
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID, // "1pOfoLkCKzDa3T9GtcxiQ1erUevUYLm4FIClz3dm-lQw"
      range: "Calls!A:T",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "", // S.no (will be auto-filled or calculated)
            formattedData.customerName,
            formattedData.phoneNumber,
            formattedData.vehicleNumber,
            formattedData.branch,
            formattedData.q1_jobCard,
            formattedData.q2_advisor,
            formattedData.q3_addWork,
            formattedData.q4_estimate,
            formattedData.q5_service,
            formattedData.q6_location,
            formattedData.q7_clean,
            formattedData.q8_billExplain,
            formattedData.q9_onTime,
            formattedData.q10_jobConf,
            formattedData.q11_deliveryC,
            formattedData.q12_response,
            formattedData.escalationFlag,
            formattedData.timestamp,
            formattedData.status,
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Test data submitted successfully",
      response: response.data,
    })
  } catch (error) {
    console.error("Error submitting test data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit test data to Google Sheets",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
