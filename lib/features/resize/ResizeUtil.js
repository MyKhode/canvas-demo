import { filter, isNumber } from "min-dash";

var max = Math.max,
  min = Math.min;

var DEFAULT_CHILD_BOX_PADDING = 20;

import { getBBox } from "diagram-js/lib/util/Elements";

import { asTRBL, asBounds } from "diagram-js/lib/layout/LayoutUtil";

/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../util/Types').Direction} Direction
 * @typedef {import('../../util/Types').Point} Point
 * @typedef {import('../../util/Types').Rect} Rect
 * @typedef {import('../../util/Types').RectTRBL} RectTRBL
 */

/**
 * Substract a TRBL from another
 *
 * @param {RectTRBL} trblA
 * @param {RectTRBL} trblB
 *
 * @return {RectTRBL}
 */
export function substractTRBL(trblA, trblB) {
  return {
    top: trblA.top - trblB.top,
    right: trblA.right - trblB.right,
    bottom: trblA.bottom - trblB.bottom,
    left: trblA.left - trblB.left,
  };
}

/**
 * Resize the given bounds by the specified delta from a given anchor point.
 *
 * @param {Rect} bounds the bounding box that should be resized
 * @param {Direction} direction in which the element is resized (nw, ne, se, sw)
 * @param {Point} delta of the resize operation
 *
 * @return {Rect} resized bounding box
 */
export function resizeBounds(bounds, direction, delta, aspectRatio) {
  var dx = delta.x,
    dy = delta.y;

  var newBounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  if (!aspectRatio) {
    if (direction.indexOf("n") !== -1) {
      newBounds.y = bounds.y + dy;
      newBounds.height = bounds.height - dy;
    } else if (direction.indexOf("s") !== -1) {
      newBounds.height = bounds.height + dy;
    }

    if (direction.indexOf("e") !== -1) {
      newBounds.width = bounds.width + dx;
    } else if (direction.indexOf("w") !== -1) {
      newBounds.x = bounds.x + dx;
      newBounds.width = bounds.width - dx;
    }

    return newBounds;
  }
  switch (direction) {
    case "n":
      newBounds.y = bounds.y + dy;
      newBounds.height = bounds.height - dy;
      newBounds.width = aspectRatio * newBounds.height;
      break;
    case "s":
      newBounds.height = bounds.height + dy;
      newBounds.width = aspectRatio * newBounds.height;
      break;
    case "e":
      newBounds.width = bounds.width + dx;
      newBounds.height = (1 / aspectRatio) * newBounds.width;
      break;
    case "w":
      newBounds.x = bounds.x + dx;
      newBounds.width = bounds.width - dx;
      newBounds.height = (1 / aspectRatio) * newBounds.width;
      break;
    case "ne":
      newBounds.y = bounds.y + dy;
      newBounds.height = bounds.height - dy;
      newBounds.width = aspectRatio * newBounds.height;
      break;
    case "nw":
      newBounds.y = bounds.y + dy;
      newBounds.x = bounds.x + dy * aspectRatio;
      newBounds.height = bounds.height - dy;
      newBounds.width = aspectRatio * newBounds.height;
      break;
    case "se":
      newBounds.width = bounds.width + dx;
      newBounds.height = (1 / aspectRatio) * newBounds.width;
      break;
    case "sw":
      newBounds.x = bounds.x + dx;
      newBounds.width = bounds.width - dx;
      newBounds.height = (1 / aspectRatio) * newBounds.width;
      break;
    default:
      break;
  }
  return newBounds;
}

/**
 * Resize the given bounds by applying the passed
 * { top, right, bottom, left } delta.
 *
 * @param {Rect} bounds
 * @param {RectTRBL} resize
 *
 * @return {Rect}
 */
export function resizeTRBL(bounds, resize) {
  return {
    x: bounds.x + (resize.left || 0),
    y: bounds.y + (resize.top || 0),
    width: bounds.width - (resize.left || 0) + (resize.right || 0),
    height: bounds.height - (resize.top || 0) + (resize.bottom || 0),
  };
}

