import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  void params.jobId;
  return NextResponse.json({
    status: "completed",
    result: { ok_count: 18, failed_count: 0 },
  });
}
