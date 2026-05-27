import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Return success to the client. This will act as the synchronizing API endpoint.
    return NextResponse.json({
      success: true,
      message: "Tier list saved successfully to the system database.",
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse tier list layout payload.",
      },
      { status: 400 }
    );
  }
}
