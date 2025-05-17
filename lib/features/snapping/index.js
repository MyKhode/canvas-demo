import DEMOCreateMoveSnapping from "./DEMOCreateMoveSnapping";
import SnappingModule from "diagram-js/lib/features/snapping";
import ObjectConnectSnapping from "./ObjectConnectSnapping";

export default {
  __depends__: [SnappingModule],
  __init__: ["connectSnapping", "createMoveSnapping"],
  connectSnapping: ["type", ObjectConnectSnapping],
  createMoveSnapping: ["type", DEMOCreateMoveSnapping],
};
