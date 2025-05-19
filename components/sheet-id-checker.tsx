"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SheetIdChecker() {
  const [checkStatus, setCheckStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [checkResult, setCheckResult] = useState<any>(null)
  const [newSheetId, setNewSheetId] = useState("")

  const checkSheetId = async () => {
    setCheckStatus("loading")
    try {
      const response = await fetch("/api/verify-sheet-id")
      const data = await response.json()

      setCheckResult(data)
      setCheckStatus(data.success ? "success" : "error")
    } catch (error) {
      setCheckStatus("error")
      setCheckResult({
        success: false,
        error: "Failed to check sheet ID",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const extractSheetId = () => {
    try {
      // Try to extract a sheet ID from a URL
      const url = newSheetId.trim()
      if (url.includes("docs.google.com/spreadsheets/d/")) {
        const matches = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
        if (matches && matches[1]) {
          setNewSheetId(matches[1])
        }
      }
    } catch (error) {
      // Just ignore errors in extraction
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Google Sheet ID Checker</CardTitle>
        <CardDescription>Verify that your Google Sheet ID is correctly formatted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will check if your GOOGLE_SHEET_ID environment variable contains a valid Google Sheet ID.
          </p>

          <Button onClick={checkSheetId} disabled={checkStatus === "loading"} className="w-full">
            {checkStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Sheet ID...
              </>
            ) : (
              "Check Current Sheet ID"
            )}
          </Button>

          {checkStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Sheet ID Format Valid</AlertTitle>
              <AlertDescription>
                <p>Your Google Sheet ID appears to be correctly formatted.</p>

                <p className="mt-2">
                  <strong>Sheet ID:</strong> {checkResult.sheetId}
                </p>

                <p className="mt-2">
                  <a
                    href={checkResult.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Open Google Sheet <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </p>

                <p className="mt-4 text-sm text-gray-600">
                  Note: This only checks the format of the ID, not whether the sheet exists or is accessible.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {checkStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Sheet ID Format Invalid</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {checkResult.error}
                </p>

                {checkResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {checkResult.details}
                  </p>
                )}

                {checkResult.message && (
                  <p className="mt-2">
                    <strong>Suggestion:</strong> {checkResult.message}
                  </p>
                )}

                {checkResult.sheetId && (
                  <p className="mt-2">
                    <strong>Current Sheet ID:</strong> {checkResult.sheetId}
                  </p>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">How to find your Google Sheet ID:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Open your Google Sheet in a browser</li>
                    <li>Look at the URL in the address bar</li>
                    <li>The Sheet ID is the long string of characters between "/d/" and "/edit"</li>
                    <li>
                      Example: https://docs.google.com/spreadsheets/d/
                      <strong>1pOfoLkCKzDa3T9GtcxiQ1erUevUYLm4FIClz3dm-lQw</strong>/edit
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Extract Sheet ID from URL</h3>
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheet URL or ID</Label>
              <Input
                id="sheet-url"
                placeholder="Paste Google Sheet URL or ID here..."
                value={newSheetId}
                onChange={(e) => setNewSheetId(e.target.value)}
                onBlur={extractSheetId}
              />
              <p className="text-xs text-gray-500">
                Paste a full Google Sheet URL and we'll extract the ID automatically when you click outside the field.
              </p>
            </div>

            {newSheetId && newSheetId.length > 20 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm">
                  <strong>Extracted Sheet ID:</strong> {newSheetId}
                </p>
                <p className="text-xs mt-2">
                  Update your GOOGLE_SHEET_ID environment variable with this value in your Vercel project settings.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          A valid Google Sheet ID is required for the Honda Feedback System to connect to your spreadsheet.
        </p>
      </CardFooter>
    </Card>
  )
}
