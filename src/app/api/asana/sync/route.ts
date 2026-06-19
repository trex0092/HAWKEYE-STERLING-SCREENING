import { NextResponse } from "next/server";
import { fetchJsonWithTimeout } from "@/lib/integrations/http";

// ── Asana case sync ──────────────────────────────────────────────────────────
// POST a screening case to Asana as a task when ASANA_ACCESS_TOKEN is present;
// otherwise return a deterministic mock so the console works offline / in CI.
// GET reports whether the integration is configured.

export const dynamic = "force-dynamic";

interface AsanaBody {
  subjectId?: string;
  name?: string;
  risk?: number;
  status?: string;
  caseId?: string;
}

interface AsanaTaskResponse {
  data?: { gid?: string; permalink_url?: string };
  errors?: Array<{ message?: string }>;
}

export function GET() {
  return NextResponse.json({ ok: true, configured: Boolean(process.env.ASANA_ACCESS_TOKEN) });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AsanaBody;
  const name = (body.name ?? "").trim() || "Unnamed subject";
  const token = process.env.ASANA_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      ok: true,
      mocked: true,
      taskGid: `mock-${body.subjectId ?? "subject"}-${Date.now()}`,
      message: "ASANA_ACCESS_TOKEN not set — returning a mock task.",
    });
  }

  const projectId = process.env.ASANA_PROJECT_ID;
  const workspace = process.env.ASANA_WORKSPACE_ID;
  const notes =
    `HAWKEYE Sterling screening case\n` +
    `Subject: ${name}\n` +
    `Subject ID: ${body.subjectId ?? "—"}\n` +
    `Risk: ${body.risk ?? "—"}/100\n` +
    `Status: ${body.status ?? "—"}`;

  const data: Record<string, unknown> = {
    name: `Screening — ${name}${body.caseId ? ` (${body.caseId})` : ""}`,
    notes,
  };
  if (projectId) data.projects = [projectId];
  else if (workspace) data.workspace = workspace;

  const res = await fetchJsonWithTimeout("https://app.asana.com/api/1.0/tasks", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const payload = res.data as AsanaTaskResponse | null;
    const error = payload?.errors?.[0]?.message ?? res.error ?? `Asana returned ${res.status}`;
    return NextResponse.json({ ok: false, mocked: false, error }, { status: 502 });
  }

  const payload = res.data as AsanaTaskResponse;
  return NextResponse.json({
    ok: true,
    mocked: false,
    taskGid: payload.data?.gid ?? null,
    permalink: payload.data?.permalink_url ?? null,
  });
}
