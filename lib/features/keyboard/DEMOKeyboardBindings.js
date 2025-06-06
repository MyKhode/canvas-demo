import inherits from "inherits-browser";

import KeyboardBindings from "diagram-js/lib/features/keyboard/KeyboardBindings";

/**
 * DEMO specific keyboard bindings.
 *
 * @param {Injector} injector
 */
export default function DEMOKeyboardBindings(injector) {
  injector.invoke(KeyboardBindings, this);
}

inherits(DEMOKeyboardBindings, KeyboardBindings);

DEMOKeyboardBindings.$inject = ["injector"];

/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
DEMOKeyboardBindings.prototype.registerBindings = function (
  keyboard,
  editorActions
) {
  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(
    this,
    keyboard,
    editorActions
  );

  /**
   * Add keyboard binding if respective editor action
   * is registered.
   *
   * @param {String} action name
   * @param {Function} fn that implements the key binding
   */
  function addListener(action, fn) {
    if (editorActions.isRegistered(action)) {
      keyboard.addListener(fn);
    }
  }

  // select all elements
  // CTRL + A
  addListener("selectElements", function (context) {
    var event = context.keyEvent;

    if (keyboard.isKey(["a", "A"], event) && keyboard.isCmd(event)) {
      editorActions.trigger("selectElements");

      return true;
    }
  });

  // search labels
  // CTRL + F
  addListener("find", function (context) {
    var event = context.keyEvent;

    if (keyboard.isKey(["f", "F"], event) && keyboard.isCmd(event)) {
      editorActions.trigger("find");

      return true;
    }
  });

  // activate space tool
  // S
  addListener("spaceTool", function (context) {
    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey(["s", "S"], event)) {
      editorActions.trigger("spaceTool");

      return true;
    }
  });

  // activate lasso tool
  // L
  addListener("lassoTool", function (context) {
    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey(["l", "L"], event)) {
      editorActions.trigger("lassoTool");

      return true;
    }
  });

  // activate hand tool
  // H
  addListener("handTool", function (context) {
    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey(["h", "H"], event)) {
      editorActions.trigger("handTool");

      return true;
    }
  });

  // activate direct editing
  // E
  addListener("directEditing", function (context) {
    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey(["e", "E"], event)) {
      editorActions.trigger("directEditing");

      return true;
    }
  });
};
