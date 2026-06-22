"use client";

// Shared "nothing here yet" panel for the console modules. Matches the standard
// dark card chrome so an empty register/feed reads as intentional, not broken.

export function EmptyState({
  title,
  hint,
  icon = "○",
}: {
  title: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 11,
        background: "#0B0F18",
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#4A5468",
          fontSize: 20,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#A3ADC0", letterSpacing: "0.02em" }}>
        {title}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 12,
            color: "#646F86",
            letterSpacing: "0.03em",
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
