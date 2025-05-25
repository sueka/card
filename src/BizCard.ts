import Rotational from './Rotational.js'

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
 *   [<account-list ... />]
 *   [<back-face ... />]
 *   [<braille-guide ... />]
 * </biz-card>
 */
class BizCard extends HTMLElement {
  #css: CSSStyleSheet
  #style: HTMLStyleElement
  #frontCss: CSSStyleSheet
  #frontStyle: HTMLStyleElement
  #ipafontCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

    this.#style = document.createElement('style')
    document.head.append(this.#style)

    this.#frontCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#frontCss)

    this.#frontStyle = document.createElement('style')
    document.head.append(this.#frontStyle)

    this.#ipafontCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#ipafontCss)
  }

  connectedCallback() {
    this.#loadCss()
    this.#preferFaceCss()
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

  #loadCss() {
    const color = this.getAttribute('color')
    const bgColor = this.getAttribute('bg-color')

    this.#css.replaceSync(`
      /* Form */
      :host {
        transform-style: preserve-3d;
      }

      .front {
        transform: translateZ(calc(var(--depth) / 2));
      }

      .back, .braille {
        transform: rotateY(180deg) translateZ(calc(var(--depth) / 2));
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
        height: var(--depth);
        width: var(--width);
      }

      .edge.dexter, .edge.sinister {
        height: var(--height);
        width: var(--depth);
      }

      .edge.top {
        transform: rotateX(90deg) translateZ(calc(var(--height) / 2));
      }

      .edge.bottom {
        transform: rotateX(-90deg) translateZ(calc(var(--height) / 2));
      }

      .edge.dexter {
        transform: rotateY(-90deg) translateZ(calc(var(--width) / 2));
      }

      .edge.sinister {
        transform: rotateY(90deg) translateZ(calc(var(--width) / 2));
      }

      .front, .back {
        background-color: ${ bgColor ?? 'white' };
        color: ${ color ?? 'black' };
        position: absolute;
      }

      .braille {
        pointer-events: none;
      }

      /* Size */
      :host, .front, .back, .braille {
        min-width: var(--width);
        max-width: var(--width);
        min-height: var(--height);
        max-height: var(--height);
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

      ::slotted(*) {
        position: relative;
      }

      ::slotted(ordinary-) {
        position: revert-layer;
      }
    `)

    this.#style.replaceChildren(document.createTextNode(`
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
        width: min((var(--width) - 8mm) / 2, (var(--height) - 8mm) / 2);
        height: min((var(--width) - 8mm) / 2, (var(--height) - 8mm) / 2);
      }

      ::slotted(account-list) {
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
        min-width: 0;
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
        align-items: stretch;
        gap: 3mm;
      }

      .profile-name {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      slot[name=title] {
        display: inline;
      }

      .back {
        display: flex;
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

    // NOTE: No need to reject the at-font-face rule.
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
          <slot name="accounts"></slot>
        </div>
        <div class="right-col">
          <slot name="qr-code"></slot>
        </div>
      </div>
      <div class="back">
        <slot name="back-face"></slot>
      </div>
      <div class="braille">
        <slot name="braille-guide"></slot>
      </div>
      <div class="edge top"></div>
      <div class="edge bottom"></div>
      <div class="edge dexter"></div>
      <div class="edge sinister"></div>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('biz-card', Rotational(BizCard))
