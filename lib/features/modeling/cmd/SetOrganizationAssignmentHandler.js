import { forEach } from "min-dash";

export default function SetOrganizationAssignmentHandler(commandStack) {
  this._commandStack = commandStack;
}

SetOrganizationAssignmentHandler.$inject = ["commandStack"];

SetOrganizationAssignmentHandler.prototype.postExecute = function (context) {
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
