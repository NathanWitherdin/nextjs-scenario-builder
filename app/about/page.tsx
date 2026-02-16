export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 16,
      }}
    >
      <h1
        style={{
          marginBottom: 8,
        }}
      >
        About
      </h1>

      <section aria-labelledby="who" style={{ marginBottom: 16 }}>
        <h2 id="who">Who made this?</h2>
        <p>
          <strong>Name:</strong> Nathan Witherdin
        </p>
        <p>
          <strong>Student Number:</strong> 20960713
        </p>
      </section>

      <section aria-labelledby="how-to" style={{ marginBottom: 16 }}>
        <h2 id="how-to">How to use this site.</h2>
        <p>
          This app generates copy-pasteable HTML + JS (with inline CSS). Use the
          home page to configure components (e.g. tabs) and content, then copy
          the output.
        </p>

        <video
          controls
          preload="metadata"
          style={{
            width: "100%",
            maxWidth: 800,
            height: "auto",
            border: "1px solid var(--muted)",
            borderRadius: 8,
            background: "var(--card)",
          }}
        >
          <source src="/Demo.mp4" type="video/mp4" />
          <p>
            Your browser does not support the video tag.{" "}
            <a href="/Demo.mp4" download>
              Download the video
            </a>
          </p>
        </video>
      </section>
    </main>
  );
}
