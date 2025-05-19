"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function PrivateKeyFixer() {
  const [credentials, setCredentials] = useState("")
  const [fixStatus, setFixStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [fixResult, setFixResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const fixPrivateKey = async () => {
    if (!credentials) return

    setFixStatus("loading")
    try {
      const response = await fetch("/api/fix-private-key", {
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
        error: "Failed to fix private key",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const copyToClipboard = () => {
    if (fixResult && fixResult.fixedCredentials) {
      navigator.clipboard.writeText(JSON.stringify(fixResult.fixedCredentials, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Fix DECODER Error - Private Key Formatter</CardTitle>
        <CardDescription>
          Solve the "DECODER routines::unsupported" error by properly formatting your private key
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This specialized tool fixes the "DECODER routines::unsupported" error by properly formatting the private key
            in your Google service account credentials.
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

          <Button onClick={fixPrivateKey} disabled={fixStatus === "loading" || !credentials} className="w-full">
            {fixStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Private Key...
              </>
            ) : (
              "Fix Private Key"
            )}
          </Button>

          {fixStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Private Key Fixed Successfully</AlertTitle>
              <AlertDescription>
                <p>Your private key has been properly formatted to fix the DECODER error.</p>

                <div className="mt-4">
                  <Label htmlFor="fixed-credentials">Fixed Credentials (Copy this to your environment variables)</Label>
                  <div className="relative">
                    <Textarea
                      id="fixed-credentials"
                      value={JSON.stringify(fixResult.fixedCredentials, null, 2)}
                      readOnly
                      className="pr-10 min-h-[200px] font-mono text-xs mt-1"
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
                    <li>Copy the fixed credentials above</li>
                    <li>Go to your Vercel project settings</li>
                    <li>Navigate to Environment Variables</li>
                    <li>Delete the current GOOGLE_SHEETS_CREDENTIALS variable</li>
                    <li>Add a new GOOGLE_SHEETS_CREDENTIALS variable with these fixed credentials</li>
                    <li>Make sure to paste the ENTIRE JSON object, including the curly braces</li>
                    <li>Redeploy your application</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {fixStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error Fixing Private Key</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {fixResult?.error}
                </p>

                {fixResult?.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {fixResult.details}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          The "DECODER routines::unsupported" error is specifically related to how the private key is formatted in your
          credentials.
        </p>
      </CardFooter>
    </Card>
  )
}
