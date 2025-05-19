"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function SheetAccessChecker() {
  const [checkStatus, setCheckStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [checkResult, setCheckResult] = useState<any>(null)

  const checkSheetAccess = async () => {
    setCheckStatus("loading")
    try {
      const response = await fetch("/api/check-sheet-access")
      const data = await response.json()

      setCheckResult(data)
      setCheckStatus(data.success ? "success" : "error")
    } catch (error) {
      setCheckStatus("error")
      setCheckResult({
        success: false,
        error: "Failed to check sheet access",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Google Sheet Access Checker</CardTitle>
        <CardDescription>Verify that your service account can access and modify the Google Sheet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will check if your service account can access and write to the Google Sheet specified in your
            GOOGLE_SHEET_ID environment variable.
          </p>

          <Button onClick={checkSheetAccess} disabled={checkStatus === "loading"} className="w-full">
            {checkStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Sheet Access...
              </>
            ) : (
              "Check Sheet Access"
            )}
          </Button>

          {checkStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Sheet Access Successful</AlertTitle>
              <AlertDescription>
                <p>Your service account can successfully access and write to the Google Sheet.</p>

                {checkResult.sheetInfo && (
                  <div className="mt-2">
                    <p>
                      <strong>Spreadsheet Title:</strong> {checkResult.sheetInfo.title}
                    </p>

                    {checkResult.sheetInfo.sheets && checkResult.sheetInfo.sheets.length > 0 && (
                      <div className="mt-1">
                        <strong>Available Sheets:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {checkResult.sheetInfo.sheets.map((sheet: any, index: number) => (
                            <li key={index}>{sheet.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {checkResult.writeResponse && (
                  <div className="mt-2">
                    <p>
                      <strong>Write Test:</strong> Successful
                    </p>
                    <p>
                      <strong>Sheet Written To:</strong> {checkResult.writeResponse.sheetWrittenTo}
                    </p>
                    <p>
                      <strong>Updated Range:</strong> {checkResult.writeResponse.updatedRange}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {checkStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Sheet Access Failed</AlertTitle>
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
                    <strong>Sheet ID:</strong> {checkResult.sheetId}
                  </p>
                )}

                {checkResult.serviceAccountEmail && (
                  <p>
                    <strong>Service Account Email:</strong> {checkResult.serviceAccountEmail}
                  </p>
                )}

                {checkResult.sheetInfo && (
                  <div className="mt-2">
                    <p>
                      <strong>Note:</strong> Your service account can read the spreadsheet but cannot write to it.
                    </p>
                    <p>
                      <strong>Spreadsheet Title:</strong> {checkResult.sheetInfo.title}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">How to fix:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Open your Google Sheet</li>
                    <li>Click the "Share" button in the top right</li>
                    <li>
                      {checkResult.serviceAccountEmail ? (
                        <>
                          Add the service account email: <strong>{checkResult.serviceAccountEmail}</strong>
                        </>
                      ) : (
                        "Add your service account email"
                      )}
                    </li>
                    <li>Give it "Editor" access (not just Viewer)</li>
                    <li>Uncheck "Notify people"</li>
                    <li>Click "Share"</li>
                    <li>
                      Verify that the sheet ID in your environment variables matches the ID in the URL of your Google
                      Sheet
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Even with valid credentials, your service account still needs explicit permission to access the Google Sheet.
        </p>
      </CardFooter>
    </Card>
  )
}
