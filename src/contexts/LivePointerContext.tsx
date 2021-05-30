import { ComponentChildren, h } from "preact";
import { interval, Observable, Subject } from "rxjs";
import { Component, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeWith,
  sample,
} from "rxjs/operators";
import {
  LivePointerCommand,
  LivePointerEvent,
  SystemFacade,
} from "../SystemFacade";

export interface LivePointerPushable {
  pushEvent(e: LivePointerCommand): void;
}

class LivePointerManager implements LivePointerPushable {
  systemFacade: SystemFacade;
  livePointerEvent$: Observable<LivePointerEvent>;

  private livePointerCommand$ = new Subject<LivePointerCommand>();
  private livePointerSendInterval$ = interval(100);
  // TODO: dispose
  private livePointerCommandSubscription = this.livePointerCommand$
    .pipe(sample(this.livePointerSendInterval$), distinctUntilChanged())
    .subscribe((c) => {
      this.systemFacade.sendLivePointer(c);
    });

  constructor(systemFacade: SystemFacade) {
    this.systemFacade = systemFacade;
    systemFacade.materializeSession();
    this.livePointerEvent$ = this.systemFacade.livePointerEvent$;
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
