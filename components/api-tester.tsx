"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function ApiTester() {
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testResult, setTestResult] = useState<any>(null)

  const runDetailedTest = async () => {
    setTestStatus("loading")
    try {
      const response = await fetch("/api/detailed-test")
      const data = await response.json()

      setTestResult(data)
      setTestStatus(data.success ? "success" : "error")
    } catch (error) {
      setTestStatus("error")
      setTestResult({
        success: false,
        error: "Failed to run test",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Detailed API Test</CardTitle>
        <CardDescription>
          Run a comprehensive test of your Google Sheets API connection with detailed error reporting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This test will attempt to read from and write to your Google Sheet to identify specific permission or API
            issues.
          </p>

          <Button onClick={runDetailedTest} disabled={testStatus === "loading"} className="w-full">
            {testStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Detailed Test...
              </>
            ) : (
              "Run Detailed API Test"
            )}
          </Button>

          {testStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">API Test Successful</AlertTitle>
              <AlertDescription>
                <p>Successfully connected to and wrote to Google Sheet!</p>
                <p className="mt-2">
                  <strong>Spreadsheet:</strong> {testResult.spreadsheetTitle}
                </p>
                <p className="mt-1">
                  <a
                    href={testResult.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Spreadsheet
                  </a>
                </p>
                {testResult.writeResponse && (
                  <div className="mt-2">
                    <p>
                      <strong>Updated Range:</strong> {testResult.writeResponse.updatedRange}
                    </p>
                    <p>
                      <strong>Updated Cells:</strong> {testResult.writeResponse.updatedCells}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">API Test Failed</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Stage:</strong> {testResult.stage || "Unknown"}
                  </p>
                  <p>
                    <strong>Error:</strong> {testResult.error || "Unknown error"}
                  </p>
                  {testResult.details && (
                    <p>
                      <strong>Details:</strong> {testResult.details}
                    </p>
                  )}
                  {testResult.apiError && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      <strong>API Error:</strong>
                      <pre>{JSON.stringify(testResult.apiError, null, 2)}</pre>
                    </div>
                  )}
                  {testResult.message && (
                    <p className="mt-2 text-sm font-medium">
                      <strong>Suggestion:</strong> {testResult.message}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This test provides detailed information about your Google Sheets API connection.
        </p>
      </CardFooter>
    </Card>
  )
}
