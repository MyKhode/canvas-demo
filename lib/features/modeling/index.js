import BehaviorModule from "./behavior";
import RulesModule from "../rules";
import DiOrderingModule from "../di-ordering";
import OrderingModule from "../ordering";

import CommandModule from "diagram-js/lib/command";
import TooltipsModule from "diagram-js/lib/features/tooltips";
import LabelSupportModule from "diagram-js/lib/features/label-support";
import AttachSupportModule from "diagram-js/lib/features/attach-support";
import SelectionModule from "diagram-js/lib/features/selection";
import ChangeSupportModule from "diagram-js/lib/features/change-support";
import SpaceToolModule from "diagram-js/lib/features/space-tool";

import DEMOFactory from "./DEMOFactory";
import DEMOUpdater from "./DEMOUpdater";
import ElementFactory from "./ElementFactory";
import Modeling from "./Modeling";
import DEMOLayouter from "./DEMOLayouter";
import CroppingConnectionDocking from "diagram-js/lib/layout/CroppingConnectionDocking";

export default {
  __init__: ["modeling", "demoUpdater"],
  __depends__: [
    BehaviorModule,
    RulesModule,
    DiOrderingModule,
    OrderingModule,
    CommandModule,
    TooltipsModule,
    LabelSupportModule,
    AttachSupportModule,
    SelectionModule,
    ChangeSupportModule,
    SpaceToolModule,
  ],
  demoFactory: ["type", DEMOFactory],
  demoUpdater: ["type", DEMOUpdater],
  elementFactory: ["type", ElementFactory],
  modeling: ["type", Modeling],
  layouter: ["type", DEMOLayouter],
  connectionDocking: ["type", CroppingConnectionDocking],
};
