/**
 * Defines <full-name [read-as=String]>String</full-name>.
 */
class FullName extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'full-name'

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
    return ['read-as'] as const
  }

  async attributeChangedCallback(name: typeof FullName.observedAttributes[number]) {
    switch (name) {
      case 'read-as':
        this.#render()
        break

      default:
        name satisfies never
    }
  }

  #loadCss() {
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    css.replaceSync(`
      :host {
        line-height: 1;

        /* 8-by-8 dots type, 20/20 vision, from 3 m */
        font-size: calc(8 * 3 * 1000mm * tan(1deg / 60));
      }

      .rb {
        display: ruby-base;
      }
    `)
  }

  #render() {
    const range = new Range()

    const kana = this.getAttribute('read-as')

    const fragment = kana !== null
      ? range.createContextualFragment(`
          <ruby>
            <slot class="rb"></slot>
            <rt>${ kana }</rt>
          </ruby>
        `)
      : range.createContextualFragment(`
          <slot></slot>
        `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('full-name', FullName)
