import { Component, h } from "preact";
import { useSystemFacade } from "../contexts/SystemFacadeContext";
import { DocumentMaterial, SystemFacade } from "../SystemFacade";
import { useDocumentMaterial } from "../contexts/MaterialBroadcastContext";
import LayerPanelItem from "./LayerPanelItem";
import {
  FocusType,
  useFocus$,
  useFocusedObjectId,
} from "../contexts/FocusContext";

type Props = {};

type InnerProps = Props & {
  system: SystemFacade;
  document: DocumentMaterial;
  onLayerSelected: (id: string) => void;
};

type InnerState = {};

class LayerPanelInner extends Component<InnerProps, InnerState> {
  render() {
    return (
      <div style={{ backgroundColor: "silver", flex: "0 0 200px" }}>
        {this.props.document?.children.map((id) => {
          return <LayerPanelItem key={id} level={0} id={id} />;
        })}
      </div>
    );
  }
}

function LayerPanel(props: Props) {
  const system = useSystemFacade();
  const document = useDocumentMaterial();
  // TODO: useFocusedObjectId 에 의해 구독이 되고 있기 때문에 일단 호출해둠. 나중에 focus$ 를 직접 구독하는 식으로 변경
  useFocusedObjectId();
  const focus$ = useFocus$();
  return (
    <LayerPanelInner
      document={document}
      system={system}
      onLayerSelected={(id) => {
        focus$.next({
          type: FocusType.layerPanelItem,
          id,
        });
      }}
      {...props}
    />
  );
}

export default LayerPanel;
