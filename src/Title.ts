/**
 * Defines <title->String</title->.
 */
class Title extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'title'

    const observer = new MutationObserver(() => {
      this.#render()
    })

    observer.observe(this, {
      childList: true,
      // subtree: true,
      characterData: true,
    })
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  #loadCss() {
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    css.replaceSync(`
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

customElements.define('title-', Title)
