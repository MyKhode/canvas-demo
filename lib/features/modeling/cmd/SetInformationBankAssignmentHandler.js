import { forEach } from "min-dash";

export default function SetInformationBankAssignmentHandler(commandStack) {
  this._commandStack = commandStack;
}

SetInformationBankAssignmentHandler.$inject = ["commandStack"];

SetInformationBankAssignmentHandler.prototype.postExecute = function (context) {
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
