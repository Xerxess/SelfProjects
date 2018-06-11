/**
 * from表单验证
 */
define(function (require, exports, module) {
        var $ = require('jquery'),
            validator = require('scripts/common/validator');

        var tip = {
            info: function (info) {
                return '<span class="tip placeholder">' + info + '</span>';
            },
            error: function (info) {
                return '<span class=" tip error">' + info + '</span>';
            },
            ok: function () {
                return '';
            },
            clear: function () {
                return '';
            }
        }

        var myValidator = function () {
            this.inputErrorList = [];
            this.resultErrorData = {};
            this.isok = true;
        }
        myValidator.prototype.addInputError = function (inputError) {
            var rulesItemType = Object.prototype.toString.call(inputError);
            switch (rulesItemType) {
                case '[object Array]':
                    this.inputErrorList = this.inputErrorList.concat(inputError);
                    break;
                default:
                    this.inputErrorList.push(inputError);
                    break;
            }
        }
        /**
         *
         * @param isForce 是否强制退出 true 验证失败退出
         * @returns {boolean}
         */
        myValidator.prototype.verification = function (isForce) {
            var self = this,
                _inputErrorList = this.inputErrorList,
                _inputErrorLen = this.inputErrorList.length;
            self.isok = true;
            if (!self.inputErrorList.length) {
                return self.isok;
            }
            for (var i = 0; i < _inputErrorLen; i++) {
                _inputErrorList[i].verification();
                if (!_inputErrorList[i].verificationEnd() && self.isok) {
                    self.isok = false;
                    if (isForce) {
                        break;
                    }
                }
            }
            return self.isok;
        }

        /**
         * 数据验证类
         * @param $input
         */
        var inputError = function (opts) {
            this.input = opts.input;
            this.type = opts.type;
            this.infoWrap = opts.infoWrap;
            this.errorCount = 0;//验证结果 在于0则不通过
            this.errorinfo = [];//记录错误信息
            this.errorCollector = [];
            this.placeholder = '';
            this.rules = opts.rules || [];
            this.rulesFn = opts.rulesFn || [];
            this.customClassName = opts.customClassName || 'error';
            this.verificationCallBack = opts.verificationCallBack;
            this.verificationInit();
            this.addErrorCollector();
        }
        inputError.prototype = {
            verificationInit: function () {
                var self = this;
                if (self.rules.length) {
                    while (self.rules.length) {
                        var rulesItem = self.rules.shift();
                        var rulesItemType = Object.prototype.toString.call(rulesItem);
                        switch (rulesItemType) {
                            case '[object Function]':
                                break;
                            case '[object Array]':
                                break;
                            case '[object String]':
                                var _arguments = rulesItem.split('|');
                                var methodName = _arguments.shift();
                                self.errorCollector.push(function (methodName, _arguments) {
                                    return function () {
                                        this[methodName].apply(this, _arguments);
                                    }
                                }(methodName, _arguments));
                                break;
                        }
                    }
                }
            },
            verification: function () {
                var self = this,
                    _errorCollector = self.errorCollector,
                    _errorCollectorLen = self.errorCollector.length;
                if (_errorCollectorLen) {
                    self.clearError();
                    for (var i = 0; i < _errorCollectorLen; i++) {
                        _errorCollector[i].call(self);
                        if (self.errorCount) {
                            break;
                        }
                    }
                    if (self.errorCount) {
                        self.verificationCallBack && self.verificationCallBack(self.errorinfo);
                    }
                    self.verificationEnd();
                }
            },
            verificationReset: function () {
                //this.clearError();
                this.clear();
            },
            verificationEnd: function () {
                if (this.errorCount) {
                    return false;
                }
                this.clear();
                return true;
            },
            addErrorCollector: function () {
                if (this.rulesFn.length) {
                    this.errorCollector = this.errorCollector.concat(this.rulesFn);
                }
            },
            tipInfo: function (type, info) {
                var _self = this;
                _self.infoWrap && _self.infoWrap.html(tip[type](info));
            },
            info: function ($input, info) {
                var self = this;
                self.tipInfo('info', info);
                return this;
            },
            isNull: function (info) {
                var self = this;
                if (!validator.validator.isNull(self.input.val())) {
                    self.addClassName();
                    self.tipInfo('error', info);
                    self.addError(info);
                }
                return this;
            },
            strLength: function (len, info) {
                var self = this,
                    isok = true;
                var lens = len.split(',');
                if (lens.length == 2) {
                    validator.validatorCall.isvalidatorStringLen(self.input, lens[0], lens[1], function () {
                        isok = false;
                    });
                } else {
                    if (self.input.val().length < lens[0]) {
                        isok = false;
                    }
                }
                if (!isok) {
                    self.addClassName();
                    self.tipInfo('error', info);
                    self.addError(info);
                }
            },
            customError: function (info) {
                var self = this;
                self.addClassName();
                self.tipInfo('error', info);
                self.addError(info);
                return this;
            },
            clear: function () {
                var self = this;
                self.input.removeClass('error');
                self.tipInfo('clear');
                return this;
            },
            addError: function (info) {
                this.errorCount++;
                this.errorinfo.push(info);
            },
            clearError: function () {
                this.errorCount = 0;
                this.error = [];
            },
            addClassName: function () {
                this.input.addClass(this.customClassName);
            },
            removeClassName: function () {
                this.input.removeClassName(this.customClassName);
            }
        }

        return {
            myValidatorBase: myValidator,
            getInputError: function (myValidatorBase, obj) {
                var _newinputError = new inputError(obj);
                if (myValidatorBase) {
                    myValidatorBase.addInputError(_newinputError);
                }
                return _newinputError;
            }
        };
    }
)
;