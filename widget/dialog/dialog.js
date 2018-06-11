/**
 * @fileOverview 文件描述
 * @author 
 * @date
 * @version
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'require', 'css!widget/dialog2/dialogs', 'widget/mask/mask', 'scripts/plug/jq/jquery.mousewheel'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        window.hl_dialog = factory(jQuery);
    }
}(function ($, require) {
    var hl_dialog = {}, dialogMask;
    if (require) {
        dialogMask = require('widget/mask/mask');
        dialogMask.setOption({opacity: 30});
    } else {
        dialogMask = window.custom_make;
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
        var dialog = function (opts) {
            var opts = $.extend({}, {width: 1000}, opts);
            this.url = opts.url ? opts.url : '';
            this.JQ_Wrap;
            this.JQ_WrapTitle;
            this.JQ_Close;
            this.JQ_Body;
            this.JQ_Loading;
            this.title = opts.title ? opts.title : '';
            this.state = false;
            this.closeCall = opts.closeCall ? opts.closeCall : null;
            this.callBack = opts.callBack ? opts.callBack : null;
            this.load = opts.load ? opts.load : null;
            this.content = opts.content ? opts.content : '';
            this.width = opts.width ? opts.width : 1000;
            this.height = opts.height ? opts.height : 650;
            this.overflow = !opts.overflow ? opts.overflow : true;
            this.loadingState = false;
            this.domLoading;
            this.ajaxdata = opts.ajaxdata ? opts.ajaxdata : null;
            this.isshow;
            this.opts = opts;
            this.marginTop = 0;
            this.hide_head = opts.hide_head ? opts.hide_head : false;
            this.drag = opts.drag ? true : false;
            this.className = opts.className ? opts.className : '';
            this.actualrange = {
                w: 0,
                h: 0
            };
            this.clearmoveIng;
            this.move = {
                x: 0,
                y: 0
            };
            this.position = {
                x: 0,
                y: 0
            }
        }
        dialog.prototype = {
            constructor: dialog,
            init: function () {
                var _s = this;
                var ish, isw;
                var _scrollTop = 0;
                var radices = 30;
                _s.getActualRange();

                /*创建容器*/
                var box = {
                    w: _s.width,
                    h: _s.height != 'auto' ? (_s.height + 51) : 'auto'
                }
                var _top = ($(document).scrollTop() + $(window).height() / 2) + ( box.h / 2);
                var _left = (_s.actualrange.w / 2) + ( box.w / 2);
                _top = isNaN(_top) ? '0' : _top;
                this.JQ_Wrap = $('<div class="zx-dialog2 ' + this.className + '" style="display: none; ">').appendTo($(document.body)).css({
                    width: box.w,
                    height: box.h,
                    top: _top <= 0 ? 0 : _top,
                    left: _left <= 0 ? 0 : _left
                });

                this.JQ_WrapTitle = $('<div class="zx-dialog-header" ><span class="dialog-title">' + _s.title + '</span><div class="dialog-opts"><a class="close" href="javascript://">关闭</a></div></div>').appendTo(this.JQ_Wrap);
                if (this.hide_head) {
                    this.JQ_WrapTitle.hide();
                }
                this.JQ_Close = this.JQ_WrapTitle.find('a.close');
                this.JQ_Body = $('<div class="zx-dialog-body"></div>').appendTo(this.JQ_Wrap).css({
                    height: (_s.height)
                });
                if (_s.overflow === false) {
                    this.JQ_Body.css('overflow', 'visible');
                }
                var bodyHeight = this.JQ_Body.outerHeight(true);
                var bodyInnerHeight = this.JQ_Body.innerHeight();
                var src = this.JQ_Body[0].scrollHeight;
                if ($.fn.mousewheel) {
                    // this.JQ_Body.mousewheel(function (events, delta, deltaX, deltaY) {
                    //     var scrollHeight = _s.JQ_Body[0].scrollHeight;
                    //     if (delta < 0) {
                    //         _scrollTop += Math.abs(delta) * radices;
                    //     }
                    //     else {
                    //         _scrollTop += -Math.abs(delta) * radices;
                    //     }
                    //     if (_scrollTop == 0) {
                    //         return false;
                    //     }
                    //     if (_scrollTop <= 0) {
                    //         _scrollTop = 0;
                    //     }
                    //     if (_scrollTop == scrollHeight - bodyHeight) {
                    //         return false;
                    //     }
                    //     if (_scrollTop > scrollHeight - bodyHeight) {
                    //         _scrollTop = scrollHeight - bodyHeight;
                    //         _s.JQ_Body.scrollTop(_scrollTop);
                    //         return false;
                    //     }
                    //     _s.JQ_Body.scrollTop(_scrollTop);
                    //     return false;
                    // });
                }
                if (_s.drag) {
                    this.JQ_WrapTitle.on('mousedown.drag', function (event) {
                        var _target = event.target || event.srcElement, _type = true, _tar_arr = null;
                        //记录鼠标点击时的位置，用于判断移动方向
                        _s.move.x = event.clientX;
                        _s.move.y = event.clientY;
                        _s.position.x = _s.JQ_Wrap.position().left;
                        _s.position.y = _s.JQ_Wrap.position().top;
                        document.onselectstart = function () {
                            return false;
                        };
                        document.onmousemove = function (event) {
                            event = event || window.event;
                            _s.moveIng.call(_s, event.clientX, event.clientY);
                        };
                        document.onmouseup = function (e) {
                            document.onselectstart = function () {
                                return true;
                            };
                            this.onmousemove = null;
                            this.onmouseup = null;
                        };
                    });
                }
                this.JQ_Loading = this.JQ_Body.find('.dialog-loading');
                this.event();
                if (this.content) {
                    if ($.type(this.content) == 'string') {
                        _s.JQ_Body.html($(this.content));
                    }
                    else {
                        _s.JQ_Body.html(this.content);
                        /*jquery对象处理*/
                    }
                    this.load && this.load.call(this);
                }
                else if (this.url) {//ajax直接获取html
                    this.ajax();
                }
                else if (this.ajaxdata) {//ajax获取json,需要回调
                    this.ajaxdata.call(this, function (html) {
                        //console.log(this);
                        _s.JQ_Body.html(html);
                        this.show();
                        this.load && this.load.call(this);
                    });
                }
                return this;
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
                        _s.JQ_Body.html(html);
                        _s.load && _s.load.call(_s);
                        console && console.log('内容返回正确！');
                    });
                }
            },
            event: function () {
                var _self = this;
                _self.JQ_Close.on('click', function () {
                    _self.hide();
                    _self.closeCall && _self.closeCall.call(_self);
                });
            },
            show: function () {
                var _self = this;
                if (this.isshow) {
                    return;
                }
                this.isshow = true;
                //添加动画效果
                if (this.opts.animation) {
                    var _top = ($(document).scrollTop() + $(window).height() / 2) - ( this.height / 2);
                    _top = _top < 0 ? 0 : _top;
                    var _start = this.opts.animmove = _top - (this.height / 2);
                    this.JQ_Wrap.css({
                        'display': 'block',
                        'top': _start,
                        'opacity': 0
                    });
                    this.JQ_Wrap.animate({
                        top: _top,
                        opacity: 1
                    }, 500, 'swing');
                } else {
                    this.JQ_Wrap.show();
                }
                dialogMaskFn.show();
            },
            animhide: function (callback) {
                var _self = this;
                if (this.opts.animation) {
                    this.JQ_Wrap.animate({
                        top: this.opts.animmove,
                        opacity: 0
                    }, 300, 'swing', function () {
                        callback.call(_self);
                    });
                }
                else {
                    callback.call(_self);
                }
            },
            hide: function () {
                if (this.opts.isoutempty) {
                    this.empty();
                    return;
                }
                var _self = this;
                if (!this.isshow) {
                    return;
                }
                this.isshow = false;
                this.animhide(function () {
                    this.JQ_Wrap.hide();
                    dialogMaskFn.hide();
                });
            },
            setTitle: function (tit) {
                this.JQ_WrapTitle.find('span.dialog-title').text(tit);
            },
            setContent: function (content) {
                this.JQ_Body.html(content);
            },
            loading: function () {//显示加载状态
                if (!this.loadingState) {
                    if (!this.domLoading) {
                        this.domLoading = $('<div class="loading" style="position:absolute;top:0;left: 0;z-index: 10; width: 100%;height: 100%; background: url(/static/images/v2.2/loading-s.gif) no-repeat center;"></div>');
                        this.JQ_Body.append(this.domLoading);
                    }
                    this.domLoading.show();
                    this.loadingState = true;
                }
                else {
                    this.domLoading.hide();
                    this.loadingState = false;
                }
            },
            set: function (content) {
                this.JQ_Body.html(content);
                this.setAuto();
            },
            empty: function () {
                this.animhide(function () {
                    this.JQ_Wrap.hide();
                    this.JQ_Wrap.remove();
                    this.JQ_Wrap = null;
                    dialogMaskFn.hide();
                });
            },
            setAuto: function () {
                /*创建容器*/
                var _s = this;
                _s.getActualRange();
                _s.height = _s.JQ_Wrap.height();

                _s.width = _s.JQ_Wrap.width() - 2;

                // console.log(_s.JQ_Wrap.height());
                var box = {
                    w: _s.width,
                    h: _s.height
                }
                var _top = ($(document).scrollTop() + $(window).height() / 2) - ( box.h / 2);
                var _left = (_s.actualrange.w / 2) - ( box.w / 2);
                _s.JQ_Wrap.css({
                    width: box.w,
                    height: box.h,
                    top: _top <= 0 ? 0 : _top,
                    left: _left <= 0 ? 0 : _left,
                });
            },
            callBackGo: function () {
                this.callback && this.callback.call(this);
            },
            getActualRange: function () {
                this.actualrange.w = $(window).width() < $(document).width() ? $(document).width() : $(window).width();
                this.actualrange.h = $(window).height() < $(document).height() ? $(document).height() : $(window).height();
            },
            moveIng: function (x, y) {
                var _s = this;
                var newcss = {
                    left: _s.position.x + (x - _s.move.x),
                    top: _s.position.y + (y - _s.move.y)
                };
                //边界逻辑处理
                if (newcss.left < 0) {
                    newcss.left = 0;
                }
                if (newcss.top < 0) {
                    newcss.top = 0;
                }
                if (newcss.left + _s.width + 2 > $(window).width()) {
                    newcss.left = $(window).width() - _s.width - 2;
                }
                if (_s.clearmoveIng)clearTimeout(_s.clearmoveIng);
                _s.clearmoveIng = setTimeout(function () {
                    _s.JQ_Wrap.css(newcss);
                }, 0);

            }
        }
        hl_dialog.dialog = function (opt) {
            return new dialog(opt).init();
        }
    }();

