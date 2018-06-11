/**
 * @fileOverview 文件描述
 * @author
 * @date
 * @version
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", 'require', 'widget/mask/mask', 'css!widget/loading/loading'], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        window.hlxy_loading = factory(jQuery);
    }
}(function ($, require) {
    var make = window.hlxy_make || (require && require('widget/mask/mask'));
    var defopts = {
        zIndex: 999
    };
    var loading = function (opts) {
        opts = $.extend({}, opts);
        this.$parent = opts.$parent ? opts.$parent : $(document.body);
        this.infoText = opts.text ? opts.text : '';
        this.$info;
        this.$loading_make;
        this.$loding_box;
        this.loadingcount = 0;
    }
    /**
     * 检测页是否存在
     */
    loading.prototype.has = function () {
        var self = this;
        //console.log(self.loadingcount);
        if (self.loadingcount > 0) {
            return true;
        }
        return false;
    }
    loading.prototype.addCount = function () {
        this.loadingcount++;
    }
    loading.prototype.delCount = function () {
        this.loadingcount--;
        if (this.loadingcount < 0) {
            this.loadingcount = 0;
        }
    }
    loading.prototype.setopts = function (opts) {
        opts = $.extend({}, opts);
        this.$parent = opts.$parent ? opts.$parent : $(document.body);
        this.infoText = opts.text ? opts.text : '';
    }
    loading.prototype.init = function (opts) {
        var _style = [];
        if (opts && opts.zIndex) {
            _style.push(['z-index', opts.zIndex].join(":"));
        }
        this.$hluimask = $('<div class="loading-mask ' + (opts.className ? opts.className : '') + '-mask" style="position: fixed;width: 100%;height: 100%;top: 0px;left: 0px;opacity:0; filter: alpha(opacity=100);z-index:' + (opts.zIndex - 1) + ';"></div>').appendTo($(document.body));
        this.$loding_box = $('<div class="loading-box ' + (opts.className ? opts.className : '') + '" style="' + _style.join(';') + '"><img src="/static/images/v2.2/loading-g.gif" width="25" height="25"><p class="text-info"></p></div>').appendTo(this.$parent);
        this.$info = this.$loding_box.find('p.text-info').text(opts.infoText);
        $(document.body).addClass('myloading');
    }
    loading.prototype.going = function (opts) {
        if (this.has()) {
            this.addCount();
            return;
        }
        make.show();
        if (!this.$loding_box) {
            opts = $.extend({}, defopts, opts ? opts : {});
            this.init(opts);
        }
    }
    loading.prototype.outing = function () {
        if (this.has()) {
            this.delCount();
            return;
        }
        make.hide();
        this.$loding_box.remove();
        this.$hluimask.remove();
        this.$loding_box = null;
        this.$hluimask = null;
    }
    loading.prototype.nomakegoing = function (opts) {
        if (this.has()) {
            this.addCount();
            return;
        }
        if (!this.$loding_box) {
            opts = $.extend({}, defopts, opts ? opts : {});
            this.init(opts);
        }
    }
    loading.prototype.nomakeouting = function () {
        if (this.has()) {
            this.delCount();
            return;
        }
        this.$loding_box && this.$loding_box.remove();
        this.$hluimask && this.$hluimask.remove();
        $(document.body).removeClass('myloading');
        this.$loding_box = null;
        this.$hluimask = null;
    }
    return new loading();
}));
