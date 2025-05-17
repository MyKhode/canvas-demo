import inherits from "inherits-browser";

import { assign, isObject } from "min-dash";

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
} from "tiny-svg";

// import { createLine } from "diagram-js/lib/util/RenderUtil";
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
  getStrokeStyle,
  getTargetMarker,
  getSourceMarker,
  getElementAssignment,
  getCirclePath,
  getInformationBankPath,
} from "./DEMORendererUtil";

import { getLabel } from "../features/label-editing/LabelUtil";

import { getBusinessObject, is } from "../util/ModelUtil";
import { query as domQuery } from "min-dom";

import {
  getFillColor,
  getRectPath,
  getSemantic,
  getStrokeColor,
} from "./DEMORendererUtil";
import Ids from "ids";

var RENDERER_IDS = new Ids();

var HIGH_FILL_OPACITY = 1;

var DEFAULT_TEXT_SIZE = 16;
var markers = {};

export default function DEMORenderer(
  config,
  eventBus,
  styles,
  canvas,
  textRenderer,
  priority
) {
  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config && config.defaultFillColor,
    defaultStrokeColor = config && config.defaultStrokeColor;

  var rendererId = RENDERER_IDS.next();

  var computeStyle = styles.computeStyle;

  function drawRect(parentGfx, width, height, r, offset, attrs) {
    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: "black",
      strokeWidth: 2,
      fill: "white",
    });

    var rect = svgCreate("rect");
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r,
    });
    svgAttr(rect, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawActor(parentGfx, width, height, attrs, assignment) {
    let stroke = "black";
    let strokeDasharray = "0";
    const group = svgCreate("g");

    const rect = svgCreate("rect");
    svgAttr(rect, {
      width,
      height,
    });
    svgAppend(group, rect);

    switch (assignment) {
      case "Missing":
        stroke = "#FF6666";
        strokeDasharray = "4";
        break;
      case "Unclear":
        renderQuestionMark(group, {
          box: { width, height },
          align: "center-middle",
          padding: 0,
          style: {
            fill: "black",
            fontSize: "48px",
          },
        });
        break;
      case "Overlapping":
        const rect1 = svgCreate("rect");
        const rect1Width = 98 / 6;
        const rect1Height = 98 / 3;
        svgAttr(rect1, {
          x: width - rect1Width - 1,
          y: height - rect1Height - 1,
          width: rect1Width,
          height: rect1Height,
          fill: "#ff6666",
          strokeWidth: 1,
        });
        const rect2 = svgCreate("rect");
        const rect2Size = rect1Width;
        svgAttr(rect2, {
          x: width - (rect2Size * 3) / 2 - 1,
          y: height - rect2Size - 1,
          width: rect2Size,
          height: rect2Size,
          fill: "#ff6666",
          strokeWidth: 1,
        });
        svgAppend(group, rect1);
        svgAppend(group, rect2);
        break;
      case "More Than One":
        for (let i = 0; i < 3; i++) {
          const square = svgCreate("rect");
          const squareSize = 98 / 6;
          svgAttr(square, {
            x: width - squareSize - i * squareSize * 2 - 1,
            y: height - squareSize - 1,
            width: squareSize,
            height: squareSize,
            fill: "#ff6666",
            strokeWidth: 1,
          });
          svgAppend(group, square);
        }
        break;
      case "No Responsibility":
        for (let i = 0; i < 3; i++) {
          const square = svgCreate("rect");
          const squareSize = 98 / 3;
          svgAttr(square, {
            x: width - squareSize - i * squareSize - 1,
            y: height - squareSize - 1,
            width: squareSize,
            height: squareSize,
            fill: i === 2 && "#ffbaba",
            strokeWidth: 1,
          });
          svgAppend(group, square);
          renderActorLetter(
            group,
            {
              box: { width, height },
              align: "leftActor-bottom",
              padding: 0,
              style: {
                fill: "black",
                strokeWidth: 0,
              },
            },
            "R"
          );
        }
        break;
      case "No Mandate":
        for (let i = 0; i < 3; i++) {
          const square = svgCreate("rect");
          const squareSize = 98 / 3;
          svgAttr(square, {
            x: width - squareSize - i * squareSize - 1,
            y: height - squareSize - 1,
            width: squareSize,
            height: squareSize,
            fill: i === 1 && "#ffbaba",
            strokeWidth: 1,
          });
          svgAppend(group, square);
          renderActorLetter(
            group,
            {
              box: {
                width,
                height,
              },
              align: "centerActor-bottom",
              padding: 0,
              style: {
                fill: "black",
                strokeWidth: 0,
              },
            },
            "M"
          );
        }
        break;
      case "No Competence":
        for (let i = 0; i < 3; i++) {
          const square = svgCreate("rect");
          const squareSize = 98 / 3;
          svgAttr(square, {
            x: width - squareSize - i * squareSize - 1,
            y: height - squareSize - 1,
            width: squareSize,
            height: squareSize,
            fill: i === 0 && "#ffbaba",
            strokeWidth: 1,
          });
          svgAppend(group, square);
          renderActorLetter(
            group,
            {
              box: {
                width,
                height,
              },
              align: "rightActor-bottom",
              padding: 0,
              style: {
                fill: "black",
                strokeWidth: 0,
              },
            },
            "C"
          );
        }
        break;
      default:
        break;
    }
    const attributes = {
      stroke,
      strokeDasharray,
      strokeWidth: 2,
      fontWeight: "bold",
      fill: "white",
      fontSize: "20px",
    };

    svgAttr(group, attributes);
    svgAppend(parentGfx, group);

    return group;
  }

  function drawTransaction(parentGfx, width, height, attrs, assignment) {
    let stroke = "black";
    let strokeDasharray = "0";
    const group = svgCreate("g");

    const circle = svgCreate("circle");
    const radius = width / 2;
    svgAttr(circle, {
      cx: radius,
      cy: radius,
      r: radius,
    });

    const polygon = svgCreate("polygon");
    svgAttr(polygon, {
      points: `${width / 2},2 ${width - 2},${width / 2} ${width / 2},${width - 2} 2,${width / 2}`,
      stroke: "#ff6666",
      strokeWidth: 1.6,
    });

    const rect = svgCreate("rect");
    svgAttr(rect, {
      width,
      height,
    });

    switch (assignment) {
      case "Unclear":
        svgAppend(group, circle);
        svgAppend(group, polygon);
        renderQuestionMark(group, {
          box: { width, height },
          align: "center-middle",
          padding: 0,
          style: {
            fill: "black",
            fontSize: "48px",
            strokeWidth: 0,
          },
        });
        break;
      case "Process White":
        svgAppend(group, rect);
        break;
      case "Process Fill":
        svgAttr(rect, {
          fill: "lightgray",
        });
        svgAppend(group, rect);
        svgAppend(group, polygon);
        break;
      case "Missing":
        stroke = "#FF6666";
        strokeDasharray = "4";
        svgAppend(group, circle);
        svgAppend(group, polygon);
        break;
      default:
        svgAppend(group, circle);
        svgAppend(group, polygon);
        break;
    }
    const attributes = {
      stroke,
      strokeDasharray,
      strokeWidth: 2,
      fill: "white",
    };
    svgAttr(group, attributes);
    svgAppend(parentGfx, group);

    return group;
  }

  function drawInformationBank(parentGfx, width, attrs) {
    attrs = computeStyle(attrs, {
      stroke: "black",
      strokeWidth: 2,
      fill: "white",
    });
    const group = svgCreate("g");
    svgAttr(group, attrs);

    const rect1 = svgCreate("rect");
    const rect2 = svgCreate("rect");
    const rectWidth = Math.sqrt((width / 2) * (width / 2) * 2);

    svgAttr(rect1, {
      x: -rectWidth / 2,
      y: -rectWidth / 2,
      width: rectWidth,
      height: rectWidth,
      transform: `translate(${width / 2}, ${width / 2}) rotate(45)`,
      fill: "white",
    });
    svgAttr(rect2, {
      x: (-rectWidth / 2) * (2 / 3),
      y: (-rectWidth / 2) * (2 / 3),
      width: rectWidth,
      height: rectWidth,
      transform: `translate(${width / 2}, ${width / 2}) rotate(45)`,
      fillOpacity: 1,
    });

    svgAppend(group, rect1);
    svgAppend(group, rect2);
    svgAppend(parentGfx, group);

    return group;
  }

  function drawPath(parentGfx, d, attrs) {
    attrs = computeStyle(attrs, ["no-fill"], {
      strokeWidth: 2,
      stroke: "black",
    });

    var path = svgCreate("path");
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function renderLabel(parentGfx, label, options) {
    options = assign(
      {
        size: {
          width: 100,
        },
      },
      options
    );

    var text = textRenderer.createText(label || "", options);

    svgClasses(text).add("djs-label");

    svgAppend(parentGfx, text);

    return text;
  }

  function renderQuestionMark(group, options) {
    options = assign(
      {
        size: {
          width: 100,
        },
      },
      options
    );

    var text = textRenderer.createText("?", options);

    svgAppend(group, text);

    return text;
  }

  function renderActorLetter(group, options, letter, size) {
    options = assign(
      {
        size: {
          width: size,
        },
      },
      options
    );
    var text = textRenderer.createText(letter, options);

    svgAppend(group, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, fontSize) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getColor(element) === "black" ? "white" : "black",
        fontSize: fontSize || DEFAULT_TEXT_SIZE,
      },
    });
  }

  function renderExternalLabel(parentGfx, element) {
    var box = {
      width: 300,
      height: 34,
      x: element.width + element.x,
      y: element.height + element.y,
    };

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign({}, textRenderer.getExternalStyle(), {
        fill: "#FF6666",
        fontWeight: "bold",
        fontSize: "20px",
      }),
    });
  }

  function renderDescription(parentGfx, element, assignment) {
    var semantic = getSemantic(element);
    if (semantic.description) {
      renderLabel(parentGfx, semantic.description, {
        box: {
          height: element.height / 2,
          width: element.width,
        },
        padding: 0,
        align: "center-topOfBox",
        style: {
          fill: assignment === "Unclear" ? "white" : defaultStrokeColor,
        },
      });
    }
  }

  function renderTitleLabel(parentGfx, element) {
    let semantic = getSemantic(element);
    let text = "";
    if (semantic.name) {
      text = semantic.name;
    }
    renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: element.width,
      },
      padding: 5,
      align: "center-middle",
      style: {
        fill: defaultStrokeColor,
      },
    });
  }

  function renderTitleLabelActor(parentGfx, element, assignment) {
    let semantic = getSemantic(element);
    let text = "";
    if (semantic.name) {
      text = semantic.name;
    }
    renderLabel(parentGfx, text, {
      box: {
        width: element.width,
        height: element.height / 2,
      },
      padding: 5,
      align: "center-bottomOfBox",
      style: {
        fill: assignment === "Unclear" ? "white" : defaultStrokeColor,
        fontWeight: "bold",
      },
    });
  }
  function renderTitleLabelTransaction(parentGfx, element) {
    let semantic = getSemantic(element);
    let text = "";
    if (semantic.name) {
      text = semantic.name;
    }
    renderLabel(parentGfx, text, {
      box: element,
      padding: 5,
      align: "center-middle",
      style: {
        fill: defaultStrokeColor,
        fontWeight: "bold",
        fontSize: "20px",
      },
    });
  }
  function renderTitleLabelInformationBank(parentGfx, element) {
    let semantic = getSemantic(element);
    let text = "";
    if (semantic.name) {
      text = semantic.name;
    }
    const rectWidth = Math.sqrt(element.width * element.width * 2);
    renderLabel(parentGfx, text, {
      box: {
        height: rectWidth - 5,
        width: element.width,
      },
      padding: 5,
      align: "center-middle",
      style: {
        fill: defaultStrokeColor,
        fontWeight: "bold",
        fontSize: "20px",
      },
    });
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = "m  " + waypoints[0].x + "," + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += "L" + waypoints[i].x + "," + waypoints[i].y + " ";
    }
    return pathData;
  }

  function marker(origin, type, fill, stroke) {
    var id =
      "-" +
      colorEscape(origin) +
      "-" +
      colorEscape(fill) +
      "-" +
      colorEscape(stroke) +
      "-" +
      colorEscape(type).toLowerCase() +
      "-" +
      rendererId;

    if (!markers[id]) {
      createMarker(origin, id, type, fill, stroke);
    }

    return "url(#" + id + ")";
  }

  function addMarker(id, options) {
    var attrs = assign(
      {
        fill: "black",
        strokeWidth: 1,
        strokeLinecap: "round",
        strokeDasharray: "none",
      },
      options.attrs
    );

    var ref = options.ref || { x: 0, y: 0 };

    var scale = options.scale || 1;

    // fix for safari / chrome / firefox bug not correctly
    // resetting stroke dash array
    if (attrs.strokeDasharray === "none") {
      attrs.strokeDasharray = [10000, 1];
    }

    var marker = svgCreate("marker");

    svgAttr(options.element, attrs);

    svgAppend(marker, options.element);

    svgAttr(marker, {
      id: id,
      viewBox: options.dataType === "Triangle" ? "-2 -2 22 22" : "-2 -2 34 34",
      refX: ref.x,
      refY: ref.y,
      markerWidth: (options.dataType === "Triangle" ? 20 : 32) * scale,
      markerHeight: (options.dataType === "Triangle" ? 20 : 32) * scale,
      orient: "auto",
    });

    var defs = domQuery("defs", canvas._svg);

    if (!defs) {
      defs = svgCreate("defs");

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function colorEscape(str) {
    // only allow characters and numbers
    return str.replace(/[^0-9a-zA-z]+/g, "_");
  }

  function createMarker(origin, id, type, fill, stroke) {
    var marker = svgCreate("path");
    svgAttr(marker, {
      d:
        type === "Triangle"
          ? origin === "source"
            ? "M 10 0 L 0 5 L 10 10 z"
            : "M 0 0 L 10 5 L 0 10 z"
          : "M1,8 L8,1 L15,8 L8,15 Z",
    });

    addMarker(id, {
      dataType: type,
      element: marker,
      ref: {
        x: origin === "source" ? 0 : type === "Triangle" ? 10 : 16,
        y: type === "Triangle" ? 5 : 8,
      },
      scale: 0.5,
      attrs: {
        fill: type === "Triangle" ? "black" : "#FF6666", //fill,
        stroke: type === "Triangle" ? stroke : "#FF6666",
      },
    });
  }

  this.handlers = {
    "demo:Object": function (parentGfx, element, attrs) {
      const rect = drawRect(
        parentGfx,
        element.width,
        element.height,
        0,
        assign(
          {
            fill: getFillColor(element, defaultFillColor),
            fillOpacity: HIGH_FILL_OPACITY,
            stroke: getStrokeColor(element, defaultStrokeColor),
          },
          attrs
        )
      );

      addDivider(parentGfx, element);

      renderTitleLabel(parentGfx, element);

      renderDescription(parentGfx, element);

      return rect;
    },
    "demo:Actor": function (parentGfx, element, attrs) {
      const assignment = getElementAssignment(element, "Default");
      const actor = drawActor(
        parentGfx,
        element.width,
        element.height,
        assign(
          {
            fill: getFillColor(element, defaultFillColor),
            fillOpacity: HIGH_FILL_OPACITY,
            stroke: getStrokeColor(element, defaultStrokeColor),
          },
          attrs
        ),
        assignment
      );
      if (assignment !== "Unclear") {
        renderTitleLabelActor(parentGfx, element, assignment);
        renderDescription(parentGfx, element, assignment);
      }
      return actor;
    },
    "demo:Transaction": function (parentGfx, element, attrs) {
      const assignment = getElementAssignment(element, "Default");
      const transaction = drawTransaction(
        parentGfx,
        element.width,
        element.height,
        assign(
          {
            fill: getFillColor(element, defaultFillColor),
            fillOpacity: HIGH_FILL_OPACITY,
            stroke: getStrokeColor(element, defaultStrokeColor),
          },
          attrs
        ),
        assignment
      );
      if (assignment !== "Unclear") {
        renderTitleLabelTransaction(parentGfx, element);
      }

      return transaction;
    },
    "demo:InformationBank": function (parentGfx, element, attrs) {
      const assignment = getElementAssignment(element, "Default");
      const informationBank = drawInformationBank(
        parentGfx,
        element.width,
        assign(
          {
            fill: getFillColor(element, defaultFillColor),
            fillOpacity: HIGH_FILL_OPACITY,
            stroke:
              assignment === "Missing"
                ? "#FF6666"
                : getStrokeColor(element, defaultStrokeColor),
            strokeDasharray: assignment === "Missing" ? "4" : "0",
          },
          attrs
        )
      );

      renderTitleLabelInformationBank(parentGfx, element);

      return informationBank;
    },
    "demo:Flow": function (parentGfx, element) {
      const strokeStyle = getStrokeStyle(element, "solid");
      const sourceMarker = getSourceMarker(element, "None");
      const targetMarker = getTargetMarker(element, "Triangle");
      var pathData = createPathFromConnection(element);

      var fill = getFillColor(element, defaultFillColor),
        stroke = getStrokeColor(element, defaultStrokeColor);

      var attrs = {
        strokeLinejoin: "round",
        markerStart:
          sourceMarker !== "None"
            ? marker("source", sourceMarker, fill, stroke)
            : undefined,
        markerEnd:
          targetMarker !== "None"
            ? marker("target", targetMarker, fill, stroke)
            : undefined,
        stroke: getStrokeColor(element, defaultStrokeColor),
        strokeDasharray: strokeStyle === "solid" ? "0" : "4",
      };
      return drawPath(parentGfx, pathData, attrs);
    },
    "demo:Organization": function (parentGfx, element, attrs) {
      const assignment = getElementAssignment(element, "Default");
      var rect = drawRect(parentGfx, element.width, element.height, 0, {
        stroke: "#FF6666",
        strokeWidth: 4,
        strokeDasharray: assignment === "Missing" ? "10 10" : "0",
        fill: "none",
        pointerEvents: "none",
      });
      return rect;
    },
    "demo:TextBox": function (parentGfx, element) {
      var attrs = {
        fill: "none",
        stroke: "none",
      };
      const semantic = getBusinessObject(element);
      var textSize = semantic.fontSize || DEFAULT_TEXT_SIZE;

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, "center-middle", textSize);

      return rect;
    },
    label: function (parentGfx, element) {
      return renderExternalLabel(parentGfx, element);
    },
  };
}

inherits(DEMORenderer, BaseRenderer);

DEMORenderer.$inject = [
  "config.demom",
  "eventBus",
  "styles",
  "canvas",
  "textRenderer",
];

DEMORenderer.prototype.canRender = function (element) {
  return is(element, "demo:BoardElement");
};

DEMORenderer.prototype.drawShape = function (parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

DEMORenderer.prototype.drawConnection = function (parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

DEMORenderer.prototype.getShapePath = function (element) {
  const type = element.type;
  const assignment = getBusinessObject(element).assignment;
  if (type === "demo:Transaction" && assignment !== "Process White") {
    return getCirclePath(element);
  }
  if (type === "demo:InformationBank") {
    return getInformationBankPath(element);
  }
};

// helpers //////////

function getColor(element) {
  var bo = getBusinessObject(element);

  return bo.color || element.color;
}
