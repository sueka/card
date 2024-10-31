import QRCode, { toString } from 'qrcode'
import assert from './assert.js'

/**
 * Defines <qr-code [rounded] content=String [dark=HexColor] [light=HexColor]></qr-code>.
 */
class QrCode extends HTMLElement {
  #roundedQrCodeCss: CSSStyleSheet
  #qrCodeSvg!: string
  #size!: number

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'qr-code'

    this.#roundedQrCodeCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#roundedQrCodeCss)
  }

  async connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  static get observedAttributes() {
    return ['content', 'dark', 'light', 'rounded'] as const
  }

  async attributeChangedCallback(name: typeof QrCode.observedAttributes[number], _oldValue: string | null, value: string | null) {
    switch (name) {
      case 'content':
      case 'dark':
      case 'light':
        const content = this.getAttribute('content')
        const dark = this.getAttribute('dark') ?? undefined
        const light = this.getAttribute('light') ?? undefined

        if (content !== null) {
          this.#size = QRCode.create(content).modules.size
          this.#qrCodeSvg = await toString(content, { type: 'svg', color: { dark, light } })

          this.#loadCss()
          this.#render()
        }
        break

      case 'rounded':
        if (value !== null) {
          this.#preferRoundedQrCode()
        } else {
          this.#rejectRoundedQrCode()
        }
        break

      default:
        name satisfies never
    }
  }

  #preferRoundedQrCode() {
    this.#roundedQrCodeCss.replaceSync(`
      .qr-code {
        border-radius: 5%;
        /* clip-path: rect(auto 0 auto 100% round 5%); */
      }
    `)
  }

  #rejectRoundedQrCode() {
    this.#roundedQrCodeCss.replaceSync('')
  }

  #loadCss() {
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    css.replaceSync(`
      :host {
        /* 4 dots/cell, 4 cell margin, 300 dpi */
        min-width: calc(4px * (${ this.#size } + 8) * 96 / 300);
        min-height: calc(4px * (${ this.#size } + 8) * 96 / 300);
      }

      :host {
        /* display: inline flow-root; */
      }

      .qr-code {
        display: block;
      }
    `)
  }

  #render() {
    const range = new Range()
    let fragment: DocumentFragment
    const link = this.hasAttribute('link')

    if (!link) {
      fragment = range.createContextualFragment(`
        <img class="qr-code" src="data:image/svg+xml,${ encodeURIComponent(this.#qrCodeSvg) }" />
      `)
    } else {
      const content = this.getAttribute('content')
      assert(content !== null)
      assert(URL.canParse(content))

      fragment = range.createContextualFragment(`
        <a href="${ content }">
          <img class="qr-code" src="data:image/svg+xml,${ encodeURIComponent(this.#qrCodeSvg) }" />
        </a>
      `)
    }

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('qr-code', QrCode)
