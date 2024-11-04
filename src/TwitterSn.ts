/**
 * Defines <twitter-sn [x] [squared] [logo-color=Color]>String</twitter-sn>.
 */
class TwitterSn extends HTMLElement {
  #css: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'account'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

    const observer = new MutationObserver(() => {
      this.#render()
    })

    observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  static get observedAttributes() {
    return ['x', 'squared', 'logo-color'] as const
  }

  attributeChangedCallback(name: typeof TwitterSn.observedAttributes[number]) {
    switch (name) {
      case 'x':
      case 'squared':
      case 'logo-color':
        this.#loadCss()
        break

      default:
        name satisfies never
    }
  }

  #loadCss() {
    const twitter = !this.hasAttribute('x')
    const squared = this.hasAttribute('squared')
    const logoColor = this.getAttribute('logo-color')

    const faUnicode = twitter
      ? (!squared ? '\\f099' : '\\f081')
      : (!squared ? '\\e61b' : '\\e61a')

    this.#css.replaceSync(`
      :host {
        display: contents;
      }

      .with-icon {
        display: grid;
        grid-column: 1 / 3;

        /* 2 cells, 600 dpi */
        gap: calc(2 * 4px * 96 / 600);
        align-items: baseline;
        line-height: 1;
      }

      .with-icon::before {
        justify-self: center;
        display: inline flow-root;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;
      }

      .twitter::before {
        font: var(--fa-font-brands);
        content: '${ faUnicode }';
        color: ${ logoColor ?? (twitter ? '#1d9bf0' : 'black') };
      }
    `)
  }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <li part="account-info-inner" class="twitter with-icon">
        <slot></slot>
      </li>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('twitter-sn', TwitterSn)