//模拟analog-sys-controls
    !function (w) {
        //创建容器
        var createControls = function () {
            var _wrap = $('<div class="analog-sys-controls"></div>');
            var _content = $('<div class="content"><p class="content-hd top-bottom-50 align"></p></div>').appendTo(_wrap);
            var _foot_opts = $('<div class="foot_opts"><div></div></div>').appendTo(_wrap).find('div');
            return {
                wrap: _wrap,
                content: _content,
                footOpts: _foot_opts
            }
        }

        var alert = function (title, content, callBack, closeCall) {
            var controls = createControls();
            controls.content.find('p').html(content);
            var _selfBtn = $('<button class="ok">确 认</button>');
            controls.footOpts.append(_selfBtn);
            var dialog = hl_dialog.dialog({
                title: title,
                width: 360,
                height: 'auto',
                content: controls.wrap,
                load: function () {
                    this.setAuto();
                    this.show();
                },
                closeCall: function () {
                    dialog.empty();
                    closeCall && closeCall();
                }
            });
            _selfBtn.click(function () {
                dialog.empty();
                callBack && callBack();

            });
        }

        /**
         * 参数自己可配制 - 方法重构
         * @param obj
         */
        var customAlert = function (opts) {
            var _def = {
                title: '提 示', /*标题*/
                content: '', /*显示内容*/
                callBack: null, /*回调*/
                closeCall: null, /*关闭回调*/
                width: 360,
                height: 'auto',
                btnText: ['确 认']
            }
            var _selfBtn = null;
            var _opts = $.extend({}, _def, opts);

            var controls = createControls();
            controls.content.find('p').html(_opts['content']);
            if (_opts['btnText'] && _opts['btnText'].length > 0 && _opts['btnText'][0]) {
                _selfBtn = $('<button class="ok">' + _opts['btnText'][0] + '</button>');
                controls.footOpts.append(_selfBtnOk)
            }
            var dialog = hl_dialog.dialog({
                title: _opts['title'],
                width: _opts['width'],
                height: _opts['height'],
                content: controls.wrap,
                drag: _opts['drag'],
                load: function () {
                    this.setAuto();
                    this.show();
                },
                closeCall: function () {
                    dialog.empty();
                    _opts.closeCall && _opts.closeCall();
                }
            });
            if (_selfBtn) {
                _selfBtn.click(function () {
                    dialog.empty();
                    _opts.callBack && _opts.callBack();
                });
            }
        }

        var confirm = function (title, content, callBack, callCancelBack, load, closeCall) {
            var controls = createControls();
            var data = {};
            if ($.type(content) === 'string') {
                content = $(content);
            }
            controls.content.html(content);
            var _selfBtnOk = $('<button class="ok">确 认</button>');
            var _selfBtnCancel = $('<button class="cancel">取 消</button>')
            controls.footOpts.append(_selfBtnOk).append(_selfBtnCancel);
            var dialog = hl_dialog.dialog({
                title: title,
                width: 420,
                height: 'auto',
                content: controls.wrap,
                load: function () {
                    load && load(content, data);
                    this.setAuto();
                    this.show();
                },
                closeCall: function () {
                    dialog.empty();
                    closeCall && closeCall();
                    data = null;
                }
            });
            _selfBtnOk.click(function () {
                if (callBack && callBack(data) === false) {
                    return;
                }
                dialog.empty();
            });
            _selfBtnCancel.click(function () {
                dialog.empty();
                callCancelBack && callCancelBack();
                data = null;
            });
        }

        /**
         * 参数自己可配制 - 方法重构
         * @param obj
         */
        var customConfirm = function (opts) {
            var footheigth = 65;
            var _def = {
                title: '提 示', /*标题*/
                content: '', /*显示内容*/
                callBack: null, /*回调*/
                callCancelBack: null, /*取消回调*/
                load: null, /*加载回调 参数是自己传递的jquery对象*/
                closeCall: null, /*关闭回调*/
                width: 360,
                overflowY: 'auto',
                height: 'auto',
                contentHeight: 0,
                btnText: ['确 认', '取 消']
            }
            var _selfBtnOk = null, _selfBtnCancel = null;
            var _opts = $.extend({}, _def, opts);
            var controls = createControls();
            var data = {};
            if ($.type(_opts['content']) === 'string') {
                _opts['content'] = $(_opts['content']);
            }
            controls.content.html(_opts['content']);
            if (_opts.overflowY == 'auto') {
                if (_opts.contentHeight) {
                    controls.content.height(_opts.contentHeight);
                }
                controls.content.css('overflowY', 'auto');
                // if ($.fn.mousewheel) {
                //     var radices=30;
                //     var _scrollTop = 0;
                //     var bodyHeight = controls.content.outerHeight(true);
                //     controls.content.mousewheel(function (events, delta, deltaX, deltaY) {
                //         var scrollHeight = _s.JQ_Body[0].scrollHeight;
                //         if (delta < 0) {
                //             _scrollTop += Math.abs(delta) * radices;
                //         }
                //         else {
                //             _scrollTop += -Math.abs(delta) * radices;
                //         }
                //         if (_scrollTop == 0) {
                //             return false;
                //         }
                //         if (_scrollTop <= 0) {
                //             _scrollTop = 0;
                //         }
                //         if (_scrollTop == scrollHeight - bodyHeight) {
                //             return false;
                //         }
                //         if (_scrollTop > scrollHeight - bodyHeight) {
                //             _scrollTop = scrollHeight - bodyHeight;
                //             controls.content.scrollTop(_scrollTop);
                //             return false;
                //         }
                //         controls.content.scrollTop(_scrollTop);
                //         return false;
                //     });
                // }
            }
            if (_opts['btnText'] && _opts['btnText'].length > 0 && _opts['btnText'][0]) {
                var _selfBtnOk = $('<button class="ok">' + _opts['btnText'][0] + '</button>');
                controls.footOpts.append(_selfBtnOk)
            }

            if (_opts['btnText'] && _opts['btnText'].length > 1 && _opts['btnText'][1]) {
                var _selfBtnCancel = $('<button class="cancel">' + _opts['btnText'][1] + '</button>');
                controls.footOpts.append(_selfBtnCancel);
            }
            if (!controls.footOpts.find('button').length) {
                controls.footOpts.hide();
            }
            var dialog = hl_dialog.dialog({
                animation: _opts['animation'],
                title: _opts['title'],
                width: _opts['width'],
                height: _opts['height'],
                hide_head: _opts['hide_head'],
                drag: _opts['drag'],
                className:_opts['className'],
                content: controls.wrap,
                load: function () {
                    _opts.load && _opts.load(_opts['content'], data);
                    this.setAuto();
                    this.show();
                },
                closeCall: function () {
                    dialog.empty();
                    _opts.closeCall && _opts.closeCall();
                    data = null;
                }
            });
            if (_selfBtnOk) {
                _selfBtnOk.click(function () {
                    if (_opts.callBack && _opts.callBack(data) === false) {
                        return;
                    }
                    dialog.empty();
                });
            }
            if (_selfBtnCancel) {
                _selfBtnCancel.click(function () {
                    dialog.empty();
                    _opts.callCancelBack && _opts.callCancelBack();
                    data = null;
                });
            }
            return dialog;
        }


        /**
         * 精简版customConfirm
         */
        var customConfirmSimplify = function (opts) {
            var _def = {
                content: '', /*显示内容*/
                callBack: null, /*回调*/
                callCancelBack: null, /*取消回调*/
                load: null, /*加载回调 参数是自己传递的jquery对象*/
                closeCall: null, /*关闭回调*/
                width: 360,
                overflowY: 'auto',
                height: 'auto',
                contentHeight: 0,
                btnText: ['确 认', '取 消']
            }
            var _selfBtnOk = null, _selfBtnCancel = null;
            var _opts = $.extend({}, _def, opts);
            var controls = createControls();
            var data = {};
            if ($.type(_opts['content']) === 'string') {
                _opts['content'] = $(_opts['content']);
            }
            controls.content.html(_opts['content']);

            controls.wrap.addClass('analog-sys-controls-simplify')
            controls.footOpts.removeClass().addClass('foot-opts-simplify');
            if (_opts['btnText'] && _opts['btnText'].length > 1 && _opts['btnText'][1]) {
                var _selfBtnCancel = $('<button class="cancel">' + _opts['btnText'][1] + '</button>');
                controls.footOpts.append(_selfBtnCancel);
            }

            if (_opts['btnText'] && _opts['btnText'].length > 0 && _opts['btnText'][0]) {
                var _selfBtnOk = $('<button class="ok">' + _opts['btnText'][0] + '</button>');
                controls.footOpts.append(_selfBtnOk)
            }

            var dialog = hl_dialog.dialog({
                animation: _opts['animation'],
                width: _opts['width'],
                height: _opts['height'],
                hide_head: true,
                content: controls.wrap,
                load: function () {
                    _opts.load && _opts.load(_opts['content'], data);
                    this.setAuto();
                    this.show();
                },
                closeCall: function () {
                    dialog.empty();
                    _opts.closeCall && _opts.closeCall();
                    data = null;
                }
            });
            if (_selfBtnOk) {
                _selfBtnOk.click(function () {
                    if (_opts.callBack && _opts.callBack(data) === false) {
                        return;
                    }
                    dialog.empty();
                });
            }
            if (_selfBtnCancel) {
                _selfBtnCancel.click(function () {
                    dialog.empty();
                    _opts.callCancelBack && _opts.callCancelBack();
                    data = null;
                });
            }
            return dialog;
        }

        hl_dialog.sysControls = {
            alert: alert,
            confirm: confirm,
            customAlert: customAlert,
            customConfirm: customConfirm,
            customConfirmSimplify: customConfirmSimplify
        }
    }(window);
    return hl_dialog;
}));