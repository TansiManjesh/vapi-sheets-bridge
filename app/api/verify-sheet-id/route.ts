import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the sheet ID
    const sheetId = process.env.GOOGLE_SHEET_ID

    if (!sheetId) {
      return NextResponse.json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable is not set",
      })
    }

    // Check if the sheet ID looks valid
    // Google Sheet IDs are typically 44 characters long
    if (sheetId.length < 20) {
      return NextResponse.json({
        success: false,
        error: "Sheet ID appears to be too short",
        sheetId,
        message:
          "A Google Sheet ID is typically a long string of letters, numbers, and hyphens (around 44 characters).",
      })
    }

    // Check if it contains invalid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(sheetId)) {
      return NextResponse.json({
        success: false,
        error: "Sheet ID contains invalid characters",
        sheetId,
        message: "A Google Sheet ID should only contain letters, numbers, underscores, and hyphens.",
      })
    }

    // If we got here, the sheet ID format looks valid
    return NextResponse.json({
      success: true,
      message: "Sheet ID format appears to be valid",
      sheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
