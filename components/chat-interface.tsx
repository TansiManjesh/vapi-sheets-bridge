"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, User, Bot } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type ChatMessage = {
  message: string
  isUser: boolean
  timestamp: Date
}

export function ChatInterface() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      message: "Hello! I'm Honda's AI assistant. How can I help you with your Honda vehicle today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message to chat
    setChatHistory((prev) => [...prev, { message: userMessage, isUser: true, timestamp: new Date() }])

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
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add AI response to chat
      setChatHistory((prev) => [...prev, { message: data.response, isUser: false, timestamp: new Date() }])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please try again.",
        variant: "destructive",
      })

      // Add error message to chat
      setChatHistory((prev) => [
        ...prev,
        {
          message: "I'm sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
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
                  chat.isUser ? "bg-[#E40521] text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-1 ${chat.isUser ? "order-2" : "order-1"}`}>
                    {chat.isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`${chat.isUser ? "order-1" : "order-2"}`}>
                    <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {chat.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
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
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
