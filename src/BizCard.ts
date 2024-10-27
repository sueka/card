import delay from "./delay.js"

export {}

/**
 * Defines:
 * <biz-card [backside] [ipafont] [color=Color] [bg-color=Color]>
 *   [<ordinary- ... />]
 *   [<icon- ... />]
 *   [<title- ... />]
 *   <full-name ... />
 *   [<bio-info ... />]
 *   [<qr-code ... />]
 *   [<twitter-sn ... />]
 *   [<github-username ... />]
 *   [<web-site ... />]
 * </biz-card>
 */
class BizCard extends HTMLElement {
  #backside: boolean
  #frontCss: CSSStyleSheet
  #frontStyle: HTMLStyleElement
  #backCss: CSSStyleSheet
  #animeCss: CSSStyleSheet
  #flipCss: CSSStyleSheet
  #ipafontCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.#backside = this.hasAttribute('backside')

    this.#frontCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#frontCss)

    this.#frontStyle = document.createElement('style')
    document.head.append(this.#frontStyle)

    this.#backCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#backCss)

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
    return ['backside', 'ipafont'] as const
  }

  attributeChangedCallback(name: typeof BizCard.observedAttributes[number], _oldValue: string | null, value: string | null) {
    switch (name) {
      case 'backside':
        this.#backside = value !== null

        this.#preferFaceCss()
        this.#render()
        break

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
      :host {
        background-color: ${ bgColor ?? 'white' };
        color: ${ color ?? 'black' };
        backface-visibility: hidden;
        position: absolute;
      }

      /* Size */
      :host {
        min-width: 91mm;
        max-width: 91mm;
        min-height: 55mm;
        max-height: 55mm;
      }

      /* Layout */
      :host {
        box-sizing: border-box;
        padding: 4mm;
      }

      /* Text */
      :host {
        font-size: 9pt;
        font-feature-settings: 'pwid';
      }

      /* Ordinary */
      :host {
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
    if (!this.#backside) {
      this.#preferFront()
    } else {
      this.#preferBack()
    }
  }

  #preferFront() {
    this.#backCss.replaceSync('')
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
      :host {
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

  #preferBack() {
    this.#frontCss.replaceSync('')
    this.#backCss.replaceSync(`
      :host {
        font-size: 24pt;
      }
    `)
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
      :host(:not([backside])) {
        transform: rotateY(360deg);
      }

      :host([backside]) {
        transform: rotateY(180deg);
      }
    `)
  }

  #preferFlipped() {
    this.#flipCss.replaceSync(`
      :host(:not([backside])) {
        transform: rotateY(540deg);
      }

      :host([backside]) {
        transform: rotateY(360deg);
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
    if (!this.#backside) {
      this.#renderFront()
    } else {
      this.#renderBack()
    }
  }

  #renderFront() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
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
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }

  #renderBack() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      back face
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('biz-card', BizCard)
