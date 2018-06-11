/**
 * placeholder模拟
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", 'scripts/plug/jq/jquery.input'], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
}(function ($) {
    var inputType = ['text', 'password'];
    var isInputSupported = 'placeholder' in document.createElement('input');
    if (isInputSupported) {
        $.fn.hl_placeholder = function () {
        }
        return false;
    }
    //通过钩子函数执行placeholder
    $.each(["input", "textarea"], function () {
        $.valHooks[this] = {
            set: function (elem, value) {
                var $elem = $(elem);
                if (value && $elem.data('placeholderopts')) {
                    $elem.trigger('hl_placeholder');
                }
            }
        };
    });
    $.fn.hl_placeholder = function (opt) {
        var _arguments = arguments;
        /**
         * 创建placeholder-span
         */
        var creatPlaceholderSpan = function ($wrap) {
            var $inputList = $wrap.find('.placeholder-control');
            var isload;
            if (!$inputList.length) {
                $inputList = $wrap.find('input,textarea');
            }
            if (!$inputList.length) {
                return;
            }
            //记录type=password
            var $passwords = $inputList.filter('[type="password"]');
            $wrap.data('passwords', $passwords);
            $wrap.data('inputList', $inputList);
            $inputList.each(function () {
                var $self = $(this),
                    isinput = false,
                    clearchange = false,
                    placeholderopts = {};

                //过滤掉会输入框的元素
                if ($self[0].nodeName.toLowerCase() !== 'textarea') {
                    $.each(inputType, function (i, item) {
                        if ($self.attr('type').toLowerCase() == item) {
                            isinput = true;
                            return false;
                        }
                    });
                    if (!isinput) {
                        return;
                    }
                }


                var placeholderstr = $self.attr('placeholder') ? $self.attr('placeholder') : '';
                var $placeholder = $('<label class="placeholder-label">' + placeholderstr + '</label>');
                var $placeholder_wrap = $self.parent('div').addClass('placeholder-textarea-wrap');
                $placeholder_wrap.css({
                    'position': 'relative',
                    'zoom': 1
                });
                // console.log($self.offset().left - $placeholder_wrap.offset().left);
                // console.log($self.offset().top - $placeholder_wrap.offset().top);
                // console.log(parseInt($self.css('border-left-width')));
                // console.log(parseInt($self.css('border-top-width')));

                var selfStyles = {
                    borderLeftSize: parseInt($self.css('border-left-width')),
                    borderTopSize: parseInt($self.css('border-top-width')),
                    width: $self.width(),
                    ptop: +$self.css('paddingTop').replace('px', '') + (+$placeholder_wrap.css('paddingTop').replace('px', '')),
                    pleft: +$self.css('paddingLeft').replace('px', '') + (+$placeholder_wrap.css('paddingLeft').replace('px', '')),
                    mtop: +$self.css('marginTop').replace('px', ''),
                    mleft: +$self.css('marginLeft').replace('px', ''),
                    zIndex: +$self.css('zIndex').replace('px', ''),
                    fontSize: $self.css('fontSize'),
                    offsetLeft: $self.offset().left - $placeholder_wrap.offset().left,
                    offsetTop: $self.offset().top - $placeholder_wrap.offset().top,
                    lineHeight: $self.css('lineHeight').indexOf('px') > 0 ? $self.css('lineHeight').replace('px', '') : null
                };
                $placeholder.css({
                    position: 'absolute',
                    color: '#ccc',
                    cursor: 'text'
                });
                //console.log(selfStyles);
                var borderTopSize=selfStyles.borderTopSize;
                var borderLeftSize=selfStyles.borderTopSize;
                borderTopSize=/\d+/.test(borderTopSize)?borderTopSize:0;
                borderLeftSize=/\d+/.test(borderLeftSize)?borderLeftSize:0;
                $placeholder.css({
                    width: selfStyles.width,
                    // top: selfStyles.ptop + selfStyles.mtop + selfStyles.borderSize+selfStyles.offsetTop,
                    // left: selfStyles.pleft + selfStyles.mleft + selfStyles.borderSize+selfStyles.offsetLeft,
                    top: selfStyles.ptop + borderTopSize + selfStyles.offsetTop,
                    left: selfStyles.pleft + borderLeftSize + selfStyles.offsetLeft,
                    zIndex: selfStyles.zIndex + 10,
                    letterSpacing: 'normal',
                    fontSize: selfStyles.fontSize
                });
                if (selfStyles.lineHeight) {
                    $placeholder.css({
                        lineHeight: selfStyles.lineHeight + 'px',
                        height: selfStyles.lineHeight + 'px'
                    });
                }
                if ($self.val()) {
                    $placeholder.hide();
                }
                $self.after($placeholder);
                placeholderopts['placeholderspan'] = $placeholder;
                if (!isload) {//执行一次
                    isload = true;
                    //浏览器自动完成，采用input事件处理placeholder
                    if ($passwords.length) {
                        $passwords.each(function () {
                            var $passitem = $(this);
                            var $userinput = [];
                            $inputList.each(function (i) {
                                if ($(this)[0] == $passitem[0]) {
                                    if (i > 0) {
                                        $userinput = $inputList.eq(i - 1);
                                    }
                                    return false;
                                }
                            });
                            if ($userinput.length) {
                                $userinput.on('input.placeholder', function () {
                                    if (clearchange) {
                                        clearTimeout(clearchange);
                                    }
                                    clearchange = setTimeout(function () {
                                        $passitem.trigger('auto.placeholder');
                                        $userinput.trigger('auto.placeholder');
                                    }, 10);
                                });
                            }
                        });
                    }
                }
                $placeholder.on('mousedown.placeholder', function () {
                    setTimeout(function () {
                        $self.focus();
                    }, 0);
                });
                $self.on('auto.placeholder', function () {
                    var $this = $(this);
                    setTimeout(function () {
                        // console.log($this.attr('type'));
                        if ($this.val()) {
                            $placeholder.hide();
                        }
                    }, 0);
                });

                $self.on('blur.placeholder', function () {
                    var $this = $(this);
                    //防止先触发blur再val
                    setTimeout(function () {
                        if ($this.val()) {
                            $placeholder.hide();
                        }
                        //处理浏览器加住密码导致的问题
                        if ($passwords.length) {
                            $passwords.trigger('auto.placeholder');
                        }
                    }, 100);

                });
                $self.on('keydown.placeholder', function () {
                    if ($(this).val()) {
                        $placeholder.hide();
                    }
                });
                $self.on('keyup.placeholder', function () {
                    if (!$self.val()) {
                        $placeholder.show();
                    }
                    else {
                        $placeholder.hide();
                    }
                });
                $self.on('hl_placeholder.show', function () {
                    $placeholder.show();
                });
                $self.on('hl_placeholder.hide', function () {
                    $placeholder.hide();
                });
                $self.on('hl_placeholder.reset', function () {
                    $self.trigger('keyup.placeholder');
                });
                $self.data('placeholderopts', placeholderopts);
            });
        }

        return this.each(function () {
            var $self = $(this);
            if (_arguments) {
                if ($.type(_arguments[0]) === 'string') {
                    switch (opt) {
                        case 'set':
                            var placeholderopts = $self.data('placeholderopts');
                            if (placeholderopts) {
                                $self.attr('placeholder', _arguments[1]);
                                placeholderopts.placeholderspan.text(_arguments[1]);
                            }
                            break;
                        case 'reset':
                            var $inputList = $self.data('inputList');
                            if ($inputList && $inputList.length) {
                                $inputList.each(function () {
                                    $(this).trigger('hl_placeholder.reset');
                                });
                            }
                            break;
                    }
                    return;
                }
            }
            creatPlaceholderSpan($(this));
        });
    }
}));