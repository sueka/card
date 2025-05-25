/**
 * Defines <braille-guide [print-only]>String</braille-guide>.
 */
class BrailleGuide extends HTMLElement {
  #css: CSSStyleSheet
  #printOnlyCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'braille-guide'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

    this.#printOnlyCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#printOnlyCss)
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  #loadCss() {
    // NOTE: Noto Sans Symbols 2 を使用する場合、JIS T 0921:2017 に準拠するには、font-size と line-height を次の範囲に収める必要がある:
    // 8.4043636364 mm < font-size < 11.3614545455 mm
    // 1.1116257527 < line-height < 1.6674386290
    this.#css.replaceSync(`
      :host {
        word-break: break-word;
        font-family: "Noto Sans Symbols 2";
        font-size: 9mm;
        line-height: 1.2;
        -webkit-text-stroke: 1px rgba(0, 0, 0, 0.1);
        color: transparent;
        position: absolute !important;
        transform: scaleX(-1);
        box-sizing: border-box;
        padding: 6mm;
        width: 100%;
        height: 100%;
      }

      @media screen {
        :host([print-only]) {
          display: none;
        }
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

customElements.define('braille-guide', BrailleGuide)
