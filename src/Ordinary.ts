import assert from './assert.js'

/**
 * Defines <ordinary- [type="chief" size=Length] color=Color></ordinary->.
 */
class Ordinary extends HTMLElement {
  #css: CSSStyleSheet
  #chiefCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'ordinary'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

    this.#chiefCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#chiefCss)
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  static get observedAttributes() {
    return ['color', 'type', 'size'] as const
  }

  async attributeChangedCallback(name: typeof Ordinary.observedAttributes[number]) {
    switch (name) {
      case 'color':
        this.#loadCss()
        break

      case 'type':
      case 'size': {
        const typ = this.getAttribute('type')
        assert(typ === 'chief')

        // this.#rejectChief()

        switch (typ) {
          case 'chief':
            this.#preferChief()
            break

          default:
            typ satisfies never
        }
        break
      }

      default:
        name satisfies never
    }
  }

  #loadCss() {
    const color = this.getAttribute('color')!

    this.#css.replaceSync(`
      :host {
        position: absolute;
        top: 0;
        left: 0;
      }

      .ordinary {
        position: absolute;
        top: 0;
        left: 0;
        background-color: ${ color };
      }
    `)
  }

  #preferChief() {
    const size = this.getAttribute('size')!

    this.#chiefCss.replaceSync(`
      .ordinary {
        width: var(--width);
        height: ${ size };
      }
    `)
  }

  // #rejectChief() {
  //   this.#chiefCss.replaceSync('')
  // }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <div class="ordinary"></div>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('ordinary-', Ordinary)
