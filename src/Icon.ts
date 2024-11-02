export {}

/**
 * Defines <icon- [rounded] src=Url></icon->.
 */
class Icon extends HTMLElement {
  #css: CSSStyleSheet
  #roundedIconCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'icon'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

    this.#roundedIconCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#roundedIconCss)
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  static get observedAttributes() {
    return ['rounded'] as const
  }

  attributeChangedCallback(name: typeof Icon.observedAttributes[number], _oldValue: string | null, value: string | null) {
    switch (name) {
      case 'rounded':
        if (value !== null) {
          this.#preferRoundedIcon()
        } else {
          this.#rejectRoundedIcon()
        }
        break

      default:
        name satisfies never
    }
  }

  #loadCss() {
    this.#css.replaceSync(`
      :host {
        display: inline-block;

        /* 400 px, 600 dpi */
        min-width: calc(400px * 96 / 600);
        min-height: calc(400px * 96 / 600);
        width: 0;
        height: 0;
      }

      img {
        position: relative;
      }

      .icon {
        display: block;
        width: 100%;
        height: 100%;
      }
    `)
  }

  #preferRoundedIcon() {
    this.#roundedIconCss.replaceSync(`
      .icon {
        border-radius: 5%;
        /* clip-path: rect(auto 0 auto 100% round 5%); */
      }
    `)
  }

  #rejectRoundedIcon() {
    this.#roundedIconCss.replaceSync('')
  }

  #render() {
    const src = this.getAttribute('src')!
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <img class="icon" src="${ src }" />
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('icon-', Icon)
