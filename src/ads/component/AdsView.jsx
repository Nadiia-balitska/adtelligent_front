/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
// @ts-nocheck

import React from 'react';

export default function AdsLView() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    setRows(window.__prebidLogs || []);
    window.__pushPrebidLog = (detail) => setRows(prev => [...prev, detail]);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Prebid Auction Logs</h2>
      <p>Події показують перебіг аукціону (bidRequested → bidResponse → auctionEnd → ...).</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Time</th>
            <th align="left">Event</th>
            <th align="left">Summary</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{new Date(r.ts).toLocaleTimeString()}</td>
              <td>{r.event}</td>
              <td><pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{summ(r)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function summ(row) {
  const a = row.args || {};
  if (row.event === 'bidResponse') {
    return `bidder=${a.bidder} cpm=${a.cpm} code=${a.adUnitCode} size=${a.size}`;
  }
  if (row.event === 'bidWon') {
    return `WIN bidder=${a.bidder} cpm=${a.cpm} code=${a.adUnitCode}`;
  }
  if (row.event === 'adRenderFailed') {
    return `RENDER FAIL code=${a.adUnitCode} reason=${a.reason || ''}`;
  }
  try { return JSON.stringify(a, null, 2); } catch { return String(a); }
}


