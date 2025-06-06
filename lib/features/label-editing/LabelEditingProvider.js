import { assign } from "min-dash";

import { getLabel } from "./LabelUtil";

import { isAny } from "../modeling/util/ModelingUtil";

import {
  getExternalLabelMid,
  isLabelExternal,
  hasExternalLabel,
  isLabel,
} from "../../util/LabelUtil";
import { getBusinessObject, is } from "../../util/ModelUtil";

export default function LabelEditingProvider(
  eventBus,
  demoFactory,
  canvas,
  directEditing,
  modeling,
  resizeHandles,
  textRenderer
) {
  this._demoFactory = demoFactory;
  this._canvas = canvas;
  this._modeling = modeling;
  this._textRenderer = textRenderer;

  directEditing.registerProvider(this);

  function decideIfTitleOrDescriptionClicked(event) {
    const zoom = canvas.zoom();
    const title_description_divider_y_coordinate =
      (event.element.y + event.element.height / 2 - canvas._cachedViewbox.y) *
      zoom;
    const click_y_coordinate = event.originalEvent.offsetY;
    if (
      is(event.element, "demo:Actor") &&
      click_y_coordinate >= title_description_divider_y_coordinate
    ) {
      event.element.businessObject.labelAttribute = "description";
    } else {
      event.element.businessObject.labelAttribute = "name";
    }
  }

  // listen to dblclick on non-root elements
  eventBus.on("element.dblclick", function (event) {
    decideIfTitleOrDescriptionClicked(event);
    activateDirectEdit(event.element, true);
  });

  // complete on followup canvas operation
  eventBus.on(
    [
      "autoPlace.start",
      "canvas.viewbox.changing",
      "drag.init",
      "element.mousedown",
      "popupMenu.open",
    ],
    function (event) {
      if (directEditing.isActive()) {
        directEditing.complete();
      }
    }
  );

  // cancel on command stack changes
  eventBus.on(["commandStack.changed"], function (e) {
    if (directEditing.isActive()) {
      directEditing.cancel();
    }
  });

  eventBus.on("directEditing.activate", function (event) {
    resizeHandles.removeResizers();
  });

  eventBus.on("create.end", 500, function (event) {
    var context = event.context,
      element = context.shape,
      canExecute = event.context.canExecute,
      isTouch = event.isTouch;

    // TODO(nikku): we need to find a way to support the
    // direct editing on mobile devices; right now this will
    // break for desworkflowediting on mobile devices
    // as it breaks the user interaction workflow

    // TODO(nre): we should temporarily focus the edited element
    // here and release the focused viewport after the direct edit
    // operation is finished
    if (isTouch) {
      return;
    }

    if (!canExecute) {
      return;
    }

    if (context.hints && context.hints.createElementsBehavior === false) {
      return;
    }

    activateDirectEdit(element, false);
  });

  eventBus.on("autoPlace.end", 500, function (event) {
    activateDirectEdit(event.shape, false);
  });

  function activateDirectEdit(element, force) {
    const businessObject = getBusinessObject(element);
    if (businessObject.assignment === "Unclear") return;
    if (
      force ||
      isAny(element, [
        "demo:TextBox",
        "demo:Object",
        "demo:Actor",
        "demo:Transaction",
        "demo:InformationBank",
        "demo:Organization",
      ])
    ) {
      directEditing.activate(element);
    }
  }
}

LabelEditingProvider.$inject = [
  "eventBus",
  "demoFactory",
  "canvas",
  "directEditing",
  "modeling",
  "resizeHandles",
  "textRenderer",
];

/**
 * Activate direct editing for objects and text annotations.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object with properties bounds (position and size), text and options
 */
LabelEditingProvider.prototype.activate = function (element) {
  // text
  var text = getLabel(element);

  if (text === undefined) {
    return;
  }

  var context = {
    text: text,
  };

  // bounds
  var bounds = this.getEditingBBox(element);

  assign(context, bounds);

  var options = {};

  // text boxes
  if (isAny(element, ["demo:TextBox"])) {
    assign(options, {
      centerVertically: true,
    });
  }

  // external labels
  if (isLabelExternal(element)) {
    assign(options, {
      autoResize: true,
    });
  }

  assign(context, {
    options: options,
  });

  return context;
};

