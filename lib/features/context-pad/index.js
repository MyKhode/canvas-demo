import DirectEditingModule from "diagram-js-direct-editing";
import ContextPadModule from "./module";
import SelectionModule from "diagram-js/lib/features/selection";
import ConnectModule from "diagram-js/lib/features/connect";
import CreateModule from "diagram-js/lib/features/create";
import PopupMenuModule from "../popup-menu";

import TextRenderer from "../../draw/TextRenderer";

import ContextPadProvider from "./ContextPadProvider";

export default {
  __depends__: [
    DirectEditingModule,
    ContextPadModule,
    SelectionModule,
    ConnectModule,
    CreateModule,
    PopupMenuModule,
    TextRenderer,
  ],
  __init__: ["contextPadProvider"],
  contextPadProvider: ["type", ContextPadProvider],
};
