import { NextResponse } from "next/server"
import { recordConversation } from "@/lib/google-sheets"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, userName, userMessage, aiResponse, intent, company, channel, sheetName } = body

    if (!userMessage || !aiResponse) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await recordConversation({
      userId: userId || "anonymous",
      userName: userName || "Anonymous User",
      userMessage,
      aiResponse,
      intent,
      company,
      channel,
      sheetName,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to record conversation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in record-chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
