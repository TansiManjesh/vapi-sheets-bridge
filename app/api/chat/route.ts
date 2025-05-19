import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, chatHistory } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

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
    })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
