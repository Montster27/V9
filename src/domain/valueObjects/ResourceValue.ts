import { ResourceType } from '../types';

export class ResourceValue {
  private _value: number;
  private _min: number;
  private _max: number;
  private _type: ResourceType;

  constructor(type: ResourceType, value: number, min = 0, max = 100) {
    this._type = type;
    this._min = min;
    this._max = max;
    this._value = this.clamp(value);
  }

  get value(): number {
    return this._value;
  }

  get type(): ResourceType {
    return this._type;
  }

  get min(): number {
    return this._min;
  }

  get max(): number {
    return this._max;
  }

  set value(newValue: number) {
    this._value = this.clamp(newValue);
  }

  add(amount: number): number {
    this._value = this.clamp(this._value + amount);
    return this._value;
  }

  subtract(amount: number): number {
    this._value = this.clamp(this._value - amount);
    return this._value;
  }

  private clamp(value: number): number {
    return Math.max(this._min, Math.min(this._max, value));
  }

  // Return a new instance with the same properties
  clone(): ResourceValue {
    return new ResourceValue(this._type, this._value, this._min, this._max);
  }

  // For serialization (e.g., to Redux store)
  toJSON() {
    return {
      type: this._type,
      value: this._value,
      min: this._min,
      max: this._max,
    };
  }
}
