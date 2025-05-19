import { NextResponse } from "next/server"
import { detectIntent, detectCompany, getPromptTemplate, getSheetName } from "@/lib/intent-detection"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, chatHistory, companyId = "honda" } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Detect intent and company
    const detectedCompany = companyId || detectCompany(message)
    const intent = detectIntent(message, detectedCompany)

    // Get prompt template
    const promptTemplate = getPromptTemplate(intent, detectedCompany)

    // Format chat history for API
    const formattedHistory =
      chatHistory?.map((chat: any) => ({
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.content,
      })) || []

    // Add current message
    formattedHistory.push({
      role: "user",
      content: message,
    })

    // Make request to Flowise API
    const flowiseApiKey = process.env.FLOWISE_API_KEY
    const flowiseResponse = await fetch(
      "https://cloud.flowiseai.com/api/v1/prediction/cf29a384-89aa-4940-81d3-1a819e1167d0",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(flowiseApiKey ? { Authorization: `Bearer ${flowiseApiKey}` } : {}),
        },
        body: JSON.stringify({
          question: message,
          history: formattedHistory.length > 1 ? formattedHistory.slice(0, -1) : [],
          overrideConfig: {
            systemMessage: promptTemplate,
          },
        }),
      },
    )

    if (!flowiseResponse.ok) {
      const errorData = await flowiseResponse.text()
      console.error("Flowise API error:", errorData)
      return NextResponse.json({ error: "Failed to get response from AI" }, { status: flowiseResponse.status })
    }

    const data = await flowiseResponse.json()

    return NextResponse.json({
      response: data.text || data.result || "I'm sorry, I couldn't process that request.",
      intent: intent,
      company: detectedCompany,
      sheetName: getSheetName(intent, detectedCompany),
    })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
