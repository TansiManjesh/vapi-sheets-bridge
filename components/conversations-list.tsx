"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

type Conversation = {
  timestamp: string
  userMessage: string
  aiResponse: string
}

export function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch("/api/get-conversations")

        if (!response.ok) {
          throw new Error("Failed to fetch conversations")
        }

        const data = await response.json()
        setConversations(data.conversations)
      } catch (err) {
        setError("Failed to load conversations. Please try again later.")
        console.error("Error fetching conversations:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer Conversations</CardTitle>
        <CardDescription>Recent interactions between customers and the AI assistant</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 p-4">No conversations recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer Query</TableHead>
                  <TableHead>AI Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conversation, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">{formatDate(conversation.timestamp)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{conversation.userMessage}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{conversation.aiResponse}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
