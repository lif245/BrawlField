import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const mapId = parseInt(resolvedParams.id, 10);
    const data = await request.json();

    // Return mock success response containing saved map strategy payload
    return NextResponse.json({
      success: true,
      message: `Strategy plan for map ${mapId} successfully saved to the database.`,
      timestamp: new Date().toISOString(),
      mapId,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse strategy planner payload.",
      },
      { status: 400 }
    );
  }
}
