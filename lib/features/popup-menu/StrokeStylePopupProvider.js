const STROKE_STYLES = [
  {
    label: "Solid",
    strokeStyle: "solid",
  },
  {
    label: "Dashed",
    strokeStyle: "dash",
  },
];

export default function StrokeStylePopupProvider(
  config,
  popupMenu,
  modeling,
  translate
) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;

  this._strokeStyles = (config && config.strokeStyles) || STROKE_STYLES;

  this._popupMenu.registerProvider("stroke-style-picker", this);
}

StrokeStylePopupProvider.$inject = [
  "config.strokeStylePicker",
  "popupMenu",
  "modeling",
  "translate",
];

StrokeStylePopupProvider.prototype.getEntries = function (elements) {
  var self = this;

  var strokeStyleIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="4" y1="30" x2="60" y2="30" stroke="black" stroke-width="4" stroke-dasharray="var(--stroke-dasharray)"/>
</svg>`;

  var entries = this._strokeStyles.map(function (strokeStyle) {
    var entryStrokeStyleIconHtml = strokeStyleIconHtml.replace(
      "var(--stroke-dasharray)",
      strokeStyle.strokeStyle === "dash" ? "8" : "0"
    );
    return {
      label: self._translate(strokeStyle.label),
      id: strokeStyle.label.toLowerCase() + "-stroke-style",
      imageHtml: entryStrokeStyleIconHtml,
      action: createAction(self._modeling, elements, strokeStyle),
    };
  });

  return entries;
};

function createAction(modeling, element, strokeStyle) {
  return function () {
    modeling.setStrokeStyle(element, strokeStyle.strokeStyle);
  };
}
