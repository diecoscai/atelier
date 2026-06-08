"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ background: "#0c0a09", color: "#e7e5e4", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, margin: "12vh auto", padding: "0 1.25rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Algo se rompió en el taller</h1>
          <p style={{ color: "#a8a29e", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Error inesperado renderizando la página.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1rem",
              background: "#d97706",
              color: "#0c0a09",
              border: 0,
              borderRadius: 6,
              padding: "0.4rem 0.9rem",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
