/**
 * Defines <github-username [squared] [logo-color=Color]>String</github-username>.
 */
class GitHubUsername extends HTMLElement {
  #css: CSSStyleSheet

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.slot = 'accounts'

    this.#css = new CSSStyleSheet()
    this.shadowRoot?.adoptedStyleSheets.push(this.#css)

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
    return ['squared', 'logo-color'] as const
  }

  attributeChangedCallback(name: typeof GitHubUsername.observedAttributes[number]) {
    switch (name) {
      case 'squared':
      case 'logo-color':
        this.#loadCss()
        break

      default:
        name satisfies never
    }
  }

  #loadCss() {
    const squared = this.hasAttribute('squared')
    const logoColor = this.getAttribute('logo-color')

    const faUnicode = !squared ? '\\f09b' : '\\f092'

    this.#css.replaceSync(`
      .with-icon {
        display: grid;
        grid-column: 1 / 3;

        /* 2 cells, 600 dpi */
        gap: calc(2 * 4px * 96 / 600);
        align-items: baseline;
        line-height: 1;
      }

      .with-icon::before {
        justify-self: center;
        display: inline flow-root;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;
      }

      .github::before {
        font: var(--fa-font-brands);
        content: '${ faUnicode }';
        color: ${ logoColor ?? '#1f2328' };
      }
    `)
  }

  #render() {
    const range = new Range()

    const fragment = range.createContextualFragment(`
      <li part="account-info-inner" class="github with-icon">
        <slot></slot>
      </li>
    `)

    this.shadowRoot?.replaceChildren(fragment)
  }
}

customElements.define('github-username', GitHubUsername)
