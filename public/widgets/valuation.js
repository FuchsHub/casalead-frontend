class CasaLeadWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // 1) Listener für eingehende Messages (Lead + Height)
    window.addEventListener('message', async (ev) => {
      // a) Lead-Submit
      if (ev.data?.type === 'lead-submitted') {
        const lead = ev.data.payload;
        try {
          await fetch('https://casalead.de/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: lead.email,
              subject: `Danke für deine Anfrage, ${lead.name}!`,
              html: `<p>Hallo ${lead.name},</p>
                     <p>vielen Dank für Ihre Anfrage (${lead.art} / ${lead.unterart}).</p>
                     <p>Wir melden uns in Kürze.</p>`
            })
          });
        } catch (err) {
          console.error('[valuation.js] E‑Mail‑Fehler:', err);
        }
      }
      // b) Auto-Resize des Iframes
      else if (ev.data?.type === 'height' && ev.source === iframe.contentWindow) {
        iframe.style.height = ev.data.height + 'px';
      }
    });

    // 2) Iframe erzeugen und einbinden
    const iframe = document.createElement('iframe');
    iframe.style.width  = '100%';
    iframe.style.height = '600px'; // Fallback bis zur ersten Height-Message
    iframe.style.border = 'none';
    iframe.setAttribute('loading', 'lazy');

    // URL-Parameter übernehmen
    const attributes = [
      'company_id','farbe','farbe_dunkel','farbe_hell',
      'border_radius','input_border_radius','schriftart'
    ];
    const url = new URL('https://casalead.de/widgets/valuation.html');
    attributes.forEach(attr => {
      const value = this.getAttribute(attr);
      if (value) url.searchParams.set(attr, value);
    });
    iframe.src = url.toString();

    this.shadowRoot.appendChild(iframe);
  }
}

customElements.define('casalead-widget', CasaLeadWidget);
