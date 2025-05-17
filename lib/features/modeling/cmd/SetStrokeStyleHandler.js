import { forEach } from "min-dash";

export default function SetStrokeStyleHandler(commandStack) {
  this._commandStack = commandStack;
}

SetStrokeStyleHandler.$inject = ["commandStack"];

SetStrokeStyleHandler.prototype.postExecute = function (context) {
  var elements = context.elements,
    strokeStyle = context.strokeStyle || "solid";

  var self = this;

  forEach(elements, function (element) {
    self._commandStack.execute("element.updateProperties", {
      element: element,
      properties: {
        strokeStyle: strokeStyle,
      },
    });
  });
};
