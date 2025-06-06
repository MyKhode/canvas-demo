import RulesModule from "../rules";
import DraggingModule from "diagram-js/lib/features/dragging";
import PreviewSupportModule from "diagram-js/lib/features/preview-support";

import Resize from "./Resize";
import ResizePreview from "./ResizePreview";
import ResizeHandles from "./ResizeHandles";

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [RulesModule, DraggingModule, PreviewSupportModule],
  __init__: ["resize", "resizePreview", "resizeHandles"],
  resize: ["type", Resize],
  resizePreview: ["type", ResizePreview],
  resizeHandles: ["type", ResizeHandles],
};
