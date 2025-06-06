import KeyboardModule from "diagram-js/lib/features/keyboard";

import DEMOKeyboardBindings from "./DEMOKeyboardBindings";

export default {
  __depends__: [KeyboardModule],
  __init__: ["keyboardBindings"],
  keyboardBindings: ["type", DEMOKeyboardBindings],
};
