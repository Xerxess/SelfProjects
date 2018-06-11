/**
 * @fileOverview  智能提示
 * @author 
 * @date
 * @version
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "scripts/plug/jq/jquery.input", "css!/static/widget/autocomplete/autocomplete.css"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
}(function ($) {
    var COOKIE_NAME = 'HL_autocomplete';
    var default_options = {
        isFocusState: false, /*当前焦点*/
        isShowState: false, /*当前显示状态*/
        oldInputValue: '',
        wrap: null,
        selectItem: null, /*当前已选择项*/
        defItem: -1, /*当前索引*/
        autocompleteList: null, /*所有智能提示列表*/
        data: null,//[{text:''}]
        url: null,
        width: 0,
        height: 0,
        delay: 500,
        cookie: 1
    };

    function delHtmlTag(str) {
        return str.replace(/<[^>]+>/g, "");//去掉所有的html标记
    }

    /**
     * 过滤
     */
    var filter = function () {
    };
    //Autocomplete插件编写
    $.fn.HL_Autocomplete = function (opt) {
        var ARROWUP = 38,
            ARROWDOWN = 40,
            ENTER = 13,
            options = $.extend(true, {}, default_options, opt),
            createDateTimePicker;

        createDateTimePicker = function (input) {
            var autocompleteWrap,
                autocompleteList,
                selectItem,
                state,
                item = -1,
                itemLength,
                oldValue = input.val(),
                cacheData,
                clear,
                async,
                filterdata,
                autoError = true,
                issearch = true,
                isform = true,
                placeholder = true,//用于兼容ie触发input
                inputChange = false,
                islocal = true,
                datakey = options.datakey,
                iscomposition = false,
                async_fnarry = {}, /*用于异步现在的ajax后执行问题*/
                asyncsign,
                stop = false;//阻止ajax内容
            var iskeyCtrl;

            if ($.type(options.data) == 'function') {
                async = true;
            }

            if (options.wrap) {
                autocompleteWrap = $('<div class="autocomplete"></div>').appendTo(options.wrap);
            }

            // input.placeholder();//placeholder插件
            input.on('click.auto', function (events) {
                //阻止doc事件
                events.stopPropagation();
            }).on('dblclick', function () {
                if (state) {
                    return;
                }
                $.trim(input.val()) || local();
            }).on('focus.auto', function () {
                cacheData=null;
                clear && clearTimeout(clear);
                var text = $.trim(input.val());
                options.focus && options.focus(text);
                if (!jQuery.support.leadingWhitespace) {//兼容ie678
                    if ((text == $(this).prop('placeholder')) || !text) {
                        oldValue = null;
                        placeholder = true;
                        return;
                    }
                }
                if (!text) {
                    oldValue = null;
                    placeholder = true;
                    cacheData=null;
                    return;
                }

                /*input是否值*/
                if ((oldValue && text === oldValue) && cacheData) {//使用缓存
                    input.trigger('show.auto');
                    return;
                }
                else {
                    oldValue = text;//防止通过js修改input的值
                }
                if (!isfilter(text)) {
                    return;
                }
                search();
                // .on('compositionstart.auto',function(){
                //   console.log('compositionstart');
                //   iscomposition=true;
                // }).on('compositionend.end',function(){
                //   console.log('compositionend');
                //   iscomposition=false;
                //   $(this).trigger('input.auto');
                // })
            }).on('paste', function (e) {
                //console.log('paste');
                $(this).trigger('input.auto');
            }).on('input.auto', function () {

                if (inputChange) {//ie9以下使onpropertychange,
                    return;
                }

                var text = $.trim(input.val());
                stop = false;
                options.input && options.input(text);//input事件
                if (!text) {
                    oldValue = null;
                    if (placeholder) {
                        return;
                    }
                    async_fnarry = {};
                    local();//调历史
                    return;
                }
                placeholder = false;
                /*input是否值*/
                if (oldValue && text === oldValue) {//中文输入法时产生点位符bug
                    return;
                }
                oldValue = text;
                //console.log('oldValue4:' + oldValue);
                if (!isfilter(oldValue)) {
                    return;
                }
//console.log(oldValue);
                search();
            }).on('keydown.auto', function (event) {
                inputChange = false;
                var _which = event.which;
                if (_which === ARROWUP || _which === ARROWDOWN || _which == ENTER) {
                    event.stopPropagation();
                    event.preventDefault();
                }
                if (!issearch) {//禁用上下选中
                    return;
                }
                if (_which == ARROWUP) {/*向上*/
                    inputChange = true;
                    if (item <= 0) {
                        if (item === 0) {
                            item = -1;
                            autoselect();
                            input.val(oldValue);
                            return;
                        }
                        item = itemLength;
                    }
                    item--;
                    selectItem = selectEq(item);
                }
                if (_which == ARROWDOWN) {/*向下*/
                    inputChange = true;
                    if (item >= itemLength - 1) {
                        autoselect();
                        item = -1;
                        input.val(oldValue);
                        return;
                    }
                    item++;
                    selectItem = selectEq(item);
                }
                if (_which == ENTER) {/*回车键*/
                    call();
                }
            }).on('show.auto', function () {
                if (state) {
                    return;
                }
                autocompleteWrap.show();
                state = true;
            }).on('hide.auto', function () {
                autocompleteWrap.hide();
                state = false;
                if (options.hideCall) {
                    options.hideCall();
                }
            });
            $(window).on("blur", function () {
                input.trigger('hide.auto');
            });

            if (options.form) {
                options.form.on('submit.auto', function () {
                    if (options.submit && !options.submit.call(input, input.val(), item == -1 ? null : cacheData[item])) {
                        return false;
                    }
                    if (isform) {
                        setLocal(oldValue);
                        return;
                    }
                    return false;
                });
            }

            // if (options.domclick) {
            //     options.domclick.on('click.auto', function () {
            //         if (options.submit && !options.submit.call(input, input.val(), item == -1 ? null : cacheData[item])) {
            //             return false;
            //         }
            //         if (isform) {
            //             setLocal(oldValue);
            //             return;
            //         }
            //         return false;
            //     });
            // }

            $(document).on('click.auto', function () {
                input.trigger('hide.auto');
            })

            //异步回调
            input.autocomplete = function (data) {
                autocompletebind(data);
            }

            input.error = function (data) {
                issearch = false;
                autoError = false;
                autocompletebind(data);
            }
            input.clearcookie = function () {
                clearLocal();
            };


            var error = function (data) {
                isform = false;
                input.error(data);
            }

            //重置配置
            var reset = function () {
                isform = true;
                issearch = true;
                item = -1;
            }

            /*闭包解决ajax后执行问题*/
            var asyncall = function () {
                asyncsign = new Date().valueOf();
                async_fnarry[asyncsign] = function (data) {
                    var _asyncsign = asyncsign;
                    return function (data) {
                       // console.log(async_fnarry);
                        if (_asyncsign == asyncsign) {
                            autocompletebind(data);
                            async_fnarry[_asyncsign] = null;
                            _asyncsign = null;
                            async_fnarry = {};
                        } else {
                            async_fnarry[_asyncsign] = null;
                            _asyncsign = null;
                        }
                    }
                }();
            }

            //本地与异步转换
            var search = function () {
                if (!async) {
                    return function () {
                        asyncall();
                        reset();
                        clear && clearTimeout(clear);
                        clear = setTimeout(function () {
                            input.autocomplete(options.data, async_fnarry[asyncsign]);
                        }, options.delay);
                    }
                }
                return function () {
                    asyncall();
                    reset();
                    clear && clearTimeout(clear);
                    clear = setTimeout(function () {
                        options.data(input, async_fnarry[asyncsign]);
                    }, options.delay);
                }
            }();

            //输入的关键字过滤
            var isfilter = function (v) {
                var reg, reg2 = /[^A-Za-z0-9\u2E80-\u9FFF\s\(\)（）]/;
                //是否是特殊字符串如:!、?、<
                //if (reg2.test(v)) {
                //  error('搜索中不得有特殊字符(!、?、@、#...)存在!');
                //  return false;
                //}
                if (options.filterdata && !filterdata) {
                    filterdata = ',' + options.filterdata.join(',') + ',';
                }
                if (!filterdata) {
                    return;
                }
                v = v.replace(/\(|\[|\{|\\|\^|\$|\||\)|\?|\*|\+|\]|\}/g, function (c) {
                    return '\\' + c;
                });
                reg = new RegExp(',' + v + ',');
                if (reg.test(filterdata)) {
                    error('搜索条件过于简单,无法搜索!');
                    return false;
                }
                input.trigger('hide.auto');
                return true;
            };

            //本地cookie处理.需要插件支持
            var local = function () {
                if (options.cookie == 1) {
                    input.trigger('hide.auto');
                    return;
                }
                var localData = [], cookie = '';
                if (!islocal) {//不使用本地cookie
                    return;
                }
                if ($.cookie) {
                    cookie = $.cookie(COOKIE_NAME);
                    if (cookie && cookie != 'null') {
                        localData = cookie.split(',');
                        if (localData.length) {
                            issearch = true;
                            autocompletebind(localData);
                        }
                    }
                }
            }

            var setLocal = function (str) {
                if (options.cookie == 1) {
                    return;
                }
                if (!oldValue) {
                    return;
                }
                var _newcookieArry = [], _cookiestr = $.cookie(COOKIE_NAME);
                if (_cookiestr && _cookiestr != 'null') {
                    _newcookieArry.push(_cookiestr);
                }
                if ((',' + _cookiestr + ',').indexOf(',' + str + ',') > -1) {
                    return;
                }
                _newcookieArry.unshift(str);
                $.cookie(COOKIE_NAME, _newcookieArry.join(','), 7);//重写
            }

            //清除cookie
            var clearLocal = function () {
                $.cookie(COOKIE_NAME, null);
            }

            //创建自动完成列表
            var autocompletebind = function (data) {
                if (stop) {
                    return;
                }
                if (!issearch) {
                    if (data && Object.prototype.toString.call(data) === '[object String]') {
                        stop = true;
                        autocompleteWrap.html('<span style="display: block;padding: 10px;color: red;">' + data + '</span>');
                        input.trigger('show.auto');
                    }
                    else {
                        autocompleteWrap.html('');
                    }
                    return;
                }
                autoError = true;
                //console.log(data);
                if (!data || data.length == 0) {
                    autocompleteWrap.html('');
                    cacheData = null;
                    return;
                }
                var _result = [];
                cacheData = [];
                itemLength = data.length;
                if (itemLength >= options.length) {
                    itemLength = options.length;
                }
                for (var i = 0; i < itemLength; i++) {
                    if (matching(data[i])) {
                        cacheData.push(data[i]);//取消缓存
                        var _str = '<li>' + getText(data[i]);
                        if (options.filter) {
                            var _s = options.filter.call(input[0], data[i]);
                            _str += _s ? _s.toString() : '';
                        }
                        _result.push(_str + '</li>');
                    }
                }
                autocompleteWrap.html('');
                if (_result.length == 0) {
                    return;
                }
                itemLength = cacheData.length;
                autocompleteList = $('<ul>' + _result.join('') + '</ul>').appendTo(autocompleteWrap).find('li').hover(function () {
                    selectItem = $(this).addClass('on');
                    item = selectItem.index();
                }, function () {
                    autoselect();
                }).on('click.auto', function (events) {
                    events.stopPropagation();
                    events.preventDefault();
                    call();
                });
                input.trigger('show.auto');
            };

            //
            var autoselect = function () {
                if (selectItem)
                    selectItem.removeClass('on');
            }

            //指定切换状态
            var selectEq = function (i) {
                if (!cacheData || !cacheData.length) {
                    return;
                }
                autoselect();
                input.val(delHtmlTag(getText(cacheData[item])));
                if (options.selectCall) {
                    var resultData = cacheData[item];
                    options.selectCall && options.selectCall.call(input, resultData);
                }
                return autocompleteList.eq(i).addClass('on');
            }

            //最后回调函数
            var call = function () {
                var resultData;
                if (item == -1) {//指定当前内容
                    resultData = {'text': oldValue};
                }
                else {
                    input.val(delHtmlTag(getText(cacheData[item])));
                    resultData = cacheData[item];
                }
                setLocal(oldValue);
                options.callBack && options.callBack.call(input, resultData);
                input.trigger('hide.auto');
                item = -1;
                reset();
            }

            var getText = function (data) {
                var _val = data;
                var _datakey = datakey ? datakey : 'text';
                if ($.type(data) != 'string') {
                    _val = data[_datakey] ? data[_datakey] : '';
                }
                return _val;
            }

            //匹配数据中是否存在input内容
            var matching = function (data) {
                if (islocal && !oldValue) {//本地cookie直接通过
                    return true;
                }
                var text = getText(data);
                return true;
                //if (text.indexOf(oldValue) != -1) {
                //  return true
                //}
            }
        };
        return this.each(function () {
            createDateTimePicker($(this));
        });
    }
}));
