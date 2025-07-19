class BtmWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const widgetType = this.getAttribute('widget');
    const companyName = this.getAttribute('company') || '';

    if (!widgetType || !companyName) {
      this.shadowRoot.innerHTML = `<p>Widget configuration missing.</p>`;
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://casalead.de/widgets/${widgetType}?company=${companyName}`;
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '800px'; // oder automatisch anpassbar
    iframe.style.maxWidth = '100%';

    this.shadowRoot.appendChild(iframe);
  }
}

customElements.define('btm-widget', BtmWidget);
