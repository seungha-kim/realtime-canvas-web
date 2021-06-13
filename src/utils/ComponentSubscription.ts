import { Observable, Subject } from "rxjs";
import { Component } from "preact";
import { takeUntil } from "rxjs/operators";
import { Disposable } from "./Disposable";

export class ComponentSubscription<
  C extends Component<any, any>,
  // TODO: S 타입추론이 제대로 되지 않음
  S = C extends Component<any, infer State> ? State : never
> implements Disposable {
  private teardown$ = new Subject<void>();
  private readonly componentInstance: C;

  constructor(c: C) {
    this.componentInstance = c;
  }

  addSubscription<T>(
    observable: Observable<T>
    // TODO: computeState: null | ((value: T) => Partial<S>) = null
  ) {
    observable.pipe(takeUntil(this.teardown$)).subscribe((value) => {
      this.componentInstance.setState({});
    });
  }

  dispose() {
    this.teardown$.next();
  }
}
