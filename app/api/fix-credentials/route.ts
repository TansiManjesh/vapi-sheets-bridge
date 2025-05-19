import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { credentials } = await request.json()

    if (!credentials) {
      return NextResponse.json({
        success: false,
        error: "No credentials provided",
      })
    }

    // Try to parse the credentials to ensure they're valid JSON
    let parsedCredentials
    try {
      parsedCredentials = JSON.parse(credentials)
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON format",
        details: e instanceof Error ? e.message : String(e),
      })
    }

    // Check for required fields
    const requiredFields = [
      "type",
      "project_id",
      "private_key_id",
      "private_key",
      "client_email",
      "client_id",
      "auth_uri",
      "token_uri",
    ]
    const missingFields = requiredFields.filter((field) => !parsedCredentials[field])

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      })
    }

    // Ensure private key is properly formatted
    if (
      !parsedCredentials.private_key.includes("-----BEGIN PRIVATE KEY-----") ||
      !parsedCredentials.private_key.includes("-----END PRIVATE KEY-----")
    ) {
      return NextResponse.json({
        success: false,
        error: "Private key is not properly formatted",
      })
    }

    // If we got here, the credentials look good
    return NextResponse.json({
      success: true,
      message: "Credentials are valid",
      formattedCredentials: JSON.stringify(parsedCredentials),
      clientEmail: parsedCredentials.client_email,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
