class CasaLeadWidget extends HTMLElement {
  connectedCallback() {
    const widget = this.getAttribute('widget') || 'valuation';
    const company = this.getAttribute('company') || 'default';

    const iframe = document.createElement('iframe');
    iframe.src = `https://casalead.de/widgets/${widget}?company=${company}`;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';

    this.appendChild(iframe);
  }
}
customElements.define('casalead-widget', CasaLeadWidget);
