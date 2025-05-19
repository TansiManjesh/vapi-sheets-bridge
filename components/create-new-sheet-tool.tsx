"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function CreateNewSheetTool() {
  const [creationStatus, setCreationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [creationResult, setCreationResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const createNewSheet = async () => {
    setCreationStatus("loading")
    try {
      const response = await fetch("/api/create-new-sheet", {
        method: "POST",
      })
      const data = await response.json()

      setLogs(data.logs || [])
      setCreationResult(data)
      setCreationStatus(data.success ? "success" : "error")
    } catch (error) {
      setCreationStatus("error")
      setCreationResult({
        success: false,
        error: "Failed to create new sheet",
        details: error instanceof Error ? error.message : String(error),
      })
      setLogs([`Client error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create New Google Sheet</CardTitle>
        <CardDescription>
          Create a brand new Google Sheet with the correct structure for the Honda Feedback System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will create a new Google Sheet with the correct structure and headers for the Honda Feedback
            System. It will also add a test row to verify that everything is working correctly.
          </p>

          <Button onClick={createNewSheet} disabled={creationStatus === "loading"} className="w-full">
            {creationStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating New Sheet...
              </>
            ) : (
              "Create New Google Sheet"
            )}
          </Button>

          {creationStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">New Sheet Created Successfully</AlertTitle>
              <AlertDescription>
                <p>A new Google Sheet has been created and configured for the Honda Feedback System.</p>

                <p className="mt-2">
                  <strong>New Sheet ID:</strong>{" "}
                  <code className="bg-gray-100 p-1 rounded">{creationResult.spreadsheetId}</code>
                </p>

                <p className="mt-2">
                  <a
                    href={creationResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Open New Google Sheet <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </p>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Next steps:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    {creationResult.instructions?.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    )) || (
                      <>
                        <li>Open the spreadsheet using the link above</li>
                        <li>Update your GOOGLE_SHEET_ID environment variable with this new ID</li>
                        <li>Redeploy your application</li>
                      </>
                    )}
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {creationStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Failed to Create New Sheet</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {creationResult.error}
                </p>

                {creationResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {creationResult.details}
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
          Creating a new sheet is often the simplest solution when you're having persistent issues with an existing
          sheet.
        </p>
      </CardFooter>
    </Card>
  )
}
