import "./style.css";

import "demo-js/assets/demo-js.css";
import "diagram-js/assets/diagram-js.css";
import "bpmn-font/dist/css/bpmn.css";
import "./reset.css";
import DEMOModeler from "demo-js/lib/Modeler";
import emptyBoardXML from "./resources/emptyBoard.xml?raw";

import { jsPDF } from "jspdf";
import "svg2pdf.js";

// modeler instance
const modeler = new DEMOModeler({
  container: "#canvas",
  keyboard: {
    bindTo: window,
  },
});

/* screen interaction */
function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

const state = {
  fullScreen: false,
  keyboardHelp: false,
};
document
  .getElementById("js-toggle-fullscreen")
  .addEventListener("click", function () {
    state.fullScreen = !state.fullScreen;
    if (state.fullScreen) {
      enterFullscreen(document.documentElement);
    } else {
      exitFullscreen();
    }
  });
document
  .getElementById("js-toggle-keyboard-help")
  .addEventListener("click", function () {
    state.keyboardHelp = !state.keyboardHelp;
    let displayProp = "none";
    if (state.keyboardHelp) {
      displayProp = "block";
    }
    document.getElementById("io-dialog-main").style.display = displayProp;
  });
document
  .getElementById("io-dialog-main")
  .addEventListener("click", function () {
    state.keyboardHelp = !state.keyboardHelp;
    let displayProp = "none";
    if (!state.keyboardHelp) {
      document.getElementById("io-dialog-main").style.display = displayProp;
    }
  });

/* file functions */
function openFile(file, callback) {
  // check file api availability
  if (!window.FileReader) {
    return window.alert(
      "Looks like you use an older browser that does not support drag and drop. " +
        "Try using a modern browser such as Chrome, Firefox or Internet Explorer > 10."
    );
  }

  // no file chosen
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const xml = e.target.result;

    callback(xml);
  };

  reader.readAsText(file);
}

const fileInput = document.createElement("input");
fileInput.setAttribute("type", "file");
fileInput.style.display = "none";
document.body.appendChild(fileInput);
document.addEventListener("change", function (e) {
  openFile(e.target.files[0], openBoard);
});

function openBoard(xml) {
  // import board
  modeler.importXML(xml).catch(function (err) {
    if (err) {
      return console.error("could not import DEMO board", err);
    }
  });
}

function saveSVG() {
  return modeler.saveSVG();
}

function saveBoard() {
  return modeler.saveXML({ format: true });
}

async function getSVG() {
  const { svg } = await saveSVG();
  // const parser = new DOMParser();
  // const svgDoc = parser.parseFromString(svg, "image/svg+xml");
  // return svgDoc.querySelector("svg");
  return svg;
}
// bootstrap board functions
const downloadLink = document.getElementById("js-download-board");
const downloadSvgLink = document.getElementById("js-download-svg");
const downloadPDFLink = document.getElementById("js-download-pdf");

const openNew = document.getElementById("js-open-new");
const openExistingBoard = document.getElementById("js-open-board");

function setEncoded(link, name, data) {
  const encodedData = encodeURIComponent(data);
  if (data) {
    link.classList.add("active");
    link.setAttribute(
      "href",
      "data:application/xml;charset=UTF-8," + encodedData
    );
    link.setAttribute("download", name);
  } else {
    link.classList.remove("active");
  }
}

function generatePDF(img, width, height) {
  const options = {
    orientation: "l",
    unit: "px",
  };
  const doc = new jsPDF(options);
  const ratio = width / height;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = pageWidth / ratio;
  doc.addImage(
    img,
    "PNG",
    0,
    0,
    Math.min(width / 2, pageWidth),
    Math.min(height / 2, pageHeight)
  );
  doc.save();
}

let parsed;

const exportArtifacts = debounce(function () {
  getSVG().then(function (result) {
    parsed = result;
    if (parsed) {
      downloadPDFLink.classList.add("active");
    } else {
      downloadPDFLink.classList.remove("active");
    }
  });
  saveSVG().then(function (result) {
    setEncoded(downloadSvgLink, "demo.svg", result.svg);
  });

  saveBoard().then(function (result) {
    setEncoded(downloadLink, "demo.xml", result.xml);
  });
}, 500);

modeler.on("commandStack.changed", exportArtifacts);
modeler.on("import.done", exportArtifacts);

downloadPDFLink.addEventListener("click", async () => {
  //save SVG as image then import into pdf doc
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const svg = new Blob([parsed], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svg);

  let img = new Image();
  let img01 = new Image();

  img.addEventListener("load", (e) => {
    URL.revokeObjectURL(e.target.src);
    canvas.width = e.target.width;
    canvas.height = e.target.height;
    ctx.drawImage(e.target, 0, 0);
    img01.src = canvas.toDataURL("image/png");
    if (img01.src === "data:,")
      return console.error(
        "Please provide a non-empty board in order to save as PDF"
      );
    generatePDF(img01, canvas.width, canvas.height);
  });
  img.src = url;
});

openNew.addEventListener("click", function () {
  openBoard(emptyBoardXML);
});

openExistingBoard.addEventListener("click", function () {
  // clear input so that previously selected file can be reopened
  fileInput.value = "";
  fileInput.click();
});

openBoard(emptyBoardXML);

// helpers //////////////////////

function debounce(fn, timeout) {
  let timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}
