"use client";
export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body>
        <h2 style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
          Something went wrong: {error.message}
        </h2>
      </body>
    </html>
  );
} 