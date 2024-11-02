/**
 * Defines <bio-info>String</bio-info>.
 */
class BioInfo extends HTMLElement {
  #css: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'bio'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  #loadCss() {
    this.#css.replaceSync(`
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
