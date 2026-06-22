// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SubjectRegister } from "@/components/console/SubjectRegister";
import { SEED_SUBJECTS } from "../fixtures/seed";

describe("<SubjectRegister />", () => {
  it("renders the register with subjects, stat tiles and the sources strip", () => {
    render(
      <SubjectRegister
        subjects={SEED_SUBJECTS}
        selectedId={SEED_SUBJECTS[0]!.id}
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

  it("shows the empty state when there are no subjects", () => {
    render(
      <SubjectRegister
        subjects={[]}
        selectedId={null}
        sortKey="risk"
        density="Compact"
        sourcesLive={false}
        onSortChange={() => {}}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("No subjects yet")).toBeInTheDocument();
  });
});
