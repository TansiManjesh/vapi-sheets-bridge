import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Get the credentials string
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS

    if (!credentialsString) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set",
      })
    }

    // Try to parse the credentials
    let credentials
    try {
      credentials = JSON.parse(credentialsString)
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials as JSON",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Check if private_key has proper line breaks
    // The DECODER error often happens when private_key doesn't have proper line breaks
    const fixedCredentials = { ...credentials }

    if (credentials.private_key) {
      // Check if private key has proper line breaks
      if (!credentials.private_key.includes("\n")) {
        // If it doesn't have proper line breaks, try to fix it
        // Replace literal "\n" strings with actual line breaks
        fixedCredentials.private_key = credentials.private_key.replace(/\\n/g, "\n")
      }
    }

    // Try to use the fixed credentials to authenticate
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: fixedCredentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })

      // Try to get a client
      const client = await auth.getClient()

      // If we got here, authentication worked!
      return NextResponse.json({
        success: true,
        message: "Authentication successful with fixed credentials",
        fixRequired: JSON.stringify(credentials) !== JSON.stringify(fixedCredentials),
        fixedPrivateKeyPreview: fixedCredentials.private_key
          ? `${fixedCredentials.private_key.substring(0, 20)}...${fixedCredentials.private_key.substring(fixedCredentials.private_key.length - 20)}`
          : "No private key found",
      })
    } catch (authError) {
      return NextResponse.json({
        success: false,
        error: "Authentication failed even with fixed credentials",
        details: authError instanceof Error ? authError.message : String(authError),
        fixRequired: JSON.stringify(credentials) !== JSON.stringify(fixedCredentials),
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
