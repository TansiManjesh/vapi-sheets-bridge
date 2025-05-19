"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ManualTestTool() {
  const [credentials, setCredentials] = useState("")
  const [sheetId, setSheetId] = useState("")
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testResult, setTestResult] = useState<any>(null)

  const runManualTest = async () => {
    if (!credentials || !sheetId) return

    setTestStatus("loading")
    try {
      const response = await fetch("/api/manual-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentials,
          sheetId,
        }),
      })

      const data = await response.json()
      setTestResult(data)
      setTestStatus(data.success ? "success" : "error")
    } catch (error) {
      setTestStatus("error")
      setTestResult({
        success: false,
        error: "Failed to run manual test",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Manual Connection Test</CardTitle>
        <CardDescription>Test your fixed credentials with a Google Sheet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            After fixing your credentials with the Private Key Fixer, use this tool to test if they work correctly.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credentials">Fixed Google Service Account Credentials (JSON)</Label>
              <Textarea
                id="credentials"
                placeholder="Paste your fixed JSON credentials here..."
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheet-id">Google Sheet ID</Label>
              <Input
                id="sheet-id"
                placeholder="Enter your Google Sheet ID..."
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This is the long string in your Google Sheet URL between /d/ and /edit
              </p>
            </div>

            <Button
              onClick={runManualTest}
              disabled={testStatus === "loading" || !credentials || !sheetId}
              className="w-full"
            >
              {testStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>

          {testStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Connection Successful!</AlertTitle>
              <AlertDescription>
                <p>Your fixed credentials successfully connected to and wrote to your Google Sheet!</p>

                {testResult.spreadsheetTitle && (
                  <p className="mt-2">
                    <strong>Spreadsheet Title:</strong> {testResult.spreadsheetTitle}
                  </p>
                )}

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

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Next steps:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to Environment Variables</li>
                    <li>Delete the current GOOGLE_SHEETS_CREDENTIALS variable</li>
                    <li>Add a new GOOGLE_SHEETS_CREDENTIALS variable with these fixed credentials</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Connection Failed</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {testResult?.error}
                </p>

                {testResult?.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {testResult.details}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This tool tests if your fixed credentials can successfully connect to and write to your Google Sheet.
        </p>
      </CardFooter>
    </Card>
  )
}
