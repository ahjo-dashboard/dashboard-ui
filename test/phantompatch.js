// This version on PhantomJS doesn't support bind so have to shim it.
// https://github.com/ariya/phantomjs/issues/10522
// This may be removed in the future when PhantomJs is fixed.
'use strict';
Function.prototype.bind = Function.prototype.bind || function (thisp) {
  var fn = this;
  return function () {
    return fn.apply(thisp, arguments);
  };
};
