"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function CredentialsChecker() {
  const [checkStatus, setCheckStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [checkResult, setCheckResult] = useState<any>(null)

  const checkCredentials = async () => {
    setCheckStatus("loading")
    try {
      const response = await fetch("/api/check-credentials-format")
      const data = await response.json()

      setCheckResult(data)
      setCheckStatus(data.success ? "success" : "error")
    } catch (error) {
      setCheckStatus("error")
      setCheckResult({
        success: false,
        error: "Failed to check credentials",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Credentials Format Checker</CardTitle>
        <CardDescription>Check if your Google service account credentials are properly formatted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will check your GOOGLE_SHEETS_CREDENTIALS environment variable for common formatting issues that
            could cause connection problems.
          </p>

          <Button onClick={checkCredentials} disabled={checkStatus === "loading"} className="w-full">
            {checkStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Credentials...
              </>
            ) : (
              "Check Credentials Format"
            )}
          </Button>

          {checkStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Credentials Format Valid</AlertTitle>
              <AlertDescription>
                <p>Your credentials appear to be properly formatted.</p>
                {checkResult.clientEmail && (
                  <p className="mt-2">
                    <strong>Service Account Email:</strong> {checkResult.clientEmail}
                  </p>
                )}
                {checkResult.projectId && (
                  <p>
                    <strong>Project ID:</strong> {checkResult.projectId}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {checkStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Credentials Format Issues</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {checkResult.error}
                </p>

                {checkResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {checkResult.details}
                  </p>
                )}

                {checkResult.issues && checkResult.issues.length > 0 && (
                  <div className="mt-2">
                    <strong>Issues Found:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {checkResult.issues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {checkResult.credentialsPreview && (
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="preview">
                      <AccordionTrigger>View Credentials Preview</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-auto">
                          {checkResult.credentialsPreview}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">How to fix:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to Environment Variables</li>
                    <li>Delete the current GOOGLE_SHEETS_CREDENTIALS variable</li>
                    <li>Add it again with the ENTIRE JSON content of your service account key file</li>
                    <li>Make sure to include the opening and closing curly braces</li>
                    <li>Ensure there are no line breaks or extra spaces</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          The error "DECODER routines::unsupported" typically indicates a problem with the credentials format.
        </p>
      </CardFooter>
    </Card>
  )
}
