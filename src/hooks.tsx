import {
  DocumentMaterial,
  ObjectMaterial,
  SessionSnapshot,
} from "./SystemFacade";
import { useEffect, useState } from "preact/hooks";
import { useSystemFacade } from "./contexts/SystemFacadeContext";

export function useDocumentMaterial() {
  const system = useSystemFacade();

  const [
    documentMaterial,
    setDocumentMaterial,
  ] = useState<DocumentMaterial | null>(null);
  useEffect(() => {
    const documentMaterial = system.materializeDocument();

    const sync = () => {
      setDocumentMaterial(system.materializeDocument());
    };
    sync();

    system.addInvalidationListener(documentMaterial.id, sync);

    return () => {
      system.removeInvalidationListener(documentMaterial.id, sync);
    };
  }, []);

  return documentMaterial;
}

export function useSessionSnapshot() {
  const system = useSystemFacade();

  const [
    sessionSnapshot,
    setSessionSnapshot,
  ] = useState<SessionSnapshot | null>(null);
  useEffect(() => {
    const sync = () => {
      setSessionSnapshot(system.materializeSession());
    };
    sync();

    system.addSessionSnapshotChangeListener(sync);

    return () => {
      system.removeSessionSnapshotChangeListener(sync);
    };
  }, []);

  return sessionSnapshot;
}

export function useObjectMaterial(id: string) {
  const system = useSystemFacade();

  const [material, setMaterial] = useState<ObjectMaterial | null>(null);
  useEffect(() => {
    const sync = () => {
      setMaterial(system.materializeObject(id));
    };
    sync();

    system.addInvalidationListener(id, sync);

    return () => {
      system.removeInvalidationListener(id, sync);
    };
  }, [id]);

  return material;
}
