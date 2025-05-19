"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function TestFlowise() {
  const [input, setInput] = useState("Hey, how are you?")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setResponse("")

    try {
      const result = await fetch("https://cloud.flowiseai.com/api/v1/prediction/cf29a384-89aa-4940-81d3-1a819e1167d0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
        }),
      })

      const data = await result.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error("Error testing Flowise connection:", error)
      setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Flowise Connection</CardTitle>
        <CardDescription>Test the connection to your Flowise AI endpoint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Message</label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <Button onClick={testConnection} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Test Connection"}
        </Button>
        {response && (
          <div className="mt-4">
            <label className="text-sm font-medium">Response:</label>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto text-xs">{response}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        This test connects directly to your Flowise endpoint without using the API route.
      </CardFooter>
    </Card>
  )
}
