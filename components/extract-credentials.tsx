"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ExtractCredentials() {
  const [credentials, setCredentials] = useState("")
  const [extractedEmail, setExtractedEmail] = useState("")
  const [extractedKey, setExtractedKey] = useState("")
  const [extractStatus, setExtractStatus] = useState<"idle" | "success" | "error">("idle")
  const [copied, setCopied] = useState<"none" | "email" | "key">("none")

  const extractCredentials = () => {
    try {
      // Parse the credentials JSON
      const parsedCredentials = JSON.parse(credentials)

      // Extract client_email and private_key
      if (parsedCredentials.client_email && parsedCredentials.private_key) {
        setExtractedEmail(parsedCredentials.client_email)

        // Format the private key for environment variables
        // Replace newlines with \\n for environment variables
        const formattedKey = parsedCredentials.private_key.replace(/\n/g, "\\n")
        setExtractedKey(formattedKey)

        setExtractStatus("success")
      } else {
        setExtractStatus("error")
      }
    } catch (error) {
      setExtractStatus("error")
    }
  }

  const copyToClipboard = (type: "email" | "key") => {
    if (type === "email" && extractedEmail) {
      navigator.clipboard.writeText(extractedEmail)
      setCopied("email")
    } else if (type === "key" && extractedKey) {
      navigator.clipboard.writeText(extractedKey)
      setCopied("key")
    }

    setTimeout(() => setCopied("none"), 2000)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Extract Credentials for New API</CardTitle>
        <CardDescription>
          Extract client_email and private_key from your service account JSON for the new API endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will help you extract the client_email and private_key from your service account JSON credentials
            for use with the new API endpoint.
          </p>

          <div className="space-y-2">
            <Label htmlFor="credentials">Paste your Google service account JSON credentials</Label>
            <Textarea
              id="credentials"
              placeholder="Paste your entire JSON credentials here..."
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>

          <Button onClick={extractCredentials} disabled={!credentials} className="w-full">
            Extract Credentials
          </Button>

          {extractStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Credentials Extracted Successfully</AlertTitle>
              <AlertDescription>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">GOOGLE_CLIENT_EMAIL</Label>
                    <div className="relative">
                      <Textarea id="client-email" value={extractedEmail} readOnly className="pr-10 font-mono text-xs" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard("email")}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {copied === "email" && <p className="text-xs text-green-600">Copied to clipboard!</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="private-key">GOOGLE_PRIVATE_KEY</Label>
                    <div className="relative">
                      <Textarea id="private-key" value={extractedKey} readOnly className="pr-10 font-mono text-xs" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard("key")}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {copied === "key" && <p className="text-xs text-green-600">Copied to clipboard!</p>}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Next steps:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>Copy the GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY values</li>
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to Environment Variables</li>
                    <li>Add these as new environment variables with the exact names shown above</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {extractStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Extraction Failed</AlertTitle>
              <AlertDescription>
                <p>Failed to extract credentials from the provided JSON.</p>
                <p className="mt-2">
                  Make sure you've pasted the entire JSON file and that it contains client_email and private_key fields.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This tool helps you prepare your credentials for the new API endpoint that uses separate environment
          variables.
        </p>
      </CardFooter>
    </Card>
  )
}
