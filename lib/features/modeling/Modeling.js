import inherits from "inherits-browser";

import BaseModeling from "diagram-js/lib/features/modeling/Modeling";

import UpdatePropertiesHandler from "./cmd/UpdatePropertiesHandler";
import UpdateCanvasRootHandler from "./cmd/UpdateCanvasRootHandler";
import IdClaimHandler from "./cmd/IdClaimHandler";

import UpdateLabelHandler from "../label-editing/cmd/UpdateLabelHandler";
import SetColorHandler from "./cmd/SetColorHandler";
import SetStrokeStyleHandler from "./cmd/SetStrokeStyleHandler";
import SetSourceMarkerHandler from "./cmd/SetSourceMarkerHandler";
import SetTargetMarkerHandler from "./cmd/SetTargetMarkerHandler";
import SetActorAssignmentHandler from "./cmd/SetActorAssignmentHandler";
import SetTransactionAssignmentHandler from "./cmd/SetTransactionAssignmentHandler";
import SetInformationBankAssignmentHandler from "./cmd/SetInformationBankAssignmentHandler";
import SetOrganizationAssignmentHandler from "./cmd/SetOrganizationAssignmentHandler";
import SetFontSizeHandler from "./cmd/SetFontSizeHandler";

/**
 * DEMO modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 * @param {DEMORules} demoRules
 */
export default function Modeling(
  eventBus,
  elementFactory,
  commandStack,
  demoRules
) {
  BaseModeling.call(this, eventBus, elementFactory, commandStack);

  this._demoRules = demoRules;
}

inherits(Modeling, BaseModeling);

Modeling.$inject = ["eventBus", "elementFactory", "commandStack", "demoRules"];

Modeling.prototype.getHandlers = function () {
  var handlers = BaseModeling.prototype.getHandlers.call(this);

  handlers["element.updateProperties"] = UpdatePropertiesHandler;
  handlers["canvas.updateRoot"] = UpdateCanvasRootHandler;
  handlers["id.updateClaim"] = IdClaimHandler;
  handlers["element.updateLabel"] = UpdateLabelHandler;
  handlers["element.setColor"] = SetColorHandler;
  handlers["element.setActorAssignment"] = SetActorAssignmentHandler;
  handlers["element.setTransactionAssignment"] =
    SetTransactionAssignmentHandler;
  handlers["element.setInformationBankAssignment"] =
    SetInformationBankAssignmentHandler;
  handlers["element.setOrganizationAssignment"] =
    SetOrganizationAssignmentHandler;
  handlers["element.setStrokeStyle"] = SetStrokeStyleHandler;
  handlers["element.setSourceMarker"] = SetSourceMarkerHandler;
  handlers["element.setTargetMarker"] = SetTargetMarkerHandler;
  handlers["element.setFontSize"] = SetFontSizeHandler;

  return handlers;
};

Modeling.prototype.updateLabel = function (
  element,
  newLabel,
  newBounds,
  hints
) {
  this._commandStack.execute("element.updateLabel", {
    element: element,
    newLabel: newLabel,
    newBounds: newBounds,
    hints: hints || {},
  });
};

Modeling.prototype.updateProperties = function (element, properties) {
  this._commandStack.execute("element.updateProperties", {
    element: element,
    properties: properties,
  });
};

Modeling.prototype.claimId = function (id, moddleElement) {
  this._commandStack.execute("id.updateClaim", {
    id: id,
    element: moddleElement,
    claiming: true,
  });
};

Modeling.prototype.unclaimId = function (id, moddleElement) {
  this._commandStack.execute("id.updateClaim", {
    id: id,
    element: moddleElement,
  });
};

Modeling.prototype.connect = function (source, target, attrs, hints) {
  var demoRules = this._demoRules;

  if (!attrs) {
    attrs = demoRules.canConnect(source, target);
  }

  if (!attrs) {
    return;
  }

  return this.createConnection(source, target, attrs, source.parent, hints);
};

/**
 * Set the color(s) of one or many elements.
 *
 * @param {Element[]} elements The elements to set the color(s) for.
 * @param {Colors} colors The color(s) to set.
 */
Modeling.prototype.setColor = function (elements, colors) {
  if (!elements.length) {
    elements = [elements];
  }

  this._commandStack.execute("element.setColor", {
    elements: elements,
    colors: colors,
  });
};

/**
 * Set the stroke style of flow elements.
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setStrokeStyle = function (elements, strokeStyle) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setStrokeStyle", {
    elements: elements,
    strokeStyle: strokeStyle,
  });
};

/**
 * Set the stroke style of flow elements.
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setSourceMarker = function (elements, sourceMarker) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setSourceMarker", {
    elements: elements,
    sourceMarker: sourceMarker,
  });
};

/**
 * Set the stroke style of flow elements.
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setTargetMarker = function (elements, targetMarker) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setTargetMarker", {
    elements: elements,
    targetMarker: targetMarker,
  });
};

/**
 * Set Actor Assignment
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setActorAssignment = function (elements, assignment) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setActorAssignment", {
    elements: elements,
    assignment: assignment,
  });
};

/**
 * Set Actor Assignment
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setTransactionAssigment = function (elements, assignment) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setTransactionAssignment", {
    elements: elements,
    assigment: assignment,
  });
};

/**
 * Set Actor Assignment
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setInformationBankAssigment = function (
  elements,
  assignment
) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setInformationBankAssignment", {
    elements: elements,
    assigment: assignment,
  });
};

/**
 * Set Organization Assignment
 *
 * @param {Element[]} elements The elements to set the stroke style
 * @param {StrokeArray} strokeStyle stroke style to set
 */
Modeling.prototype.setOrganizationAssigment = function (elements, assignment) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setOrganizationAssignment", {
    elements: elements,
    assigment: assignment,
  });
};

Modeling.prototype.setFontSize = function (elements, fontSize) {
  if (!elements.length) {
    elements = [elements];
  }
  this._commandStack.execute("element.setFontSize", {
    elements: elements,
    fontSize: fontSize,
  });
};
