"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function AlternativeActions() {
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [actionResult, setActionResult] = useState<any>(null)
  const [currentAction, setCurrentAction] = useState<string>("")

  const performAction = async (action: string) => {
    setActionStatus("loading")
    setCurrentAction(action)

    try {
      const response = await fetch("/api/update-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      setActionResult(data)
      setActionStatus(data.success ? "success" : "error")
    } catch (error) {
      setActionStatus("error")
      setActionResult({
        success: false,
        error: "Failed to perform action",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const getActionTitle = (action: string) => {
    switch (action) {
      case "test-connection":
        return "Test Connection"
      case "test-submission":
        return "Test Submission"
      default:
        return "Action"
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Alternative Actions</CardTitle>
        <CardDescription>Try alternative methods to connect to and interact with Google Sheets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            These actions use a different approach to connect to Google Sheets, which might work even if the regular
            methods are failing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => performAction("test-connection")}
              disabled={actionStatus === "loading"}
              variant="outline"
            >
              {actionStatus === "loading" && currentAction === "test-connection" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            <Button
              onClick={() => performAction("test-submission")}
              disabled={actionStatus === "loading"}
              variant="outline"
            >
              {actionStatus === "loading" && currentAction === "test-submission" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Test Submission"
              )}
            </Button>
          </div>

          {actionStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">{getActionTitle(currentAction)} Successful</AlertTitle>
              <AlertDescription>
                <p>{actionResult.message}</p>

                {actionResult.spreadsheetTitle && (
                  <p className="mt-2">
                    <strong>Spreadsheet Title:</strong> {actionResult.spreadsheetTitle}
                  </p>
                )}

                {actionResult.updatedRange && (
                  <p className="mt-2">
                    <strong>Updated Range:</strong> {actionResult.updatedRange}
                  </p>
                )}

                {actionResult.updatedCells && (
                  <p>
                    <strong>Updated Cells:</strong> {actionResult.updatedCells}
                  </p>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Good news!</strong>
                  <p className="mt-1 text-blue-700">
                    The alternative method worked! This suggests that there's an issue with how the main application is
                    connecting to Google Sheets. Try using the direct test and other tools to further diagnose the
                    issue.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {actionStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">{getActionTitle(currentAction)} Failed</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {actionResult.error}
                </p>

                {actionResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {actionResult.details}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          These alternative methods use a different approach to connect to Google Sheets.
        </p>
      </CardFooter>
    </Card>
  )
}
