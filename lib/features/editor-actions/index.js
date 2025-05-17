import EditorActionsModule from "diagram-js/lib/features/editor-actions";

import DEMOEditorActions from "./DEMOEditorActions";

export default {
  __depends__: [EditorActionsModule],
  editorActions: ["type", DEMOEditorActions],
};
