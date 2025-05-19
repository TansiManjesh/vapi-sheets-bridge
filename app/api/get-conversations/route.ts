import { NextResponse } from "next/server"
import { getConversations } from "@/lib/google-sheets"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sheetName = searchParams.get("sheet") || "Conversations"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const conversations = await getConversations(sheetName, limit)

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error in get-conversations API:", error)
    return NextResponse.json({ error: "Failed to retrieve conversations" }, { status: 500 })
  }
}
