import { isString, assign } from "min-dash";

import { Moddle } from "moddle";

import { Reader, Writer } from "moddle-xml";

/**
 * A sub class of {@link Moddle} with support for import and export of DEMO xml files.
 *
 * @class DEMOModdle
 *
 * @extends Moddle
 *
 * @param {Object|Array} packages to use for instantiating the model
 * @param {Object} [options] additional options to pass over
 */
export default function DEMOModdle(packages, options) {
  Moddle.call(this, packages, options);
}

DEMOModdle.prototype = Object.create(Moddle.prototype);

/**
 * The fromXML result.
 *
 * @typedef {Object} ParseResult
 *
 * @property {ModdleElement} rootElement
 * @property {Array<Object>} references
 * @property {Array<Error>} warnings
 * @property {Object} elementsById - a mapping containing each ID -> ModdleElement
 */

/**
 * The fromXML error.
 *
 * @typedef {Error} ParseError
 *
 * @property {Array<Error>} warnings
 */

/**
 * Instantiates an DEMO model tree from a given xml string.
 *
 * @param {String}   xmlStr
 * @param {String}   [typeName='demo:Definitions'] name of the root element
 * @param {Object}   [options]  options to pass to the underlying reader
 *
 * @returns {Promise<ParseResult, ParseError>}
 */
DEMOModdle.prototype.fromXML = function (xmlStr, typeName, options) {
  if (!isString(typeName)) {
    options = typeName;
    typeName = "demo:Definitions";
  }
  const reader = new Reader(assign({ model: this, lax: false }, options));
  const rootHandler = reader.handler(typeName);
  return reader.fromXML(xmlStr, rootHandler);
};

/**
 * The toXML result.
 *
 * @typedef {Object} SerializationResult
 *
 * @property {String} xml
 */

/**
 * Serializes a DEMO object tree to XML.
 *
 * @param {String}   element    the root element, typically an instance of `demo:Definitions`
 * @param {Object}   [options]  to pass to the underlying writer
 *
 * @returns {Promise<SerializationResult, Error>}
 */
DEMOModdle.prototype.toXML = function (element, options) {
  const writer = new Writer(options);

  return new Promise(function (resolve, reject) {
    try {
      const result = writer.toXML(element);

      return resolve({
        xml: result,
      });
    } catch (err) {
      return reject(err);
    }
  });
};
