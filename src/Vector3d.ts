import IPosition from './IPosition'

export default class Vector3d {
  private constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  static of(x: number, y: number, z: number) {
    return new Vector3d(x, y, z)
  }

  static from(p: IPosition) {
    return new Vector3d(p.x, p.y, 0)
  }

  get normalized() {
    const n = this.norm

    return new Vector3d(
      this.x / n,
      this.y / n,
      this.z / n
    )
  }

  get norm() {
    return Math.hypot(this.x, this.y, this.z)
  }

  get opposite() {
    return new Vector3d(
      -this.x,
      -this.y,
      -this.z
    )
  }

  /**
   * 法線ベクトルのうち、XY 平面に水平なものを返す.
   */
  get normal() {
    if (this.norm === 0) {
      throw new Error('Zero vector has no normal.')
    }

    return new Vector3d(
      -this.y,
      this.x,
      0
    )
  }

  add(this: Vector3d, that: Vector3d) {
    return new Vector3d(
      this.x + that.x,
      this.y + that.y,
      this.z + that.z
    )
  }

  sub(this: Vector3d, that: Vector3d) {
    return new Vector3d(
      this.x - that.x,
      this.y - that.y,
      this.z - that.z
    )
  }

  dot(this: Vector3d, that: Vector3d) {
    return this.x * that.x + this.y * that.y + this.z * that.z
  }

  cross(this: Vector3d, that: Vector3d) {
    return new Vector3d(
      this.y * that.z - this.z * that.y,
      this.z * that.x - this.x * that.z,
      this.x * that.y - this.y * that.x
    )
  }

  // Scalar MULtiplication
  smul(this: Vector3d, k: number) {
    return new Vector3d(
      k * this.x,
      k * this.y,
      k * this.z
    )
  }

  // Scalar DIVision
  sdiv(this: Vector3d, k: number) {
    return new Vector3d(
      this.x / k,
      this.y / k,
      this.z / k
    )
  }
}
