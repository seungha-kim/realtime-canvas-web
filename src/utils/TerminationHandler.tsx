import { h } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { useEffect } from "preact/hooks";

type Props = {
  onTermination: () => void;
};

export function TerminationHandler(props: Props) {
  const system = useSystemFacade();
  useEffect(() => {
    const subscription = system.termination$.subscribe(props.onTermination);
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
