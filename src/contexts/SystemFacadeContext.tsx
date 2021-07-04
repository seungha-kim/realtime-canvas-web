import { h, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { SystemFacade } from "../SystemFacade";

const SystemFacadeContext = createContext<SystemFacade | null>(null!);

type Props = {
  fileId: string;
  children: ComponentChildren;
};

export function SystemFacadeProvider(props: Props) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = process.env.WS_HOST;
  const [facade, setFacade] = useState<SystemFacade>(null as any);
  (window as any).system = facade;

  useEffect(() => {
    (async () => {
      const facade = await SystemFacade.create(
        `${protocol}//${host}/ws/${props.fileId}`
      );
      setFacade(facade);
    })();
  }, []);

  return (
    <SystemFacadeContext.Provider value={facade}>
      {facade && props.children}
    </SystemFacadeContext.Provider>
  );
}

export function useSystemFacade() {
  return useContext(SystemFacadeContext)!;
}
