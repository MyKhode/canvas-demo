import PopupMenuModule from "diagram-js/lib/features/popup-menu";
import StrokeStylePopupProvider from "./StrokeStylePopupProvider";
import SourceMarkerPopupProvider from "./SourceMarkerPopupProvider";
import TargetMarkerPopupProvider from "./TargetMarkerPopupProvider";
import ActorCreatePopupProvider from "./ActorCreatePopupProvider";
import ActorChangePopupProvider from "./ActorChangePopupProvider";
import TransactionCreatePopupProvider from "./TransactionCreatePopupProvider";
import TransactionChangePopupProvider from "./TransactionChangePopupProvider";
import InformationBankCreatePopupProvider from "./InformationBankCreatePopupProvider";
import InformationBankChangePopupProvider from "./InformationBankChangePopupProvider";
import OrganizationCreatePopupProvider from "./OrganizationCreatePopupProvider";
import OrganizationChangePopupProvider from "./OrganizationChangePopupProvider";

export default {
  __depends__: [PopupMenuModule],
  __init__: [
    "strokeStylePopupProvider",
    "sourceMarkerPopupProvider",
    "targetMarkerPopupProvider",
    "actorCreatePopupProvider",
    "actorChangePopupProvider",
    "transactionCreatePopupProvider",
    "transactionChangePopupProvider",
    "informationBankCreatePopupProvider",
    "informationBankChangePopupProvider",
    "organizationCreatePopupProvider",
    "organizationChangePopupProvider",
  ],
  strokeStylePopupProvider: ["type", StrokeStylePopupProvider],
  sourceMarkerPopupProvider: ["type", SourceMarkerPopupProvider],
  targetMarkerPopupProvider: ["type", TargetMarkerPopupProvider],
  actorCreatePopupProvider: ["type", ActorCreatePopupProvider],
  actorChangePopupProvider: ["type", ActorChangePopupProvider],
  transactionCreatePopupProvider: ["type", TransactionCreatePopupProvider],
  transactionChangePopupProvider: ["type", TransactionChangePopupProvider],
  informationBankCreatePopupProvider: [
    "type",
    InformationBankCreatePopupProvider,
  ],
  informationBankChangePopupProvider: [
    "type",
    InformationBankChangePopupProvider,
  ],
  organizationCreatePopupProvider: ["type", OrganizationCreatePopupProvider],
  organizationChangePopupProvider: ["type", OrganizationChangePopupProvider],
};
