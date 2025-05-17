import { assign } from "min-dash";

const TRANSACTION_ASSIGNMENTS = [
  {
    label: "Default",
    assignment: "Default",
  },
  {
    label: "Unclear",
    assignment: "Unclear",
  },
  {
    label: "Process Fill",
    assignment: "Process Fill",
  },
  {
    label: "Process White",
    assignment: "Process White",
  },
  {
    label: "Missing",
    assignment: "Missing",
  },
];

export default function TransactionChangePopupProvider(
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

  this._transactionAssignments =
    (config && config.transactionAssignments) || TRANSACTION_ASSIGNMENTS;

  this._popupMenu.registerProvider("transaction-assignment-changer", this);
}

TransactionChangePopupProvider.$inject = [
  "config.transactionChanger",
  "popupMenu",
  "modeling",
  "translate",
  "create",
  "demoFactory",
  "elementFactory",
];

TransactionChangePopupProvider.prototype.getEntries = function (elements) {
  var self = this,
    elementFactory = this._elementFactory,
    demoFactory = this._demoFactory,
    popupMenu = this._popupMenu,
    create = this._create;

  let transactionIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31" stroke="black" stroke-width="3"/>
<rect x="31.9852" y="3.41421" width="40.4056" height="40.4056" transform="rotate(45 31.9852 3.41421)" stroke="black" stroke-width="3"/>
</svg>
`;

  var entries = this._transactionAssignments.map(function (transaction) {
    switch (transaction.assignment) {
      case "Unclear":
        transactionIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31" stroke="black" stroke-width="3"/>
<rect x="31.9852" y="3.41421" width="40.4056" height="40.4056" transform="rotate(45 31.9852 3.41421)" stroke="black" stroke-width="3"/>
<path d="M24.4659 25.8266C24.4624 25.9094 24.4758 25.992 24.5054 26.0693C24.535 26.1467 24.5801 26.2172 24.638 26.2765C24.6958 26.3358 24.7652 26.3826 24.8418 26.4141C24.9184 26.4456 25.0006 26.461 25.0834 26.4596H27.1975C27.5511 26.4596 27.833 26.17 27.8791 25.8189C28.1098 24.1379 29.2629 22.9131 31.318 22.9131C33.0759 22.9131 34.6851 23.792 34.6851 25.9061C34.6851 27.5332 33.7268 28.2815 32.2123 29.4193C30.4878 30.6723 29.1219 32.1355 29.2193 34.5109L29.227 35.067C29.2297 35.2351 29.2984 35.3954 29.4182 35.5134C29.5381 35.6313 29.6995 35.6974 29.8676 35.6974H31.9458C32.1157 35.6974 32.2787 35.6299 32.3988 35.5097C32.5189 35.3896 32.5864 35.2267 32.5864 35.0567V34.7877C32.5864 32.9478 33.286 32.4122 35.1746 30.9798C36.7351 29.7934 38.3623 28.4763 38.3623 25.7113C38.3623 21.8394 35.0926 19.9688 31.5128 19.9688C28.2661 19.9688 24.7093 21.4806 24.4659 25.8266ZM28.4557 40.5943C28.4557 41.9601 29.5448 42.9697 31.0438 42.9697C32.6044 42.9697 33.6781 41.9601 33.6781 40.5943C33.6781 39.1798 32.6018 38.1856 31.0413 38.1856C29.5448 38.1856 28.4557 39.1798 28.4557 40.5943Z" fill="black"/>
</svg>
`;
        break;
      case "Process Fill":
        transactionIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="62" height="62" fill="#D9D9D9" stroke="black" stroke-width="3"/>
<rect x="31.9854" y="3.41421" width="40.4056" height="40.4056" transform="rotate(45 31.9854 3.41421)" fill="white" stroke="black" stroke-width="3"/>
</svg>
`;
        break;
      case "Process White":
        transactionIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="62" height="62" fill="white"/>
<rect x="1" y="1" width="62" height="62" stroke="black" stroke-width="3"/>
</svg>
`;
        break;
      case "Missing":
        transactionIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="31" stroke="#FF6666" stroke-width="3" stroke-dasharray="6 6"/>
<rect x="31.9852" y="3.41421" width="40.4056" height="40.4056" transform="rotate(45 31.9852 3.41421)" stroke="#FF6666" stroke-width="3" stroke-dasharray="6 6"/>
</svg>
`;
        break;
      default:
        break;
    }
    return {
      label: self._translate(transaction.label),
      id: transaction.label.toLowerCase() + "-transaction-assignment",
      imageHtml: transactionIconHtml,
      action: createAction(self._modeling, elements, transaction.assignment),
    };
  });

  return entries;
};

function createAction(modeling, element, assignment) {
  return function () {
    modeling.setActorAssignment(element, assignment);
  };
}
