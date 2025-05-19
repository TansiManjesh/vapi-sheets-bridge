"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function DirectTestTool() {
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testResult, setTestResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const runDirectTest = async () => {
    setTestStatus("loading")
    try {
      const response = await fetch("/api/direct-test")
      const data = await response.json()

      setLogs(data.logs || [])
      setTestResult(data)
      setTestStatus(data.success ? "success" : "error")
    } catch (error) {
      setTestStatus("error")
      setTestResult({
        success: false,
        error: "Failed to run direct test",
        details: error instanceof Error ? error.message : String(error),
      })
      setLogs([`Client error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Direct Google Sheets Test</CardTitle>
        <CardDescription>
          A direct test that bypasses the normal API flow and attempts to connect directly to Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will attempt to connect directly to Google Sheets using a simplified approach that fixes common
            credential issues automatically.
          </p>

          <Button onClick={runDirectTest} disabled={testStatus === "loading"} className="w-full">
            {testStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Direct Test...
              </>
            ) : (
              "Run Direct Test"
            )}
          </Button>

          {testStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Direct Test Successful</AlertTitle>
              <AlertDescription>
                <p>Successfully connected to and wrote to Google Sheet!</p>

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
                  <strong className="text-blue-700">Good news!</strong>
                  <p className="mt-1 text-blue-700">
                    The direct test was successful, which means your credentials and sheet ID are correct, but there's
                    an issue with how they're being used in the main application. Please contact the developer with this
                    information.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Direct Test Failed</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {testResult.error}
                </p>

                {testResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {testResult.details}
                  </p>
                )}

                {testResult.message && (
                  <p className="mt-2">
                    <strong>Suggestion:</strong> {testResult.message}
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
          This direct test bypasses the normal API flow and attempts to connect directly to Google Sheets.
        </p>
      </CardFooter>
    </Card>
  )
}
