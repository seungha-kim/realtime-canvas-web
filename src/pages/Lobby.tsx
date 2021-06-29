import { h, Component, createRef } from "preact";

type Props = {
  onJoin: (fileId: string) => void;
};

type InnerProps = Props & {};

type InnerState = {
  files: string[] | null;
};

class LobbyInner extends Component<InnerProps, InnerState> {
  inputRef = createRef<HTMLInputElement>();

  constructor(props: InnerProps) {
    super(props);

    this.state = {
      files: null,
    };
  }

  handleCreate = async () => {
    try {
      const res = await fetch(`//${process.env.WS_HOST}/files`, {
        method: "POST",
      });
      const json = await res.json();
      this.props.onJoin(json.fileId);
    } catch (e) {
      alert(e);
    }
  };

  componentDidMount() {
    this.fetchFiles();
  }

  async fetchFiles() {
    const res = await fetch(`//${process.env.WS_HOST}/files`);
    const json = await res.json();
    this.setState({ files: json });
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleCreate}>Create a session</button>
        </div>
        <div>
          {this.state.files?.map((fileId) => (
            <div
              onClick={() => this.props.onJoin(fileId)}
              style={{ cursor: "pointer" }}
            >
              {fileId}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function Lobby(props: Props) {
  return <LobbyInner {...props} />;
}

export default Lobby;
