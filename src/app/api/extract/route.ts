import { NextRequest, NextResponse } from "next/server";
import { extractImagesFromUrl } from "@/lib/image-extractor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!isValidHttpUrl(url)) {
      return NextResponse.json({ error: "Provide a valid http or https URL" }, { status: 400 });
    }

    const result = await extractImagesFromUrl(url);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract images";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json({ error: "Pass ?url=https://example.com" }, { status: 400 });
  }

  if (!isValidHttpUrl(url)) {
    return NextResponse.json({ error: "Provide a valid http or https URL" }, { status: 400 });
  }

  try {
    const result = await extractImagesFromUrl(url);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract images";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
