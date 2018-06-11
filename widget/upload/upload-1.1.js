/**
 * @fileOverview 文件上传
 * @author 
 * @date
 * @version
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'require', 'css!/static/dist/v2.2/page/widget/upload-1.1.css', 'scripts/plug/webuploader-0.1.5/webuploader', 'widget/hlxyui/tips', 'widget/dialog/dialog'], factory);
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
    var hl_dialog = window.hl_dialog || (require && require('widget/dialog/dialog')) || null;
    var errorInfo = '图片上传不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器';
    var fileURL = 'http://183.66.64.138:8380/file';

    //用于判断是否在生产环境
    if (!window.location.port && /www\.hlxy\.com/.test(window.location.href)) {
        fileURL = 'https://member.hlxy.com/uploadfile/';
    }

    if (!hl_dialog) {
        alert('请加入hl_dialog组件');
        console.log('请加入hl_dialog组件');
        return;
    }

    /**
     * 允许修改的属性参数
     * 'key','key:key','key:key&key:key'
     */
    var canSetOpts = function () {
        var optsKeys = ['auto', 'server', 'runtimeOrder', 'fileNumLimit', 'accept', 'pick:multiple'];//允许修改的参数
        return function (opts) {
        }
    }();

    var maxSize = 800;
    var defOptsFun = function (opts) {
        var result = {
            options: {
                auto: true,
                width: 90,
                height: 90,
                swf: '/static/scripts/plug/webuploader-0.1.5/Uploader.swf',
                server: fileURL, /*上传服务地址*/
                // runtimeOrder: "flash",
                fileNumLimit: 1, /*上传数量控制*/
                fileSingleSizeLimit: maxSize * 1000,
                pick: {
                    id: '',
                    innerHTML: function () {
                        return '<img src="/static/widget/upload/upload.png" width="90" height="90"/>'
                    }(),
                    multiple: false/*是否多选*/
                },
                thumb: {
                    width: 90,
                    height: 90,
                    allowMagnify: false,
                    crop: false,
                    type: ''
                },
                resize: false,
                threads: 3,
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/jpg,image/jpeg,image/png,image/jpeg,image/bmp,image/gif'
                    // mimeTypes: 'image/*'
                }
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
        return result;
    };

    var hlxy_upload = function (opts) {
        this.opts = $.extend(true, {}, opts, defOptsFun(opts, opts || {}));
        this.defaultlist = opts.defaultlist ? opts.defaultlist : null;
        this.btn = opts.btn;
        this.preview = opts.preview;
        this.wrap = opts.wrap;
        this.width = opts.width ? opts.width : 90;
        this.height = opts.height ? opts.height : 90;
        this.listimg = [];
        this.errorlist = [];
        this.deferred = $.Deferred();
        this.uploadSuccess = [];
        this.defaultlist = [];
        this.isOver = true;
        /*数据转换为图片id的数组*可自定义*/
        this.dictionary = opts.dictionary ? opts.dictionary : function (data) {
            var dataArrary = [];
            for (var i = 0, j = data.length; i < j; i++) {
                dataArrary.push(data[i]['imglist'][0]);
            }
            return dataArrary;
        }
        if (this.wrap) {
            this.init();
        }
        if (this.btn) {
            this.initBtn();
        }

    }
    hlxy_upload.prototype.init = function () {
        var _self = this;
        _self.getDefautList();
        _self.wrap.html('<div class="hlxy-upload-image"><div class="hlxy-upload-view-list hlxy-upload-view-list0"></div><div class="hlxy-upload-view-list hlxy-upload-view-list1"></div><div class="hlxy-upload-control"></div></div>');
        _self.viewDefaultBox = _self.wrap.find('div.hlxy-upload-view-list0');
        _self.viewAddBox = _self.wrap.find('div.hlxy-upload-view-list1');
        _self.control = _self.wrap.find('.hlxy-upload-control').width(_self.width).height(_self.height);
        _self.control.html('<img src="' + _self.opts['upfileimg'] + '"  style="width:' + _self.width + 'px;height: ' + _self.height + 'px;"/>');
        if (_self.defaultlist && _self.opts.fileNumLimit <= _self.defaultlist.length) {
            _self.control.hide();
        }

        if (_self.defaultlist.length) {
            var _defaulthtml = [];
            for (var i = 0, j = _self.defaultlist.length; i < j; i++) {
                if (_self.defaultlist[i].id) {
                    _defaulthtml.push('<div class="hlxy-upload-item">' +
                        '<h4 class="info"></h4>' +
                        '<div class="makeThumb"><img src="' + _self.defaultlist[i].imgsrc + '"  style="width:' + _self.width + 'px;height: ' + _self.height + 'px;"/></div>' +
                        '<p class="state"></p>' +
                        '<i class="delete" title="移除">移除</i>' +
                        '</div>');
                }
            }
            if (_defaulthtml.length) {
                _self.viewDefaultBox.html(_defaulthtml.join(''));
            }
        }

        //弹出上传组件
        _self.wrap.on('click', 'div.hlxy-upload-control', function () {
            _self.create();
        });

        //点击编辑图片
        // _self.wrap.on('click', 'div.hlxy-upload-item .makeThumb', function () {
        //   _self.create({options: {fileNumLimit: 1}});
        // });

        //移除图片
        _self.wrap.on('click', 'div.hlxy-upload-item .delete', function () {
            var $fileItem = $(this).parent();
            var _fileItem = $fileItem.index();
            if ($fileItem.data('fileid')) {
                _self.uploader.removeFile(_self.uploadSuccess[_fileItem][$fileItem.data('fileid')]);
                _self.uploadSuccess.splice(_fileItem, 1);
                _self.listimg.splice(_fileItem, 1);
            } else {
                _self.defaultlist.splice(_fileItem, 1);
            }
            $fileItem.remove();
            if (_self.opts.fileNumLimit <= (_self.listimg.length + _self.defaultlist.length)) {
                _self.control.hide();
            } else {
                _self.control.show();
            }
            // console.log(_self.getList());
        });

    }

    hlxy_upload.prototype.initBtn = function () {
        var _self = this;
        // _self.btn.click(function () {
        //     if (_self.opts.isupdate) {
        //         _self.reset();
        //     }
        //     _self.create();
        // });
        _self.opts.options['pick'].id = _self.btn;
        _self.opts.options['pick'].innerHTML = '';
        _self.opts.options['pick'].label = '点击上传'
        var upfileData = _self.createuploader($('<div></div>'), function () {
            if (_self.isOver) {
                _self.listimg = _self.listimg.concat(upfileData._selfDataList);
                _self.uploadSuccess = _self.uploadSuccess.concat(upfileData._uploadSuccess);
                if (_self.preview) {
                    _self.preview.html('<img src="' + _self.listimg[0]['imgdis'][_self.listimg[0].imglist[0]] + '"  style="width:' + _self.width + 'px;height: ' + _self.height + 'px;"/>');
                }
            }
        });
    }

    /*获得默认图片列表 注意模板*/
    //<div class="upfile-default-list" style="display: none;">
    //<s class="s" data-id="2Lcq6stj98O1B3WAXCX54Ms1kKgVL5A">http://119.84.15.204:8380/file/O8I+JE3nuY96YyHCWbvPdy/2Lcq6stj98O1B3WAXCX54Ms1kKgVL5A==</s>
    //</div>
    hlxy_upload.prototype.getDefautList = function () {
        var _self = this;
        var defaultList = _self.wrap.find('div.upfile-default-list').find('s.s');
        if (defaultList.length) {
            defaultList.each(function (i) {
                _self.defaultlist.push({
                    id: $(this).data('id'),
                    imgsrc: $(this).text()
                });
            });
        }
    };

    /*实例化上传组件*/
    hlxy_upload.prototype.create = function (fileNumLimit) {
        if (!WebUploader.Uploader.support()) {
            alert(errorInfo);
            return;
        }
        var _self = this, upfileData;
        if (_self.opts.fileNumLimit <= _self.listimg.length) {
            if (hl_ui) {
                hl_ui.tips.error({content: '图片最多上传' + _self.opts.options.fileNumLimit + '张图片!'});
            }
            else {
                alert('图片最多上传' + _self.opts.fileNumLimit + '张图片!');
            }
            return;
        }
        if (fileNumLimit) {
            _self.opts.options['fileNumLimit'] = fileNumLimit;
        } else {
            _self.opts.options['fileNumLimit'] = _self.opts.fileNumLimit - _self.defaultlist.length - _self.listimg.length;
        }
        var $uploadBox = $('<div class="hlxy-upload-image-dialog"><div><div class="hlxy-upload-control"></div></div></div><div class="hlxy-upload-opts"><button class="ok">确 认</button><button class="cancel">取 消</button></div>');
        var $control = $uploadBox.find('.hlxy-upload-control');

        _self.opts.options['pick'].id = $control;
        try {
            upfileData = _self.createuploader($control);
        }
        catch (e) {
        }

        var upfiledialog = hl_dialog.dialog({
            title: _self.opts.title ? _self.opts.title : '图片上传',
            width: 520,
            height: 'auto',
            animation: true,
            isoutempty: true,
            content: $uploadBox,
            load: function () {
                this.setAuto();
                this.show();
            },
            closeCall: function () {
            }
        });
        //成功
        $uploadBox.on('click', 'button.ok', function () {
            if (_self.isOver) {
                _self.listimg = _self.listimg.concat(upfileData._selfDataList);
                _self.uploadSuccess = _self.uploadSuccess.concat(upfileData._uploadSuccess);
                //console.log(_self.listimg);
                //判断是否存在多图片的容器
                if (_self.wrap) {
                    if (_self.listimg) {
                        var _defaulthtml = [];
                        for (var i = 0, j = _self.listimg.length; i < j; i++) {
                            if (_self.listimg[i].imglist) {
                                _defaulthtml.push('<div class="hlxy-upload-item"  data-fileitem="' + i + '" data-fileid="' + _self.uploadSuccess[i].key + '">' +
                                    '<div class="makeThumb"><img src="' + _self.listimg[i]['imgdis'][_self.listimg[i].imglist[0]] + '"  style="width:' + _self.width + 'px;height: ' + _self.height + 'px;"/></div>' +
                                    '<i class="delete" title="移除">移除</i>' +
                                    '</div>'
                                );
                            }
                        }
                        if (_defaulthtml.length) {
                            _self.viewAddBox.html(_defaulthtml.join(''));
                        }
                    }
                    //已存在的图片列表
                    if (_self.defaultlist.length) {
                        var _defaulthtml = [];
                        for (var i = 0, j = _self.defaultlist.length; i < j; i++) {
                            if (_self.defaultlist[i].id) {
                                _defaulthtml.push('<div class="hlxy-upload-item">' +
                                    '<h4 class="info"></h4>' +
                                    '<div class="makeThumb"><img src="' + _self.defaultlist[i].imgsrc + '"  style="width:' + _self.width + 'px;height: ' + _self.height + 'px;"/></div>' +
                                    '<p class="state"></p>' +
                                    '<i class="delete" title="移除">移除</i>' +
                                    '</div>');
                            }
                        }
                        if (_defaulthtml.length) {
                            _self.viewDefaultBox.html(_defaulthtml.join(''));
                        }
                    }

                    if (_self.opts.fileNumLimit <= (_self.listimg.length + _self.defaultlist.length)) {
                        _self.control.hide();
                    } else {
                        _self.control.show();
                    }
                }
                if (_self.preview) {
                    _self.preview.html('<img src="' + _self.listimg[0]['imgdis'][_self.listimg[0].imglist[0]] + '"  style="width:' + _self.width + 'px;height: ' + _self.height + 'px;"/>');
                }
                upfiledialog.hide();
                _self.opts.callback && _self.opts.callback(_self.getList(), _self.uploadSuccess);
            }
        });
        //取消
        $uploadBox.on('click', 'button.cancel', function () {
            if (_self.isOver) {
                upfiledialog.hide();
            }
        });
    }

    hlxy_upload.prototype.createuploader = function ($control, callback) {
        var _self = this,
            resultData = {
                _selfDataList: [],
                _uploadSuccess: [],
                _errorList: []
            }

        //开始创建百度上传组件
        _self.uploader = WebUploader.create(_self.opts.options);
        // 文件加入队列之前
        _self.uploader.on('beforeFileQueued', function (file) {
            if (_self.opts.isupdate) {
                _self.uploader.reset();
                _self.uploader.trigger('clearfile.uploader');
                _self.reset.call(_self);
            }
            if (_self.uploader.getFiles('inited').length >= _self.opts.options['fileNumLimit']) {
                if (hl_ui) {
                    hl_ui.tips.error({content: '图片最多上传' + _self.opts.options.fileNumLimit + '张图片!'});
                }
                else {
                    alert('图片最多上传' + _self.opts.fileNumLimit + '张图片!');
                }
            }
        });
        // 文件加入队列中
        _self.uploader.on('fileQueued', function (file) {
            _self.isOver = null;
            var $wrap = $('<div id="' + file.id + '" class="hlxy-upload-item">' +
                '<h4 class="info">' + file.name + '</h4>' +
                '<div class="makeThumb"></div>' +
                '<p class="state">等待上传...</p>' +
                '<i class="delete" title="移除">移除</i>' +
                '</div>');
            $control.before($wrap);
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
                if (_self.uploader.getFiles('inited').length < _self.opts.options['fileNumLimit']) {
                    $control.removeClass('uploadhide');
                }
            });
            if (_self.uploader.getFiles('inited').length >= _self.opts.options['fileNumLimit']) {
                $control.addClass('uploadhide');
            }
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
            var fileData = {};
            fileData[file.id] = file;
            fileData['key'] = file.id;
            resultData._uploadSuccess.push(fileData);
        });
        //文件上传失败
        _self.uploader.on('uploadError', function (file) {
            $('#' + file.id).find('p.state').addClass('upfileerror').text('上传出错');
            resultData._errorList.push(file);
        });
        _self.uploader.on('error', function (type) {
            if (type == 'F_EXCEED_SIZE') {
                hl_ui.tips.warning({content: '文件大小超出' + maxSize + 'KB!'});
            } else if (type == 'Q_EXCEED_NUM_LIMIT') {
                hl_ui.tips.warning({content: '已超上传限制!'});
            } else if (type == 'Q_TYPE_DENIED') {
                hl_ui.tips.warning({content: ' 文件类型不符!'});
            }
        });
        //不管成功或者失败，文件上传完成时触发
        _self.uploader.on('uploadComplete', function (file) {
            $('#' + file.id).find('.progress').fadeOut();
        });
        //单个文件上传成功服务返回消息
        _self.uploader.on('uploadAccept', function (object, data) {
            resultData._selfDataList.push(data);
        });
        //文件全部上传成功
        _self.uploader.on('uploadFinished', function () {
            _self.isOver = true;
            callback && callback.call(_self);
            _self.opts.callback && _self.opts.callback.call(_self);
        });
        //清除缓存
        _self.uploader.on('clearfile.uploader', function () {
            resultData['_selfDataList'] = [];
            resultData['_uploadSuccess'] = [];
            resultData['_errorList'] = [];
        });
        return resultData;
    }

    hlxy_upload.prototype.reset = function () {
        this.listimg = [];
        this.uploadSuccess = [];
    }

    /*移除已上传图片*/
    hlxy_upload.prototype.move = function (i) {

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

    //得到所有图片列表
    hlxy_upload.prototype.getList = function () {
        var _self = this, newlist = [], defaultlist = [];
        if (_self.listimg.length) {
            newlist = _self.dictionary(_self.listimg);
        }
        if (_self.defaultlist.length) {
            for (var i = 0, j = _self.defaultlist.length; i < j; i++) {
                defaultlist.push(_self.defaultlist[i]['id']);
            }
        }
        return [].concat(defaultlist, newlist);
    };

    //设置初始化图片
    hlxy_upload.prototype.setDefaultList = function (listimg) {
        var _self = this;
        if (Object.prototype.toString.call(listimg) !== '[object Array]') {
            alert('参数错误');
        }
        if (listimg.length) {
            for (var i = 0, j = listimg.length; i < j; i++) {
                _self.listimg.push({
                    'imglist': [listimg[i]]
                });
            }
        }
    };

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
}))
;