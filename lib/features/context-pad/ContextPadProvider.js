import { assign, isArray } from "min-dash";

import { hasPrimaryModifier } from "diagram-js/lib/util/Mouse";
import { getBusinessObject } from "../../util/ModelUtil";

/**
 * A provider for DEMO elements context pad.
 */
export default function ContextPadProvider(
  config,
  injector,
  eventBus,
  connect,
  create,
  elementFactory,
  contextPad,
  modeling,
  rules,
  translate,
  popupMenu,
  textRenderer
) {
  config = config || {};

  contextPad.registerProvider(this);

  this._connect = connect;
  this._create = create;
  this._elementFactory = elementFactory;
  this._contextPad = contextPad;
  this._popupMenu = popupMenu;
  this._textRenderer = textRenderer;

  this._modeling = modeling;

  this._rules = rules;
  this._translate = translate;

  if (config.autoPlace !== false) {
    this._autoPlace = injector.get("autoPlace", false);
  }

  eventBus.on("create.end", 250, function (event) {
    let context = event.context,
      shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    let entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });
}

ContextPadProvider.$inject = [
  "config.contextPad",
  "injector",
  "eventBus",
  "connect",
  "create",
  "elementFactory",
  "contextPad",
  "modeling",
  "rules",
  "translate",
  "popupMenu",
  "textRenderer",
];

