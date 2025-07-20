class CasaLeadWidget extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // 1) Listener für Formular‑Submit‑Nachricht aus dem Iframe
    window.addEventListener('message', async (ev) => {
      if (ev.data?.type === 'lead-submitted') {
        const lead = ev.data.payload
        try {
          await fetch('/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to:      lead.email,
              subject: `Danke für deine Anfrage, ${lead.name}!`,
              html:    `
                <p>Hallo ${lead.name},</p>
                <p>vielen Dank für deine Anfrage (${lead.art} / ${lead.unterart}). Wir melden uns in Kürze bei dir.</p>
                <p>Dein CasaLead‑Team</p>
              `
            })
          })
          console.log('E‑Mail verschickt!')
        } catch (err) {
          console.error('E‑Mail‑Fehler:', err)
        }
      }
    })

    // 2) Iframe erzeugen und einbinden
    const iframe = document.createElement('iframe')
    iframe.style.width  = '100%'
    iframe.style.height = '600px'
    iframe.style.border = 'none'
    iframe.setAttribute('loading', 'lazy')

    // Supported attributes, inkl. neu: company_id
    const attributes = [
      'company_id',
      'farbe',
      'farbe_dunkel',
      'farbe_hell',
      'border_radius',
      'input_border_radius',
      'schriftart'
    ]

    const url = new URL('https://casalead.de/widgets/valuation.html')
    attributes.forEach(attr => {
      const value = this.getAttribute(attr)
      if (value) url.searchParams.set(attr, value)
    })

    iframe.src = url.toString()
    this.shadowRoot.appendChild(iframe)
  }
}

customElements.define('casalead-widget', CasaLeadWidget)
