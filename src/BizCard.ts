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
 * </biz-card>
 */
class BizCard extends HTMLElement {
  #ipafontCss: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.#ipafontCss = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#ipafontCss)
  }

  connectedCallback() {
    this.#loadCss()
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
    const css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(css)

    const color = this.getAttribute('color')
    const bgColor = this.getAttribute('bg-color')

    css.replaceSync(`
      :host {
        background-color: ${ bgColor ?? 'white' };
        color: ${ color ?? 'black' };
      }

      /* Size */
      :host {
        min-width: 91mm;
        max-width: 91mm;
        min-height: 55mm;
        max-height: 55mm;
      }

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
      :host{
        box-sizing: border-box;
        padding: 4mm;

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

      /* Text */
      :host {
        font-size: 9pt;
        font-feature-settings: 'pwid';
      }

      /* Ordinary */
      :host {
        position: relative;
      }

      ::slotted(*), .accounts {
        position: relative;
      }

      ::slotted(ordinary-) {
        position: revert-layer;
      }
    `)

    const style = document.createElement('style')

    // FIXME: 本当はシャドウルートのスタイルシートで .accounts ::slotted(*)::part(account-info-inner) のようにしたかった。
    style.append(document.createTextNode(`
      /* Layout */
      ::part(account-info-inner) {
        display: grid;
        grid-template-columns: subgrid; /* in .accounts */
        grid-column: 1 / 3;
      }

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

    document.head.append(style)
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
}

customElements.define('biz-card', BizCard)
