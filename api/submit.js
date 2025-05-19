// /api/submit.js
import { google } from "googleapis"

export async function POST(req) {
  const body = await req.json()

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })

  const sheetId = "1pOfoLkCKzDa3T9GtcxiQ1erUevUYLm4FIClz3dm-lQw"

  const row = [
    new Date().toISOString(),
    body.customerName || "",
    body.phoneNumber || "",
    body.vehicleNumber || "",
    body.branch || "",
    body.message || "",
    body.response || "",
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A1", // Change this if your sheet tab is named differently
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
