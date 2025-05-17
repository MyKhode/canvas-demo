import { assign } from "min-dash";

const ACTOR_ASSIGNMENTS = [
  {
    label: "Default",
    assignment: "Default",
  },
  {
    label: "Unclear",
    assignment: "Unclear",
  },
  {
    label: "Overlapping",
    assignment: "Overlapping",
  },
  {
    label: "No Responsibility",
    assignment: "No Responsibility",
  },
  {
    label: "No Mandate",
    assignment: "No Mandate",
  },
  {
    label: "No Competence",
    assignment: "No Competence",
  },
  {
    label: "More Than One",
    assignment: "More Than One",
  },
  {
    label: "Missing",
    assignment: "Missing",
  },
];

export default function ActorPopupProvider(
  config,
  popupMenu,
  modeling,
  translate,
  create,
  demoFactory,
  elementFactory
) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;
  this._create = create;
  this._demoFactory = demoFactory;
  this._elementFactory = elementFactory;

  this._actorAssignments =
    (config && config.actorAssignments) || ACTOR_ASSIGNMENTS;

  this._popupMenu.registerProvider("actor-assignment-picker", this);
}

ActorPopupProvider.$inject = [
  "config.actorPicker",
  "popupMenu",
  "modeling",
  "translate",
  "create",
  "demoFactory",
  "elementFactory",
];

