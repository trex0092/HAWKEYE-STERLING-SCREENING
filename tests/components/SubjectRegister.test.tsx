// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SubjectRegister } from "@/components/console/SubjectRegister";
import { SUBJECTS } from "@/lib/data/subjects";

describe("<SubjectRegister />", () => {
  it("renders the register with seed subjects, stat tiles and the sources strip", () => {
    render(
      <SubjectRegister
        subjects={SUBJECTS}
        selectedId={SUBJECTS[0]!.id}
        sortKey="risk"
        density="Compact"
        sourcesLive={false}
        onSortChange={() => {}}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Boris Volkov")).toBeInTheDocument();
    expect(screen.getByText("Vladimir Putin")).toBeInTheDocument();
    expect(screen.getByText("In Queue")).toBeInTheDocument();
    expect(screen.getByText("Intelligence Sources")).toBeInTheDocument();
  });
});
