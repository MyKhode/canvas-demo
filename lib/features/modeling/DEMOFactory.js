import { assign, map, pick } from "min-dash";

import { isAny } from "./util/ModelingUtil";

import { is } from "../../util/ModelUtil";

export default function DEMOFactory(moddle) {
  this._model = moddle;
}

DEMOFactory.$inject = ["moddle"];

DEMOFactory.prototype._needsId = function (element) {
  return isAny(element, ["demo:BoardElement"]);
};

DEMOFactory.prototype._ensureId = function (element) {
  // generate semantic ids for elements
  // demo:Actor -> Actor_ID
  var prefix;

  if (is(element, "demo:Actor")) {
    prefix = "Actor";
  } else if (is(element, "demo:Transaction")) {
    prefix = "Transaction";
  } else if (is(element, "demo:InformationBank")) {
    prefix = "InformationBank";
  } else if (is(element, "demo:Organization")) {
    prefix = "Organization";
  } else {
    prefix = (element.$type || "").replace(/^[^:]*:/g, "");
  }

  prefix += "_";

  if (!element.id && this._needsId(element)) {
    element.id = this._model.ids.nextPrefixed(prefix, element);
  }
};

DEMOFactory.prototype.create = function (type, attrs) {
  var element = this._model.create(type, attrs || {});

  switch (type) {
    case "demo:Actor":
      element.description = "";
      element.assignment = "Default";
      break;
    case "demo:Transaction":
      element.assignment = "Default";
      break;
    case "demo:InformationBank":
      element.assignment = "Default";
      break;
    case "demo:Organization":
      element.assignment = "Default";
      break;
    case "demo:Flow":
      element.strokeType = "solid";
      element.sourceMarker = "None";
      element.targetMarker = "Triangle";
      break;
    case "demo:TextBox":
      element.fontSize = "16px";
    default:
      break;
  }

  this._ensureId(element);

  return element;
};

DEMOFactory.prototype.createDiLabel = function () {
  return this.create("demoDi:DemoLabel", {
    bounds: this.createDiBounds(),
  });
};

DEMOFactory.prototype.createDiShape = function (semantic, bounds, attrs) {
  return this.create(
    "demoDi:DemoShape",
    assign(
      {
        boardElement: semantic,
        bounds: this.createDiBounds(bounds),
      },
      attrs
    )
  );
};

DEMOFactory.prototype.createDiBounds = function (bounds) {
  return this.create("dc:Bounds", bounds);
};

DEMOFactory.prototype.createDiEdge = function (semantic, waypoints, attrs) {
  return this.create(
    "demoDi:Flow",
    assign(
      {
        boardElement: semantic,
      },
      attrs
    )
  );
};

DEMOFactory.prototype.createDiPlane = function (semantic) {
  return this.create("demoDi:DemoPlane", {
    boardElement: semantic,
  });
};

DEMOFactory.prototype.createDiWaypoints = function (waypoints) {
  var self = this;

  return map(waypoints, function (pos) {
    return self.createDiWaypoint(pos);
  });
};

DEMOFactory.prototype.createDiWaypoint = function (point) {
  return this.create("dc:Point", pick(point, ["x", "y"]));
};
