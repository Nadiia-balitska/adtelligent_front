export default function AdminPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Create Line Item</h2>
      <form action="/api/line-items"></form>
    </div>
  );
}