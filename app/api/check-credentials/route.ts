import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Step 1: Check if credentials are available
    const credentialsString = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentialsString) {
      return NextResponse.json({
        success: false,
        stage: "credentials-check",
        error: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set or empty",
      })
    }

    // Step 2: Try to parse credentials
    let credentials
    try {
      credentials = JSON.parse(credentialsString)

      // Check if essential fields exist
      if (!credentials.client_email) {
        return NextResponse.json({
          success: false,
          stage: "credentials-validation",
          error: "client_email is missing from credentials",
          credentialsPreview: "Contains keys: " + Object.keys(credentials).join(", "),
        })
      }

      if (!credentials.private_key) {
        return NextResponse.json({
          success: false,
          stage: "credentials-validation",
          error: "private_key is missing from credentials",
          credentialsPreview: "Contains keys: " + Object.keys(credentials).join(", "),
        })
      }
    } catch (e) {
      return NextResponse.json({
        success: false,
        stage: "credentials-parse",
        error: "Failed to parse GOOGLE_SHEETS_CREDENTIALS as JSON",
        details: e instanceof Error ? e.message : String(e),
        credentialsPreview:
          credentialsString.substring(0, 20) + "..." + credentialsString.substring(credentialsString.length - 20),
      })
    }

    // Step 3: Check if sheet ID is available
    const sheetId = process.env.GOOGLE_SHEET_ID
    if (!sheetId) {
      return NextResponse.json({
        success: false,
        stage: "sheet-id-check",
        error: "GOOGLE_SHEET_ID environment variable is not set or empty",
      })
    }

    return NextResponse.json({
      success: true,
      stage: "credentials-validation",
      message: "Credentials and Sheet ID are properly set",
      clientEmail: credentials.client_email,
      sheetId: sheetId,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      stage: "unknown",
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
