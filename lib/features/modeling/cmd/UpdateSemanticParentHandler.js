export default function UpdateSemanticParentHandler(demoUpdater) {
  this._demoUpdater = demoUpdater;
}

UpdateSemanticParentHandler.$inject = ["demoUpdater"];

UpdateSemanticParentHandler.prototype.execute = function (context) {
  var dataStoreBo = context.dataStoreBo,
    newSemanticParent = context.newSemanticParent,
    newDiParent = context.newDiParent;

  context.oldSemanticParent = dataStoreBo.$parent;
  context.oldDiParent = dataStoreBo.di.$parent;

  // update semantic parent
  this._demoUpdater.updateSemanticParent(dataStoreBo, newSemanticParent);

  // update DI parent
  this._demoUpdater.updateDiParent(dataStoreBo.di, newDiParent);
};

UpdateSemanticParentHandler.prototype.revert = function (context) {
  var dataStoreBo = context.dataStoreBo,
    oldSemanticParent = context.oldSemanticParent,
    oldDiParent = context.oldDiParent;

  // update semantic parent
  this._demoUpdater.updateSemanticParent(dataStoreBo, oldSemanticParent);

  // update DI parent
  this._demoUpdater.updateDiParent(dataStoreBo.di, oldDiParent);
};
