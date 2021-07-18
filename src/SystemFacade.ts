// @ts-ignore
import mod from "./wasm/realtime-canvas_bg.wasm";
// @ts-ignore
import init, { CanvasSystem } from "./wasm/realtime-canvas";
import { Subject } from "rxjs";
import { Disposable } from "./utils/Disposable";
import { takeUntil } from "rxjs/operators";

export interface LivePointerEvent {
  connection_id: number;
  x: number;
  y: number;
}

export interface LivePointerCommand {
  x: number;
  y: number;
}

type ConnectionId = number;
type FileId = string;
type CommandId = number;

type SessionCommand = { LivePointer: LivePointerCommand };

type SessionEvent = {
  LivePointer?: LivePointerEvent;
  SomeoneJoined?: ConnectionId;
  SomeoneLeft?: ConnectionId;
};

interface IdentifiableEvent {
  ByMyself?: {
    command_id: CommandId;
    result: {
      SessionEvent?: SessionEvent;
      Error?: any;
    };
  };
  BySystem?: {
    session_event: SessionEvent;
  };
}

type CommandResolver = {
  resolve: (value: SessionEvent) => void;
  reject: (error: any) => void;
};

export type DocumentMaterial = {
  id: string;
  name: string;
  children: string[];
};

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type ObjectMaterial = {
  Document?: DocumentMaterial;
  Oval?: {
    id: string;
    name: string;
    pos_x: number;
    pos_y: number;
    r_h: number;
    r_v: number;
    fill_color: Color;
  };
  Frame?: {
    id: string;
    name: string;
    pos_x: number;
    pos_y: number;
    w: number;
    h: number;
    children: string[];
  };
};

export function getPos(material: ObjectMaterial): [number, number] {
  if (material.Oval) {
    return [material.Oval.pos_x, material.Oval.pos_y];
  } else if (material.Frame) {
    return [material.Frame.pos_x, material.Frame.pos_y];
  } else {
    throw new Error("Unsupported material");
  }
}

export type DocumentCommand = {
  UpdateDocumentName?: { name: string };
  CreateOval?: {
    pos: [number, number];
    r_h: number;
    r_v: number;
    fill_color: Color;
  };
  CreateFrame?: {
    pos: [number, number];
    w: number;
    h: number;
  };
  UpdateName?: { id: string; name: string };
  UpdatePosition?: { id: string; pos: [number, number] };
  DeleteObject?: { id: string };
  UpdateIndex?: { id: string; int_index: number };
  UpdateParent?: { id: string; parent_id: string };
};

type InvalidationListener = (objectId: string) => void;
type SessionSnapshotListener = (sessionSnapshot: SessionSnapshot) => void;
export type SessionSnapshot = {
  connections: number[];
};

export class SystemFacade implements Disposable {
  private system: CanvasSystem;
  private ws: WebSocket;
  private commandResolverRegistry: Map<CommandId, CommandResolver> = new Map();
  private invalidationListeners: Map<
    string,
    Set<InvalidationListener>
  > = new Map();
  private sessionSnapshotChangeListeners: Set<SessionSnapshotListener> = new Set();
  private teardown$ = new Subject<void>();
  private livePointerEventSubject$ = new Subject<LivePointerEvent>();
  private terminationSubject$ = new Subject<void>();
  readonly livePointerEvent$ = this.livePointerEventSubject$.pipe(
    takeUntil(this.teardown$)
  );
  readonly termination$ = this.terminationSubject$.pipe(
    takeUntil(this.teardown$)
  );

  static async create(url: string): Promise<SystemFacade> {
    await init(mod);

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    const system = await this.initializeSystem(ws);

    return new SystemFacade(system, ws);
  }

  static async initializeSystem(ws: WebSocket): Promise<CanvasSystem> {
    return new Promise((resolve) => {
      const listener = (e: MessageEvent) => {
        ws.removeEventListener("message", listener);

        const buf = new Uint8Array(e.data);
        const system = new CanvasSystem(buf);
        (window as any).system = system;
        resolve(system);
      };
      ws.addEventListener("message", listener);
    });
  }

  private constructor(system: CanvasSystem, ws: WebSocket) {
    this.system = system;
    this.ws = ws;
    this.setupWebSocketEventHandlers();
  }

  dispose() {
    this.ws.close();
    this.system.free();
    this.teardown$.next();
  }

  private setupWebSocketEventHandlers() {
    // this.ws.onopen = this.ws.onmessage = this.ws.onerror = this.ws.onclose = console.log
    this.ws.addEventListener("message", (e) => {
      // TODO: handle event more elegantly rather than using raw event
      const buf = new Uint8Array(e.data);
      const json = this.system.convert_event_to_json(buf);
      const parsed: IdentifiableEvent = JSON.parse(json);
      this.handleIdentifiableEvent(parsed);

      this.system.handle_event_from_server(buf);
      if (this.system.terminated()) {
        this.ws.close();
        this.terminationSubject$.next();
      } else {
        this.notifyObjectInvalidation();
        this.notifySessionSnapshotInvalidation();
        this.notifyLivePointerEvents();
      }
    });
  }

