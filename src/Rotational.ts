import type IPosition from './IPosition'
import Quaternion from './Quaternion.js'
import Vector3d from './Vector3d.js'
import assert from './assert.js'

type Constructor<T = {}> = new (...args: any[]) => T

export default function Rotational<T extends Constructor<HTMLElement>> (BaseClass: T) {
  return class extends BaseClass {
    #rotationCss: CSSStyleSheet
    #rotation = Quaternion.neutral
    #timerId: number | null = null
    #dragging = false
    #pinching = false
    #lastDragPosition: IPosition | null = null
    #lastPinchAngle: number | null = null

    constructor(...args: any[]) {
      super(...args)

      this.#rotationCss = new CSSStyleSheet()
      this.shadowRoot?.adoptedStyleSheets.push(this.#rotationCss)

      globalThis.addEventListener('mousedown', this.#handleDragStart.bind(this))
      globalThis.addEventListener('mousemove', this.#handleDrag.bind(this))
      globalThis.addEventListener('mouseup', this.#handleDragEnd.bind(this))
      globalThis.addEventListener('mouseleave', this.#handleDragEnd.bind(this))
      globalThis.addEventListener('wheel', this.#handleWheel.bind(this))
      globalThis.addEventListener('touchstart', this.#handleDragStart.bind(this))
      globalThis.addEventListener('touchmove', this.#handleDrag.bind(this))
      globalThis.addEventListener('touchend', this.#handleDragEnd.bind(this))
      globalThis.addEventListener('touchcancel', this.#handleDragEnd.bind(this))
      globalThis.addEventListener('touchstart', this.#handlePinchStart.bind(this))
      globalThis.addEventListener('touchmove', this.#handlePinch.bind(this))
      globalThis.addEventListener('touchend', this.#handlePinchEnd.bind(this))
      globalThis.addEventListener('touchcancel', this.#handlePinchEnd.bind(this))
    }

    #handleDragStart(event: MouseEvent | TouchEvent) {
      if (event instanceof MouseEvent) {
        this.#dragging = true
        this.#lastDragPosition = this.#getDragPosition(event)
      } else {
        this.#updateTouchState(event)
      }
    }

    #handleDrag(event: MouseEvent | TouchEvent) {
      if (!this.#dragging) {
        return
      }

      assert(this.#lastDragPosition != null)

      const currentPosition = this.#getDragPosition(event)
      this.#rotation = this.#rotation.rotateByDrag(this.#lastDragPosition, currentPosition)
      this.#lastDragPosition = currentPosition
      this.#applyRotation()
    }

    #handleDragEnd(event: MouseEvent | TouchEvent) {
      if (!this.#dragging) {
        return
      }

      if (event instanceof MouseEvent) {
        this.#dragging = false
        this.#lastDragPosition = null
      } else {
        this.#updateTouchState(event)
      }

      if (this.#timerId != null) {
        clearTimeout(this.#timerId)
      }

      this.#timerId = window.setTimeout(() => {
        this.#snapToNearestOrientation()
        this.#timerId = null
      }, 200)
    }

    #getDragPosition(event: MouseEvent | TouchEvent): IPosition {
      if (event instanceof MouseEvent) {
        return { x: event.clientX, y: event.clientY }
      } else {
        assert(event.touches[0] != null)
        return { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
    }

    #handleWheel(event: WheelEvent) {
      this.#rotation = this.#rotation.roll(event.deltaY * Math.PI / 180)
      this.#applyRotation()

      if (this.#timerId != null) {
        clearTimeout(this.#timerId)
      }

      this.#timerId = window.setTimeout(() => {
        this.#snapToNearestOrientation()
        this.#timerId = null
      }, 200)
    }

    #handlePinchStart(event: TouchEvent) {
      this.#updateTouchState(event)
    }

    #handlePinch(event: TouchEvent) {
      if (!this.#pinching) {
        return
      }

      assert(this.#lastPinchAngle != null)

      const currentPinchAngle = this.#getPinchAngle(event)
      this.#rotation = this.#rotation.roll(-(currentPinchAngle - this.#lastPinchAngle))
      this.#lastPinchAngle = currentPinchAngle
      this.#applyRotation()
    }

    #handlePinchEnd(event: TouchEvent) {
      if (!this.#pinching) {
        return
      }

      this.#updateTouchState(event)

      if (this.#timerId != null) {
        clearTimeout(this.#timerId)
      }

      this.#timerId = window.setTimeout(() => {
        this.#snapToNearestOrientation()
        this.#timerId = null
      }, 200)
    }

    #getPinchAngle(event: TouchEvent): number {
      assert(event.touches[0] != null)
      assert(event.touches[1] != null)
      const thumb = Vector3d.from({ x: event.touches[0].clientX, y: event.touches[0].clientY })
      const index = Vector3d.from({ x: event.touches[1].clientX, y: event.touches[1].clientY })

      const { x, y } = index.sub(thumb)

      return Math.atan2(-y, x)
    }

    #updateTouchState(event: TouchEvent) {
      this.#dragging = event.touches.length === 1
      this.#pinching = event.touches.length === 2

      this.#lastDragPosition = this.#dragging ? this.#getDragPosition(event) : null
      this.#lastPinchAngle = this.#pinching ? this.#getPinchAngle(event) : null
    }

    #snapToNearestOrientation(): void {
      this.#rotation = this.#rotation
        .snap(Quaternion.neutral, 30 * Math.PI / 180)
        .snap(Quaternion.upsideDown, 30 * Math.PI / 180)
        .snap(Quaternion.rolledClockwise, 30 * Math.PI / 180)
        .snap(Quaternion.rolledCounterClockwise, 30 * Math.PI / 180)
        .snap(Quaternion.flipped, 30 * Math.PI / 180)
        .snap(Quaternion.flipped.then(Quaternion.upsideDown), 30 * Math.PI / 180)
        .snap(Quaternion.flipped.then(Quaternion.rolledClockwise), 30 * Math.PI / 180)
        .snap(Quaternion.flipped.then(Quaternion.rolledCounterClockwise), 30 * Math.PI / 180)

      this.#applyRotation()
    }

    #applyRotation(): void {
      const { axis, angle } = this.#rotation.toAxisAngle()

      this.#rotationCss.replaceSync(`
        :host {
          transform: rotate3d(${axis.x},
                              ${axis.y},
                              ${axis.z},
                              ${angle}rad);
        }
      `)
    }
  }
}
