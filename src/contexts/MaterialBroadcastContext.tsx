import { Observable, Subject } from "rxjs";
import { ObjectMaterial, SystemFacade } from "../SystemFacade";
import { finalize, share } from "rxjs/operators";
import { Component, ComponentChildren, createContext, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useSystemFacade } from "./SystemFacadeContext";

class MaterialBroadcastManager {
  readonly documentId: string;

  private systemFacade: SystemFacade;
  private broadcastRegistry = new Map<string, Observable<ObjectMaterial>>();
  private materialCache = new Map<string, ObjectMaterial>();

  constructor(systemFacade: SystemFacade) {
    this.systemFacade = systemFacade;
    this.documentId = systemFacade.materializeDocument().id;
  }

  getMaterialObservable(objectId: string): Observable<ObjectMaterial> {
    if (this.broadcastRegistry.has(objectId)) {
      return this.broadcastRegistry.get(objectId)!;
    } else {
      return this.createMaterialObservable(objectId);
    }
  }

  getCachedMaterial(objectId: string): ObjectMaterial | null {
    return this.materialCache.get(objectId) || null;
  }

  private createMaterialObservable(
    objectId: string
  ): Observable<ObjectMaterial> {
    const subject$ = new Subject<ObjectMaterial>();

    const invalidationCallback = () => {
      const material = this.systemFacade.materializeObject(objectId);
      if (material) {
        this.materialCache.set(objectId, material);
        subject$.next(material);
      }
    };

    const finalizer = () => {
      this.materialCache.delete(objectId);
      this.broadcastRegistry.delete(objectId);
      this.systemFacade.removeInvalidationListener(
        objectId,
        invalidationCallback
      );
    };

    const broadcast$ = subject$.pipe(finalize(finalizer), share());

    const material = this.systemFacade.materializeObject(objectId);
    this.materialCache.set(objectId, material!);
    this.broadcastRegistry.set(objectId, broadcast$);
    this.systemFacade.addInvalidationListener(objectId, invalidationCallback);

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
  const manager = useContext(MaterialBroadcastContext);
  const material$ = useObjectMaterialObservable(objectId);
  const [material, setMaterial] = useState(
    () => manager.getCachedMaterial(objectId)!
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
  const manager = useContext(MaterialBroadcastContext);
  return useObjectMaterial(manager.documentId).Document!;
};
