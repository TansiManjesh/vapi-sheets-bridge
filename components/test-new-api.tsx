"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TestNewApi() {
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testResult, setTestResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    customerName: "Test User",
    phoneNumber: "1234567890",
    vehicleNumber: "TEST123",
    branch: "Test Branch",
    message: "Test message",
    response: "Test response",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const testNewApi = async () => {
    setTestStatus("loading")
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setTestResult(data)
      setTestStatus(data.success ? "success" : "error")
    } catch (error) {
      setTestStatus("error")
      setTestResult({
        success: false,
        error: "Failed to submit data",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Test New API Endpoint</CardTitle>
        <CardDescription>Test the new /api/submit.js endpoint that uses separate environment variables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">
            This tool will test the new API endpoint that uses GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment
            variables instead of the full JSON credentials.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input id="vehicleNumber" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" name="branch" value={formData.branch} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input id="message" name="message" value={formData.message} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">Response</Label>
                <Input id="response" name="response" value={formData.response} onChange={handleChange} />
              </div>
            </div>

            <Button onClick={testNewApi} disabled={testStatus === "loading"} className="w-full">
              {testStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Test New API Endpoint"
              )}
            </Button>
          </div>

          {testStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Submission Successful</AlertTitle>
              <AlertDescription>
                <p>Data was successfully submitted to Google Sheets using the new API endpoint!</p>
                <p className="mt-2">Check your Google Sheet to see the new row.</p>
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Submission Failed</AlertTitle>
              <AlertDescription>
                <p>
                  <strong>Error:</strong> {testResult?.error || "Failed to submit data"}
                </p>

                {testResult?.details && (
                  <p className="mt-2">
                    <strong>Details:</strong> {testResult.details}
                  </p>
                )}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong className="text-blue-700">Troubleshooting:</strong>
                  <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-700">
                    <li>
                      Make sure you've added the GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables in
                      Vercel
                    </li>
                    <li>Ensure the private key is properly formatted (replace \n with \\n)</li>
                    <li>Verify that the service account has access to the Google Sheet</li>
                    <li>Check that the sheet ID and sheet name are correct</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          This approach uses separate environment variables for the client email and private key instead of the full
          JSON credentials.
        </p>
      </CardFooter>
    </Card>
  )
}
