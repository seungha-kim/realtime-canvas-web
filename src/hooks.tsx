import { SessionSnapshot } from "./SystemFacade";
import { useEffect, useState } from "preact/hooks";
import { useSystemFacade } from "./contexts/SystemFacadeContext";

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
