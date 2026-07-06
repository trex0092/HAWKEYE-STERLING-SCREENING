// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { writeAuditEvent, readAuditLog } from "@/lib/audit";

const AUDIT_KEY = "hawkeye.audit-log.v1";

describe("client audit log", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes an entry that reads back with actor/action/target and a timestamp", () => {
    writeAuditEvent("analyst.a", "reassign", "subject:42");
    const log = readAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0]!).toMatchObject({
      actor: "analyst.a",
      action: "reassign",
      target: "subject:42",
    });
    expect(typeof log[0]!.ts).toBe("string");
    expect(Number.isNaN(Date.parse(log[0]!.ts))).toBe(false);
  });

  it("appends in order", () => {
    writeAuditEvent("a", "one", "t1");
    writeAuditEvent("b", "two", "t2");
    const actions = readAuditLog().map((e) => e.action);
    expect(actions).toEqual(["one", "two"]);
  });

  it("caps the log at 1000 entries, dropping the oldest", () => {
    for (let i = 0; i < 1005; i++) writeAuditEvent("a", `act${i}`, "t");
    const log = readAuditLog();
    expect(log).toHaveLength(1000);
    // oldest five were trimmed; the window now starts at act5.
    expect(log[0]!.action).toBe("act5");
    expect(log[log.length - 1]!.action).toBe("act1004");
  });

  it("dispatches a hawkeye:audit-updated event on write", () => {
    const handler = vi.fn();
    window.addEventListener("hawkeye:audit-updated", handler);
    writeAuditEvent("a", "sign", "audit:1");
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener("hawkeye:audit-updated", handler);
  });

  it("returns [] when stored data is corrupt", () => {
    window.localStorage.setItem(AUDIT_KEY, "not json{");
    expect(readAuditLog()).toEqual([]);
  });

  it("returns [] when stored data is a non-array JSON value", () => {
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify({ nope: true }));
    expect(readAuditLog()).toEqual([]);
  });

  it("recovers from a corrupt store on the next write", () => {
    window.localStorage.setItem(AUDIT_KEY, "garbage");
    writeAuditEvent("a", "recover", "t");
    const log = readAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0]!.action).toBe("recover");
  });

  it("readAuditLog returns [] when nothing has been written", () => {
    expect(readAuditLog()).toEqual([]);
  });
});
