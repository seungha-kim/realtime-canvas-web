import { h, ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { SystemFacade } from "../SystemFacade";

const SystemFacadeContext = createContext<SystemFacade | null>(null!);

type Props = {
  children: ComponentChildren;
};

export function SystemFacadeProvider(props: Props) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = "localhost:8080";
  const [facade, setFacade] = useState<SystemFacade>(null as any);
  useEffect(() => {
    (async () => {
      // TODO: 객체 생성과 소켓 연결 시점을 분리
      const facade = await SystemFacade.create(`${protocol}//${host}/ws/`);
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
