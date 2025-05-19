"use server"

type FeedbackData = {
  process: string
  name: string
  phone: string
  vehicleNumber?: string
  location: string

  // Service specific fields matching the spreadsheet columns
  jobCardExplained?: string
  advisorBehavior?: string
  additionalWorkExplained?: string
  estimateProvided?: string
  serviceQuality?: string
  vehicleCleanliness?: string
  billExplained?: string
  deliveredOnTime?: string
  jobConfirmation?: string
  deliveryCall?: string

  // Sales specific fields
  salesExperience?: string
  salesPersonBehavior?: string

  additionalFeedback?: string
  timestamp: string
  needsEscalation: boolean
}

import { google } from "googleapis"

export async function submitFeedback(data: FeedbackData) {
  try {
    // Format the data to match the spreadsheet columns
    const formattedData = {
      customerName: data.name,
      phoneNumber: data.phone,
      vehicleNumber: data.vehicleNumber || "",
      branch: data.location,
      // Service quality questions
      q1_jobCard: data.jobCardExplained || "",
      q2_advisor: data.advisorBehavior || "",
      q3_addWork: data.additionalWorkExplained || "",
      q4_estimate: data.estimateProvided || "",
      q5_service: data.serviceQuality || "",
      q6_location: data.location || "",
      q7_clean: data.vehicleCleanliness || "",
      q8_billExplain: data.billExplained || "",
      q9_onTime: data.deliveredOnTime || "",
      q10_jobConf: data.jobConfirmation || "",
      q11_deliveryC: data.deliveryCall || "",
      q12_response: data.additionalFeedback || "",
      // Metadata
      escalationFlag: data.needsEscalation ? "YES" : "NO",
      timestamp: data.timestamp,
      status: "New",
    }

    console.log("Feedback data to be sent to Google Sheets:", formattedData)

    // In a real implementation, you would:
    // 1. Authenticate with Google Sheets API
    // 2. Append the data to your spreadsheet

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID, // This should be "1pOfoLkCKzDa3T9GtcxiQ1erUevUYLm4FIClz3dm-lQw"
      range: "Calls!A:T", // Update this to match your sheet name and range
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

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Error submitting feedback:", error)
    throw new Error("Failed to submit feedback")
  }
}
