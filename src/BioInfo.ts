/**
 * Defines <bio-info>String</bio-info>.
 */
class BioInfo extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'bio'
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  #loadCss() {
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    css.replaceSync(`
      :host {
        // line-height: 1;
      }
    `)
  }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <slot></slot>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('bio-info', BioInfo)
