type Constructor<T> = new (...args: any[]) => T

interface CustomHTMLElement extends HTMLElement {
  connectedCallback?(): void
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void
}

interface CustomElementConstructor extends Constructor<CustomHTMLElement> {
  observedAttributes?: readonly string[]
}

export default function Standaloneable<T extends CustomElementConstructor>(BaseClass: T) {
  return class extends BaseClass {
    #slotName: string

    constructor(...args: any[]) {
      super(...args)
      this.#slotName = this.slot
    }

    override connectedCallback() {
      super.connectedCallback?.()
      this.#updateSlot()
    }

    static override get observedAttributes() {
      return [...(BaseClass.observedAttributes ?? []), 'standalone']
    }

    override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      super.attributeChangedCallback?.(name, oldValue, newValue)

      if (name === 'standalone') {
        this.#localAttributeChangedCallback(name)
      }
    }

    #localAttributeChangedCallback(name: 'standalone') {
      switch (name) {
        case 'standalone':
          this.#updateSlot()
          break

        default:
          name satisfies never
      }
    }

    #updateSlot() {
      if (!this.hasAttribute('standalone')) {
        this.slot = this.#slotName // This will be inserted to <slot name="{this.#slotName}"></slot>
      } else {
        this.removeAttribute('slot') // This will be inserted to <slot></slot>
      }
    }
  }
}
