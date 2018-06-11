(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
}(function ($) {
    // IE6\7\8不支持input事件，但支持propertychange事件  
    // if (!$.support.leadingWhitespace) {
    //     // 检查是否为可输入元素  
    //     var rinput = /^INPUT|TEXTAREA$/,
    //         isInput = function (elem) {
    //             return rinput.test(elem.nodeName);
    //         };
    //
    //     $.event.special.input = {
    //         setup: function () {
    //             var elem = this;
    //             if (!isInput(elem)) return false;
    //             $.data(elem, '@oldValue', elem.value);
    //             $.event.add(elem, 'propertychange', function (event) {
    //                 // 元素属性任何变化都会触发propertychange事件  
    //                 // 需要屏蔽掉非value的改变，以便接近标准的onput事件  
    //                 if ($.data(this, '@oldValue') !== this.value) {
    //                     $.event.trigger('input', null, this);
    //                 };
    //                 $.data(this, '@oldValue', this.value);
    //             });
    //         },
    //         teardown: function () {
    //             var elem = this;
    //             if (!isInput(elem)) return false;
    //             $.event.remove(elem, 'propertychange');
    //             $.removeData(elem, '@oldValue');
    //         }
    //     };
    // };
    //
    // // 声明快捷方式：$(elem).input(function () {});  
    // $.fn.input = function (callback) {
    //     return this.bind('input', callback);
    // };
    var handle=(function(){
        if(!document.addEventListener){
            return function(e){
                if(e.originalEvent.propertyName=='value'){
                    e.handleObj.handler.apply(this,arguments);
                }
            }
        }
    })();
    var bindType=(function(){
        if(window.addEventListener)return 'input';
        return 'propertychange';
    })();
    $.event.special['input']={
        bindType:bindType,
        setup:function(){
            if(document.documentMode==9){
                var input=this;
                $.event.add(this,'focus._input',function(){
                    $.event.add(document,'selectionchange._input',function(){
                        $.event.trigger('input','',input)
                    });
                });
                $.event.add(this,'blur._input',function(){
                    $.event.remove(document,'selectionchange._input');
                });
            }
            return false;
        },
        handle:handle
    }    
}));