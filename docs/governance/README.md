# AI Governance — Hawkeye Sterling Screening

This folder documents how the Hawkeye Sterling screening platform — the **app** and its
surrounding **Asana automation** — aligns with the **6 Layers of Agentic AI Governance**
(*from AI visibility to AI assurance*):

1. **AI Discovery & Inventory** — you can't govern what you can't see.
2. **Data Governance Foundation** — good data powers trustworthy AI.
3. **Security & Resilience** — protect AI systems, data, and tools.
4. **Model & Agent Assurance** — validate performance, detect issues early.
5. **Human Oversight** — humans decide, AI executes.
6. **Governance, Compliance & Audit** — prove it, improve it, assure it.

## Status at a glance

| Layer | Status | One-line summary |
|---|---|---|
| 1 · Discovery & Inventory | 🟢 | AI system register + framework mapping written; components inventoried. |
| 2 · Data Governance | 🟢 | Source lineage + "honest verdicts" + a data retention & deletion policy. |
| 3 · Security & Resilience | 🟢 | HMAC-signed audit, four-eyes, RBAC, rate limiting, incident playbook. |
| 4 · Model & Agent Assurance | 🟢 | Output coercion + golden eval + red-team tests + LLM drift logging. |
| 5 · Human Oversight | 🟢 | Escalate/override, four-eyes, **MLRO sign-off gate**, SLA escalation. |
| 6 · Governance, Compliance & Audit | 🟢 | Tamper-evident audit + export, AI risk register, NIST/ISO/EU-AI-Act mapping. |

> All six layers now have a documented control baseline. Remaining work is
> **production hardening** (a real auth provider in place of header-based identity,
> a durable monitoring sink, bias testing, and a legal sign-off on EU AI Act
> classification) — tracked in [`six-layer-alignment.md`](./six-layer-alignment.md).

## What's the actual AI surface?

A deliberate, important finding: **most of the automation is deterministic, not AI.**

- The **Asana automation** (Regulatory Watch, Sanctions Watch, FATF Watchdog, the expiry
  notifier, the Daily Compliance Brief, site/health checks) is a set of **scheduled GitHub
  Actions** that diff sources and create Asana tasks via the API. There are **no Asana AI
  Teammates** configured in the workspace. These are rules, not models.
- The app's screening **decision logic** is also deterministic (fixed score→decision thresholds).
- The **only true AI/LLM** is the *optional, env-gated* Claude (`claude-opus-4-8`) enrichment
  inside the app: adverse-media sentiment/category classification and screening-reasoning
  synthesis. It never auto-blocks on its own output. See `model-card-claude.md`.

This narrow, well-bounded AI surface is itself a governance strength — the autonomous behaviour
is mostly explainable and reproducible.

## Documents

| Document | Purpose | Primary layer |
|---|---|---|
| [`ai-system-register.md`](./ai-system-register.md) | Inventory of every automated / AI decision component across the app **and** the Asana automation. | Layer 1 |
| [`model-card-claude.md`](./model-card-claude.md) | Model card for the sole LLM (Claude enrichment): intended use, prompts, I/O, controls, limitations. | Layer 4 |
| [`data-retention-policy.md`](./data-retention-policy.md) | Retention schedule, deletion, data minimisation, responsibilities. | Layer 2 |
| [`ai-risk-register.md`](./ai-risk-register.md) | Scored risks, mitigating controls, residual risk, owners. | Layer 6 |
| [`incident-response.md`](./incident-response.md) | Severity levels, roles, response steps, runbooks. | Layer 3 |
| [`framework-mapping.md`](./framework-mapping.md) | Control mapping to NIST AI RMF, ISO/IEC 42001, EU AI Act. | Layer 6 |
| [`six-layer-alignment.md`](./six-layer-alignment.md) | Full 6-layer alignment assessment with file references and remaining backlog. | All |
| [`periodic-table-mapping.md`](./periodic-table-mapping.md) | Per-block coverage of the *AI Governance & Security Periodic Table (2026)* against the code. | All |

## Scope & disclaimer

Consistent with [`../../SECURITY.md`](../../SECURITY.md) and the project README, Hawkeye Sterling
Screening is a **demo / reference build**. It runs fully offline against deterministic mocks
unless live integrations are explicitly configured. These governance documents describe the
system **as built** and flag what additional controls a production, regulated deployment would
require — they are not a certification of regulatory compliance.

_Last reviewed: 2026-06-21._
