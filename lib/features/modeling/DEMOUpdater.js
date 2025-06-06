import { assign, forEach } from "min-dash";

import inherits from "inherits-browser";

import { remove as collectionRemove } from "diagram-js/lib/util/Collections";

import { getBusinessObject, is } from "../../util/ModelUtil";

import { isLabel } from "../../util/LabelUtil";

import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

/**
 * A handler responsible for updating the underlying DEMO XML + DI
 * once changes on the diagram happen
 */
export default function DEMOUpdater(
  eventBus,
  demoFactory,
  connectionDocking,
  translate
) {
  CommandInterceptor.call(this, eventBus);

  this._demoFactory = demoFactory;
  this._translate = translate;

  var self = this;

  // connection cropping //////////////////////

  // crop connection ends during create/update
  function cropConnection(e) {
    var context = e.context,
      hints = context.hints || {},
      connection;

    if (!context.cropped && hints.createElementsBehavior !== false) {
      connection = context.connection;
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  this.executed(["connection.layout", "connection.create"], cropConnection);

  this.reverted(["connection.layout"], function (e) {
    delete e.context.cropped;
  });

  // DEMO + DI update //////////////////////

  // update parent
  function updateParent(e) {
    var context = e.context;

    self.updateParent(context.shape || context.connection, context.oldParent);
  }

  function reverseUpdateParent(e) {
    var context = e.context;

    var element = context.shape || context.connection,
      // oldParent is the (old) new parent, because we are undoing
      oldParent = context.parent || context.newParent;

    self.updateParent(element, oldParent);
  }

  this.executed(
    [
      "shape.move",
      "shape.create",
      "shape.delete",
      "connection.create",
      "connection.move",
      "connection.delete",
    ],
    ifDemo(updateParent)
  );

  this.reverted(
    [
      "shape.move",
      "shape.create",
      "shape.delete",
      "connection.create",
      "connection.move",
      "connection.delete",
    ],
    ifDemo(reverseUpdateParent)
  );

  /*
   * ## Updating Parent
   *
   * When morphing a root element
   * make sure that both the *semantic* and *di* parent of each element
   * is updated.
   *
   */
  function updateRoot(event) {
    var context = event.context,
      oldRoot = context.oldRoot,
      children = oldRoot.children;

    forEach(children, function (child) {
      if (is(child, "demo:BoardElement")) {
        self.updateParent(child);
      }
    });
  }

  this.executed(["canvas.updateRoot"], updateRoot);
  this.reverted(["canvas.updateRoot"], updateRoot);

  // update bounds
  function updateBounds(e) {
    var shape = e.context.shape;

    if (!is(shape, "demo:BoardElement")) {
      return;
    }

    self.updateBounds(shape);
  }

  this.executed(
    ["shape.move", "shape.create", "shape.resize"],
    ifDemo(function (event) {
      // exclude labels because they're handled separately during shape.changed
      if (event.context.shape.type === "label") {
        return;
      }

      updateBounds(event);
    })
  );

  this.reverted(
    ["shape.move", "shape.create", "shape.resize"],
    ifDemo(function (event) {
      // exclude labels because they're handled separately during shape.changed
      if (event.context.shape.type === "label") {
        return;
      }

      updateBounds(event);
    })
  );

  // Handle labels separately. This is necessary, because the label bounds have to be updated
  // every time its shape changes, not only on move, create and resize.
  eventBus.on("shape.changed", function (event) {
    if (event.element.type === "label") {
      updateBounds({ context: { shape: event.element } });
    }
  });

  // attach / detach connection
  function updateConnection(e) {
    self.updateConnection(e.context);
  }

  this.executed(
    [
      "connection.create",
      "connection.move",
      "connection.delete",
      "connection.reconnect",
    ],
    ifDemo(updateConnection)
  );

  this.reverted(
    [
      "connection.create",
      "connection.move",
      "connection.delete",
      "connection.reconnect",
    ],
    ifDemo(updateConnection)
  );

  // update waypoints
  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection);
  }

  this.executed(
    ["connection.layout", "connection.move", "connection.updateWaypoints"],
    ifDemo(updateConnectionWaypoints)
  );

  this.reverted(
    ["connection.layout", "connection.move", "connection.updateWaypoints"],
    ifDemo(updateConnectionWaypoints)
  );

  // update attachments
  function updateAttachment(e) {
    self.updateAttachment(e.context);
  }

  this.executed(["element.updateAttachment"], ifDemo(updateAttachment));
  this.reverted(["element.updateAttachment"], ifDemo(updateAttachment));
}

inherits(DEMOUpdater, CommandInterceptor);

DEMOUpdater.$inject = [
  "eventBus",
  "demoFactory",
  "connectionDocking",
  "translate",
];

