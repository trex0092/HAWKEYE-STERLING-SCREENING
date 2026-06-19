import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await req.json().catch(() => ({}));
  const jobId = `job_${Date.now().toString(36)}`;
  return NextResponse.json(
    { jobId, statusUrl: `/api/sanctions/refresh-status/${jobId}` },
    { status: 202 },
  );
}
