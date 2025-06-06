import { isObject, assign, forEach, reduce } from "min-dash";

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove,
} from "tiny-svg";

import { assignStyle } from "min-dom";

/**
 * @typedef {import('../util/Types').Dimensions} Dimensions
 *
 * @typedef { {
 *   top: number;
 *   left: number;
 *   right: number;
 *   bottom: number;
 * } } Padding
 *
 * @typedef { number | Partial<Padding> } PaddingConfig
 *
 * @typedef { {
 *   horizontal: 'center' | 'left' | 'right';
 *   vertical: 'top' | 'middle';
 * } } Alignment
 *
 *  @typedef { 'center-middle' | 'center-top' } AlignmentConfig
 *
 * @typedef { Partial<{
 *   align: AlignmentConfig;
 *   style: Record<string, number | string>;
 *   padding: PaddingConfig;
 * }> } BaseTextConfig
 *
 * @typedef { BaseTextConfig & Partial<{
 *   size: Dimensions;
 * }> } TextConfig
 *
 * @typedef { BaseTextConfig & Partial<{
 *   box: Dimensions;
 *   fitBox: boolean;
 * }> } TextLayoutConfig
 *
 *  @typedef { Dimensions & {
 *  text: string;
 * } } LineDescriptor
 */

var DEFAULT_BOX_PADDING = 0;

var DEFAULT_LABEL_SIZE = {
  width: 150,
  height: 50,
};

/**
 * @param {AlignmentConfig} align
 * @return {Alignment}
 */
function parseAlign(align) {
  var parts = align.split("-");

  return {
    horizontal: parts[0] || "center",
    vertical: parts[1] || "top",
  };
}

/**
 * @param {PaddingConfig} padding
 *
 * @return {Padding}
 */
