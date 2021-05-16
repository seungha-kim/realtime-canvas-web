import { DocumentMaterial, SystemFacade } from "./SystemFacade";
import { useEffect, useState } from "preact/hooks";

export function useDocumentMaterial(system: SystemFacade) {
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
