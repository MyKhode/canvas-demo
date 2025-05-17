import { forEach } from "min-dash";

export default function SetFontSize(commandStack) {
  this._commandStack = commandStack;
}

SetFontSize.$inject = ["commandStack"];

SetFontSize.prototype.postExecute = function (context) {
  var elements = context.elements,
    fontSize = context.fontSize || "16px";

  var self = this;

  forEach(elements, function (element) {
    self._commandStack.execute("element.updateProperties", {
      element: element,
      properties: {
        fontSize: fontSize,
      },
    });
  });
};
