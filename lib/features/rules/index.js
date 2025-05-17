import RulesModule from "diagram-js/lib/features/rules";

import DEMORules from "./DEMORules";

export default {
  __depends__: [RulesModule],
  __init__: ["demoRules"],
  demoRules: ["type", DEMORules],
};
