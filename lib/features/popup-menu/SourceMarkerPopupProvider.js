const MARKER_TYPES = [
  {
    label: "None",
    markerType: "None",
  },
  {
    label: "Triangle",
    markerType: "Triangle",
  },
  {
    label: "Diamond",
    markerType: "Diamond",
  },
];

export default function SourceMarkerPopupProvider(
  config,
  popupMenu,
  modeling,
  translate
) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;

  this._markerTypes = (config && config.markerTypes) || MARKER_TYPES;

  this._popupMenu.registerProvider("source-marker-picker", this);
}

SourceMarkerPopupProvider.$inject = [
  "config.sourceMarkerPicker",
  "popupMenu",
  "modeling",
  "translate",
];

SourceMarkerPopupProvider.prototype.getEntries = function (elements) {
  var self = this;

  var sourceMarkerIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`;

  var entries = this._markerTypes.map(function (markerType) {
    let entrySourceMarkerIconHtml = sourceMarkerIconHtml;

    switch (markerType.markerType) {
      case "Triangle":
        entrySourceMarkerIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M54 31.5L14 50L14 13L54 31.5Z" fill="black"/></svg>`;
        break;
      case "Diamond":
        entrySourceMarkerIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="32" width="31" height="31" transform="rotate(-45 10 32)" fill="black"/></svg>`;
      default:
        break;
    }

    return {
      label: self._translate(markerType.label),
      id: markerType.label.toLowerCase() + "-source-marker",
      imageHtml: entrySourceMarkerIconHtml,
      action: createAction(self._modeling, elements, markerType),
    };
  });

  return entries;
};

function createAction(modeling, element, markerType) {
  return function () {
    modeling.setSourceMarker(element, markerType.markerType);
  };
}
