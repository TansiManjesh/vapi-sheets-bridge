import { NextResponse } from "next/server"

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

    // Check for common formatting issues
    const formattingIssues = []

    // Check if it starts and ends with curly braces
    if (!credentialsString.trim().startsWith("{") || !credentialsString.trim().endsWith("}")) {
      formattingIssues.push(
        "Credentials string does not start with '{' and end with '}'. Make sure you include the entire JSON object.",
      )
    }

    // Check for escaped quotes or newlines that might cause issues
    if (credentialsString.includes('\\"')) {
      formattingIssues.push('Credentials contain escaped quotes (\\"). This might cause parsing issues.')
    }

    if (credentialsString.includes("\\n") && !credentialsString.includes("-----BEGIN PRIVATE KEY-----")) {
      formattingIssues.push(
        "Credentials contain '\\n' butt no proper private key format. The private key might not be properly formatted.",
      )
    }

    // Try to parse the JSON
    let parsedCredentials
    try {
      parsedCredentials = JSON.parse(credentialsString)

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
        formattingIssues.push(`Missing required fields in credentials: ${missingFields.join(", ")}`)
      }

      // Check private key format
      if (parsedCredentials.private_key) {
        if (
          !parsedCredentials.private_key.includes("-----BEGIN PRIVATE KEY-----") ||
          !parsedCredentials.private_key.includes("-----END PRIVATE KEY-----")
        ) {
          formattingIssues.push(
            "Private key does not have the correct format. It should include BEGIN and END markers.",
          )
        }
      }
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse credentials as JSON",
        details: e instanceof Error ? e.message : String(e),
        credentialsPreview:
          credentialsString.length > 100
            ? `${credentialsString.substring(0, 50)}...${credentialsString.substring(credentialsString.length - 50)}`
            : credentialsString,
      })
    }

    if (formattingIssues.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Credentials formatting issues detected",
        issues: formattingIssues,
        // Show a preview of the credentials for debugging
        credentialsPreview:
          credentialsString.length > 100
            ? `${credentialsString.substring(0, 50)}...${credentialsString.substring(credentialsString.length - 50)}`
            : credentialsString,
      })
    }

    // If we got here, the credentials format looks good
    return NextResponse.json({
      success: true,
      message: "Credentials format appears to be valid",
      clientEmail: parsedCredentials.client_email,
      projectId: parsedCredentials.project_id,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
