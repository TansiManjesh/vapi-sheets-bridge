import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

// Initialize auth
const initializeAuth = () => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || "{}")
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!clientEmail || !privateKey) {
      throw new Error("Missing Google credentials")
    }

    return new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
  } catch (error) {
    console.error("Error initializing Google auth:", error)
    throw error
  }
}

// Get or create sheet
export const getOrCreateSheet = async (sheetName: string) => {
  try {
    const auth = initializeAuth()
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || "", auth)
    await doc.loadInfo()

    // Try to get existing sheet
    let sheet = doc.sheetsByTitle[sheetName]

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = await doc.addSheet({
        title: sheetName,
        headerValues: ["timestamp", "userId", "userName", "userMessage", "aiResponse", "intent", "company", "channel"],
      })
    }

    return sheet
  } catch (error) {
    console.error(`Error getting/creating sheet ${sheetName}:`, error)
    throw error
  }
}

// Record conversation
export const recordConversation = async (data: {
  userId: string
  userName: string
  userMessage: string
  aiResponse: string
  intent?: string
  company?: string
  channel?: string
  sheetName?: string
}) => {
  try {
    const {
      userId,
      userName,
      userMessage,
      aiResponse,
      intent = "general",
      company = "honda",
      channel = "chat",
      sheetName = "Conversations",
    } = data

    const sheet = await getOrCreateSheet(sheetName)

    await sheet.addRow({
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userMessage,
      aiResponse,
      intent,
      company,
      channel,
    })

    return { success: true }
  } catch (error) {
    console.error("Error recording conversation:", error)
    return { success: false, error: error.message }
  }
}

// Get conversations
export const getConversations = async (sheetName = "Conversations", limit = 100) => {
  try {
    const sheet = await getOrCreateSheet(sheetName)
    const rows = await sheet.getRows()

    return rows
      .slice(-limit)
      .reverse()
      .map((row) => ({
        timestamp: row.get("timestamp"),
        userId: row.get("userId"),
        userName: row.get("userName"),
        userMessage: row.get("userMessage"),
        aiResponse: row.get("aiResponse"),
        intent: row.get("intent"),
        company: row.get("company"),
        channel: row.get("channel"),
      }))
  } catch (error) {
    console.error(`Error getting conversations from ${sheetName}:`, error)
    throw error
  }
}
