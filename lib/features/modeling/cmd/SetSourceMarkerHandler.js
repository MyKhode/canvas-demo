import { forEach } from "min-dash";

export default function SetSourceMarkerHandler(commandStack) {
  this._commandStack = commandStack;
}

SetSourceMarkerHandler.$inject = ["commandStack"];

SetSourceMarkerHandler.prototype.postExecute = function (context) {
  var elements = context.elements,
    sourceMarker = context.sourceMarker || "None";

  var self = this;

  forEach(elements, function (element) {
    self._commandStack.execute("element.updateProperties", {
      element: element,
      properties: {
        sourceMarker: sourceMarker,
      },
    });
  });
};
