"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function SheetCreator() {
  const [creationStatus, setCreationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [sheetId, setSheetId] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const createSheet = async () => {
    setCreationStatus("loading")
    try {
      const response = await fetch("/api/create-sheet", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setCreationStatus("success")
        setSheetId(data.spreadsheetId)
      } else {
        setCreationStatus("error")
        setErrorMessage(data.message || "Failed to create Google Sheet")
      }
    } catch (error) {
      setCreationStatus("error")
      setErrorMessage("Network error when creating Google Sheet")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create New Google Sheet</CardTitle>
        <CardDescription>
          Don't have a Google Sheet yet? Create a new one with the correct structure for the Honda Feedback System.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This will create a new Google Sheet with all the required columns for the Honda Feedback System. You'll need
            to have set up your Google Cloud project and service account first.
          </p>

          <Button onClick={createSheet} disabled={creationStatus === "loading"} className="w-full">
            {creationStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Sheet...
              </>
            ) : (
              "Create New Google Sheet"
            )}
          </Button>

          {creationStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription>
                <p>Google Sheet created successfully!</p>
                <p className="mt-2">
                  Your new Sheet ID: <code className="bg-gray-100 p-1 rounded">{sheetId}</code>
                </p>
                <p className="mt-2">
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open your new Google Sheet
                  </a>
                </p>
                <p className="mt-2 text-sm">
                  Make sure to update your <code>GOOGLE_SHEET_ID</code> environment variable with this new ID.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {creationStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Creation Error</AlertTitle>
              <AlertDescription>
                {errorMessage || "Failed to create Google Sheet. Please check your Google API credentials."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Note: You must have the Google Sheets API enabled and proper credentials set up for this to work.
        </p>
      </CardFooter>
    </Card>
  )
}
