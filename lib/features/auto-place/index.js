import AutoPlaceModule from "diagram-js/lib/features/auto-place";

import DEMOAutoPlace from "./DEMOAutoPlace";

export default {
  __depends__: [AutoPlaceModule],
  __init__: ["demoAutoPlace"],
  demoAutoPlace: ["type", DEMOAutoPlace],
};