// implementation //////////////////////

DEMOUpdater.prototype.updateAttachment = function (context) {
  var shape = context.shape,
    businessObject = shape.businessObject,
    host = shape.host;

  businessObject.attachedToRef = host && host.businessObject;
};

DEMOUpdater.prototype.updateParent = function (element, oldParent) {
  // do not update label parent
  if (isLabel(element)) {
    return;
  }

  var parentShape = element.parent;

  var businessObject = element.businessObject,
    parentBusinessObject = parentShape && parentShape.businessObject,
    parentDi = parentBusinessObject && parentBusinessObject.di;

  this.updateSemanticParent(businessObject, parentBusinessObject);

  this.updateDiParent(businessObject.di, parentDi);
};

DEMOUpdater.prototype.updateBounds = function (shape) {
  var di = shape.businessObject.di;

  var target = isLabel(shape) ? this._getLabel(di) : di;

  var bounds = target.bounds;

  if (!bounds) {
    bounds = this._demoFactory.createDiBounds();
    target.set("bounds", bounds);
  }

  assign(bounds, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  });
};

DEMOUpdater.prototype.updateDiParent = function (di, parentDi) {
  if (parentDi && !is(parentDi, "demoDi:DemoPlane")) {
    parentDi = parentDi.$parent;
  }

  if (di.$parent === parentDi) {
    return;
  }

  var planeElements = (parentDi || di.$parent).get("planeElement");

  if (parentDi) {
    planeElements.push(di);
    di.$parent = parentDi;
  } else {
    collectionRemove(planeElements, di);
    di.$parent = null;
  }
};

DEMOUpdater.prototype.updateSemanticParent = function (
  businessObject,
  newParent,
  visualParent
) {
  var containment,
    translate = this._translate;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (is(businessObject, "demo:BoardElement")) {
    containment = "boardElements";
  }

  if (!containment) {
    throw new Error(
      translate("no parent for {element} in {parent}", {
        element: businessObject.id,
        parent: newParent.id,
      })
    );
  }

  var children;

  if (businessObject.$parent) {
    // remove from old parent
    children = businessObject.$parent.get(containment);
    collectionRemove(children, businessObject);
  }

  if (!newParent) {
    businessObject.$parent = null;
  } else {
    // add to new parent
    children = newParent.get(containment);
    children.push(businessObject);
    businessObject.$parent = newParent;
  }

  if (visualParent) {
    var diChildren = visualParent.get(containment);

    collectionRemove(children, businessObject);

    if (newParent) {
      if (!diChildren) {
        diChildren = [];
        newParent.set(containment, diChildren);
      }

      diChildren.push(businessObject);
    }
  }
};

DEMOUpdater.prototype.updateConnection = function (context) {
  var connection = context.connection,
    businessObject = getBusinessObject(connection),
    newSource = getBusinessObject(connection.source),
    newTarget = getBusinessObject(connection.target);

  var inverseSet = is(businessObject, "demo:Flow");

  if (businessObject.sourceRef !== newSource) {
    if (inverseSet) {
      collectionRemove(
        businessObject.sourceRef && businessObject.sourceRef.get("flows"),
        businessObject
      );

      if (newSource && newSource.get("flows")) {
        newSource.get("flows").push(businessObject);
      }
    }

    businessObject.sourceRef = newSource;
  }
  if (businessObject.targetRef !== newTarget) {
    businessObject.targetRef = newTarget;
  }

  this.updateConnectionWaypoints(connection);
  this.updateDiConnection(businessObject.di, newSource, newTarget);
};
DEMOUpdater.prototype.updateConnectionWaypoints = function (connection) {
  connection.businessObject.di.set(
    "waypoint",
    this._demoFactory.createDiWaypoints(connection.waypoints)
  );
};

// update existing sourceElement and targetElement di information
DEMOUpdater.prototype.updateDiConnection = function (di, newSource, newTarget) {
  if (di.sourceElement && di.sourceElement.boardElement !== newSource) {
    di.sourceElement = newSource && newSource.di;
  }

  if (di.targetElement && di.targetElement.boardElement !== newTarget) {
    di.targetElement = newTarget && newTarget.di;
  }
};

// helpers //////////////////////

DEMOUpdater.prototype._getLabel = function (di) {
  if (!di.label) {
    di.label = this._demoFactory.createDiLabel();
  }

  return di.label;
};

/**
 * Make sure the event listener is only called
 * if the touched element is a DEMO element.
 *
 * @param  {Function} fn
 * @return {Function} guarded function
 */
function ifDemo(fn) {
  return function (event) {
    var context = event.context,
      element = context.shape || context.connection;

    if (is(element, "demo:BoardElement")) {
      fn(event);
    }
  };
}
