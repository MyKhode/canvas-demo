import { forEach } from "min-dash";

export default function SetTargetMarkerHandler(commandStack) {
  this._commandStack = commandStack;
}

SetTargetMarkerHandler.$inject = ["commandStack"];

SetTargetMarkerHandler.prototype.postExecute = function (context) {
  var elements = context.elements,
    targetMarker = context.targetMarker || "Triangle";

  var self = this;

  forEach(elements, function (element) {
    self._commandStack.execute("element.updateProperties", {
      element: element,
      properties: {
        targetMarker: targetMarker,
      },
    });
  });
};
