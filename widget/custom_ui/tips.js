/**
 * @fileOverview tips
 * @author 
 * @date
 * @version
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery', 'require', 'widget/mask/mask', 'scripts/core/base', 'css!/static/dist/v2.2/hlxyui/tips.css'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    window.hl_ui = factory(jQuery);
  }
}(function ($, require) {
  var hl_ui = {}, dialogMask, core;
  if (require) {
    dialogMask = require('widget/mask/mask');
    dialogMask.setOption({opacity: 30});
    core = require('scripts/core/base');
  }else{
    dialogMask=window.hlxy_make;
    core =window.hlxy_base;
  }
  var dialogMaskFn = {
    show: function () {
      dialogMask.show();
    },
    hide: function () {
      dialogMask.hide();
    }
  }

  //弹出框插件未实现通用
  !function () {
    var tips = function (opts) {
      var defopts = {
        time: 2000,
        ismask: true,
        anim: 'hlui-anim'
      }
      this.opts = $.extend(defopts, opts);
      this.url = this.opts.url ? this.opts.url : '';
      this.$hlui;
      this.$hlui_tips;
      this.$hluimask;
      this.load = this.opts.load ? this.opts.load : null;
      this.content = this.opts.content ? this.opts.content : '';
      this.width;
      this.height;
      this.isshow;
      this.ishide;
      
    }
    tips.prototype = {
      constructor: tips,
      init: function () {
        var _s = this;
        /*创建容器*/
        this.$hluimask = $('<div style="position: fixed;width: 100%;height: 100%;top: 0px;left: 0px;opacity:0; filter: alpha(opacity=100);z-index: 128887;"></div>').appendTo($(document.body));
        this.$hlui = $('<div class="hl-ui hlui-tip" style="display: none;"></div>').appendTo($(document.body));
        this.$hlui_tips = $('<div class="hlui-tip-body ' + this.opts.className + '"></div>').appendTo(this.$hlui);
        if (this.content) {
          _s.setcontent(this.content);
        }
        // else if (this.url) {//ajax直接获取html
        //   this.ajax();
        // }
        // else if (this.ajaxdata) {//ajax获取json,需要回调
        //   this.ajaxdata.call(this, function (html) {
        //     _s.$hlui_tips.html(html);
        //     this.show();
        //     this.load && this.load.call(this);
        //   });
        // }
        return this;
      },
      setcontent: function (content) {
        this.$hlui_tips.html(content);
        this.setAuto();
        this.load && this.load.call(this);
      },
      ajax: function () {
        var _s = this;
        if (this.url) {
          $.ajax({
            url: _s.url,
            dataType: 'html',
            cache: false,
            error: function () {
              console && console.log('服务器500...');
            }
          }).done(function (html) {
            _s.$hlui_tips.html(html);
            _s.load && _s.load.call(_s);
            // console && console.log('内容返回正确！');
          });
        }
      },
      event: function () {
        var _self = this;
        _self.$hlui.on('click.hluiTips', function (event) {
          event.stopPropagation();
        });
        _self.$hluimask.one('click.hluiTips', function () {
          _self.hide();
        });
      },
      show: function () {
        var _self = this;
        _self.ishide = null;
        this.$hlui.addClass(this.opts.anim).show();
        this.opts.ismask && dialogMaskFn.show();
        this.opts.time && (this.opts.autohidefn = setTimeout(function () {
          _self.hide();
        }, this.opts.time));
        this.event();
      },
      hide: function () {
        var _self = this;
        if (!this.$hlui)return;
        this.$hlui.removeClass(this.opts.anim).addClass('hlui-tip-close');
        var animationEnd = function () {
          if (_self.ishide) {
            return;
          }
          core.WN.vendorPrefix && core.WN.removeAnimEvent(_self.$hlui[0], animationEnd);
          _self.$hlui.hide().off().remove();
          _self.$hluimask.remove();
          _self.opts.ismask && dialogMaskFn.hide();
          _self.$hlui = null;
          _self.ishide = true;
          _self.opts.callback && _self.opts.callback();
        }
        if (core.WN.vendorPrefix) {
          core.WN.addAnimEvent(this.$hlui[0], animationEnd);
        } else {
          setTimeout(animationEnd, 200);
        }
      },
      setAuto: function () {
        /*创建容器*/
        var _s = this;
        var bodyheight = $(window).height();
        var bodywidth = $(window).width();
        _s.height = _s.$hlui.height();
        _s.width = _s.$hlui.width();
        _s.$hlui.css({
          top: Math.floor((bodyheight / 2) - (_s.height / 2)),
          left: Math.floor((bodywidth / 2) - (_s.width / 2))
        });
      },
      setOpts: function () {

      },
      ok: function (opts) {
        this.opts.className = 'ok';
        this.init();
        this.show();
      },
      error: function (opts) {
        this.opts.className = 'error';
        // this.opts.time=0;
        this.opts.anim = 'hlui-anim-06';
        this.init();
        this.show();
      },
      warning: function (opts) {
        this.opts.className = 'warning';
        // this.opts.time=0;
        this.opts.anim = 'hlui-anim-06';
        this.init();
        this.show();
      }
    }

    var mytips = {
      ok: function (opts) {
        return new tips(opts).ok();
      },
      error: function (opts) {
        return new tips(opts).error();
      },
      warning: function (opts) {
        return new tips(opts).warning();
      }
    }
    hl_ui.tips = mytips;
  }();
  return hl_ui;
}));