import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the credentials from the request body
    const { credentials } = await request.json()

    if (!credentials) {
      return NextResponse.json({
        success: false,
        error: "No credentials provided",
      })
    }

    // Parse the credentials
    let parsedCredentials
    try {
      parsedCredentials = typeof credentials === "string" ? JSON.parse(credentials) : credentials
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials as JSON",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Check if private_key exists
    if (!parsedCredentials.private_key) {
      return NextResponse.json({
        success: false,
        error: "No private_key found in credentials",
      })
    }

    // Fix the private key - this is the critical part for fixing the DECODER error
    // The issue is often that the private key needs proper line breaks and formatting
    let privateKey = parsedCredentials.private_key

    // First, ensure we have the correct BEGIN and END markers
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      privateKey = "-----BEGIN PRIVATE KEY-----\n" + privateKey.replace(/-----BEGIN PRIVATE KEY-----/g, "")
    }

    if (!privateKey.includes("-----END PRIVATE KEY-----")) {
      privateKey = privateKey.replace(/-----END PRIVATE KEY-----/g, "") + "\n-----END PRIVATE KEY-----"
    }

    // Replace literal \n with actual line breaks
    privateKey = privateKey.replace(/\\n/g, "\n")

    // Ensure proper spacing in the key format
    privateKey = privateKey
      .replace(/-----BEGIN PRIVATE KEY-----\s*/g, "-----BEGIN PRIVATE KEY-----\n")
      .replace(/\s*-----END PRIVATE KEY-----/g, "\n-----END PRIVATE KEY-----")

    // Create a new credentials object with the fixed private key
    const fixedCredentials = {
      ...parsedCredentials,
      private_key: privateKey,
    }

    return NextResponse.json({
      success: true,
      fixedCredentials,
      message: "Private key has been fixed. Use these credentials in your environment variables.",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
