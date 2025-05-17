import { assign } from "min-dash";

import DEMOModdle from "./demo-moddle.js";

import DEMODescriptors from "../resources/demo.json" assert { type: "json" };
import DEMODiDescriptors from "../resources/demoDi.json" assert { type: "json" };
import DcDescriptors from "../resources/dc.json" assert { type: "json" };
import BiocPackage from "../resources/bioc.json" assert { type: "json" };

const packages = {
  demo: DEMODescriptors,
  demoDi: DEMODiDescriptors,
  dc: DcDescriptors,
  bioc: BiocPackage,
};

export default function (additionalPackages, options) {
  const pks = assign({}, packages, additionalPackages);

  return new DEMOModdle(pks, options);
}
