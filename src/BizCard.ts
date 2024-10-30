import delay from './delay.js'

export {}

/**
 * Defines:
 * <biz-card [ipafont] [color=Color] [bg-color=Color]>
 *   [<ordinary- ... />]
 *   [<icon- ... />]
 *   [<title- ... />]
 *   <full-name ... />
 *   [<bio-info ... />]
 *   [<qr-code ... />]
 *   [<twitter-sn ... />]
 *   [<github-username ... />]
 *   [<web-site ... />]
 *   [<back-face ... />]
 * </biz-card>
 */
class BizCard extends HTMLElement {
  #frontCss: CSSStyleSheet
  #frontStyle: HTMLStyleElement
  #animeCss: CSSStyleSheet
  #flipCss: CSSStyleSheet
  #ipafontCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.#frontCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#frontCss)

    this.#frontStyle = document.createElement('style')
    document.head.append(this.#frontStyle)

    this.#animeCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#animeCss)

    this.#flipCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#flipCss)

    window.addEventListener('popstate', () => {
      this.#preferFlipCss()
    })

    this.#ipafontCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#ipafontCss)

    this.onclick = this.#handleClick.bind(this)
  }

  connectedCallback() {
    this.#loadCss()
    this.#preferFaceCss()
    this.#preferFlipCss()
    this.#render()
  }

  static get observedAttributes() {
    return ['ipafont'] as const
  }

  attributeChangedCallback(name: typeof BizCard.observedAttributes[number], _oldValue: string | null, value: string | null) {
    switch (name) {
      case 'ipafont':
        if (value !== null) {
          this.#preferIpaFonts()
        } else {
          this.#rejectIpaFonts()
        }
        break

      default:
        name satisfies never
    }
  }

  get #flipped() {
    const search = new URLSearchParams(location.search)

