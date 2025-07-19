class CasaLeadWidget extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = 'none'
    iframe.setAttribute('loading', 'lazy')

    // Parameterliste, die übergeben werden soll
    const attributes = [
      "company",
      "farbe",
      "farbe_dunkel",
      "farbe_hell",
      "border_radius",
      "input_border_radius",
      "schriftart"
    ]

    // Base URL der Bewertungsvorschau
    const url = new URL('https://casalead.de/widgets/valuation.html')

    // Alle gefundenen Attribute an die URL anhängen
    attributes.forEach(attr => {
      const value = this.getAttribute(attr)
      if (value) {
        url.searchParams.set(attr, value)
      }
    })

    iframe.src = url.toString()

    // Iframe in die Shadow-DOM einfügen
    this.shadowRoot.appendChild(iframe)
  }
}

customElements.define('casalead-widget', CasaLeadWidget)
