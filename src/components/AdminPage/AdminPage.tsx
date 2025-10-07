/** biome-ignore-all lint/correctness/useExhaustiveDependencies: this effect runs once by design */
import { useEffect, useState } from "react";
import AdTester from "../AdapterServerTest/AdapterServerTest";

const API_ORIGIN = import.meta.env.VITE_BACKEND as string;

export default function AdminPage() {
  const [scriptReady, setScriptReady] = useState(false);
  const [hasLineItems, setHasLineItems] = useState<boolean | null>(null);

  useEffect(() => {
    const scriptId = "line-item-form-script";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.src = `${API_ORIGIN}/admin/line-items/new`;
      scriptEl.type = "text/javascript";
      scriptEl.defer = true;
      scriptEl.onload = () => setScriptReady(true);
      scriptEl.onerror = () => setScriptReady(false);
      document.body.appendChild(scriptEl);
    } else {
      setScriptReady(true);
    }

    (async () => {
      try {
        const res = await fetch(`${API_ORIGIN}/line-items`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load line items");
        const data = await res.json();
        setHasLineItems(Array.isArray(data) ? data.length > 0 : false);
      } catch (e) {
        console.error("Не вдалося отримати лайн айтеми:", e);
        setHasLineItems(false);
      }
    })();
  }, []);

  if (!scriptReady) {
    return <p className="p-4 text-zinc-500">Завантаження форми…</p>;
  }

  return (
    <div
      className="p-6"
      style={{ position: "relative", width: "100%", minHeight: "70vh" }}
    >
      <h2 className="mb-3 text-xl font-semibold">Admin • Line Items</h2>
      <line-item-form data-api-origin={API_ORIGIN} />
      {hasLineItems === false && (
        <p className="mt-3 text-sm text-zinc-500">
          Поки що лайн-айтемів немає — створіть перший через форму вище.
        </p>
      )}

      <AdTester />
    </div>
  );
}
