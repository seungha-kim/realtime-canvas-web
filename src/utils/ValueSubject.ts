import { Subject } from "rxjs";

export class ValueSubject<T> extends Subject<T> {
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  next(value: T) {
    this._value = value;
    super.next(value);
  }
}
