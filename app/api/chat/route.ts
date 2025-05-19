import { NextResponse } from "next/server"
import { detectIntent, detectCompany, getPromptTemplate, getSheetName } from "@/lib/intent-detection"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, chatHistory, companyId = "honda" } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Detect intent and company from message
    const detectedCompany = body.companyId || detectCompany(message)
    const intent = detectIntent(message, detectedCompany)

    // Get the appropriate prompt template based on intent
    const promptTemplate = getPromptTemplate(intent, detectedCompany)

    // Prepare the request to Flowise API
    const flowiseApiKey = process.env.FLOWISE_API_KEY

    // Format chat history for Flowise
    const formattedHistory =
      chatHistory?.map((chat: any) => ({
        role: chat.isUser ? "user" : "assistant",
        content: chat.message,
      })) || []

    // Add the current message
    formattedHistory.push({
      role: "user",
      content: message,
    })

    // Make request to the specific Flowise API endpoint
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
          history: formattedHistory.length > 1 ? formattedHistory.slice(0, -1) : [], // Exclude the current message from history
          overrideConfig: {
            systemMessage: promptTemplate, // Override the system message based on intent
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
