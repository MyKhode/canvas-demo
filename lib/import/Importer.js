import DemoTreeWalker from "./DemoTreeWalker";

/**
 * The importdemoDi:agram result.
 *
 * @typedef {Object} importdemoDi:agramResult
 *
 * @property {Array<string>} warnings
 */

/**
 * The importdemoDi:agram error.
 *
 * @typedef {Error} importdemoDi:agramError
 *
 * @property {Array<string>} warnings
 */

/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param  {djs.Diagram} diagram
 * @param  {ModdleElement<Definitions>} definitions
 * @param  {ModdleElement<PotitRootBoard>} [rootBoard] the diagram to be rendered
 * (if not provided, the first one will be rendered)
 *
 * Returns {Promise<importdemoDi:agramResult, importdemoDi:agramError>}
 */
export function importDemoDiagram(diagram, definitions, rootBoard) {
  var importer, eventBus, translate;

  var error,
    warnings = [];

  /**
   * Walk the diagram semantically, importing (=drawing)
   * all elements you encounter.
   *
   * @param {ModdleElement<Definitions>} definitions
   * @param {ModdleElement<DEMORootBoard>} rootBoard
   */
  function render(definitions, rootBoard) {
    var visitor = {
      root: function (element) {
        return importer.add(element);
      },

      element: function (element, parentShape) {
        return importer.add(element, parentShape);
      },

      error: function (message, context) {
        warnings.push({ message: message, context: context });
      },
    };

    var walker = new DemoTreeWalker(visitor, translate);

    // traverse xml document model,
    // starting at definitions
    walker.handleDefinitions(definitions, rootBoard);
  }

  return new Promise(function (resolve, reject) {
    try {
      importer = diagram.get("demoImporter");
      eventBus = diagram.get("eventBus");
      translate = diagram.get("translate");

      eventBus.fire("import.render.start", { definitions: definitions });

      render(definitions, rootBoard);

      eventBus.fire("import.render.complete", {
        error: error,
        warnings: warnings,
      });

      return resolve({ warnings: warnings });
    } catch (e) {
      return reject(e);
    }
  });
}
