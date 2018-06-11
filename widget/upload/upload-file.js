/**
 * @fileOverview 文件上传
 * @author 
 * @date 
 * @version
 */


//     //图片上传组件初始化
// var uploader = hl_upload({
//         auto:true,
//         btn: $('#feedback-upfile-box'),
//         url:'',
//         upfileimg: '/static/images/v2.1/upload_1.png',
//         width: 115,
//         height: 125,
//         fileNumLimit: 1,
//         multiple: false, /*不能多选图片*/
//         callback: function (data) {
//             if (data.length) {
//                 flag[2] = 0;
//             } else {
//                 flag[2] = 1;
//                 notice($("#notice-2"));
//             }
//         }
//     });
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'require', 'scripts/plug/webuploader-0.1.5/webuploader'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        window.hl_upload = factory(jQuery);
    }
}(function ($, require) {
    var WebUploader = require('scripts/plug/webuploader-0.1.5/webuploader');
    var errorInfo = '图片上传不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器';
   // var fileURL = '';
    /**
     * 允许修改的属性参数
     * 'key','key:key','key:key&key:key'
     */
    var canSetOpts = function () {
        var optsKeys = ['auto', 'server', 'runtimeOrder', 'fileNumLimit', 'accept', 'pick:multiple'];//允许修改的参数
        return function (opts) {
        }
    }();
    var fileURL = 'http://183.66.64.138:8380/file';

    //用于判断是否在生产环境
    if (!window.location.port && /www\.hlxy\.com/.test(window.location.href)) {
        fileURL = 'https://member.hlxy.com/uploadfile/';
    }
    var maxSize = 1000 * 10;
    var defOptsFun = function (opts) {
        var result = {
            options: {
                auto: true,
                width: 90,
                height: 90,
                swf: '/static/scripts/plug/webuploader-0.1.5/Uploader.swf',
                server: fileURL, /*上传服务地址*/
                // runtimeOrder: "flash,html5",
                fileNumLimit: 1, /*上传数量控制*/
                fileSingleSizeLimit: maxSize * 1000,
                pick: {
                    id: '',
                    innerHTML: function () {
                        return ''
                    }(),
                    multiple: false/*是否多选*/
                },
                resize: false,
                threads: 3
            }
        };
        if (opts.fileSingleSizeLimit) {
            result.options.fileSingleSizeLimit = opts.fileSingleSizeLimit;
        }
        if (opts.fileNumLimit) {
            result.options.fileNumLimit = opts.fileNumLimit;
        }
        //是否自动上传
        if (opts.auto === false) {
            result.options.auto = opts.auto;
        }
        //上传的服务器地址
        if (opts.server) {
            result.options.server = opts.server;
        }
        //是否可多选
        if (opts.multiple) {
            result.options.pick.multiple = opts.multiple;
        }
        //自定义格式
        if (opts.accept) {
            result.options.accept = opts.accept;
        }

        //自定义表单
        if (opts.formData) {
            result.options.formData = opts.formData;
        }
        return result;
    };

    var hlxy_upload = function (opts) {
        this.opts = $.extend(true, {}, opts, defOptsFun(opts, opts || {}));
        this.btn = opts.btn;
        this.width = opts.width ? opts.width : 90;
        this.height = opts.height ? opts.height : 90;
        this.callback = opts.callback;
        this.error = opts.error;
        this.errorlist = [];
        this.deferred = $.Deferred();
        this.uploadSuccess = [];
        this.defaultlist = [];
        this.isOver = true;
        if (this.btn) {
            this.initBtn();
        }
    }
    hlxy_upload.prototype.init = function () {
        var _self = this;
    }

    hlxy_upload.prototype.initBtn = function () {
        var _self = this;
        var $btn = $('<a href="javascript:;" class="hlxy-yc-update">\n' +
            '                            <div class="hlxy-yc-update-lable"><div class="update-lable"><i></i><span>上传</span></div><i class="update-progress" style="display: none;"></i></div>\n' +
            '                            <div class="hlxy-yc-update-control"></div>\n' +
            '                        </a>').width(this.width).height(this.height);
        this.btn.after($btn);
        this.domControl = $btn.find('.hlxy-yc-update-control')[0];//file
        this.progress = $btn.find('.update-progress');//进度条
        $btn.find('.update-lable').html(this.btn);
        this.opts.options.pick.id = this.domControl;
        $btn.hover(function () {
            _self.btn.addClass('hover');
        }, function () {
            _self.btn.removeClass('hover');
        });
        this.createuploader();
    }

    /*实例化上传组件*/
    hlxy_upload.prototype.create = function (fileNumLimit) {
        if (!WebUploader.Uploader.support()) {
            alert(errorInfo);
            return;
        }
    }

    hlxy_upload.prototype.createuploader = function ($control, callback) {
        var _self = this;

        //开始创建百度上传组件
        _self.uploader = WebUploader.create(_self.opts.options);

        // 文件加入队列之前
        _self.uploader.on('beforeFileQueued', function (file) {
            _self.uploader.reset();
            if (_self.uploader.getFiles('inited').length >= _self.opts.options['fileNumLimit']) {
                alert('文件数量达到上限!');
            }
        });

        // 文件加入队列中
        _self.uploader.on('fileQueued', function (file) {
            var name = file.name;
            $('span#file_value').html(name);
        });

        //文件上传进度
        _self.uploader.on('uploadProgress', function (file, percentage) {
            _self.progress.show();
            _self.progress.css('width', percentage * 100 + '%');
            if (percentage == 1) {
                _self.progress.hide();
            }
            ;
            // var $li = $('#' + file.id),
            //     $percent = $li.find('.progress .progress-bar');
            //
            // // 避免重复创建
            // if (!$percent.length) {
            //     $percent = $('<div class="progress progress-striped active">' +
            //         '<span></span><div class="progress-bar" role="progressbar" style="width: 0%">' +
            //         '</div>' +
            //         '</div>').appendTo($li).find('.progress-bar');
            // }
            //
            // $li.find('p.state').text('上传中');
            // $percent.prev().text(parseInt(percentage * 100) + '%');
            // $percent.css('width', percentage * 100 + '%');
        });

        //文件上传成功
        _self.uploader.on('uploadSuccess', function (file, response) {
            _self.callback && _self.callback.call(_self, response);

        });

        //文件上传失败
        _self.uploader.on('uploadError', function (file) {

        });

        //文件检测error
        _self.uploader.on('error', function (type) {
            if (type == 'F_EXCEED_SIZE') {
                alert('文件大小超出' + maxSize + 'KB!');
            } else if (type == 'Q_EXCEED_NUM_LIMIT') {
                alert('已超上传限制!');
            } else if (type == 'Q_TYPE_DENIED') {
                alert('文件类型不符!');
            }
        });
        //不管成功或者失败，文件上传完成时触发
        _self.uploader.on('uploadComplete', function (file) {
            _self.uploader.reset();
        });
        //单个文件上传成功服务返回消息
        _self.uploader.on('uploadAccept', function (object, data) {
            console.log(data);
            _self.error && _self.error(data);
        });

        //文件全部上传成功
        _self.uploader.on('uploadFinished', function () {

        });

        //文件全部上传成功
        _self.uploader.on('uploadSuccess', function () {
            callback && callback.call(_self);
        });

        //清除缓存
        _self.uploader.on('clearfile.uploader', function () {

        });
        return;
    }

    hlxy_upload.prototype.reset = function () {

    }

    /*移除已上传图片*/
    hlxy_upload.prototype.move = function (i) {

    }

    hlxy_upload.prototype.setFormData = function (data) {
        this.uploader.options.formData = data;
    }

    /*开始上传*/
    hlxy_upload.prototype.start = function () {
        this.uploader.upload();
    }
    hlxy_upload.prototype.getFiles = function () {
        return this.uploader.getFiles();
    }
    return function (opts, validate) {
        var _upload;
        try {
            _upload = new hlxy_upload(opts);
        } catch (e) {
            _upload = {
                error: -1,
                info: errorInfo
            };
        }

        if (validate) {
            if (!WebUploader.Uploader.support()) {
                _upload = {
                    error: -1,
                    info: errorInfo
                };
            }
        }
        return _upload;
    }
}));
