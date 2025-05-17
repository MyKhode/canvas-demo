import translate from "diagram-js/lib/i18n/translate";

import DEMOOrderingProvider from "./DEMOOrderingProvider";

export default {
  __depends__: [translate],
  __init__: ["demoOrderingProvider"],
  demoOrderingProvider: ["type", DEMOOrderingProvider],
};
