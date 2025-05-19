import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const timeRange = url.searchParams.get("timeRange") || "all"
    const company = url.searchParams.get("company") || "all"

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    // Get all sheets in the spreadsheet
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const sheetNames = sheetsResponse.data.sheets?.map((sheet) => sheet.properties?.title) || []

    // Filter out sheets that don't contain conversation data
    const conversationSheets = sheetNames.filter(
      (name) => name !== "Form Responses 1" && name !== "Sheet1" && name !== "Sheet2" && name !== "Sheet3",
    )

    let allConversations: any[] = []

    // Fetch data from each conversation sheet
    for (const sheetName of conversationSheets) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A:E`,
        })

        const rows = response.data.values || []

        // Skip header row
        if (rows.length > 1) {
          const sheetData = rows.slice(1).map((row) => ({
            timestamp: row[0] || "",
            company: row[1] || "honda",
            intent: row[2] || "general",
            userMessage: row[3] || "",
            aiResponse: row[4] || "",
            sheetName: sheetName,
          }))

          allConversations = [...allConversations, ...sheetData]
        }
      } catch (error) {
        console.error(`Error fetching data from sheet ${sheetName}:`, error)
      }
    }

    // Apply time range filter
    let filteredConversations = allConversations

    if (timeRange !== "all") {
      const now = new Date()
      let cutoffDate: Date

      switch (timeRange) {
        case "7days":
          cutoffDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "30days":
          cutoffDate = new Date(now.setDate(now.getDate() - 30))
          break
        case "90days":
          cutoffDate = new Date(now.setDate(now.getDate() - 90))
          break
        default:
          cutoffDate = new Date(0) // Beginning of time
      }

      filteredConversations = allConversations.filter((conv) => {
        try {
          return new Date(conv.timestamp) >= cutoffDate
        } catch (e) {
          return false
        }
      })
    }

    // Apply company filter
    if (company !== "all") {
      filteredConversations = filteredConversations.filter(
        (conv) => conv.company.toLowerCase() === company.toLowerCase(),
      )
    }

    // Sort by timestamp (newest first)
    filteredConversations.sort((a, b) => {
      try {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } catch (e) {
        return 0
      }
    })

    // Calculate analytics
    const analytics = {
      totalConversations: filteredConversations.length,
      intentBreakdown: {} as Record<string, number>,
      companyBreakdown: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>,
      averageResponseLength: 0,
    }

    let totalResponseLength = 0

    filteredConversations.forEach((conv) => {
      // Intent breakdown
      analytics.intentBreakdown[conv.intent] = (analytics.intentBreakdown[conv.intent] || 0) + 1

      // Company breakdown
      analytics.companyBreakdown[conv.company] = (analytics.companyBreakdown[conv.company] || 0) + 1

      // Daily activity
      try {
        const date = new Date(conv.timestamp).toISOString().split("T")[0]
        analytics.dailyActivity[date] = (analytics.dailyActivity[date] || 0) + 1
      } catch (e) {
        // Skip invalid dates
      }

      // Response length
      totalResponseLength += conv.aiResponse.length
    })

    // Calculate average response length
    analytics.averageResponseLength =
      filteredConversations.length > 0 ? totalResponseLength / filteredConversations.length : 0

    return NextResponse.json({
      conversations: filteredConversations,
      analytics,
    })
  } catch (error) {
    console.error("Error in analytics API route:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
