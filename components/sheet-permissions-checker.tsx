"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SheetPermissionsChecker() {
  const [checkStatus, setCheckStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [checkResult, setCheckResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const checkPermissions = async () => {
    setCheckStatus("loading")
    try {
      const response = await fetch("/api/check-sheet-permissions")
      const data = await response.json()

      setLogs(data.logs || [])
      setCheckResult(data)
      setCheckStatus(data.success ? "success" : "error")
    } catch (error) {
      setCheckStatus("error")
      setCheckResult({
        success: false,
        error: "Failed to check sheet permissions",
        details: error instanceof Error ? error.message : String(error),
      })
      setLogs([`Client error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Google Sheet Permissions Checker</CardTitle>
        <CardDescription>
          Check if your service account has the correct permissions to write to your Google Sheet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will check if your service account has the correct permissions to write to your Google Sheet. It
            will also provide instructions on how to fix any permission issues.
          </p>

          <Button onClick={checkPermissions} disabled={checkStatus === "loading"} className="w-full">
            {checkStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Permissions...
              </>
            ) : (
              "Check Sheet Permissions"
            )}
          </Button>

          {checkStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Permissions Correct</AlertTitle>
              <AlertDescription>
                <p>Your service account has the correct permissions to write to your Google Sheet.</p>

                {checkResult.spreadsheetTitle && (
                  <p className="mt-2">
                    <strong>Spreadsheet Title:</strong> {checkResult.spreadsheetTitle}
                  </p>
                )}

                {checkResult.sheetNames && checkResult.sheetNames.length > 0 && (
                  <p>
                    <strong>Available Sheets:</strong> {checkResult.sheetNames.join(", ")}
                  </p>
                )}

                {checkResult.serviceAccountEmail && (
                  <p>
                    <strong>Service Account:</strong> {checkResult.serviceAccountEmail}
                  </p>
                )}

                {checkResult.writeResponse && (
                  <div className="mt-2">
                    <p>
                      <strong>Test Write Successful:</strong>
                    </p>
                    <p>
                      <strong>Updated Range:</strong> {checkResult.writeResponse.updatedRange}
                    </p>
                    <p>
                      <strong>Updated Cells:</strong> {checkResult.writeResponse.updatedCells}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Next steps:</strong>
                  <p className="mt-1 text-blue-700">
                    Your permissions are correct! If you're still having issues with the main application, try the
                    following:
                  </p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Make sure you're using the correct sheet name in your application</li>
                    <li>Check if your application is using the correct range format</li>
                    <li>Try redeploying your application</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {checkStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Permission Issue Detected</AlertTitle>
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
                    <strong>Issue:</strong> {checkResult.message}
                  </p>
                )}

                {checkResult.spreadsheetTitle && (
                  <p className="mt-2">
                    <strong>Spreadsheet Title:</strong> {checkResult.spreadsheetTitle}
                  </p>
                )}

                {checkResult.serviceAccountEmail && (
                  <p className="mt-2">
                    <strong>Service Account Email:</strong> {checkResult.serviceAccountEmail}
                  </p>
                )}

                {checkResult.sheetId && (
                  <p>
                    <strong>Sheet ID:</strong> {checkResult.sheetId}
                  </p>
                )}

                {checkResult.fixInstructions && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <strong className="text-blue-700">How to fix:</strong>
                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                      {checkResult.fixInstructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {logs.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="logs">
                <AccordionTrigger>View Detailed Logs ({logs.length} entries)</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-80">
                    {logs.map((log, index) => (
                      <div key={index} className={log.startsWith("ERROR") ? "text-red-600" : ""}>
                        {index + 1}. {log}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          Even with valid credentials, your service account still needs explicit permission to write to the Google
          Sheet.
        </p>
      </CardFooter>
    </Card>
  )
}