ActorPopupProvider.prototype.getEntries = function (elements) {
  var self = this,
    elementFactory = this._elementFactory,
    demoFactory = this._demoFactory,
    popupMenu = this._popupMenu,
    create = this._create;

  let actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="62" height="62" stroke="black" stroke-width="2"/>
<path d="M13.5068 27.7701H12L16.358 16H17.8416L22.1997 27.7701H20.6929L17.1462 17.8621H17.0535L13.5068 27.7701ZM14.0631 23.1724H20.1365V24.4368H14.0631V23.1724Z" fill="black"/>
<path d="M27.4791 27.954C26.6446 27.954 25.926 27.7586 25.3233 27.3678C24.7206 26.977 24.257 26.4387 23.9324 25.7529C23.6079 25.0671 23.4456 24.2835 23.4456 23.4023C23.4456 22.5057 23.6118 21.7146 23.944 21.0287C24.2802 20.3391 24.7476 19.8008 25.3465 19.4138C25.9492 19.023 26.6523 18.8276 27.456 18.8276C28.0818 18.8276 28.6459 18.9425 29.1482 19.1724C29.6504 19.4023 30.0619 19.7241 30.3826 20.1379C30.7032 20.5517 30.9022 21.0345 30.9795 21.5862H29.6118C29.5075 21.1839 29.2757 20.8276 28.9164 20.5172C28.5609 20.2031 28.0818 20.046 27.4791 20.046C26.946 20.046 26.4785 20.1839 26.0767 20.4598C25.6787 20.7318 25.3677 21.1169 25.1436 21.6149C24.9234 22.1092 24.8133 22.6897 24.8133 23.3563C24.8133 24.0383 24.9215 24.6322 25.1378 25.1379C25.3581 25.6437 25.6671 26.0364 26.0651 26.3161C26.4669 26.5958 26.9382 26.7356 27.4791 26.7356C27.8346 26.7356 28.1572 26.6743 28.4469 26.5517C28.7367 26.4291 28.982 26.2529 29.1829 26.023C29.3838 25.7931 29.5268 25.5172 29.6118 25.1954H30.9795C30.9022 25.7165 30.711 26.1858 30.4057 26.6034C30.1044 27.0172 29.7045 27.3467 29.2061 27.592C28.7116 27.8333 28.1359 27.954 27.4791 27.954Z" fill="black"/>
<path d="M36.8501 18.9425V20.092H32.237V18.9425H36.8501ZM33.5815 16.8276H34.9492V25.2414C34.9492 25.6245 35.0052 25.9119 35.1173 26.1034C35.2332 26.2912 35.38 26.4176 35.5577 26.4828C35.7393 26.5441 35.9305 26.5747 36.1315 26.5747C36.2821 26.5747 36.4058 26.5671 36.5023 26.5517C36.5989 26.5326 36.6762 26.5172 36.7342 26.5057L37.0123 27.7241C36.9196 27.7586 36.7902 27.7931 36.6241 27.8276C36.4579 27.8659 36.2474 27.8851 35.9924 27.8851C35.606 27.8851 35.2274 27.8027 34.8565 27.6379C34.4895 27.4732 34.1842 27.2222 33.9408 26.8851C33.7013 26.5479 33.5815 26.1226 33.5815 25.6092V16.8276Z" fill="black"/>
<path d="M42.428 27.954C41.6244 27.954 40.9193 27.7644 40.3127 27.3851C39.71 27.0057 39.2387 26.4751 38.8987 25.7931C38.5626 25.1111 38.3945 24.3142 38.3945 23.4023C38.3945 22.4828 38.5626 21.6801 38.8987 20.9943C39.2387 20.3084 39.71 19.7759 40.3127 19.3966C40.9193 19.0172 41.6244 18.8276 42.428 18.8276C43.2316 18.8276 43.9348 19.0172 44.5375 19.3966C45.144 19.7759 45.6154 20.3084 45.9515 20.9943C46.2915 21.6801 46.4615 22.4828 46.4615 23.4023C46.4615 24.3142 46.2915 25.1111 45.9515 25.7931C45.6154 26.4751 45.144 27.0057 44.5375 27.3851C43.9348 27.7644 43.2316 27.954 42.428 27.954ZM42.428 26.7356C43.0384 26.7356 43.5407 26.5805 43.9348 26.2701C44.3288 25.9598 44.6205 25.5517 44.8099 25.046C44.9992 24.5402 45.0938 23.9923 45.0938 23.4023C45.0938 22.8123 44.9992 22.2625 44.8099 21.7529C44.6205 21.2433 44.3288 20.8314 43.9348 20.5172C43.5407 20.2031 43.0384 20.046 42.428 20.046C41.8176 20.046 41.3153 20.2031 40.9212 20.5172C40.5272 20.8314 40.2355 21.2433 40.0461 21.7529C39.8568 22.2625 39.7622 22.8123 39.7622 23.4023C39.7622 23.9923 39.8568 24.5402 40.0461 25.046C40.2355 25.5517 40.5272 25.9598 40.9212 26.2701C41.3153 26.5805 41.8176 26.7356 42.428 26.7356Z" fill="black"/>
<path d="M48.5492 27.7701V18.9425H49.8706V20.2759H49.9633C50.1256 19.8391 50.4192 19.4847 50.8442 19.2126C51.2691 18.9406 51.7482 18.8046 52.2814 18.8046C52.3818 18.8046 52.5074 18.8065 52.6581 18.8103C52.8088 18.8142 52.9227 18.8199 53 18.8276V20.2069C52.9536 20.1954 52.8474 20.1782 52.6813 20.1552C52.519 20.1284 52.3471 20.1149 52.1655 20.1149C51.7328 20.1149 51.3464 20.205 51.0064 20.3851C50.6703 20.5613 50.4037 20.8065 50.2067 21.1207C50.0135 21.431 49.9169 21.7854 49.9169 22.1839V27.7701H48.5492Z" fill="black"/>
<path d="M28.8859 48H27.3792L31.7372 36.2299H33.2208L37.5788 48H36.0721L32.5254 38.092H32.4326L28.8859 48ZM29.4423 43.4023H35.5157V44.6667H29.4423V43.4023Z" fill="black"/>
</svg>
`;
  var entries = this._actorAssignments.map(function (actor) {
    switch (actor.assignment) {
      case "Unclear":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
<path d="M24.4659 25.8266C24.4624 25.9094 24.4758 25.992 24.5054 26.0693C24.535 26.1467 24.5801 26.2172 24.638 26.2765C24.6958 26.3358 24.7652 26.3826 24.8418 26.4141C24.9184 26.4456 25.0006 26.461 25.0834 26.4596H27.1975C27.5511 26.4596 27.833 26.17 27.8791 25.8189C28.1098 24.1379 29.2629 22.9131 31.318 22.9131C33.0759 22.9131 34.6851 23.792 34.6851 25.9061C34.6851 27.5332 33.7268 28.2815 32.2123 29.4193C30.4878 30.6723 29.1219 32.1355 29.2193 34.5109L29.227 35.067C29.2297 35.2351 29.2984 35.3954 29.4182 35.5134C29.5381 35.6313 29.6995 35.6974 29.8676 35.6974H31.9458C32.1157 35.6974 32.2787 35.6299 32.3988 35.5097C32.5189 35.3896 32.5864 35.2267 32.5864 35.0567V34.7877C32.5864 32.9478 33.286 32.4122 35.1746 30.9798C36.7351 29.7934 38.3623 28.4763 38.3623 25.7113C38.3623 21.8394 35.0926 19.9688 31.5128 19.9688C28.2661 19.9688 24.7093 21.4806 24.4659 25.8266ZM28.4557 40.5943C28.4557 41.9601 29.5448 42.9697 31.0438 42.9697C32.6044 42.9697 33.6781 41.9601 33.6781 40.5943C33.6781 39.1798 32.6018 38.1856 31.0413 38.1856C29.5448 38.1856 28.4557 39.1798 28.4557 40.5943Z" fill="black"/>
</svg>
`;
        break;
      case "Overlapping":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
<rect x="51.5" y="41.5" width="10" height="20" fill="#FF6666" stroke="#990000"/>
<rect x="45.5" y="51.5" width="10" height="10" fill="#FF6666" stroke="#990000"/>
</svg>
`;
        break;
      case "No Responsibility":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
<line x1="21.5" y1="43" x2="21.5" y2="63" stroke="black"/>
<line x1="42.5" y1="42" x2="42.5" y2="62" stroke="black"/>
<line x1="63" y1="42.5" y2="42.5" stroke="black"/>
<rect x="2" y="43" width="19" height="19" fill="#F8CECC"/>
</svg>
`;
        break;
      case "No Mandate":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
<line x1="21.5" y1="43" x2="21.5" y2="63" stroke="black"/>
<line x1="42.5" y1="42" x2="42.5" y2="62" stroke="black"/>
<line x1="63" y1="42.5" y2="42.5" stroke="black"/>
<rect x="22" y="43" width="20" height="19" fill="#F8CECC"/>
</svg>
`;
        break;
      case "No Competence":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
<line x1="21.5" y1="43" x2="21.5" y2="63" stroke="black"/>
<line x1="42.5" y1="42" x2="42.5" y2="62" stroke="black"/>
<line x1="63" y1="42.5" y2="42.5" stroke="black"/>
<rect x="43" y="43" width="19" height="19" fill="#F8CECC"/>
</svg>
`;
        break;
      case "More Than One":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="black" stroke-width="3"/>
<rect x="51.5" y="51.5" width="10" height="10" fill="#FF6666" stroke="#990000"/>
<rect x="32.5" y="51.5" width="10" height="10" fill="#FF6666" stroke="#990000"/>
<rect x="13.5" y="51.5" width="10" height="10" fill="#FF6666" stroke="#990000"/>
</svg>
`;
        break;
      case "Missing":
        actorIconHtml = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="61" height="61" stroke="#FF6666" stroke-width="3" stroke-dasharray="6 6"/>
</svg>
`;
        break;
      default:
        break;
    }
    return {
      label: self._translate(actor.label),
      id: actor.label.toLowerCase() + "-actor-assignment",
      imageHtml: actorIconHtml,
      action: createAction("demo:Actor", actor.assignment),
    };
  });

  return entries;

  function createAction(type, assignment) {
    function createListener(event) {
      const businessObject = demoFactory.create(type);
      businessObject.assignment = assignment;
      var shape = elementFactory.createShape(assign({ type, businessObject }));
      create.start(event, shape);
      popupMenu.close();
    }

    return {
      dragstart: createListener,
      click: createListener,
    };
  }
};
