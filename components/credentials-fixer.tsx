"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function CredentialsFixer() {
  const [credentials, setCredentials] = useState("")
  const [fixStatus, setFixStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [fixResult, setFixResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const fixCredentials = async () => {
    setFixStatus("loading")
    try {
      const response = await fetch("/api/fix-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credentials }),
      })
      const data = await response.json()

      setFixResult(data)
      setFixStatus(data.success ? "success" : "error")
    } catch (error) {
      setFixStatus("error")
      setFixResult({
        success: false,
        error: "Failed to process credentials",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const copyToClipboard = () => {
    if (fixResult && fixResult.formattedCredentials) {
      navigator.clipboard.writeText(fixResult.formattedCredentials)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Credentials Formatter</CardTitle>
        <CardDescription>
          Format your Google service account credentials properly for use in environment variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            Paste your Google service account JSON credentials below, and this tool will format them properly for use in
            your Vercel environment variables.
          </p>

          <div className="space-y-2">
            <Label htmlFor="credentials">Service Account JSON Credentials</Label>
            <Textarea
              id="credentials"
              placeholder="Paste your JSON credentials here..."
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>

          <Button onClick={fixCredentials} disabled={fixStatus === "loading" || !credentials} className="w-full">
            {fixStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Format Credentials"
            )}
          </Button>

          {fixStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Credentials Formatted Successfully</AlertTitle>
              <AlertDescription>
                <p>Your credentials have been properly formatted for use in Vercel environment variables.</p>

                {fixResult.clientEmail && (
                  <p className="mt-2">
                    <strong>Service Account Email:</strong> {fixResult.clientEmail}
                  </p>
                )}

                <div className="mt-4">
                  <Label htmlFor="formatted-credentials">Formatted Credentials</Label>
                  <div className="relative">
                    <Textarea
                      id="formatted-credentials"
                      value={fixResult.formattedCredentials}
                      readOnly
                      className="pr-10 min-h-[100px] font-mono text-xs mt-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Next steps:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Copy the formatted credentials above</li>
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to Environment Variables</li>
                    <li>Delete the current GOOGLE_SHEETS_CREDENTIALS variable</li>
                    <li>Add it again with the formatted credentials</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {fixStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error Processing Credentials</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {fixResult.error}
                </p>

                {fixResult.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {fixResult.details}
                  </p>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Suggestions:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Make sure you're pasting the entire JSON file content</li>
                    <li>Ensure the JSON is valid and contains all required fields</li>
                    <li>Check that the private key is properly formatted with BEGIN and END markers</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This tool helps format your credentials properly to avoid the "DECODER routines::unsupported" error.
        </p>
      </CardFooter>
    </Card>
  )
}
