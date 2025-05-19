"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, User, Bot } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { companies } from "@/lib/intent-detection"
import { VoiceChat } from "@/components/voice-chat"

type ChatMessage = {
  message: string
  isUser: boolean
  timestamp: Date
  intent?: string
  company?: string
}

type ChatInterfaceProps = {
  initialCompany?: string
}

export function ChatInterface({ initialCompany = "honda" }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [company, setCompany] = useState(initialCompany)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      message: `Hello! I'm ${companies[initialCompany]?.name || "Honda"}'s AI assistant. How can I help you today?`,
      isUser: false,
      timestamp: new Date(),
      company: initialCompany,
      intent: "general",
    },
  ])
  const [lastAiMessage, setLastAiMessage] = useState<string | null>(
    `Hello! I'm ${companies[initialCompany]?.name || "Honda"}'s AI assistant. How can I help you today?`,
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  // Update welcome message when company changes
  useEffect(() => {
    const welcomeMessage = `Hello! I'm ${companies[company]?.name || "Honda"}'s AI assistant. How can I help you today?`
    setChatHistory([
      {
        message: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
        company: company,
        intent: "general",
      },
    ])
    setLastAiMessage(welcomeMessage)
  }, [company])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setInput("")

    // Add user message to chat
    setChatHistory((prev) => [
      ...prev,
      {
        message: userMessage,
        isUser: true,
        timestamp: new Date(),
        company: company,
      },
    ])

    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: chatHistory,
          companyId: company,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const aiResponse = data.response
      const detectedIntent = data.intent
      const detectedCompany = data.company
      const sheetName = data.sheetName

      // Add AI response to chat
      setChatHistory((prev) => [
        ...prev,
        {
          message: aiResponse,
          isUser: false,
          timestamp: new Date(),
          intent: detectedIntent,
          company: detectedCompany,
        },
      ])

      // Update last AI message for voice
      setLastAiMessage(aiResponse)

      // Record the conversation in Google Sheets
      try {
        await fetch("/api/record-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString(),
            intent: detectedIntent,
            company: detectedCompany,
            sheetName: sheetName,
          }),
        })
      } catch (recordError) {
        console.error("Error recording conversation:", recordError)
        // Don't show an error to the user if recording fails
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please try again.",
        variant: "destructive",
      })

      // Add error message to chat
      const errorMessage = "I'm sorry, I encountered an error. Please try again."
      setChatHistory((prev) => [
        ...prev,
        {
          message: errorMessage,
          isUser: false,
          timestamp: new Date(),
          company: company,
          intent: "general",
        },
      ])
      setLastAiMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSendMessage(input)
  }

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Customer Service AI</h2>
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Company" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(companies).map(([id, companyData]) => (
              <SelectItem key={id} value={id}>
                {companyData.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                chat.isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  chat.isUser
                    ? "bg-[#E40521] text-white rounded-br-none"
                    : chat.company === "toyota"
                      ? "bg-blue-600 text-white rounded-bl-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-1 ${chat.isUser ? "order-2" : "order-1"}`}>
                    {chat.isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`${chat.isUser ? "order-1" : "order-2"}`}>
                    <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs opacity-50">
                        {chat.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {!chat.isUser && chat.intent && chat.intent !== "general" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-2">
                          {chat.intent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <VoiceChat onSendMessage={handleSendMessage} isProcessing={isLoading} lastAiMessage={lastAiMessage} />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
