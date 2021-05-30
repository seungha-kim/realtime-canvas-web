import { ComponentChildren, h } from "preact";
import { Observable, Subject } from "rxjs";
import { Component, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeWith,
  sampleTime,
  takeUntil,
} from "rxjs/operators";
import {
  LivePointerCommand,
  LivePointerEvent,
  SystemFacade,
} from "../SystemFacade";
import { Disposable } from "../utils/Disposable";

export interface LivePointerPushable {
  pushEvent(e: LivePointerCommand): void;
}

class LivePointerManager implements LivePointerPushable, Disposable {
  systemFacade: SystemFacade;
  livePointerEvent$: Observable<LivePointerEvent>;

  private livePointerCommand$ = new Subject<LivePointerCommand>();
  private teardown$ = new Subject<void>();

  constructor(systemFacade: SystemFacade) {
    this.systemFacade = systemFacade;
    this.livePointerEvent$ = systemFacade.livePointerEvent$;

    this.livePointerCommand$
      .pipe(takeUntil(this.teardown$), sampleTime(100), distinctUntilChanged())
      .subscribe((c) => {
        this.systemFacade.sendLivePointer(c);
      });
  }

  dispose(): void {
    this.teardown$.next();
  }

  pushEvent(c: LivePointerCommand) {
    this.livePointerCommand$.next(c);
  }

  livePointerEventByClient$(
    connectionId: number,
    livingDuration: number = 3000
  ) {
    const filtered$ = this.livePointerEvent$.pipe(
      filter((e) => e.connection_id == connectionId)
    );

    const debouncedNull$ = filtered$.pipe(
      debounceTime(livingDuration),
      map(() => null)
    );

    return filtered$.pipe(mergeWith(debouncedNull$));
  }
}

const LivePointerContext = createContext<LivePointerManager>(null as any);

type LivePointerProviderProps = {
  systemFacade: SystemFacade;
  children: ComponentChildren;
};

export class LivePointerProvider extends Component<
  LivePointerProviderProps,
  {}
> {
  livePointerManager = new LivePointerManager(this.props.systemFacade);

  componentWillUnmount() {
    this.livePointerManager.dispose();
  }

  render() {
    return (
      <LivePointerContext.Provider value={this.livePointerManager}>
        {this.props.children}
      </LivePointerContext.Provider>
    );
  }
}

export function useLivePointer(connectionId: number) {
  const manager = useContext(LivePointerContext);
  const [livePointer, setLivePointer] = useState<LivePointerEvent | null>(null);

  useEffect(() => {
    const sub = manager
      .livePointerEventByClient$(connectionId)
      .subscribe((e) => {
        setLivePointer(e);
      });
    return () => sub.unsubscribe();
  }, []);

  return livePointer;
}

export function useLivePointerPushable(): LivePointerPushable {
  return useContext(LivePointerContext);
}
