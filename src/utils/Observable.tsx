export class Observable<T> {
  value: T;
  observers: Set<(newValue: T, prevValue: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  addObserver = (observer: (newValue: T, prevValue: T) => void) => {
    this.observers.add(observer);
  };

  removeObserver = (observer: (newValue: T, prevValue: T) => void) => {
    this.observers.delete(observer);
  };

  updateValue = (newValue: T) => {
    const prevValue = this.value;
    this.value = newValue;
    for (const observer of this.observers) {
      observer(newValue, prevValue);
    }
  };
}
