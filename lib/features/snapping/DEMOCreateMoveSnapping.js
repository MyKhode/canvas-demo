import inherits from "inherits-browser";

import CreateMoveSnapping from "diagram-js/lib/features/snapping/CreateMoveSnapping";

/**
 * Snap during create and move.
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function DEMOCreateMoveSnapping(injector) {
  injector.invoke(CreateMoveSnapping, this);
}

inherits(DEMOCreateMoveSnapping, CreateMoveSnapping);

DEMOCreateMoveSnapping.$inject = ["injector"];

DEMOCreateMoveSnapping.prototype.initSnap = function (event) {
  return CreateMoveSnapping.prototype.initSnap.call(this, event);
};

DEMOCreateMoveSnapping.prototype.addSnapTargetPoints = function (
  snapPoints,
  shape,
  target
) {
  return CreateMoveSnapping.prototype.addSnapTargetPoints.call(
    this,
    snapPoints,
    shape,
    target
  );
};

DEMOCreateMoveSnapping.prototype.getSnapTargets = function (shape, target) {
  return CreateMoveSnapping.prototype.getSnapTargets.call(this, shape, target);
};
