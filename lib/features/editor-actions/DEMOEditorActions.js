import inherits from "inherits-browser";

import EditorActions from "diagram-js/lib/features/editor-actions/EditorActions";

import { getBBox } from "diagram-js/lib/util/Elements";

/**
 * Registers and executes DEMOM specific editor actions.
 *
 * @param {Injector} injector
 */
export default function DEMOEditorActions(injector) {
  injector.invoke(EditorActions, this);
}

inherits(DEMOEditorActions, EditorActions);

DEMOEditorActions.$inject = ["injector"];

/**
 * Register default actions.
 *
 * @param {Injector} injector
 */
DEMOEditorActions.prototype._registerDefaultActions = function (injector) {
  // (0) invoke super method

  EditorActions.prototype._registerDefaultActions.call(this, injector);

  // (1) retrieve optional components to integrate with

  var canvas = injector.get("canvas", false);
  var elementRegistry = injector.get("elementRegistry", false);
  var selection = injector.get("selection", false);
  var spaceTool = injector.get("spaceTool", false);
  var lassoTool = injector.get("lassoTool", false);
  var handTool = injector.get("handTool", false);
  var globalConnect = injector.get("globalConnect", false);
  var distributeElements = injector.get("distributeElements", false);
  var alignElements = injector.get("alignElements", false);
  var directEditing = injector.get("directEditing", false);
  var searchPad = injector.get("searchPad", false);
  var modeling = injector.get("modeling", false);

  // (2) check components and register actions

  if (canvas && elementRegistry && selection) {
    this._registerAction("selectElements", function () {
      // select all elements except for the invisible
      // root element
      var rootElement = canvas.getRootElement();

      var elements = elementRegistry.filter(function (element) {
        return element !== rootElement;
      });

      selection.select(elements);

      return elements;
    });
  }

  if (spaceTool) {
    this._registerAction("spaceTool", function () {
      spaceTool.toggle();
    });
  }

  if (lassoTool) {
    this._registerAction("lassoTool", function () {
      lassoTool.toggle();
    });
  }

  if (handTool) {
    this._registerAction("handTool", function () {
      handTool.toggle();
    });
  }

  if (globalConnect) {
    this._registerAction("globalConnectTool", function () {
      globalConnect.toggle();
    });
  }

  if (selection && distributeElements) {
    this._registerAction("distributeElements", function (opts) {
      var currentSelection = selection.get(),
        type = opts.type;

      if (currentSelection.length) {
        distributeElements.trigger(currentSelection, type);
      }
    });
  }

  if (selection && alignElements) {
    this._registerAction("alignElements", function (opts) {
      var currentSelection = selection.get(),
        type = opts.type;

      if (currentSelection.length) {
        alignElements.trigger(currentSelection, type);
      }
    });
  }

  if (selection && directEditing) {
    this._registerAction("directEditing", function () {
      var currentSelection = selection.get();

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }
    });
  }

  if (searchPad) {
    this._registerAction("find", function () {
      searchPad.toggle();
    });
  }

  if (canvas && modeling) {
    this._registerAction("moveToOrigin", function () {
      var rootElement = canvas.getRootElement(),
        boundingBox;

      var elements = elementRegistry.filter(function (element) {
        return element !== rootElement;
      });

      boundingBox = getBBox(elements);

      modeling.moveElements(
        elements,
        { x: -boundingBox.x, y: -boundingBox.y },
        rootElement
      );
    });
  }
};
