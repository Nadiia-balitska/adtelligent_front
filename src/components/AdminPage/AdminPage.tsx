import { useEffect, useMemo,  useState } from "react";

const API_ORIGIN =
  import.meta.env.VITE_BACKEND

export default function AdminPage() {
  const formUrl = useMemo(
    () => `${API_ORIGIN}/admin/line-items/new`,
    []
  );
  const [hasLineItems, setHasLineItems] = useState<boolean | null>(null);

useEffect(() => {
    const checkLineItems = async () => {
      try {
        const res = await fetch(`${API_ORIGIN}/line-items`);
        if (!res.ok) throw new Error("Failed to load line items");
        const data = await res.json();
        setHasLineItems(data.length > 0);
      } catch (e) {
        console.error("Не вдалося отримати лайн айтеми:", e);
        setHasLineItems(false);
      }
    };

    checkLineItems();
  }, []);

   if (hasLineItems === null) {
    return <p className="p-4 text-zinc-500">Завантаження даних…</p>;
  }

  if (!hasLineItems) {
    return null;
  }
  return (
    <div className="p-6"     style={{
          position: "relative",
          width: "100%",
          minHeight: "70vh", 
          height: "auto",
        }}>
      <h2 className="mb-3 text-xl font-semibold">Admin • Line Items</h2>

      <iframe
        src={formUrl}
        title="Line Item Admin"
        style={{
          width: "100%",
           minHeight: "70vh",      
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          background: "white",
        }}
      />
    </div>
  );
}
