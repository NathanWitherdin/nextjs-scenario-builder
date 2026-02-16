import ClientPreview from "./ClientPreview";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the scenario from your own API
  const res = await fetch(`http://localhost:3000/api/scenarios/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Could not load scenario {id}</h1>
      </main>
    );
  }
  const scenario = await res.json();

  return (
    <main style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Game #{id}</h1>
      <ClientPreview scenario={scenario} />
    </main>
  );
}
