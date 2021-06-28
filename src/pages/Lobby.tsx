import { h, Component, createRef } from "preact";

type Props = {
  onJoin: (fileId: string) => void;
};

type InnerProps = Props & {};

class LobbyInner extends Component<InnerProps> {
  inputRef = createRef<HTMLInputElement>();

  handleJoin = async () => {
    const fileId = this.inputRef.current!.value;
    try {
      this.props.onJoin(fileId);
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
