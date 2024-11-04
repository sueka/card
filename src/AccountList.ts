/**
 * Defines:
 * <account-list>
 *   [<twitter-sn ... />]
 *   [<github-username ... />]
 *   [<web-site ... />]
 * </account-list>
 */
class AccountList extends HTMLElement {
  #css: CSSStyleSheet
  #style: HTMLStyleElement

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'accounts'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

    this.#style = document.createElement('style')
    document.head.append(this.#style)
  }

  connectedCallback() {
    this.#loadCss()
    this.#render()
  }

  #loadCss() {
    this.#css.replaceSync(`
      .accounts {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5mm;

        /* Reset <ul> */
        margin-top: 0;
        margin-bottom: 0;
        padding-left: 0;
      }
    `)

    // FIXME: 本当はシャドウルートのスタイルシートで .accounts ::slotted(*)::part(account-info-inner) のようにしたかった。
    this.#style.replaceChildren(document.createTextNode(`
      /* Layout */
      ::part(account-info-inner) {
        display: grid;
        grid-template-columns: subgrid; /* in .accounts */
        grid-column: 1 / 3;
      }
    `))
  }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <ul class="accounts">
        <slot name="account"></slot>
      </ul>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('account-list', AccountList)
