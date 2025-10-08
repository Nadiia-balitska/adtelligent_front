/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { useState } from "react";
import { apiPost, API_ORIGIN } from "../../services/addServer";
import type { AdRequestPayload, AdResponse } from "../../types/add-server";



function extractIframeSrc(adm: string): string | null {
  const m = adm.match(/src="([^"]+)"/i);
  return m?.[1] ?? null;
}

function toAbsolute(url: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}



export default function AdTester() {
  const [payload, setPayload] = useState<AdRequestPayload>({
    geo: "NO",
    size: "300x250",
    adType: "BANNER",
    cpm: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [ad, setAd] = useState<AdResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAd = async () => {
    setLoading(true);
    setError(null);
    setAd(null);
    try {
      const res = await apiPost<AdResponse>("/balitska/get", payload);
      setAd(res);
    } catch (e: any) {
      setError(e?.message || "Помилка запиту");
    } finally {
      setLoading(false);
    }
  };

  const creativeSrcAbs = toAbsolute(ad ? extractIframeSrc(ad.adm) : null);
  // const creativeIsImage = isImageUrl(creativeSrcAbs);

  return (
    <div className="mt-16 rounded-2xl border p-4">
      <h3 className="mb-3 text-lg font-semibold">Тестер реклами </h3>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Geo
          <input
            className="rounded-lg border px-3 py-2"
            value={payload.geo ?? ""}
            onChange={(e) => setPayload((p) => ({ ...p, geo: e.target.value || undefined }))}
            placeholder="NO"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Size
          <input
            className="rounded-lg border px-3 py-2"
            value={payload.size ?? ""}
            onChange={(e) => setPayload((p) => ({ ...p, size: e.target.value || undefined }))}
            placeholder="300x250"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Ad Type
          <select
            className="rounded-lg border px-3 py-2"
            value={payload.adType ?? ""}
            onChange={(e) => setPayload((p) => ({ ...p, adType: e.target.value || undefined }))}
          >
            <option value="BANNER">BANNER</option>
            <option value="VIDEO">VIDEO</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          CPM
          <input
            className="rounded-lg border px-3 py-2"
            type="number"
            step="0.01"
            value={payload.cpm ?? 0}
            onChange={(e) =>
              setPayload((p) => ({
                ...p,
                cpm: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </label>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
        type="button"
          onClick={requestAd}
          disabled={loading}
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Запит..." : "Отримати рекламу"}
        </button>
        <span className="text-sm text-zinc-500">API: {API_ORIGIN}/balitska/get</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {!error && !loading && ad === null && (
        <p className="mt-3 text-sm text-zinc-500">
          204 No Content — під фільтри нічого не підійшло або спрацював frequency cap.
        </p>
      )}

      {ad && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-zinc-700">
            <div>
              <b>Line Item ID:</b> {ad.id} | <b>CPM:</b> {ad.price}
            </div>
            <div>
              <b>Type:</b> {ad.adType} | <b>Size:</b> {ad.w}×{ad.h}
            </div>
            <div>
              <b>Geo:</b> {ad.geo ?? "-"}
            </div>
            {creativeSrcAbs && (
              <div className="truncate">
                <b>Creative URL:</b>{" "}
                <a href={creativeSrcAbs} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {creativeSrcAbs}
                </a>
              </div>
            )}
          </div>

          
        </div>
      )}
    </div>
  );
}
