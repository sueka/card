export {}

/**
 * Defines:
 * <back-face [color=Color] [bg-color=Color]>
 * </back-face>
 */
class BackFace extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'back-face'
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  #loadCss() {
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    const color = this.getAttribute('color')
    const bgColor = this.getAttribute('bg-color')

    css.replaceSync(`
      :host {
        flex-grow: 1;
        background-color: ${ bgColor ?? 'transparent' };
        color: ${ color ?? 'currentColor' };
        padding: 4mm;
        font-size: 9pt;
      }
    `)
  }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <div>
        back face
      </div>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('back-face', BackFace)
