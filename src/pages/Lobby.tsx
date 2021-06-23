import { h, Component, createRef } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { SystemFacade } from "../SystemFacade";

type Props = {
  onJoin: (sessionId: number) => void;
};

type InnerProps = Props & {
  system: SystemFacade;
};

class LobbyInner extends Component<InnerProps> {
  inputRef = createRef<HTMLInputElement>();

  handleCreate = async () => {
    const event = await this.props.system.createSession();
    this.props.onJoin(event.JoinedSession!.session_id);
  };

  handleJoin = async () => {
    const sessionId = parseInt(this.inputRef.current!.value, 10);
    try {
      const event = await this.props.system.joinSession(sessionId);
      this.props.onJoin(event.JoinedSession!.session_id);
    } catch (e) {
      alert(e);
    }
  };

  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleCreate}>Create a session</button>
        </div>
        <div>Or</div>
        <div>
          Join a session: <input ref={this.inputRef} type="text" />
          <button onClick={this.handleJoin}>Join!</button>
        </div>
      </div>
    );
  }
}

function Lobby(props: Props) {
  const system = useSystemFacade();
  if (system) {
    return <LobbyInner {...props} system={system} />;
  } else {
    return null;
  }
}

export default Lobby;
