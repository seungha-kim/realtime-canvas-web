// @ts-ignore
import mod from "./wasm/realtime-canvas_bg.wasm";
// @ts-ignore
import init, { CanvasSystem } from "./wasm/realtime-canvas";
import { Subject } from "rxjs";

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
type SessionId = number;
type CommandId = number;

export type SystemEvent = {
  JoinedSession?: { session_id: SessionId };
  LeftSession?: null;
  SessionEvent?: {
    LivePointer?: LivePointerEvent;
    SomeoneJoined: ConnectionId;
    SomeoneLeft: ConnectionId;
  };
};

type SystemCommand = {
  CreateSession?: null;
  JoinSession?: { session_id: SessionId };
  LeaveSession?: null;
  SessionCommand?: { LivePointer: LivePointerCommand };
};

interface IdentifiableEvent {
  ByMyself?: {
    command_id: CommandId;
    result: {
      SystemEvent?: SystemEvent;
      Error?: any;
    };
  };
  BySystem?: {
    system_event: SystemEvent;
  };
}

type CommandResolver = {
  resolve: (value: SystemEvent) => void;
  reject: (error: any) => void;
};

export type DocumentMaterial = {
  id: string;
  name: string;
  children: string[];
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
  };
};

export type DocumentCommand = {
  UpdateDocumentName?: { name: string };
  CreateOval?: {
    pos: [number, number];
    r_h: number;
    r_v: number;
  };
  UpdateName?: { id: string; name: string };
  UpdatePosition?: { id: string; pos: [number, number] };
};

type InvalidationListener = (objectId: string) => void;
type SessionSnapshotListener = (sessionSnapshot: SessionSnapshot) => void;
export type SessionSnapshot = {
  connections: number[];
};

export class SystemFacade {
  private system: CanvasSystem;
  private ws: WebSocket;
  private commandResolverRegistry: Map<CommandId, CommandResolver> = new Map();
  private invalidationListeners: Map<
    string,
    Set<InvalidationListener>
  > = new Map();
  private sessionSnapshotChangeListeners: Set<SessionSnapshotListener> = new Set();
  livePointerEvent$ = new Subject<LivePointerEvent>();

  static async create(url: string): Promise<SystemFacade> {
    await init(mod);
    const system = new CanvasSystem();
    (window as any).system = system;
    return new SystemFacade(url, system);
  }

  private constructor(url: string, system: CanvasSystem) {
    this.system = system;

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    this.ws = ws;
    this.setupWebSocketEventHandlers();
  }

  private setupWebSocketEventHandlers() {
    // this.ws.onopen = this.ws.onmessage = this.ws.onerror = this.ws.onclose = console.log
    this.ws.addEventListener("message", (e) => {
      const buf = new Uint8Array(e.data);
      const json = this.system.convert_event_to_json(buf);
      const parsed: IdentifiableEvent = JSON.parse(json);
      this.handleIdentifiableEvent(parsed);

      this.system.handle_event_from_server(buf);
      this.notifyObjectInvalidation();
      this.notifySessionSnapshotInvalidation();
      this.notifyLivePointerEvents();
    });
  }

  createSession(): Promise<SystemEvent> {
    return this.sendCommand({
      CreateSession: null,
    });
  }

  joinSession(sessionId: number): Promise<SystemEvent> {
    return this.sendCommand({
      JoinSession: { session_id: sessionId },
    });
  }

  leaveSession(): Promise<SystemEvent> {
    return this.sendCommand({
      LeaveSession: null,
    });
  }

  sendLivePointer(livePointer: LivePointerCommand) {
    return this.sendCommand(
      {
        SessionCommand: { LivePointer: livePointer },
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

  materializeObject(objectId: string): ObjectMaterial {
    return JSON.parse(this.system.materialize_object(objectId)!);
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
        this.livePointerEvent$.next(e);
      }
    }
  }

  private sendCommand(command: SystemCommand): Promise<SystemEvent>;
  private sendCommand(
    command: SystemCommand,
    registerCommandResolver: false
  ): void;
  private sendCommand(
    command: SystemCommand,
    registerCommandResolver = true
  ): Promise<SystemEvent> | void {
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
    const systemEvent =
      event.BySystem?.system_event ??
      event.ByMyself?.result?.SystemEvent ??
      null;

    if (
      event.ByMyself &&
      this.commandResolverRegistry.has(event.ByMyself.command_id)
    ) {
      const commandId = event.ByMyself.command_id;
      const resolver = this.commandResolverRegistry.get(commandId)!;
      this.commandResolverRegistry.delete(commandId);
      if (systemEvent) {
        resolver.resolve(systemEvent);
      } else {
        resolver.reject(event.ByMyself.result.Error);
      }
    }
  }

  private static logCommand(command: SystemCommand) {
    if (process.env.NODE_ENV == "production") {
      return;
    }
    if (command.SessionCommand?.LivePointer) {
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
