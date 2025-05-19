"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function SetupConversationsSheet() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const setupSheet = async () => {
    setSetupStatus("loading")
    try {
      const response = await fetch("/api/create-conversations-sheet", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setSetupStatus("success")
      } else {
        setSetupStatus("error")
        setErrorMessage(data.error || "Failed to set up Conversations sheet")
      }
    } catch (error) {
      setSetupStatus("error")
      setErrorMessage("Network error when setting up Conversations sheet")
    }
  }

  // Automatically try to set up the sheet when the component mounts
  useEffect(() => {
    setupSheet()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Conversations Sheet Setup</CardTitle>
        <CardDescription>
          Set up the "Conversations" sheet in your Google Sheet to record customer interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {setupStatus === "loading" && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
              <p>Setting up Conversations sheet...</p>
            </div>
          )}

          {setupStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription>
                The "Conversations" sheet is set up and ready to record customer interactions.
              </AlertDescription>
            </Alert>
          )}

          {setupStatus === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Setup Error</AlertTitle>
              <AlertDescription>
                {errorMessage || "Failed to set up Conversations sheet. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {setupStatus === "error" && (
            <Button onClick={setupSheet} className="w-full">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This setup creates a new sheet named "Conversations" in your Google Sheet to record all customer interactions
          with the AI assistant.
        </p>
      </CardFooter>
    </Card>
  )
}
