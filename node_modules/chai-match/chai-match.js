(function (chaiMatch) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // NodeJS
    module.exports = chaiMatch;
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define(function () {
      return chaiMatch;
    });
  } else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    chai.use(chaiMatch);
  }
})(function (chai, _) {
  var Assertion = chai.Assertion;
  var flag = _.flag;

  Assertion.overwriteMethod('match', function matchOverwriter(_super) {
    return function assertMatch(re, msg) {
      _super.call(this, re, msg);

      var obj = flag(this, 'object');
      var match = re.exec(obj);

      if (match) {
        flag(this, 'matchCaptures', match.slice(1));
      }
    }
  });

  Assertion.addMethod('capture', function getCapture(n) {
    var capture = (flag(this, 'matchCaptures') || [])[n];
    flag(this, 'object', capture);
  });
});
