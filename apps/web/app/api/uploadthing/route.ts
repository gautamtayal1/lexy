// This route has been replaced with Digital Ocean Spaces integration
// See /api/upload for the new file upload implementation
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "UploadThing has been replaced with Digital Ocean Spaces" });
}

export async function POST() {
  return NextResponse.json({ message: "UploadThing has been replaced with Digital Ocean Spaces" });
}
