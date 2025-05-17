import { forEach } from "min-dash";

export default function SetActorAssignmentHandler(commandStack) {
  this._commandStack = commandStack;
}

SetActorAssignmentHandler.$inject = ["commandStack"];

SetActorAssignmentHandler.prototype.postExecute = function (context) {
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
