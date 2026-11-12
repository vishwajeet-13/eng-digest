import { Composition } from "remotion";
import { Explainer, ExplainerProps } from "./Explainer";

const sample: ExplainerProps = {
  total: 150,
  scenes: [{ scene: "title", text: "Sample scene for the studio preview.", from: 0, duration: 150, kicker: "Engineering Digest", big: "Hello", emoji: "👋" }],
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Explainer"
    component={Explainer}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={sample}
    calculateMetadata={({ props }) => ({ durationInFrames: props.total })}
  />
);
