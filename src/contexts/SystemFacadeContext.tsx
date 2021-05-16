import { SystemFacade } from "../SystemFacade";
import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

const SystemFacadeContext = createContext<SystemFacade | null>(null!);

type Props = {
  children: ComponentChildren;
};

export function SystemFacadeProvider(props: Props) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = "localhost:8080";
  const [facade, setFacade] = useState<SystemFacade | null>(null);
  useEffect(() => {
    (async () => {
      const facade = await SystemFacade.create(`${protocol}//${host}/ws/`);
      setFacade(facade);
    })();
  }, []);

  return (
    <SystemFacadeContext.Provider value={facade}>
      {props.children}
    </SystemFacadeContext.Provider>
  );
}

export function useSystemFacade() {
  return useContext(SystemFacadeContext);
}
