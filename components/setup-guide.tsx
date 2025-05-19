"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SetupGuide() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [debugResult, setDebugResult] = useState<any>(null)
  const [debugStatus, setDebugStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [apiLogs, setApiLogs] = useState<string[]>([])

  const checkConnection = async () => {
    setConnectionStatus("loading")
    try {
      const response = await fetch("/api/google-auth")
      const data = await response.json()

      if (data.status === "Connected") {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setErrorMessage(data.message || "Failed to connect to Google Sheets")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Network error when checking connection")
    }
  }

  const testSubmission = async () => {
    setTestStatus("loading")
    try {
      const response = await fetch("/api/test-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test User",
          phone: "1234567890",
          vehicleNumber: "TEST123",
          location: "Test Location",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTestStatus("success")
      } else {
        setTestStatus("error")
        setErrorMessage(data.message || "Failed to submit test data")
      }
    } catch (error) {
      setTestStatus("error")
      setErrorMessage("Network error when submitting test data")
    }
  }

  const runDiagnostics = async () => {
    setDebugStatus("loading")
    try {
      // First, check if credentials are available
      const credentialsResponse = await fetch("/api/check-credentials")
      const credentialsData = await credentialsResponse.json()

      setDebugResult(credentialsData)
      setDebugStatus(credentialsData.success ? "success" : "error")
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

  const runApiTest = async () => {
    setDebugStatus("loading")
    setApiLogs([])
    try {
      const response = await fetch("/api/debug-api")
      const data = await response.json()

      setApiLogs(data.logs || [])
      setDebugResult(data)
      setDebugStatus(data.success ? "success" : "error")
    } catch (error) {
      setDebugStatus("error")
      setDebugResult({
        success: false,
        error: "Failed to run API test",
        details: error instanceof Error ? error.message : String(error),
      })
      setApiLogs([`Client error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Honda Feedback System Setup</CardTitle>
        <CardDescription>Follow these steps to set up your Google Sheets integration</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            <TabsTrigger value="test">Test Connection</TabsTrigger>
            <TabsTrigger value="debug">Diagnostics</TabsTrigger>
          </TabsList>
          <TabsContent value="setup" className="space-y-4 mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="step1">
                <AccordionTrigger>Step 1: Create Google Cloud Project</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Go to the{" "}
                      <a
                        href="https://console.cloud.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Create a new project or select an existing one</li>
                    <li>Navigate to &quot;APIs &amp; Services&quot; &gt; &quot;Library&quot;</li>
                    <li>Search for &quot;Google Sheets API&quot; and enable it</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step2">
                <AccordionTrigger>Step 2: Create Service Account</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to &quot;APIs &amp; Services&quot; &gt; &quot;Credentials&quot;</li>
                    <li>Click &quot;Create Credentials&quot; &gt; &quot;Service Account&quot;</li>
                    <li>Fill in the service account details and click &quot;Create&quot;</li>
                    <li>Skip the optional steps and click &quot;Done&quot;</li>
                    <li>Click on the newly created service account</li>
                    <li>Go to the &quot;Keys&quot; tab</li>
                    <li>Click &quot;Add Key&quot; &gt; &quot;Create new key&quot;</li>
                    <li>Select &quot;JSON&quot; and click &quot;Create&quot;</li>
                    <li>The key file will be downloaded to your computer</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step3">
                <AccordionTrigger>Step 3: Share Google Sheet</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Open your Google Sheet</li>
                    <li>Click the &quot;Share&quot; button in the top right</li>
                    <li>
                      Add the email address of your service account (it looks like:
                      voice-ai@voice-ai-460305.iam.gserviceaccount.com)
                    </li>
                    <li>Give it &quot;Editor&quot; access</li>
                    <li>Uncheck &quot;Notify people&quot;</li>
                    <li>Click &quot;Share&quot;</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step4">
                <AccordionTrigger>Step 4: Add Environment Variables</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>In your Vercel project, go to &quot;Settings&quot; &gt; &quot;Environment Variables&quot;</li>
                    <li>
                      Add a new variable named <code>GOOGLE_SHEETS_CREDENTIALS</code> with the entire content of the
                      JSON key file you downloaded
                    </li>
                    <li>
                      Add another variable named <code>GOOGLE_SHEET_ID</code> with the ID of your Google Sheet (the long
                      string in the URL between /d/ and /edit)
                    </li>
                    <li>Click &quot;Save&quot;</li>
                    <li>Redeploy your application for the changes to take effect</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Troubleshooting Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="/check-credentials" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium">Check Credentials Format</h4>
                  <p className="text-sm text-gray-500">Verify your Google service account credentials format</p>
                </a>
                <a href="/check-sheet-id" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium">Check Sheet ID</h4>
                  <p className="text-sm text-gray-500">Verify your Google Sheet ID is correctly formatted</p>
                </a>
                <a
                  href="/check-sheet-access"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Check Sheet Access</h4>
                  <p className="text-sm text-gray-500">Verify your service account can access the Google Sheet</p>
                </a>
                <a
                  href="/fix-decoder-error"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-yellow-50"
                >
                  <h4 className="font-medium">Fix DECODER Error</h4>
                  <p className="text-sm text-gray-500">Fix the "DECODER routines::unsupported" error</p>
                </a>
                <a
                  href="/test-fixed-credentials"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Test Fixed Credentials</h4>
                  <p className="text-sm text-gray-500">Test if your fixed credentials work properly</p>
                </a>
                <a href="/fix-credentials" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium">Fix Credentials</h4>
                  <p className="text-sm text-gray-500">Format your credentials properly for Vercel</p>
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Check Google Sheets Connection</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Verify that your application can connect to the Google Sheets API with your credentials.
                </p>
                <Button onClick={checkConnection} disabled={connectionStatus === "loading"}>
                  {connectionStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Connection"
                  )}
                </Button>

                {connectionStatus === "success" && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Success</AlertTitle>
                    <AlertDescription>Successfully connected to Google Sheets API.</AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "error" && (
                  <Alert className="mt-4 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-600">Connection Error</AlertTitle>
                    <AlertDescription>
                      {errorMessage || "Failed to connect to Google Sheets API. Please check your credentials."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">2. Test Data Submission</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Submit test data to your Google Sheet to verify the full integration.
                </p>
                <Button onClick={testSubmission} disabled={testStatus === "loading"}>
                  {testStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Test Data"
                  )}
                </Button>

                {testStatus === "success" && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Success</AlertTitle>
                    <AlertDescription>
                      Test data successfully submitted to Google Sheets. Check your spreadsheet for a new row with test
                      data.
                    </AlertDescription>
                  </Alert>
                )}

                {testStatus === "error" && (
                  <Alert className="mt-4 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-600">Submission Error</AlertTitle>
                    <AlertDescription>
                      {errorMessage || "Failed to submit test data. Please check your Google Sheets integration."}
                      {errorMessage && errorMessage.includes("DECODER") && (
                        <div className="mt-2">
                          <p>This appears to be a DECODER error. Try using our:</p>
                          <a href="/fix-decoder-error" className="text-blue-600 hover:underline block mt-1">
                            DECODER Error Fix Tool
                          </a>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Detailed API Diagnostics</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Run a comprehensive test of your Google Sheets API connection with detailed error reporting.
                </p>
                <Button onClick={runApiTest} disabled={debugStatus === "loading"} className="w-full">
                  {debugStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running API Test...
                    </>
                  ) : (
                    "Run Detailed API Test"
                  )}
                </Button>

                {debugStatus !== "idle" && (
                  <Alert
                    className={`mt-4 ${
                      debugStatus === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    {debugStatus === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle className={debugStatus === "success" ? "text-green-600" : "text-red-600"}>
                      {debugStatus === "success" ? "API Test Successful" : "API Test Failed"}
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        {debugResult && (
                          <>
                            {debugResult.error && (
                              <p>
                                <strong>Error:</strong> {debugResult.error}
                              </p>
                            )}
                            {debugResult.details && (
                              <p>
                                <strong>Details:</strong> {debugResult.details}
                              </p>
                            )}
                            {debugResult.message && (
                              <p>
                                <strong>Message:</strong> {debugResult.message}
                              </p>
                            )}
                            {debugStatus === "success" && debugResult.spreadsheetTitle && (
                              <p>
                                <strong>Spreadsheet Title:</strong> {debugResult.spreadsheetTitle}
                              </p>
                            )}
                            {debugStatus === "success" && debugResult.spreadsheetUrl && (
                              <p className="mt-2">
                                <a
                                  href={debugResult.spreadsheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Open Spreadsheet
                                </a>
                              </p>
                            )}
                            {debugResult.details && debugResult.details.includes("DECODER") && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <p>
                                  <strong>DECODER Error Detected:</strong> This specific error is often caused by
                                  improper line breaks in the private key.
                                </p>
                                <a href="/fix-decoder-error" className="text-blue-600 hover:underline block mt-1">
                                  Use our DECODER Error Fix Tool
                                </a>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {apiLogs.length > 0 && (
                  <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="logs">
                      <AccordionTrigger>View Detailed Logs ({apiLogs.length} entries)</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-80">
                          {apiLogs.map((log, index) => (
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">Need help? Contact your system administrator.</p>
      </CardFooter>
    </Card>
  )
}
