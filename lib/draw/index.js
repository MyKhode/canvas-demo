import DEMORenderer from "./DEMORenderer";
import TextRenderer from "./TextRenderer";

export default {
  __init__: ["demoRenderer"],
  demoRenderer: ["type", DEMORenderer],
  textRenderer: ["type", TextRenderer],
};
