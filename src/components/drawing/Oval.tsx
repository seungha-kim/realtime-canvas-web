import { ObjectMaterial } from "../../SystemFacade";

type Props = {
  material: ObjectMaterial["Oval"];
};

function Oval(props: Props) {
  const material = props.material!;
  return (
    <ellipse
      onClick={(e) => {
        e.stopPropagation();
        alert(material.name);
      }}
      cx={material.pos_x}
      cy={material.pos_y}
      rx={material.r_h}
      ry={material.r_v}
    />
  );
}

export default Oval;
