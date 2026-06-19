// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ScreeningHero } from "@/components/screening/ScreeningHero";

describe("<ScreeningHero />", () => {
  it("renders the four KPI cards with their values", () => {
    render(<ScreeningHero inQueue={12} critical={3} slaRisk={5} avgRisk={48} />);
    expect(screen.getByText("In queue")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("48/100")).toBeInTheDocument();
  });
});
