import CopyPasteModule from "diagram-js/lib/features/copy-paste";

import DEMOCopyPaste from "./DEMOCopyPaste";
import ModdleCopy from "./ModdleCopy";

export default {
  __depends__: [CopyPasteModule],
  __init__: ["demoCopyPaste", "moddleCopy"],
  demoCopyPaste: ["type", DEMOCopyPaste],
  moddleCopy: ["type", ModdleCopy],
};
