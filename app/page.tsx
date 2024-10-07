"use client";

// app/page.tsx
export default function HomePage() {
  return (
    <section>
      <h1>Welcome to My App!</h1>
      <p>This is the main homepage of the app. Feel free to explore!</p>
      <button onClick={() => alert("You clicked the button!")}>Click Me</button>
    </section>
  );
}
