import translate from "diagram-js/lib/i18n/translate";

import DemoImporter from "./DemoImporter";

export default {
  __depends__: [translate],
  demoImporter: ["type", DemoImporter],
};
