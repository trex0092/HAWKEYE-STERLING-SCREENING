// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { AnalystHud } from "@/components/console/AnalystHud";
import { OPERATORS } from "@/lib/data/operators";

describe("<AnalystHud />", () => {
  it("renders the analyst name, role, threat and uptime", () => {
    const analyst = OPERATORS[0]!;
    render(
      <AnalystHud
        analyst={analyst}
        threat={{ t: "CRITICAL", c: "#FF6B6B" }}
        caseLabel="HS-10001"
        duty="AI ANALYST ON CASE"
        uptime="00:01:00"
      />,
    );
    expect(screen.getByText(analyst.name)).toBeInTheDocument();
    expect(screen.getByText(analyst.role)).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("00:01:00")).toBeInTheDocument();
  });
});
