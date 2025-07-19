class CasaLeadWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const company = this.getAttribute('company') || 'default';

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
      <iframe src="https://casalead.de/widgets/valuation.html?company=${company}" loading="lazy"></iframe>
    `;
  }
}

customElements.define('casalead-widget', CasaLeadWidget);
