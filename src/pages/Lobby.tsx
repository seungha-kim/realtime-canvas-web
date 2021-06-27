import { h, Component, createRef } from "preact";

type Props = {
  onJoin: (sessionId: number) => void;
};

type InnerProps = Props & {};

class LobbyInner extends Component<InnerProps> {
  inputRef = createRef<HTMLInputElement>();

  handleJoin = async () => {
    const sessionId = parseInt(this.inputRef.current!.value, 10);
    try {
      this.props.onJoin(sessionId);
    } catch (e) {
      alert(e);
    }
  };

  render() {
    return (
      <div>
        <div>
          Join a session: <input ref={this.inputRef} type="text" />
          <button onClick={this.handleJoin}>Join!</button>
        </div>
      </div>
    );
  }
}

function Lobby(props: Props) {
  return <LobbyInner {...props} />;
}

export default Lobby;
