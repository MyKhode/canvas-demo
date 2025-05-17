import { forEach } from "min-dash";

export default function SetTransactionAssignmentHandler(commandStack) {
  this._commandStack = commandStack;
}

SetTransactionAssignmentHandler.$inject = ["commandStack"];

SetTransactionAssignmentHandler.prototype.postExecute = function (context) {
  var elements = context.elements,
    assignment = context.assignment || "Default";

  var self = this;

  forEach(elements, function (element) {
    self._commandStack.execute("element.updateProperties", {
      element: element,
      properties: {
        assignment: assignment,
      },
    });
  });
};