/**
 * Get the editing bounding box based on the element's size and position
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object containing information about position
 *                  and size (fixed or minimum and/or maximum)
 */
LabelEditingProvider.prototype.getEditingBBox = function (element) {
  var canvas = this._canvas;

  var target = element.label || element;

  var bbox = canvas.getAbsoluteBBox(target);

  var mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  };

  // default position
  var bounds = { x: bbox.x, y: bbox.y };

  var zoom = canvas.zoom();

  var defaultStyle = this._textRenderer.getDefaultStyle(),
    externalStyle = this._textRenderer.getExternalStyle();

  // take zoom into account
  var externalFontSize = externalStyle.fontSize * zoom,
    externalLineHeight = externalStyle.lineHeight,
    defaultFontSize = defaultStyle.fontSize * zoom,
    defaultLineHeight = defaultStyle.lineHeight;

  if (is(element, "demo:Organization")) {
    externalFontSize = 20 * zoom;
  }
  if (isAny(element, ["demo:Transaction", "demo:InformationBank"])) {
    defaultFontSize = 20 * zoom;
  }

  var style = {
    fontFamily: this._textRenderer.getDefaultStyle().fontFamily,
    fontWeight: this._textRenderer.getDefaultStyle().fontWeight,
  };

  if (
    isAny(element, [
      "demo:TextBox",
      "demo:Actor",
      "demo:Transaction",
      "demo:InformationBank",
    ])
  ) {
    assign(bounds, {
      width: bbox.width,
      height: bbox.height,
    });

    assign(style, {
      fontSize: defaultFontSize + "px",
      lineHeight: defaultLineHeight,
      paddingTop: 7 * zoom + "px",
      paddingBottom: 7 * zoom + "px",
      paddingLeft: 5 * zoom + "px",
      paddingRight: 5 * zoom + "px",
    });

    if (isAny(element, ["demo:Actor"])) {
      // Editing attributes should be different.
      if (element.businessObject.labelAttribute === "description") {
        assign(bounds, {
          y: bbox.y + (element.height / 2) * zoom,
          height: bbox.height - (element.height / 2) * zoom,
        });
      } else {
        assign(bounds, {
          height: (element.height / 2) * zoom,
        });
      }
    }
    if (isAny(element, ["demo:Transaction", "demo:InformationBank"])) {
      assign(bounds, {
        y: bbox.y + element.height / 2 - 34 / 2,
        height: 34 * zoom,
      });
    }
  }

  var width = 300 * zoom,
    paddingTop = 7 * zoom,
    paddingBottom = 4 * zoom;

  // external labels for events, data elements, gateways, groups and connections
  if (target.labelTarget) {
    assign(bounds, {
      width: width,
      height: bbox.height + paddingTop + paddingBottom,
      x: mid.x - width / 2,
      y: bbox.y - paddingTop,
    });

    assign(style, {
      fontSize: externalFontSize + "px",
      lineHeight: externalLineHeight,
      paddingTop: paddingTop + "px",
      paddingBottom: paddingBottom + "px",
    });
  }

  // external label not yet created
  if (
    isLabelExternal(target) &&
    !hasExternalLabel(target) &&
    !isLabel(target)
  ) {
    var externalLabelMid = getExternalLabelMid(element);

    var absoluteBBox = canvas.getAbsoluteBBox({
      x: externalLabelMid.x,
      y: externalLabelMid.y,
      width: 0,
      height: 0,
    });

    var height = externalFontSize + paddingTop + paddingBottom;

    assign(bounds, {
      width: width,
      height: height,
      x: absoluteBBox.x - width / 2,
      y: absoluteBBox.y - height / 2,
    });

    assign(style, {
      fontSize: externalFontSize + "px",
      lineHeight: externalLineHeight,
      paddingTop: paddingTop + "px",
      paddingBottom: paddingBottom + "px",
    });
  }

  return { bounds: bounds, style: style };
};

LabelEditingProvider.prototype.update = function (element, newLabel) {
  if (isEmptyText(newLabel)) {
    newLabel = null;
  }

  this._modeling.updateLabel(element, newLabel);
};

// helpers //////////////////////

function isEmptyText(label) {
  return !label || !label.trim();
}