export function reattachPoint(bounds, newBounds, point) {
  var sx = bounds.width / newBounds.width,
    sy = bounds.height / newBounds.height;

  return {
    x:
      Math.round(newBounds.x + newBounds.width / 2) -
      Math.floor((bounds.x + bounds.width / 2 - point.x) / sx),
    y:
      Math.round(newBounds.y + newBounds.height / 2) -
      Math.floor((bounds.y + bounds.height / 2 - point.y) / sy),
  };
}

function applyConstraints(attr, trbl, resizeConstraints) {
  var value = trbl[attr],
    minValue = resizeConstraints.min && resizeConstraints.min[attr],
    maxValue = resizeConstraints.max && resizeConstraints.max[attr];

  if (isNumber(minValue)) {
    value = (/top|left/.test(attr) ? min : max)(value, minValue);
  }

  if (isNumber(maxValue)) {
    value = (/top|left/.test(attr) ? max : min)(value, maxValue);
  }

  return value;
}

export function ensureConstraints(currentBounds, resizeConstraints) {
  // if (!resizeConstraints) {
  //   return currentBounds;
  // }
  return currentBounds;

  var currentTrbl = asTRBL(currentBounds);

  return asBounds({
    top: applyConstraints("top", currentTrbl, resizeConstraints),
    right: applyConstraints("right", currentTrbl, resizeConstraints),
    bottom: applyConstraints("bottom", currentTrbl, resizeConstraints),
    left: applyConstraints("left", currentTrbl, resizeConstraints),
  });
}

export function getMinResizeBounds(
  direction,
  currentBounds,
  minDimensions,
  childrenBounds
) {
  var currentBox = asTRBL(currentBounds);

  var minBox = {
    top: /n/.test(direction)
      ? currentBox.bottom - minDimensions.height
      : currentBox.top,
    left: /w/.test(direction)
      ? currentBox.right - minDimensions.width
      : currentBox.left,
    bottom: /s/.test(direction)
      ? currentBox.top + minDimensions.height
      : currentBox.bottom,
    right: /e/.test(direction)
      ? currentBox.left + minDimensions.width
      : currentBox.right,
  };

  var childrenBox = childrenBounds ? asTRBL(childrenBounds) : minBox;

  var combinedBox = {
    top: min(minBox.top, childrenBox.top),
    left: min(minBox.left, childrenBox.left),
    bottom: max(minBox.bottom, childrenBox.bottom),
    right: max(minBox.right, childrenBox.right),
  };

  return asBounds(combinedBox);
}

function asPadding(mayBePadding, defaultValue) {
  if (typeof mayBePadding !== "undefined") {
    return mayBePadding;
  } else {
    return DEFAULT_CHILD_BOX_PADDING;
  }
}

export function addPadding(bbox, padding) {
  var left, right, top, bottom;

  if (typeof padding === "object") {
    left = asPadding(padding.left);
    right = asPadding(padding.right);
    top = asPadding(padding.top);
    bottom = asPadding(padding.bottom);
  } else {
    left = right = top = bottom = asPadding(padding);
  }

  return {
    x: bbox.x - left,
    y: bbox.y - top,
    width: bbox.width + left + right,
    height: bbox.height + top + bottom,
  };
}

/**
 * Is the given element part of the resize
 * targets min boundary box?
 *
 * This is the default implementation which excludes
 * connections and labels.
 *
 * @param {Element} element
 */
function isBBoxChild(element) {
  // exclude connections
  if (element.waypoints) {
    return false;
  }
  // exclude labels
  if (element.type === "label") {
    return false;
  }

  return true;
}

/**
 * Return children bounding computed from a shapes children
 * or a list of prefiltered children.
 *
 * @param {Shape|Shape[]} shapeOrChildren
 * @param {RectTRBL|number} padding
 *
 * @return {Rect}
 */
export function computeChildrenBBox(shapeOrChildren, padding) {
  var elements;

  // compute based on shape
  if (shapeOrChildren.length === undefined) {
    // grab all the children that are part of the
    // parents children box
    elements = filter(shapeOrChildren.children, isBBoxChild);
  } else {
    elements = shapeOrChildren;
  }

  if (elements.length) {
    return addPadding(getBBox(elements), padding);
  }
}