ContextPadProvider.prototype.getContextPadEntries = function (element) {
  const {
    _contextPad: contextPad,
    _rules: rules,
    _modeling: modeling,
    _translate: translate,
    _connect: connect,
    _elementFactory: elementFactory,
    _autoPlace: autoPlace,
    _create: create,
    _popupMenu: popupMenu,
    _textRenderer: textRenderer,
  } = this;

  let actions = {};

  if (element.type === "label") {
    return actions;
  }

  createDeleteEntry(actions);

  switch (element.type) {
    case "demo:Flow":
      if (
        element.waypoints[0].x >
        element.waypoints[element.waypoints.length - 1].x
      ) {
        assign(actions, {
          "set-target-marker": {
            group: "edit",
            className: "demo-icon-target-marker-reverse",
            title: translate("Change target marker"),
            action: {
              click: function (event, element) {
                var position = assign(getReplaceMenuPosition(element), {
                  cursor: { x: event.x, y: event.y },
                });

                popupMenu.open(element, "target-marker-picker", position, {
                  title: translate("Change target marker"),
                });
              },
            },
          },
        });
        assign(actions, {
          "set-source-marker": {
            group: "edit",
            className: "demo-icon-source-marker-reverse",
            title: translate("Change source marker"),
            action: {
              click: function (event, element) {
                var position = assign(getReplaceMenuPosition(element), {
                  cursor: { x: event.x, y: event.y },
                });

                popupMenu.open(element, "source-marker-picker", position, {
                  title: translate("Change source marker"),
                });
              },
            },
          },
        });
      } else {
        assign(actions, {
          "set-source-marker": {
            group: "edit",
            className: "demo-icon-source-marker",
            title: translate("Change source marker"),
            action: {
              click: function (event, element) {
                var position = assign(getReplaceMenuPosition(element), {
                  cursor: { x: event.x, y: event.y },
                });

                popupMenu.open(element, "source-marker-picker", position, {
                  title: translate("Change source marker"),
                });
              },
            },
          },
        });

        assign(actions, {
          "set-target-marker": {
            group: "edit",
            className: "demo-icon-target-marker",
            title: translate("Change target marker"),
            action: {
              click: function (event, element) {
                var position = assign(getReplaceMenuPosition(element), {
                  cursor: { x: event.x, y: event.y },
                });

                popupMenu.open(element, "target-marker-picker", position, {
                  title: translate("Change target marker"),
                });
              },
            },
          },
        });
      }

      assign(actions, {
        "set-stroke-style": {
          group: "edit",
          className: "demo-icon-stroke-style",
          title: translate("Change stroke type"),
          action: {
            click: function (event, element) {
              var position = assign(getReplaceMenuPosition(element), {
                cursor: { x: event.x, y: event.y },
              });

              popupMenu.open(element, "stroke-style-picker", position, {
                title: translate("Change stroke type"),
              });
            },
          },
        },
      });
      break;
    case "demo:Actor":
      createLinkObjectsEntry(actions);
      changeActor(actions);
      break;
    case "demo:Transaction":
      createLinkObjectsEntry(actions);
      changeTransaction(actions);
      break;
    case "demo:InformationBank":
      createLinkObjectsEntry(actions);
      changeInformationBank(actions);
      break;
    case "demo:Organization":
      createLinkObjectsEntry(actions);
      changeOrganization(actions);
      break;
    case "demo:TextBox":
      createTextSizeDecreaseEntry(actions);
      createTextSizeIncreaseEntry(actions);
      break;
    default:
      break;
  }

  // Helper functions
  function getReplaceMenuPosition(element) {
    var Y_OFFSET = 5;

    var pad = contextPad.getPad(element).html;

    var padRect = pad.getBoundingClientRect();

    var pos = {
      x: padRect.left,
      y: padRect.bottom + Y_OFFSET,
    };

    return pos;
  }

  return actions;

  function removeElement() {
    modeling.removeElements([element]);
  }

  function createDeleteEntry(actions) {
    // delete element entry, only show if allowed by rules
    let deleteAllowed = rules.allowed("elements.delete", {
      elements: [element],
    });

    if (isArray(deleteAllowed)) {
      // was the element returned as a deletion candidate?
      deleteAllowed = deleteAllowed[0] === element;
    }

    if (deleteAllowed) {
      assign(actions, {
        delete: {
          group: "edit",
          className: "bpmn-icon-trash",
          title: translate("Remove"),
          action: {
            click: removeElement,
          },
        },
      });
    }
  }

  function startConnect(event, element) {
    connect.start(event, element);
  }

  function changeActor(actions) {
    assign(actions, {
      "change-actor-type": {
        group: "edit",
        className: "demo-icon-actor",
        title: translate("Change Actor type"),
        action: {
          click: function (event, element) {
            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });
            popupMenu.open(element, "actor-assignment-changer", position, {
              title: translate("Change Actor type"),
            });
          },
        },
      },
    });
  }
  function changeTransaction(actions) {
    assign(actions, {
      "change-transaction-type": {
        group: "edit",
        className: "demo-icon-transaction",
        title: translate("Change Transaction type"),
        action: {
          click: function (event, element) {
            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });

            popupMenu.open(
              element,
              "transaction-assignment-changer",
              position,
              {
                title: translate("Change Transaction type"),
              }
            );
          },
        },
      },
    });
  }
  function changeInformationBank(actions) {
    assign(actions, {
      "change-informationBank-type": {
        group: "edit",
        className: "demo-icon-informationBank",
        title: translate("Change Information Bank type"),
        action: {
          click: function (event, element) {
            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });

            popupMenu.open(
              element,
              "informationBank-assignment-changer",
              position,
              {
                title: translate("Change Information Bank type"),
              }
            );
          },
        },
      },
    });
  }
  function changeOrganization(actions) {
    assign(actions, {
      "change-organization-type": {
        group: "edit",
        className: "demo-icon-organization",
        title: translate("Change Actor type"),
        action: {
          click: function (event, element) {
            var position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });

            popupMenu.open(
              element,
              "organization-assignment-changer",
              position,
              {
                title: translate("Change Organization type"),
              }
            );
          },
        },
      },
    });
  }

  function createLinkObjectsEntry(actions) {
    assign(actions, {
      connect: {
        group: "connect",
        className: "bpmn-icon-connection",
        title: "Link object to other objects",
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  function createTextSizeIncreaseEntry(actions) {
    assign(actions, {
      "increase-text-size": {
        group: "text-size",
        className: "demo-icon-plus",
        title: "Increase Text Size",
        action: {
          click: function (event, element) {
            changeTextSize(element, 1);
          },
        },
      },
    });
  }

  function createTextSizeDecreaseEntry(actions) {
    assign(actions, {
      "decrease-text-size": {
        group: "text-size",
        className: "demo-icon-minus",
        title: "Decrease Text Size",
        action: {
          click: function (event, element) {
            changeTextSize(element, -1);
          },
        },
      },
    });
  }

  function changeTextSize(element, direction) {
    const semantic = getBusinessObject(element);
    const oldFontSize = Number(semantic.fontSize.slice(0, 2));
    let newFontSize;
    if (direction === 1) {
      newFontSize = oldFontSize + 2;
      if (newFontSize > 32) return;
      modeling.setFontSize(element, `${newFontSize}px`);
    } else {
      newFontSize = oldFontSize - 2;
      if (newFontSize < 12) return;
      modeling.setFontSize(element, `${newFontSize}px`);
    }
  }

  /**
   * Create an append action
   *
   * @param {string} type
   * @param {string} className
   * @param {string} [title]
   * @param {Object} [options]
   *
   * @return {Object} descriptor
   */
  function appendAction(type, className, title, options) {
    if (typeof title !== "string") {
      options = title;
      title = translate("Append {type}", { type: type.replace(/^bpmn:/, "") });
    }

    function appendStart(event, element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape, {
        source: element,
      });
    }

    var append = autoPlace
      ? function (event, element) {
          var shape = elementFactory.createShape(
            assign({ type: type }, options)
          );

          autoPlace.append(element, shape);
        }
      : appendStart;

    return {
      group: "model",
      className: className,
      title: title,
      action: {
        dragstart: appendStart,
        click: append,
      },
    };
  }
};
