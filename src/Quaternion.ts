import type IPosition from './IPosition'
import Vector3d from './Vector3d.js'
import assert from './assert.js'

/**
 * 四元数. 回転の表現に用いる.
 */
export default class Quaternion {
  private constructor(
    public w: number,
    public v: Vector3d
  ) {}

  static of(w: number, x: number, y: number, z: number) {
    return new Quaternion(w, Vector3d.of(x, y, z))
  }

  static from(v: Vector3d) {
    return new Quaternion(0, v)
  }

  static get neutral() {
    return new Quaternion(1, Vector3d.of(0, 0, 0))
  }

  static get flipped() {
    return new Quaternion(0, Vector3d.of(0, 1, 0))
  }

  static get upsideDown() {
    return new Quaternion(0, Vector3d.of(0, 0, 1))
  }

  static get rolledClockwise() {
    return new Quaternion(Math.SQRT1_2, Vector3d.of(0, 0, Math.SQRT1_2))
  }

  static get rolledCounterClockwise() {
    return new Quaternion(-Math.SQRT1_2, Vector3d.of(0, 0, Math.SQRT1_2))
  }

  get conjugate() {
    return new Quaternion(this.w, this.v.opposite)
  }

  get norm() {
    return Math.hypot(this.w, this.v.norm)
  }

  get inverse() {
    return this.conjugate.sdiv(this.norm * this.norm)
  }

  transformVector(this: Quaternion, v: Vector3d): Vector3d {
    const qv = Quaternion.from(v)
    const qv_ = this.mul(qv).mul(this.inverse)

    return qv_.v
  }

  dot(this: Quaternion, that: Quaternion) {
    return this.w * that.w + this.v.dot(that.v)
  }

  mul(this: Quaternion, that: Quaternion) {
    return new Quaternion(
      this.w * that.w - this.v.dot(that.v),
      that.v.smul(this.w).add(this.v.smul(that.w)).add(this.v.cross(that.v))
    )
  }

  // 回転の合成を自然な順で記述するためのヘルパー関数
  then(this: Quaternion, that: Quaternion) {
    return that.mul(this)
  }

  // Scalar DIVision
  sdiv(this: Quaternion, n: number) {
    return new Quaternion(
      this.w / n,
      this.v.sdiv(n)
    )
  }

  rotateByDrag(this: Quaternion, startPoint: IPosition, endPoint: IPosition): Quaternion {
    const drag = Vector3d.from(endPoint).sub(Vector3d.from(startPoint))
    const angle = drag.norm * Math.PI / 180

    if (angle === 0) {
      return this
    }

    const normal = drag.normal.normalized
    const rotation = Quaternion.fromAxisAngle(normal, angle)

    return this.then(rotation)
  }

  roll(this: Quaternion, angle: number): Quaternion {
    const rotation = Quaternion.fromAxisAngle(Vector3d.of(0, 0, 1), angle)

    return this.then(rotation)
  }

  /**
   * this と orientation の間の角が error 以下の場合、orientation にスナップする.
   */
  snap(this: Quaternion, orientation: Quaternion, error: number) {
    assert(error >= 0)
    const angle = this.#angleTo(orientation)

    if (Number.isNaN(angle) || Math.abs(angle) < error) {
      return orientation
    }

    return this
  }

  #angleTo(this: Quaternion, that: Quaternion) {
    const { angle } = that.mul(this.conjugate).toAxisAngle()

    return (angle > Math.PI) ? angle - 2 * Math.PI : angle
  }

  static fromAxisAngle(axis: Vector3d, angle: number) {
    return new Quaternion(
      Math.cos(angle / 2),
      axis.smul(Math.sin(angle / 2))
    )
  }

  toAxisAngle(this: Quaternion): { axis: Vector3d, angle: number } {
    const w = Math.max(-1, Math.min(this.w, 1))
    const angle = 2 * Math.acos(w)
    const s = Math.sqrt(1 - w * w) // sin(angle / 2)
    const axis = s !== 0 ? this.v.sdiv(s) : Vector3d.of(1, 0, 0)

    return { axis, angle }
  }
}
