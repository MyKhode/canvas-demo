import { assign } from "min-dash";

const ORGANIZATION_ASSIGNMENTS = [
  {
    label: "Default",
    assignment: "Default",
  },
  {
    label: "Missing",
    assignment: "Missing",
  },
];

export default function OrganizationChangePopupProvider(
  config,
  popupMenu,
  modeling,
  translate,
  create,
  demoFactory,
  elementFactory
) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;
  this._create = create;
  this._demoFactory = demoFactory;
  this._elementFactory = elementFactory;

  this._organizationAssignments =
    (config && config.organizationAssignments) || ORGANIZATION_ASSIGNMENTS;

  this._popupMenu.registerProvider("organization-assignment-changer", this);
}

OrganizationChangePopupProvider.$inject = [
  "config.organizationChanger",
  "popupMenu",
  "modeling",
  "translate",
  "create",
  "demoFactory",
  "elementFactory",
];

OrganizationChangePopupProvider.prototype.getEntries = function (elements) {
  var self = this,
    elementFactory = this._elementFactory,
    demoFactory = this._demoFactory,
    popupMenu = this._popupMenu,
    create = this._create;

  let organizationIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
</svg>
`;

  var entries = this._organizationAssignments.map(function (organization) {
    switch (organization.assignment) {
      case "Missing":
        organizationIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="#FF6666" stroke-width="3" stroke-dasharray="6 6"/>
</svg>
`;
        break;
      default:
        break;
    }
    return {
      label: self._translate(organization.label),
      id: organization.label.toLowerCase() + "-organization-assignment",
      imageHtml: organizationIconHtml,
      action: createAction(self._modeling, elements, organization.assignment),
    };
  });

  return entries;
};

function createAction(modeling, element, assignment) {
  return function () {
    modeling.setActorAssignment(element, assignment);
  };
}
