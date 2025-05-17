import { assign } from "min-dash";

/**
 * A palette provider for DEMO elements.
 */
export default function PaletteProvider(
  palette,
  create,
  elementFactory,
  spaceTool,
  lassoTool,
  handTool,
  globalConnect,
  translate,
  demoFactory,
  popupMenu
) {
  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;
  this._globalConnect = globalConnect;
  this._translate = translate;
  this._demoFactory = demoFactory;
  this._popupMenu = popupMenu;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  "palette",
  "create",
  "elementFactory",
  "spaceTool",
  "lassoTool",
  "handTool",
  "globalConnect",
  "translate",
  "demoFactory",
  "popupMenu",
];

PaletteProvider.prototype.getPaletteEntries = function (element) {
  var actions = {},
    create = this._create,
    elementFactory = this._elementFactory,
    spaceTool = this._spaceTool,
    lassoTool = this._lassoTool,
    handTool = this._handTool,
    globalConnect = this._globalConnect,
    translate = this._translate,
    demoFactory = this._demoFactory,
    popupMenu = this._popupMenu;

  function createAction({
    type,
    group,
    className,
    title,
    options,
    assignment,
  }) {
    function createListener(event) {
      const businessObject = demoFactory.create(type);
      businessObject.assignment = assignment;
      var shape = elementFactory.createShape(
        assign({ type: type, businessObject: businessObject }, options)
      );
      create.start(event, shape);
    }

    var shortType = type.replace(/^demo:/, "");

    return {
      group: group,
      className: className,
      title: title || translate("Create {type}", { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener,
      },
    };
  }

  assign(actions, {
    "hand-tool": {
      group: "tools",
      className: "bpmn-icon-hand-tool",
      title: translate("Activate the hand tool"),
      action: {
        click: function (event) {
          handTool.activateHand(event);
        },
      },
    },
    "lasso-tool": {
      group: "tools",
      className: "bpmn-icon-lasso-tool",
      title: translate("Activate the lasso tool"),
      action: {
        click: function (event) {
          lassoTool.activateSelection(event);
        },
      },
    },
    // "space-tool": {
    //   group: "tools",
    //   className: "bpmn-icon-space-tool",
    //   title: translate("Activate the create/remove space tool"),
    //   action: {
    //     click: function (event) {
    //       spaceTool.activateSelection(event);
    //     },
    //   },
    // },
    "tool-separator": {
      group: "tools",
      separator: true,
    },
    "create.actor": createAction({
      type: "demo:Actor",
      group: "demo-actor",
      className: "demo-icon-actor",
      title: translate("Create Actor"),
    }),
    "set.actor-assignment": {
      group: "demo-actor",
      className: "demo-icon-arrow",
      title: translate("Choose Actor Type"),
      action: {
        click: function (event) {
          var position = assign(getMenuPosition(event.target), {
            cursor: { x: event.x, y: event.y },
          });
          popupMenu.open(event.target, "actor-assignment-picker", position, {
            title: translate("Choose Actor Type"),
          });
        },
      },
    },
    "create.transaction": createAction({
      type: "demo:Transaction",
      group: "demo-transaction",
      className: "demo-icon-transaction",
      title: translate("Create Transaction"),
    }),
    "set.transaction-assignment": {
      group: "demo-transaction",
      className: "demo-icon-arrow",
      title: translate("Choose Transaction Type"),
      action: {
        click: function (event) {
          var position = assign(getMenuPosition(event.target), {
            cursor: { x: event.x, y: event.y },
          });
          popupMenu.open(
            event.target,
            "transaction-assignment-picker",
            position,
            {
              title: translate("Choose Transaction Type"),
            }
          );
        },
      },
    },
    "create.informationBank": createAction({
      type: "demo:InformationBank",
      group: "demo-informationBank",
      className: "demo-icon-informationBank",
      title: translate("Create Information Bank"),
    }),
    "set.informationBank-assignment": {
      group: "demo-informationBank",
      className: "demo-icon-arrow",
      title: translate("Choose Information Bank Type"),
      action: {
        click: function (event) {
          var position = assign(getMenuPosition(event.target), {
            cursor: { x: event.x, y: event.y },
          });
          popupMenu.open(
            event.target,
            "informationBank-assignment-picker",
            position,
            {
              title: translate("Choose Information Bank Type"),
            }
          );
        },
      },
    },
    "element-linker": {
      group: "demo-elements",
      className: "bpmn-icon-connection",
      title: translate("Link elements"),
      action: {
        click: function (event) {
          globalConnect.start(event);
        },
      },
    },
    "demo-separator": {
      group: "demo-elements",
      separator: true,
    },
    "create.organization": createAction({
      type: "demo:Organization",
      group: "demo-organization",
      className: "demo-icon-organization",
      title: translate("Create Organization"),
    }),
    "set.organization-assignment": {
      group: "demo-organization",
      className: "demo-icon-arrow",
      title: translate("Choose Organization Type"),
      action: {
        click: function (event) {
          var position = assign(getMenuPosition(event.target), {
            cursor: { x: event.x, y: event.y },
          });
          popupMenu.open(
            event.target,
            "organization-assignment-picker",
            position,
            {
              title: translate("Choose Organization Type"),
            }
          );
        },
      },
    },
    "create.text-box": createAction({
      type: "demo:TextBox",
      group: "text",
      className: "demojs-text-box",
      title: translate("Create text"),
    }),
  });

  return actions;
};

// Helper functions
const X_OFFSET = 8;
function getMenuPosition(target) {
  const rect = target.getBoundingClientRect();

  var pos = {
    x: rect.right + X_OFFSET,
    y: rect.top,
  };

  return pos;
}
