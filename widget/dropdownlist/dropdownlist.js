/**
 * @fileOverview 下拉控件插件
 * @author
 * @date
 * @version
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "css!/static/widget/dropdownlist/dropdownlist.css"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
}(function ($) {
    var HL_dropdown_length = [];
    var fieldconfig = ['text', 'value']
    $.fn.extend({
        HL_Dropdownlist: function (opts) {
            var $item = this;
            var select_set = {
                selectWrap: null,
                isListShow: false,
                isListHide: false,
                scrollTop: 0,
                data: []
            };
            if ($.type(opts) !== 'string') {
                HL_dropdown_length.push(this);
            }
            //settings = jQuery.extend({}, select_set, opts);
            /*创建select*/
            function init(select) {
                var settings = jQuery.extend({}, select_set, opts);
                select.data('opts', settings);

                function getText(data) {
                    if (settings.field) {
                        return data[settings.field[0]]
                    }
                    return data[fieldconfig[0]]
                }

                function getValue(data) {
                    if (settings.field) {
                        return data[settings.field[1]]
                    }
                    return data[fieldconfig[1]]
                }

                /*组装dataItem*/
                function assembleData(text, value) {
                    var _data = {};
                    var _conf = fieldconfig;
                    if (settings.field) {
                        _conf = settings.field;
                    }
                    _data[_conf[0]] = text;
                    _data[_conf[1]] = value;
                    return _data;
                }

                /*下拉列表*/
                function selectList(data, span) {
                    //console.log(data);
                    var _selectArry = [], resultHtml = '';
                    var _item = null;
                    if (settings.insertbegin) {
                        for (var i = 0, j = settings.insertbegin.length; i < j; i++) {
                            if (span && i === 0) {
                                _item = settings.insertbegin[i];
                            }
                            _selectArry.push('<li data-val="' + getValue(settings.insertbegin[i]) + '" data-item="insertbegin:' + i + '">' + getText(settings.insertbegin[i]) + '</li>');
                        }
                    }
                    for (var i = 0, j = data.length; i < j; i++) {
                        if (span && i === 0 && !_item) {
                            _item = settings.data[i];
                        }
                        _selectArry.push('<li data-val="' + getValue(data[i]) + '" data-item="data:' + i + '">' + getText(data[i]) + '</li>');
                    }
                    if (_item) {
                        span.text(getText(_item)).attr('data-val', getValue(_item));
                    }
                    if (_selectArry.length) {
                        resultHtml = '<ul class="option-list">' + _selectArry.join('') + '</ul>';
                    }
                    return {
                        curritem: _item,
                        resulthtml: resultHtml
                    }
                }

                //初始/同步selectlist
                function synchdata() {
                    settings.selectlist.show();
                    var item = 0;
                    if (settings.synchtarget && settings.synchtarget.val()) {
                        for (var i = 0, data = settings['data'], j = data.length; i < j; i++) {
                            if (getValue(data[i]) == settings.synchtarget.val() && settings.synchtarget.val() != '') {
                                settings.selectText.find('span').text(getText(data[i])).attr('data-val', getValue(data[i]));
                                item = i;
                                break;
                            }
                        }
                    }
                    else {
                        if (settings.synchtarget) {
                            settings.synchtarget.val(getValue(settings['data'][0]));
                        }
                    }
                    settings.select = settings.selectlist.find('li').eq(item);
                    settings.scrollTop = 0;
                    if (item) {
                        settings.scrollTop = settings.select.offset().top - settings.selectWrap.offset().top - settings.select.outerHeight(true);
                    }
                    // console.log(settings.select.offset().top);
                    // console.log(settings.selectWrap.offset().top);
                    // console.log(settings.select.outerHeight(true));
                    settings.selectlist.css('visibility', 'visible').hide();
                }

                settings.selectWrap = $('<div class="select">').appendTo(select.html(''));

                settings.selectText = $('<div class="reveal"><span></span><i></i></div>').appendTo(settings.selectWrap);

                var selectResult = selectList(settings['data'], settings.selectText.find('span'));
                settings.selectlist = $(selectResult.resulthtml).appendTo(settings.selectWrap);
                if (settings.width) {
                    settings.selectWrap.width(settings.width);
                    settings.selectText.find('span').width(settings.width - 35);
                    settings.selectlist.width(settings.width);
                }
                synchdata();
                if (settings.zIndex) {
                    settings.selectWrap.css('zIndex', settings.zIndex);
                }
                settings.selectWrap.on('click', function (event) {
                    //console.log(settings.isListHide);
                    if (settings.isListHide) {
                        resetSelect();
                        return;
                    }

                    settings.select && settings.select.addClass('option');
                    event.stopPropagation();    // do something
                    if (settings.isListShow) {
                        resetSelect();
                        return;
                    }

                    if (HL_dropdown_length.length) {
                        $.each(HL_dropdown_length, function (t, tt) {
                            tt.trigger('select.hide', tt.data('opts'));
                        });
                    }
                    settings.isListShow = true;
                    if (settings.scrollTop) settings.selectlist.css('visibility', 'hidden').show().scrollTop(settings.scrollTop).css('visibility', 'visible');
                    settings.selectlist.show();
                    settings.selectWrap.addClass('onfocus');
                    //当点击控件执行事件
                    $(document).on('click.select', resetSelect);
                    $(window).on('blur', resetSelect);
                }).on('selectstart', function () {
                    return false;
                });

                //点击事件
                settings.selectWrap.find('li').on('click', function (event) {
                    //event.stopPropagation();    // do something
                    settings.isListHide = true;
                    if (settings.select && settings.select.is($(this))) {
                        settings.isListShow = false;
                        settings.selectlist.hide();
                        //console.log('同一个元素');
                        return;
                    }
                    settings.select && settings.select.removeClass('option');
                    var _slef = $(this).addClass('option');
                    settings.selectText.find('span').text(_slef.text()).attr('data-val', _slef.data('val'));
                    settings.scrollTop = settings.selectlist.scrollTop();
                    settings.select = _slef;
                    settings.isListShow = false;
                    settings.selectlist.hide();
                    if (settings.synchtarget) {
                        settings.synchtarget.val(_slef.data('val'));
                    }
                    if (settings.callback)
                        var currItemArr = _slef.data('item').split(':');
                    // switch (currItemArr[0]){
                    //   case 'insertbegin':
                    //     currItemArr=settings[currItemArr[0]][currItemArr[1]];
                    //     break;default
                    // }
                    settings.callback.call(settings, assembleData(_slef.text(), _slef.data('val')), settings[currItemArr[0]][currItemArr[1]]);
                }).hover(function () {
                    settings.select && settings.select.removeClass('option');
                }, function () {
                });

                //重置一设置，但不清下拉中已存在的
                function resetSelect() {
                    //console.log('tex');
                    //settings.select&&settings.select.removeClass('option');
                    settings.selectWrap.removeClass('onfocus');
                    settings.isListShow = false;
                    settings.isListHide = false;
                    settings.selectlist.hide();
                    document.onclick = null;
                    $(document).off("click.select", resetSelect);
                    $(window).off('blur', resetSelect);
                }

                //手动符值
                function setValue(val) {
                    for (var i = 0, data = settings['data'], j = data.length; i < j; i++) {
                        if (getValue(data[i]) == val) {
                            settings.selectText.find('span').text(getText(data[i])).attr('data-val', getValue(data[i]));
                            resetSelect();
                            settings.select && settings.select.removeClass('option');
                            settings.select = settings.selectlist.find('li').eq(i);
                            if (settings.synchtarget) {
                                settings.synchtarget.val(getValue(data[i]));
                            }
                            break;
                        }
                    }
                }


                //on(select, resetSelect);
                select.on('select.show', function () {

                });
                select.on('select.hide', function (event, data) {
                    resetSelect();
                });
                select.on('select.setValue', function (event, data) {
                    setValue(data);
                });
                select.on('select.getValue', function (event, settings) {
                    if (settings.select) {
                        return settings.select.data('val');
                    }
                    return '';

                });
                settings.callload && settings.callload(selectResult.curritem);
            }


            /*当前焦点处理onfocus*/
            function isfocus() {
                settings.selectWrap.addClass();
            };

            //自定义事件
            function on(self, resetSelect) {

            }

            if (this.length > 1) {
                $item = this.eq(0);
            }

            if ($.type(opts) === 'string') {
                var _opts = $item.data('opts');
                if (_opts) {
                    switch (opts) {
                        case 'show':
                            break;
                        case 'hide':
                            $item.trigger('select.hide', _opts);
                            break;
                        case 'select':
                            break;
                        case 'set':
                            $item.trigger('select.setValue', arguments[1]);
                            break;
                        case 'value':
                            if (_opts && _opts.select) {
                                return _opts.select.data('val');
                            }
                        case 'data':
                            var currItemArr = _opts.select.data('item').split(':');
                            return _opts[currItemArr[0]][currItemArr[1]];
                            break;
                    }
                    return;
                }
            }

            return this.each(function () {
                var _selef = $(this);
                var _opts = _selef.data('opts');
                //var _opts = _selef.data('opts', settings) || settings;
                if ($.type(opts) === 'string') {
                    switch (opts) {
                        case 'show':
                            break;
                        case 'hide':
                            _selef.trigger('select.hide', _selef.data('opts'));
                            break;
                        case 'select':
                            break;
                        case 'set':

                            break;
                        case 'value':
                            if (_opts && _opts.select) {
                                return _opts.select.data('val');
                            }
                            return '';
                            break;
                    }
                }
                else {
                    init(_selef);
                }
            });
        }
    });
}));