import { assign, forEach } from "min-dash";

import inherits from "inherits-browser";

import { is } from "../../util/ModelUtil";

import BaseElementFactory from "diagram-js/lib/core/ElementFactory";

import { DEFAULT_LABEL_SIZE } from "../../util/LabelUtil";
import { isAny } from "./util/ModelingUtil";

const DEFAULT_SIZE = 100;

/**
 * A DEMO-aware factory for diagram-js shapes
 */
export default function ElementFactory(demoFactory, moddle, translate) {
  BaseElementFactory.call(this);

  this._demoFactory = demoFactory;
  this._moddle = moddle;
  this._translate = translate;
}

inherits(ElementFactory, BaseElementFactory);

ElementFactory.$inject = ["demoFactory", "moddle", "translate"];

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;

ElementFactory.prototype.create = function (elementType, attrs) {
  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === "label") {
    return this.baseCreate(
      elementType,
      assign({ type: "label" }, DEFAULT_LABEL_SIZE, attrs)
    );
  }

  return this.createDemoElement(elementType, attrs);
};

ElementFactory.prototype.createDemoElement = function (elementType, attrs) {
  var size,
    translate = this._translate;

  attrs = attrs || {};

  var businessObject = attrs.businessObject;

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error(translate("no shape type specified"));
    }

    businessObject = this._demoFactory.create(attrs.type);
  }

  if (!businessObject.di) {
    if (elementType === "root") {
      businessObject.di = this._demoFactory.createDiPlane(businessObject, [], {
        id: businessObject.id + "_di",
      });
    } else if (elementType === "connection") {
      businessObject.di = this._demoFactory.createDiEdge(businessObject, [], {
        id: businessObject.id + "_di",
      });
    } else {
      businessObject.di = this._demoFactory.createDiShape(
        businessObject,
        {},
        {
          id: businessObject.id + "_di",
        }
      );
    }
  }

  if (is(businessObject, "demo:Organization")) {
    attrs = assign(
      {
        isFrame: true,
      },
      attrs
    );
  }

  if (attrs.di) {
    assign(businessObject.di, attrs.di);

    delete attrs.di;
  }

  applyAttributes(businessObject, attrs, [
    "processRef",
    "isInterrupting",
    "associationDirection",
    "isForCompensation",
  ]);

  size = this._getDefaultSize(businessObject);

  attrs = assign(
    {
      businessObject: businessObject,
      id: businessObject.id,
    },
    size,
    attrs
  );

  return this.baseCreate(elementType, attrs);
};

ElementFactory.prototype._getDefaultSize = function (semantic) {
  if (isAny(semantic, ["demo:Actor", "demo:Transaction"])) {
    return { width: DEFAULT_SIZE, height: DEFAULT_SIZE };
  }
  const rectWidth = Math.sqrt((DEFAULT_SIZE / 2) * (DEFAULT_SIZE / 2) * 2);
  const informationBankHeight = rectWidth + rectWidth * (2 / 3);

  if (is(semantic, "demo:InformationBank")) {
    return { width: DEFAULT_SIZE, height: informationBankHeight };
  }
  if (is(semantic, "demo:Organization")) {
    return { width: 300, height: 300 };
  }
  return { width: 200, height: 100 };
};

// helpers //////////////////////

/**
 * Apply attributes from a map to the given element,
 * remove attribute from the map on application.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {Array<String>} attributeNames name of attributes to apply
 */
function applyAttributes(element, attrs, attributeNames) {
  forEach(attributeNames, function (property) {
    if (attrs[property] !== undefined) {
      applyAttribute(element, attrs, property);
    }
  });
}

/**
 * Apply named property to element and drain it from the attrs
 * collection.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {String} attributeName to apply
 */
function applyAttribute(element, attrs, attributeName) {
  element[attributeName] = attrs[attributeName];

  delete attrs[attributeName];
}
