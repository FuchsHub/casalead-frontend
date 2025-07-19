class CasaLeadWidget extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const widget = this.getAttribute('widget') || 'valuation'
    const company = this.getAttribute('company') || 'default'

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Inter, sans-serif;
        }
        iframe {
          width: 100%;
          height: 600px;
          border: none;
        }
      </style>
      <iframe src="https://deine-domain.de/widgets/${widget}?company=${company}" loading="lazy"></iframe>
    `
  }
}

customElements.define('casalead-widget', CasaLeadWidget)