function parsePadding(padding) {
  if (isObject(padding)) {
    return assign({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
  } else {
    return {
      top: padding,
      left: padding,
      right: padding,
      bottom: padding,
    };
  }
}

/**
 * @param {string} text
 * @param {SVGTextElement} fakeText
 *
 * @return {import('../util/Types').Dimensions}
 */
function getTextBBox(text, fakeText) {
  fakeText.textContent = text;

  var textBBox;

  try {
    var bbox,
      emptyLine = text === "";

    // add dummy text, when line is empty to
    // determine correct height
    fakeText.textContent = emptyLine ? "dummy" : text;

    textBBox = fakeText.getBBox();

    // take text rendering related horizontal
    // padding into account
    bbox = {
      width: textBBox.width + textBBox.x * 2,
      height: textBBox.height,
    };

    if (emptyLine) {
      // correct width
      bbox.width = 0;
    }

    return bbox;
  } catch (e) {
    return { width: 0, height: 0 };
  }
}

/**
 * Layout the next line and return the layouted element.
 *
 * Alters the lines passed.
 *
 * @param {string[]} lines
 * @param {number} maxWidth
 * @param {SVGTextElement} fakeText
 *
 * @return {LineDescriptor} the line descriptor
 */
function layoutNext(lines, maxWidth, fakeText) {
  var originalLine = lines.shift(),
    fitLine = originalLine;

  var textBBox;

  for (;;) {
    textBBox = getTextBBox(fitLine, fakeText);

    textBBox.width = fitLine ? textBBox.width : 0;

    // try to fit
    if (
      fitLine === " " ||
      fitLine === "" ||
      textBBox.width < Math.round(maxWidth) ||
      fitLine.length < 2
    ) {
      return fit(lines, fitLine, originalLine, textBBox);
    }

    fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
  }
}

/**
 * @param {string[]} lines
 * @param {string} fitLine
 * @param {string} originalLine
 * @param {Dimensions} textBBox
 *
 * @return {LineDescriptor}
 */
function fit(lines, fitLine, originalLine, textBBox) {
  if (fitLine.length < originalLine.length) {
    var remainder = originalLine.slice(fitLine.length).trim();

    lines.unshift(remainder);
  }

  return {
    width: textBBox.width,
    height: textBBox.height,
    text: fitLine,
  };
}

var SOFT_BREAK = "\u00AD";

/**
 * Shortens a line based on spacing and hyphens.
 * Returns the shortened result on success.
 *
 * @param {string} line
 * @param {number} maxLength the maximum characters of the string
 *
 * @return {string} the shortened string
 */
function semanticShorten(line, maxLength) {
  var parts = line.split(/(\s|-|\u00AD)/g),
    part,
    shortenedParts = [],
    length = 0;

  // try to shorten via break chars
  if (parts.length > 1) {
    while ((part = parts.shift())) {
      if (part.length + length < maxLength) {
        shortenedParts.push(part);
        length += part.length;
      } else {
        // remove previous part, too if hyphen does not fit anymore
        if (part === "-" || part === SOFT_BREAK) {
          shortenedParts.pop();
        }

        break;
      }
    }
  }

  var last = shortenedParts[shortenedParts.length - 1];

  // translate trailing soft break to actual hyphen
  if (last && last === SOFT_BREAK) {
    shortenedParts[shortenedParts.length - 1] = "-";
  }

  return shortenedParts.join("");
}

/**
 * @param {string} line
 * @param {number} width
 * @param {number} maxWidth
 *
 * @return {string}
 */
function shortenLine(line, width, maxWidth) {
  var length = Math.max(line.length * (maxWidth / width), 1);

  // try to shorten semantically (i.e. based on spaces and hyphens)
  var shortenedLine = semanticShorten(line, length);

  if (!shortenedLine) {
    // force shorten by cutting the long word
    shortenedLine = line.slice(0, Math.max(Math.round(length - 1), 1));
  }

  return shortenedLine;
}

/**
 * @return {SVGSVGElement}
 */
function getHelperSvg() {
  var helperSvg = document.getElementById("helper-svg");

  if (!helperSvg) {
    helperSvg = svgCreate("svg");

    svgAttr(helperSvg, {
      id: "helper-svg",
    });

    assignStyle(helperSvg, {
      visibility: "hidden",
      position: "fixed",
      width: 0,
      height: 0,
    });

    document.body.appendChild(helperSvg);
  }

  return helperSvg;
}

/**
 * Creates a new label utility
 *
 * @param {TextConfig} [config]
 */
export default function Text(config) {
  this._config = assign(
    {},
    {
      size: DEFAULT_LABEL_SIZE,
      padding: DEFAULT_BOX_PADDING,
      style: {},
      align: "center-top",
    },
    config || {}
  );
}

/**
 * Returns the layouted text as an SVG element.
 *
 * @param {string} text
 * @param {TextLayoutConfig} options
 *
 * @return {SVGElement}
 */
Text.prototype.createText = function (text, options) {
  return this.layoutText(text, options).element;
};

/**
 * Returns a labels layouted dimensions.
 *
 * @param {string} text to layout
 * @param {TextLayoutConfig} options
 *
 * @return {Dimensions}
 */
Text.prototype.getDimensions = function (text, options) {
  return this.layoutText(text, options).dimensions;
};

/**
 * Creates and returns a label and its bounding box.
 *
 * @param {string} text the text to render on the label
 * @param {TextLayoutConfig} options
 *
 * @return { {
 *   element: SVGElement,
 *   dimensions: Dimensions
 * } }
 */
Text.prototype.layoutText = function (text, options) {
  var box = assign({}, this._config.size, options.box),
    style = assign({}, this._config.style, options.style),
    align = parseAlign(options.align || this._config.align),
    padding = parsePadding(
      options.padding !== undefined ? options.padding : this._config.padding
    ),
    fitBox = options.fitBox || false;

  var lineHeight = getLineHeight(style);

  // we split text by lines and normalize
  // {soft break} + {line break} => { line break }
  var lines = text.split(/\u00AD?\r?\n/),
    layouted = [];

  var maxWidth = box.width - padding.left - padding.right;

  // ensure correct rendering by attaching helper text node to invisible SVG
  var helperText = svgCreate("text");
  svgAttr(helperText, { x: 0, y: 0 });
  svgAttr(helperText, style);

  var helperSvg = getHelperSvg();

  svgAppend(helperSvg, helperText);

  while (lines.length) {
    layouted.push(layoutNext(lines, maxWidth, helperText));
  }

  if (align.vertical === "middle") {
    padding.top = padding.bottom = 0;
  }

  var totalHeight =
    reduce(
      layouted,
      function (sum, line, idx) {
        return sum + (lineHeight || line.height);
      },
      0
    ) +
    padding.top +
    padding.bottom;

  var maxLineWidth = reduce(
    layouted,
    function (sum, line, idx) {
      return line.width > sum ? line.width : sum;
    },
    0
  );
  const squareSize = 100 / 3;

  // the y position of the next line
  var y = padding.top;

  if (align.vertical === "middle") {
    y += (box.height - totalHeight) / 2;
  }
  if (align.vertical === "bottom") {
    y += box.height - squareSize / 2 - totalHeight / 2;
  }
  if (align.vertical === "bottomOfBox") {
    y += box.height - totalHeight + 2;
  }

  if (align.vertical === "topOfBox") {
    y += box.height - 2;
  }
  // magic number initial offset
  y -= (lineHeight || layouted[0].height) / 4;

  var textElement = svgCreate("text");

  svgAttr(textElement, style);

  // layout each line taking into account that parent
  // shape might resize to fit text size
  forEach(layouted, function (line) {
    var x;

    y += lineHeight || line.height;

    switch (align.horizontal) {
      case "left":
        x = padding.left;
        break;
      case "leftActor":
        x =
          (fitBox ? maxLineWidth : maxWidth) -
          padding.right -
          squareSize * 3 +
          (squareSize - line.width) / 2;
        break;

      case "right":
        x = (fitBox ? maxLineWidth : maxWidth) - padding.right - line.width;
        break;
      case "rightActor":
        x =
          (fitBox ? maxLineWidth : maxWidth) -
          padding.right -
          squareSize +
          (squareSize - line.width) / 2;
        break;

      case "centerActor":
        x =
          (fitBox ? maxLineWidth : maxWidth) -
          padding.right -
          squareSize * 2 +
          (squareSize - line.width) / 2;
        break;

      default:
        // aka center
        x = Math.max(
          ((fitBox ? maxLineWidth : maxWidth) - line.width) / 2 + padding.left,
          0
        );
    }

    var tspan = svgCreate("tspan");
    svgAttr(tspan, { x: x, y: y });

    tspan.textContent = line.text;

    svgAppend(textElement, tspan);
  });

  svgRemove(helperText);

  var dimensions = {
    width: maxLineWidth,
    height: totalHeight,
  };

  return {
    dimensions: dimensions,
    element: textElement,
  };
};

function getLineHeight(style) {
  if ("fontSize" in style && "lineHeight" in style) {
    return style.lineHeight * parseInt(style.fontSize, 10);
  }
}