  sendLivePointer(livePointer: LivePointerCommand) {
    return this.sendCommand(
      {
        LivePointer: livePointer,
      },
      false
    );
  }

  materializeDocument(): DocumentMaterial {
    return JSON.parse(this.system.materialize_document()!);
  }

  materializeSession(): SessionSnapshot {
    return JSON.parse(this.system.materialize_session()!);
  }

  materializeObject(objectId: string): ObjectMaterial | null {
    try {
      return JSON.parse(this.system.materialize_object(objectId));
    } catch {
      return null;
    }
  }

  pushDocumentCommand(command: DocumentCommand) {
    this.system.push_document_command(JSON.stringify(command));
    this.notifyObjectInvalidation();
    while (true) {
      const pendingCommand = this.system.consume_pending_identifiable_command();
      if (pendingCommand) {
        this.ws.send(pendingCommand);
      } else {
        break;
      }
    }
  }

  undo() {
    this.system.undo();
    this.notifyObjectInvalidation();
    while (true) {
      const pendingCommand = this.system.consume_pending_identifiable_command();
      if (pendingCommand) {
        this.ws.send(pendingCommand);
      } else {
        break;
      }
    }
  }

  redo() {
    this.system.redo();
    this.notifyObjectInvalidation();
    while (true) {
      const pendingCommand = this.system.consume_pending_identifiable_command();
      if (pendingCommand) {
        this.ws.send(pendingCommand);
      } else {
        break;
      }
    }
  }

  addInvalidationListener(objectId: string, listener: InvalidationListener) {
    const listeners = this.invalidationListeners.get(objectId) ?? new Set();
    listeners.add(listener);
    this.invalidationListeners.set(objectId, listeners);
  }

  removeInvalidationListener(objectId: string, listener: InvalidationListener) {
    this.invalidationListeners.get(objectId)?.delete(listener);
  }

  addSessionSnapshotChangeListener(listener: SessionSnapshotListener) {
    this.sessionSnapshotChangeListeners.add(listener);
  }

  removeSessionSnapshotChangeListener(listener: SessionSnapshotListener) {
    this.sessionSnapshotChangeListeners.delete(listener);
  }

  private notifyObjectInvalidation() {
    const invalidatedObjectIds = this.consumeInvalidatedObjectIds();
    for (const objectId of invalidatedObjectIds) {
      const listeners = this.invalidationListeners.get(objectId);
      if (listeners) {
        for (const listener of listeners.values()) {
          listener(objectId);
        }
      }
    }
  }

  private notifySessionSnapshotInvalidation() {
    const snapshotJson = this.system.consume_latest_session_snapshot();
    if (snapshotJson) {
      const parsed = JSON.parse(snapshotJson);
      for (const listener of this.sessionSnapshotChangeListeners) {
        listener(parsed);
      }
    }
  }

  private notifyLivePointerEvents() {
    const json = this.system.consume_live_pointer_events();
    if (json) {
      const parsed = JSON.parse(json);
      for (const e of parsed) {
        this.livePointerEventSubject$.next(e);
      }
    }
  }

  private sendCommand(command: SessionCommand): Promise<SessionEvent>;
  private sendCommand(
    command: SessionCommand,
    registerCommandResolver: false
  ): void;
  private sendCommand(
    command: SessionCommand,
    registerCommandResolver = true
  ): Promise<SessionEvent> | void {
    SystemFacade.logCommand(command);
    const commandBuf = this.system.create_command(JSON.stringify(command));
    this.ws.send(commandBuf);
    if (registerCommandResolver) {
      const commandId = this.system.last_command_id();
      return new Promise((resolve, reject) => {
        this.registerCommandResolver(commandId, { resolve, reject });
      });
    }
  }

  private registerCommandResolver(commandId: number, resolve: CommandResolver) {
    // TODO: timeout
    this.commandResolverRegistry.set(commandId, resolve);
  }

  private handleIdentifiableEvent(event: IdentifiableEvent) {
    const sessionEvent =
      event.BySystem?.session_event ??
      event.ByMyself?.result?.SessionEvent ??
      null;

    if (
      event.ByMyself &&
      this.commandResolverRegistry.has(event.ByMyself.command_id)
    ) {
      const commandId = event.ByMyself.command_id;
      const resolver = this.commandResolverRegistry.get(commandId)!;
      this.commandResolverRegistry.delete(commandId);
      if (sessionEvent) {
        resolver.resolve(sessionEvent);
      } else {
        resolver.reject(event.ByMyself.result.Error);
      }
    }
  }

  private static logCommand(command: SessionCommand) {
    if (process.env.NODE_ENV == "production") {
      return;
    }
    if (command.LivePointer) {
      console.debug(this.formatJson(command));
    } else {
      console.info(this.formatJson(command));
    }
  }

  private static formatJson(obj: any) {
    return JSON.stringify(obj, null, 2);
  }

  private consumeInvalidatedObjectIds(): string[] {
    return JSON.parse(this.system.consume_invalidated_object_ids());
  }
}
