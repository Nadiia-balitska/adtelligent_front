const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host { all: initial; font-family: ui-sans-serif, system-ui, -apple-system; }
    form { display:grid; gap:12px; width:320px; padding:16px; border:1px solid #e5e7eb; border-radius:12px; }
    h3 { margin:0 0 4px; font-size:16px; }
    label { font-size:12px; color:#374151 }
    input, select { padding:8px; border:1px solid #d1d5db; border-radius:8px; font-size:14px; }
    button { padding:10px 12px; border:0; border-radius:10px; background:#111827; color:white; cursor:pointer }
    .row { display:grid; gap:6px; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .ok { color:#065f46; background:#ecfdf5; padding:8px; border-radius:8px; }
    .err { color:#991b1b; background:#fee2e2; padding:8px; border-radius:8px; }
  </style>

  <form novalidate>
    <h3>Create Line Item</h3>

    <div class="row">
      <label>Size (e.g. 300x250)</label>
      <input name="size" placeholder="300x250" required />
    </div>

    <div class="grid2">
      <div class="row">
        <label>Min CPM</label>
        <input name="minCPM" type="number" step="0.01" min="0" required />
      </div>
      <div class="row">
        <label>Max CPM</label>
        <input name="maxCPM" type="number" step="0.01" min="0" required />
      </div>
    </div>

    <div class="row">
      <label>Geo (CSV: UA,NO,US)</label>
      <input name="geo" placeholder="UA,NO" />
    </div>

    <div class="grid2">
      <div class="row">
        <label>Ad type</label>
        <select name="adType">
          <option value="BANNER">BANNER</option>
          <option value="VIDEO">VIDEO</option>
        </select>
      </div>
      <div class="row">
        <label>Frequency cap</label>
        <input name="frequencyCap" type="number" min="1" value="3" required />
      </div>
    </div>

    <div class="row">
      <label>Creative file</label>
      <input name="creative" type="file" accept="image/*,video/*" required />
    </div>

    <button type="submit">Create</button>
    <div id="msg"></div>
  </form>
`;

class LineItemFormElement extends HTMLElement {
  static get observedAttributes() { return ['api']; } 
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(tpl.content.cloneNode(true));
    this.$form = root.querySelector('form');
    this.$msg = root.querySelector('#msg');
    this.api = this.getAttribute('api') || '/api/line-items';
  }

  attributeChangedCallback(name, _old, val) {
    if (name === 'api') this.api = val || '/api/line-items';
  }

  connectedCallback() {
    this.$form.addEventListener('submit', this.onSubmit);
  }
  disconnectedCallback() {
    this.$form.removeEventListener('submit', this.onSubmit);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.$msg.textContent = '';
    this.$msg.className = '';

    const fd = new FormData(this.$form);

    // простенька валідація
    const min = parseFloat(fd.get('minCPM'));
    const max = parseFloat(fd.get('maxCPM'));
    if (!isFinite(min) || !isFinite(max) || min > max) {
      this.showErr('Min CPM must be ≤ Max CPM');
      return;
    }

    try {
      const res = await fetch(this.api, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (res.status === 201 || res.ok) {
        const data = await res.json().catch(() => ({}));
        this.showOk(`Saved ✔️ id: ${data.id ?? '—'}`);
        this.$form.reset();
      } else {
        const t = await res.text();
        this.showErr(`Server error (${res.status}): ${t}`);
      }
    } catch (err) {
      this.showErr(err.message || 'Network error');
    }
  };

  showOk(msg) { this.$msg.className = 'ok'; this.$msg.textContent = msg; }
  showErr(msg){ this.$msg.className = 'err'; this.$msg.textContent = msg; }
}

if (!customElements.get('lineitem-form')) {
  customElements.define('lineitem-form', LineItemFormElement);
}
export default LineItemFormElement;
