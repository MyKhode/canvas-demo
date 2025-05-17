import { componentsToPath } from "diagram-js/lib/util/RenderUtil";

import { getBusinessObject } from "../util/ModelUtil";

// element utils //////////////////////

export function getDi(element) {
  return element.businessObject.di;
}

export function getSemantic(element) {
  return element.businessObject;
}

// color access //////////////////////

export function getFillColor(element, defaultColor) {
  const di = getDi(element);

  return (
    di["background-color"] || di.get("bioc:fill") || defaultColor || "white"
  );
}

export function getStrokeColor(element, defaultColor) {
  const di = getDi(element);

  return di["border-color"] || di.get("bioc:stroke") || defaultColor || "black";
}

// stroke dasharray access //////////////////////

export function getStrokeStyle(element, defaultStrokeStyle) {
  const semantic = getSemantic(element);

  return semantic.strokeStyle || defaultStrokeStyle || "solid";
}

// source marker access //
export function getSourceMarker(element, defaultSourceMarker) {
  const semantic = getSemantic(element);

  return semantic.sourceMarker || defaultSourceMarker || "None";
}

// target marker access //
export function getTargetMarker(element, defaultTargetMarker) {
  const semantic = getSemantic(element);

  return semantic.targetMarker || defaultTargetMarker || "Triangle";
}

// target marker access //
export function getElementAssignment(element, defaultElementAssignment) {
  const semantic = getSemantic(element);

  return semantic.assignment || defaultElementAssignment || "Default";
}

// cropping path customizations //////////////////////

export function getRectPath(shape) {
  var x = shape.x,
    y = shape.y,
    width = shape.width,
    height = shape.height;

  var rectPath = [
    ["M", x, y],
    ["l", width, 0],
    ["l", 0, height],
    ["l", -width, 0],
    ["z"],
  ];
  return componentsToPath(rectPath);
}

export function getCirclePath(shape) {
  var cx = shape.x + shape.width / 2,
    cy = shape.y + shape.height / 2,
    radius = shape.width / 2;

  var circlePath = [
    ["M", cx, cy],
    ["m", 0, -radius],
    ["a", radius, radius, 0, 1, 1, 0, 2 * radius],
    ["a", radius, radius, 0, 1, 1, 0, -2 * radius],
    ["z"],
  ];

  return componentsToPath(circlePath);
}

export function getInformationBankPath(shape) {
  const width = shape.width;
  const x = shape.x;
  const y = shape.y;

  const rectWidth = Math.sqrt((width / 2) * (width / 2) * 2);
  const rectHypotenuse = Math.sqrt(2 * Math.pow(rectWidth, 2));
  const halfRectHypotenuse = rectHypotenuse / 2;
  const distanceBetweenIntersections = Math.sqrt(
    Math.pow(rectWidth / 2 / 3, 2) / 2
  );

  const path = [
    ["M", x + width / 2, y],
    ["l", width / 2, halfRectHypotenuse],
    ["l", -distanceBetweenIntersections, distanceBetweenIntersections],
    ["l", distanceBetweenIntersections, distanceBetweenIntersections],
    ["l", -width / 2, halfRectHypotenuse],
    ["l", -width / 2, -halfRectHypotenuse],
    ["l", distanceBetweenIntersections, -distanceBetweenIntersections],
    ["l", -distanceBetweenIntersections, -distanceBetweenIntersections],
    ["l", width / 2, -halfRectHypotenuse],
    ["z"],
  ];
  return componentsToPath(path);
}

// Diamond
export function drawDiamond(parentGfx, width, height, attrs) {
  var x_2 = width / 2;
  var y_2 = height / 2;

  var points = [
    { x: x_2, y: 0 },
    { x: width, y: y_2 },
    { x: x_2, y: height },
    { x: 0, y: y_2 },
  ];

  var pointsString = points
    .map(function (point) {
      return point.x + "," + point.y;
    })
    .join(" ");

  attrs = shapeStyle(attrs);

  var polygon = svgCreate("polygon", {
    ...attrs,
    points: pointsString,
  });

  svgAppend(parentGfx, polygon);

  return polygon;
}

export function drawCircle(parentGfx, width, height, offset, attrs = {}) {
  if (isObject(offset)) {
    attrs = offset;
    offset = 0;
  }

  offset = offset || 0;

  attrs = shapeStyle(attrs);

  var cx = width / 2,
    cy = height / 2;

  var circle = svgCreate("circle", {
    cx: cx,
    cy: cy,
    r: Math.round((width + height) / 4 - offset),
    ...attrs,
  });

  svgAppend(parentGfx, circle);

  return circle;
}

// Dashes
export function calculateDashArrayAndOffset(
  width,
  height,
  dashLength,
  gapLength
) {
  // Calculate the perimeter of the rectangle
  const perimeter = 2 * (width + height);

  // Calculate the total dash-and-gap pattern length
  const patternLength = dashLength + gapLength;

  // Calculate how many times the pattern fits into the perimeter
  const repeatCount = Math.ceil(perimeter / patternLength);

  // Calculate the stroke-dasharray value
  const dashArray = new Array(repeatCount)
    .fill(dashLength)
    .concat(new Array(repeatCount).fill(gapLength));
  const dashArrayString = dashArray.slice(0, repeatCount * 2).join(" ");

  // Calculate the stroke-dashoffset (to start pattern correctly)
  const dashOffset = 0; // Default to 0; modify if you want to shift the pattern

  return {
    strokeDasharray: dashArrayString,
    strokeDashoffset: dashOffset,
  };
}
