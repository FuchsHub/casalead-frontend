class CasaLeadWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const company = this.getAttribute('company') || 'default';
    const farbe = this.getAttribute('farbe') || '#2563eb';
    const farbe_dunkel = this.getAttribute('farbe_dunkel') || '#1e40af';
    const farbe_hell = this.getAttribute('farbe_hell') || '#eff6ff';
    const border_radius = this.getAttribute('border_radius') || '1rem';
    const input_border_radius = this.getAttribute('input_border_radius') || '0.75rem';
    const schriftart = this.getAttribute('schriftart') || "'Inter', sans-serif";

    const url = `https://casalead.de/widgets/valuation.html?company=${encodeURIComponent(company)}&farbe=${encodeURIComponent(farbe)}&farbe_dunkel=${encodeURIComponent(farbe_dunkel)}&farbe_hell=${encodeURIComponent(farbe_hell)}&border_radius=${encodeURIComponent(border_radius)}&input_border_radius=${encodeURIComponent(input_border_radius)}&schriftart=${encodeURIComponent(schriftart)}`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Inter, sans-serif;
        }
        iframe {
          width: 100%;
          height: 800px;
          border: none;
        }
      </style>
      <iframe src="${url}" loading="lazy"></iframe>
    `;
  }
}

customElements.define('casalead-widget', CasaLeadWidget);
