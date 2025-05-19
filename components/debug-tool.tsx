"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Bug } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function DebugTool() {
  const [debugStatus, setDebugStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [debugResult, setDebugResult] = useState<any>(null)

  const runDiagnostics = async () => {
    setDebugStatus("loading")
    try {
      const response = await fetch("/api/debug-connection")
      const data = await response.json()

      setDebugResult(data)
      setDebugStatus(data.success ? "success" : "error")
    } catch (error) {
      setDebugStatus("error")
      setDebugResult({
        success: false,
        stage: "fetch",
        error: "Failed to fetch diagnostic results",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Connection Diagnostics Tool
        </CardTitle>
        <CardDescription>Get detailed information about your Google Sheets connection issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will check each step of the Google Sheets connection process and provide detailed error
            information to help troubleshoot issues.
          </p>

          <Button onClick={runDiagnostics} disabled={debugStatus === "loading"} className="w-full">
            {debugStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              "Run Connection Diagnostics"
            )}
          </Button>

          {debugStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Connection Successful</AlertTitle>
              <AlertDescription>
                <p>Successfully connected to Google Sheets!</p>
                <p className="mt-2">
                  Spreadsheet: <strong>{debugResult.spreadsheetTitle}</strong>
                </p>
                <p className="mt-1">
                  <a
                    href={debugResult.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open Spreadsheet
                  </a>
                </p>
                <Accordion type="single" collapsible className="w-full mt-2">
                  <AccordionItem value="details">
                    <AccordionTrigger>View Details</AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(debugResult, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AlertDescription>
            </Alert>
          )}

          {debugStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Connection Error</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error Stage:</strong> {debugResult?.stage}
                </p>
                <p className="mt-2">
                  <strong>Error Message:</strong> {debugResult?.error}
                </p>
                {debugResult?.details && (
                  <p className="mt-1">
                    <strong>Details:</strong> {debugResult.details}
                  </p>
                )}
                {debugResult?.message && (
                  <p className="mt-1">
                    <strong>Suggestion:</strong> {debugResult.message}
                  </p>
                )}
                <Accordion type="single" collapsible className="w-full mt-2">
                  <AccordionItem value="details">
                    <AccordionTrigger>View Full Diagnostic Data</AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(debugResult, null, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This tool helps identify specific issues with your Google Sheets integration.
        </p>
      </CardFooter>
    </Card>
  )
}
