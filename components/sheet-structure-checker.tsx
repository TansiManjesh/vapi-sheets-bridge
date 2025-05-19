"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SheetStructureChecker() {
  const [checkStatus, setCheckStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [checkResult, setCheckResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const checkStructure = async () => {
    setCheckStatus("loading")
    try {
      const response = await fetch("/api/check-sheet-structure")
      const data = await response.json()

      setLogs(data.logs || [])
      setCheckResult(data)
      setCheckStatus(data.success ? "success" : "error")
    } catch (error) {
      setCheckStatus("error")
      setCheckResult({
        success: false,
        error: "Failed to check sheet structure",
        details: error instanceof Error ? error.message : String(error),
      })
      setLogs([`Client error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Google Sheet Structure Checker</CardTitle>
        <CardDescription>
          Check if your Google Sheet has the correct structure for the Honda Feedback System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will check if your Google Sheet has the correct structure for the Honda Feedback System, including
            the required "Calls" sheet and the correct headers.
          </p>

          <Button onClick={checkStructure} disabled={checkStatus === "loading"} className="w-full">
            {checkStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Structure...
              </>
            ) : (
              "Check Sheet Structure"
            )}
          </Button>

          {checkStatus === "success" && checkResult.issues && checkResult.issues.length === 0 && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Sheet Structure Correct</AlertTitle>
              <AlertDescription>
                <p>Your Google Sheet has the correct structure for the Honda Feedback System.</p>

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

                {checkResult.writeSuccess && checkResult.writeResponse && (
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
                    Your sheet structure is correct! If you're still having issues with the main application, try the
                    following:
                  </p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Make sure your service account has Editor access to the sheet</li>
                    <li>Try redeploying your application</li>
                    <li>Check the application logs for any other errors</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {checkStatus === "success" && checkResult.issues && checkResult.issues.length > 0 && (
            <Alert className="mt-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-600">Sheet Structure Issues Detected</AlertTitle>
              <AlertDescription>
                <p>Your Google Sheet has some structure issues that need to be fixed:</p>

                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {checkResult.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-yellow-700">
                      {issue}
                    </li>
                  ))}
                </ul>

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

          {checkStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error Checking Sheet Structure</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {checkResult.error}
                </p>

                {checkResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {checkResult.details}
                  </p>
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
          The Honda Feedback System requires a specific sheet structure to work correctly.
        </p>
      </CardFooter>
    </Card>
  )
}
