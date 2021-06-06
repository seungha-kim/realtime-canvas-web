import { Observable, Subject } from "rxjs";
import { ObjectMaterial, SystemFacade } from "../SystemFacade";
import { finalize, share } from "rxjs/operators";
import { Component, ComponentChildren, createContext, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useSystemFacade } from "./SystemFacadeContext";

export class MaterialBroadcastManager {
  private systemFacade: SystemFacade;
  private broadcastRegistry = new Map<string, Observable<ObjectMaterial>>();

  constructor(systemFacade: SystemFacade) {
    this.systemFacade = systemFacade;
  }

  getMaterialObservable(objectId: string): Observable<ObjectMaterial> {
    if (this.broadcastRegistry.has(objectId)) {
      return this.broadcastRegistry.get(objectId)!;
    } else {
      return this.createMaterialObservable(objectId);
    }
  }

  private createMaterialObservable(
    objectId: string
  ): Observable<ObjectMaterial> {
    const subject$ = new Subject<ObjectMaterial>();
    const invalidationCallback = () => {
      subject$.next(this.systemFacade.materializeObject(objectId));
    };
    this.systemFacade.addInvalidationListener(objectId, invalidationCallback);
    const broadcast$ = subject$.pipe(
      finalize(() => {
        this.broadcastRegistry.delete(objectId);
        this.systemFacade.removeInvalidationListener(
          objectId,
          invalidationCallback
        );
      }),
      share()
    );
    this.broadcastRegistry.set(objectId, broadcast$);
    return broadcast$;
  }
}

const MaterialBroadcastContext = createContext<MaterialBroadcastManager>(
  null as any
);

type ProviderProps = {
  systemFacade: SystemFacade;
  children: ComponentChildren;
};

export class MaterialBroadcastProvider extends Component<ProviderProps, {}> {
  private manager = new MaterialBroadcastManager(this.props.systemFacade);
  render() {
    return (
      <MaterialBroadcastContext.Provider value={this.manager}>
        {this.props.children}
      </MaterialBroadcastContext.Provider>
    );
  }
}

export const useObjectMaterialObservable = (objectId: string) => {
  const manager = useContext(MaterialBroadcastContext);

  return manager.getMaterialObservable(objectId);
};

export const useObjectMaterial = (objectId: string) => {
  const systemFacade = useSystemFacade();
  const material$ = useObjectMaterialObservable(objectId);
  const [material, setMaterial] = useState(() =>
    systemFacade.materializeObject(objectId)
  );
  useEffect(() => {
    const sub = material$.subscribe((material) => {
      setMaterial(material);
    });
    return () => sub.unsubscribe();
  }, []);
  return material;
};

export const useDocumentMaterial = () => {
  const systemFacade = useSystemFacade();
  const [documentId] = useState(() => {
    const document = systemFacade.materializeDocument();
    return document.id;
  });
  return useObjectMaterial(documentId).Document!;
};
