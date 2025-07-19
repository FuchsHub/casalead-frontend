class CasaLeadWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
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
      <iframe id="widgetFrame" src="https://casalead.de/widgets/valuation.html?company=${company}" loading="lazy"></iframe>
    `;

    try {
      const res = await fetch(`https://casalead.de/api/colors?company=${company}`);
      const data = await res.json();

      // Nach dem Laden dem iframe die Farbe mitteilen (z. B. über postMessage)
      const iframe = this.shadowRoot.getElementById('widgetFrame');
      iframe.addEventListener('load', () => {
        iframe.contentWindow.postMessage({ type: 'setColors', data }, '*');
      });
    } catch (error) {
      console.error('Fehler beim Laden der Farben:', error);
    }
  }
}

customElements.define('casalead-widget', CasaLeadWidget);
