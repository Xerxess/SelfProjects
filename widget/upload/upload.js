/**
 * @fileOverview 文件上传
 * @author
 * @date
 * @version
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'require', 'css!/static/dist/v2.2/page/widget/upload.css', 'scripts/plug/webuploader-0.1.5/webuploader', 'widget/hlxyui/tips'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        window.hl_upload = factory(jQuery);
    }
}(function ($, require) {

    var WebUploader = window.WebUploader || (require && require('scripts/plug/webuploader-0.1.5/webuploader'));
    var hl_ui = window.hl_ui || (require && require('widget/hlxyui/tips')) || null;
    var errorInfo = '图片上传不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器';
    var fileURL = 'http://183.66.64.138:8380/file';

    //用于判断是否在生产环境
    if (!window.location.port &&/www\.hlxy\.com/.test(window.location.href)) {
        fileURL = 'https://member.hlxy.com/uploadfile/';
    }

    var defOpts = {
        width: 90,
        height: 90,
        swf: '/static/scripts/plug/webuploader-0.1.5/Uploader.swf',
        server: fileURL, /*上传服务地址*/
        runtimeOrder: "html5,flash",
        fileNumLimit: 1, /*上传数量控制*/
        fileSingleSizeLimit: 500000,
        pick: {
            id: '',
            innerHTML: '<img src="/static/widget/upload/upload.png" width="' + this.width + '" height="' + this.height + '"/>',
            multiple: false/*是否多选*/
        },
        thumb: {
            width: this.width,
            height: this.height,
            allowMagnify: false,
            crop: false,
            type: ''
        },
        resize: false,
        threads: 5,
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/jpg,image/jpeg,image/png,image/jpeg,image/bmp,image/gif'
        }
    }

    var setOpts = function (opts, opts2) {
        if (opts2.pick && opts2.pick.innerHTML !== '') {
            return $.extend(true, {}, opts, {
                thumb: {
                    width: opts.width,
                    height: opts.height
                }
            });
        }
        return $.extend(true, {}, opts, {
            pick: {
                innerHTML: '<img src="/static/widget/upload/upload.png" width="' + opts.width + '" height="' + opts.height + '"/>'
            },
            thumb: {
                width: opts.width,
                height: opts.height
            }
        });
    }
    var hlxy_upload = function (opts) {
        this.opts = setOpts($.extend(true, {}, defOpts, opts.options), opts);
        // console.log(this.opts);
        this.defaultlist = opts.defaultlist ? opts.defaultlist : null;
        this.wrap = opts.wrap;
        this.listimg = [];
        this.errorlist = [];
        this.deferred = $.Deferred();
        this.init();
    }
    hlxy_upload.prototype.init = function () {
        var _self = this;
        _self.wrap.append('<div class="hlxy-upload-image"><div class="hlxy-upload-control"></div></div>');
        _self.control = _self.wrap.find('.hlxy-upload-control');
        if (_self.defaultlist) {
            var _defaulthtml = [];
            for (var i = 0, j = _self.defaultlist.length; i < j; i++) {
                if (_self.defaultlist[i].id) {
                    _defaulthtml.push('<div class="hlxy-upload-item">' +
                        '<h4 class="info"></h4>' +
                        '<div class="makeThumb"><img src="' + _self.defaultlist[i].imgsrc + '"  style="max-width:90px;max-height: 90px;"/></div>' +
                        '<p class="state"></p>' +
                        '</div>');
                }
            }
            if (_defaulthtml.length) {
                _self.control.before(_defaulthtml.join(''));
            }
        }

        _self.opts.pick.id = _self.control;
        //开始创建百度上传组件
        _self.uploader = WebUploader.create(_self.opts);
        // 文件加入队列之前
        _self.uploader.on('beforeFileQueued', function (file) {
            if (_self.uploader.getFiles('inited').length >= _self.opts.fileNumLimit) {
                if (hl_ui) {
                    hl_ui.tips.error({content: '图片最多上传' + _self.opts.fileNumLimit + '张图片!'});
                }
                else {
                    alert('图片最多上传' + _self.opts.fileNumLimit + '张图片!');
                }
            }
        });
        // 文件加入队列中
        _self.uploader.on('fileQueued', function (file) {
            var $wrap = $('<div id="' + file.id + '" class="hlxy-upload-item">' +
                '<h4 class="info">' + file.name + '</h4>' +
                '<div class="makeThumb"></div>' +
                '<p class="state">等待上传...</p>' +
                '<i class="delete" title="移除">×</i>' +
                '</div>');
            _self.control.before($wrap);
            var $li = $wrap.find('.makeThumb');
            _self.uploader.makeThumb(file, function (error, ret) {
                if (error) {
                    $li.text('不支持图片预览');
                } else {
                    $li.css('background-image', 'url(' + ret + ')');
                }
            });
            $wrap.on('selectstart', function () {
                return false;
            });
            $wrap.on('click', 'i.delete', function () {
                _self.uploader.removeFile(file);
                $wrap.remove();
                if (_self.errorlist.length) {
                    for (var i = 0, j = _self.errorlist.length; i < j; i++) {
                        if (_self.errorlist[i] == file) {
                            _self.errorlist.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        });
        //文件上传进度
        _self.uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress .progress-bar');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<div class="progress progress-striped active">' +
                    '<span></span><div class="progress-bar" role="progressbar" style="width: 0%">' +
                    '</div>' +
                    '</div>').appendTo($li).find('.progress-bar');
            }

            $li.find('p.state').text('上传中');
            $percent.prev().text(parseInt(percentage * 100) + '%');
            $percent.css('width', percentage * 100 + '%');
        });
        //文件上传成功
        _self.uploader.on('uploadSuccess', function (file) {
            $('#' + file.id).find('i.delete').remove();
            $('#' + file.id).find('p.state').text('已上传');
        });
        //文件上传失败
        _self.uploader.on('uploadError', function (file) {

            $('#' + file.id).find('p.state').text('上传出错');
            _self.errorlist.push(file);
        });

        _self.uploader.on('error', function (type) {
            if (type = 'F_EXCEED_SIZE') {
                hl_ui.tips.warning({content: '文件大小超出500KB'});
            }
        });
        //不管成功或者失败，文件上传完成时触发
        _self.uploader.on('uploadComplete', function (file) {
            $('#' + file.id).find('.progress').fadeOut();
        });
        //单个文件上传成功服务返回消息
        _self.uploader.on('uploadAccept', function (object, data) {
            // console.log(object);
            // console.log(data);
            _self.listimg.push(data);
        });
        //文件全部上传成功
        _self.uploader.on('uploadFinished', function () {
            _self.deferred.resolve(_self.listimg, _self.errorlist);
        });
    }
    /*主动提交*/
    hlxy_upload.prototype.uploadImgage = function (callBack) {
        var _self = this;
        var file = function () {
            _self.deferred = $.Deferred();
            _self.uploader.upload();
            return _self.deferred;
        }

        //回调
        file().then(function (okList, errorList) {
            callBack(okList, errorList);
        })
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