    return search.has('flipped')
  }

  #handleClick() {
    // TODO: Improve conditions
    if (this.#animeCss.cssRules.length === 0) {
      return
    }

    this.#flip()
  }

  #flip() {
    const search = new URLSearchParams(location.search)

    if (!search.has('flipped')) {
      search.append('flipped', '')
    } else {
      search.delete('flipped')
    }

    const url = new URL(location.href)
    url.search = search.toString()

    history.pushState(null, '', url)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  #loadCss() {
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    const color = this.getAttribute('color')
    const bgColor = this.getAttribute('bg-color')

    css.replaceSync(`
      /* Form */
      :host {
        transform-style: preserve-3d;
        box-shadow: 0 0 16px darkslategray;
      }

      .front {
        transform: translateZ(0.1mm);
      }

      .back {
        transform: rotateY(180deg) translateZ(0.1mm);
      }

      /* Edges */
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .edge {
        background-color: white;
        position: absolute;
      }

      .edge.top, .edge.bottom {
        height: 0.2mm;
        width: 91mm;
      }

      .edge.dexter, .edge.sinister {
        height: 55mm;
        width: 0.2mm;
      }

      .edge.top {
        transform: rotateX(90deg) translateZ(27.5mm);
      }

      .edge.bottom {
        transform: rotateX(-90deg) translateZ(27.5mm);
      }

      .edge.dexter {
        transform: rotateY(-90deg) translateZ(45.5mm);
      }

      .edge.sinister {
        transform: rotateY(90deg) translateZ(45.5mm);
      }

      .front, .back {
        background-color: ${ bgColor ?? 'white' };
        color: ${ color ?? 'black' };
        position: absolute;
      }

      /* Size */
      :host, .front, .back {
        min-width: 91mm;
        max-width: 91mm;
        min-height: 55mm;
        max-height: 55mm;
      }

      /* Layout */
      .front {
        box-sizing: border-box;
        padding: 4mm;
      }

      /* Text */
      .front {
        font-size: 9pt;
        font-feature-settings: 'pwid';
      }

      /* Ordinary */
      .front {
        /* position: relative; */
      }

      ::slotted(*), .accounts {
        position: relative;
      }

      ::slotted(ordinary-) {
        position: revert-layer;
      }
    `)

    const style = document.createElement('style')
    document.head.append(style)

    style.replaceChildren(document.createTextNode(`
      /* Link */
      :link {
        color: LinkText;
      }

      :visited {
        color: VisitedText;
      }

      :any-link {
        text-decoration-line: none;
      }

      :any-link:hover {
        text-decoration: underline dashed;
      }

      :any-link:active {
        text-decoration: underline;
      }

      @media print {
        :any-link {
          color: currentColor;
        }
      }
    `))
  }

  #preferFaceCss() {
    this.#frontCss.replaceSync(`
      ::slotted(qr-code) {
        /* Quarter of the card */
        max-width: calc((91mm - 8mm) / 2);
        max-height: calc((55mm - 8mm) / 2);
      }

      .accounts {
        /* brevier */
        font-size: 8pt;
      }

      /* Layout */
      .front {
        display: flex;
        justify-content: space-between;
        gap: 4mm;
      }

      .left-col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .right-col {
        display: flex;
        align-items: flex-end;
      }

      .profile {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 2mm;
      }

      .profile-header {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 3mm;
      }

      .profile-name {
        display: flex;
        flex-direction: column;
      }

      .accounts {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5mm;

        /* Reset <ul> */
        margin-top: 0;
        margin-bottom: 0;
        padding-left: 0;
      }

      .accounts > li {
        display: contents;
      }

      .accounts ::slotted(*) {
        display: contents;
      }

      .back {
        display: flex;
      }
    `)

    // FIXME: 本当はシャドウルートのスタイルシートで .accounts ::slotted(*)::part(account-info-inner) のようにしたかった。
    this.#frontStyle.replaceChildren(document.createTextNode(`
      /* Layout */
      ::part(account-info-inner) {
        display: grid;
        grid-template-columns: subgrid; /* in .accounts */
        grid-column: 1 / 3;
      }
    `))
  }

  async #preferFlipCss() {
    if (!this.#flipped) {
      this.#preferNotFlipped()
    } else {
      this.#preferFlipped()
    }

    await delay(1000)
    /* Transformed */

    this.#animeCss.replaceSync(`
      :host {
        transition: transform 1s ease-in-out;
      }
    `)
  }

  #preferNotFlipped() {
    this.#flipCss.replaceSync(`
      :host {
        transform: rotateY(0deg);
      }
    `)
  }

  #preferFlipped() {
    this.#flipCss.replaceSync(`
      :host {
        transform: rotateY(180deg);
      }
    `)
  }

  #preferIpaFonts() {
    this.#ipafontCss.replaceSync(`
      /* Fonts */
      :host {
        font-family: "ipaexg", sans-serif;
      }
    `)

    const style = document.createElement('style')

    style.append(document.createTextNode(`
      @font-face {
        font-family: ipaexg;

        src:
          local(IPAexGothic),
          url(assets/fonts/ipaexg/ipaexg.ttf) format(truetype);

        font-display: block;
      }
    `))

    document.head.append(style)
  }

  #rejectIpaFonts() {
    this.#ipafontCss.replaceSync('')
  }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <div class="front">
        <slot name="ordinary"></slot>
        <div class="left-col">
          <div class="profile">
            <div class="profile-header">
              <slot name="icon"></slot>
              <div class="profile-name">
                <slot name="title"></slot>
                <slot name="full-name"></slot>
              </div>
            </div>
            <slot name="bio"></slot>
          </div>
          <ul class="accounts">
            <slot name="accounts"></slot>
          </ul>
        </div>
        <div class="right-col">
          <slot name="qr-code"></slot>
        </div>
      </div>
      <div class="back">
        <slot name="back-face"></slot>
      </div>
      <div class="edge top"></div>
      <div class="edge bottom"></div>
      <div class="edge dexter"></div>
      <div class="edge sinister"></div>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('biz-card', BizCard)
