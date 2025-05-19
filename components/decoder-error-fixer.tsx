"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function DecoderErrorFixer() {
  const [fixStatus, setFixStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [fixResult, setFixResult] = useState<any>(null)
  const [manualCredentials, setManualCredentials] = useState("")
  const [showManualFix, setShowManualFix] = useState(false)

  const fixDecoderError = async () => {
    setFixStatus("loading")
    try {
      const response = await fetch("/api/fix-decoder-error")
      const data = await response.json()

      setFixResult(data)
      setFixStatus(data.success ? "success" : "error")
    } catch (error) {
      setFixStatus("error")
      setFixResult({
        success: false,
        error: "Failed to fix decoder error",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const fixPrivateKey = () => {
    try {
      if (!manualCredentials) return

      // Parse the credentials
      const credentials = JSON.parse(manualCredentials)

      // Fix the private key by replacing literal \n with actual line breaks
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, "\n")
      }

      // Update the state with the fixed credentials
      setManualCredentials(JSON.stringify(credentials, null, 2))
    } catch (error) {
      alert("Error parsing credentials: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Fix DECODER Error</CardTitle>
        <CardDescription>
          Fix the "DECODER routines::unsupported" error by properly formatting the private key
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            The "DECODER routines::unsupported" error often occurs when the private key in your credentials doesn't have
            proper line breaks. This tool will attempt to fix that issue.
          </p>

          <Button onClick={fixDecoderError} disabled={fixStatus === "loading"} className="w-full">
            {fixStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Decoder Error...
              </>
            ) : (
              "Fix Decoder Error"
            )}
          </Button>

          {fixStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Authentication Successful</AlertTitle>
              <AlertDescription>
                <p>
                  {fixResult.fixRequired
                    ? "The private key was fixed and authentication was successful!"
                    : "Authentication was successful! No fixes were required."}
                </p>

                {fixResult.fixRequired && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <strong className="text-blue-700">Next steps:</strong>
                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                      <li>Go to your Vercel project settings</li>
                      <li>Navigate to Environment Variables</li>
                      <li>Delete the current GOOGLE_SHEETS_CREDENTIALS variable</li>
                      <li>
                        Use the "Manual Fix" option below to get properly formatted credentials and add them as a new
                        GOOGLE_SHEETS_CREDENTIALS variable
                      </li>
                      <li>Redeploy your application</li>
                    </ol>
                  </div>
                )}

                <Button variant="outline" className="mt-4" onClick={() => setShowManualFix(!showManualFix)}>
                  {showManualFix ? "Hide Manual Fix" : "Show Manual Fix Option"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {fixStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error Fixing Decoder Issue</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {fixResult.error}
                </p>

                {fixResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {fixResult.details}
                  </p>
                )}

                <Button variant="outline" className="mt-4" onClick={() => setShowManualFix(!showManualFix)}>
                  {showManualFix ? "Hide Manual Fix" : "Try Manual Fix"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showManualFix && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Manual Fix</h3>
              <p className="text-sm">
                Paste your Google service account JSON credentials below, and this tool will fix the private key format.
              </p>

              <div className="space-y-2">
                <Label htmlFor="manual-credentials">Service Account JSON Credentials</Label>
                <Textarea
                  id="manual-credentials"
                  placeholder="Paste your JSON credentials here..."
                  value={manualCredentials}
                  onChange={(e) => setManualCredentials(e.target.value)}
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>

              <Button onClick={fixPrivateKey} disabled={!manualCredentials} className="w-full">
                Fix Private Key Format
              </Button>

              {manualCredentials && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Instructions:</strong>
                  </p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-blue-700">
                    <li>Copy the entire fixed credentials above</li>
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to Environment Variables</li>
                    <li>Delete the current GOOGLE_SHEETS_CREDENTIALS variable</li>
                    <li>Add a new GOOGLE_SHEETS_CREDENTIALS variable with the fixed credentials</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          The "DECODER routines::unsupported" error is often caused by improper line breaks in the private key.
        </p>
      </CardFooter>
    </Card>
  )
}
