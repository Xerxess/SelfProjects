
/**
 * @fileOverview jquery 编写兼容 require
 * @author 
 * @date 
 * @version
 */
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery", "require", "scripts/core/base"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("jquery"));
  } else {
    window.hlxy_make = factory(jQuery);
  }
}(function ($, require) {
  var common = window.hlxy_base || (require && require('scripts/core/base'));
  var iscreatestyle;
  var makecount = 0;
  var $make
  var opts = {
    zIndex: 999,
    opacity: 30
  };
  var createmake = function () {
    //  if (!iscreatestyle) {
    // iscreatestyle = true;
    //common.createstyle('.page-make-widget{ display: none; position: fixed; top: 0; left: 0; z-index: ' + opts.zIndex + '; width: 100%; height: 100%; background: #000; opacity:' + opts.opacity / 100 + '; filter: alpha(opacity=' + opts.opacity + '); }');
    // }
    return $('<div class="page-make-widget" style="display: none; position: fixed; top: 0; left: 0; z-index: ' + opts.zIndex + '; width: 100%; height: 100%; background: #000; opacity:' + opts.opacity / 100 + '; filter: alpha(opacity=' + opts.opacity + ');"></div>').appendTo($(document.body));
  }
  var makeshow = function () {
    //console.log(makecount);
    $make || ($make = createmake());
    if (makecount <= 0) {
      makecount = 0;
      $make.fadeIn(0);
    }
    makecount++;
  }
  var makehide = function () {
    makecount--;
    if (makecount <= 0 && $make) {
      $make.fadeOut(function () {
        $make.remove();
        $make = null;
      });
    }
  }
  return {
    setOption: function (optss) {
      opts = $.extend({}, opts, optss);
    },
    show: makeshow,
    hide: makehide
  };
}));