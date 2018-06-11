//说明：图片上传预览插件
//上传的时候可以生成固定宽高范围内的等比例缩放图

//参数设置：
//width                     存放图片固定大小容器的宽
//height                    存放图片固定大小容器的高
//imgDiv                    页面DIV的JQuery的id
//maxSize                   图片大小最大限制(K)
//imgType                   数组后缀名
//noimg                     默认显示图片
//validatorerror            格式验证错误回调
//validatorback             格式验证回调
//callback                  回调函数
//errorback                 异常回调 
//**********************图片上传预览插件*************************
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
}(function ($) {
  jQuery.fn.extend({
    uploadPreview: function (opts) {
      var infocode = {
        code0: {code: 0, info: true}, //正常
        code1: {code: -1, info: '图片格式错误'},
        code2: {code: -2, info: '图片大小超出指定范围'},
        code3: {code: -99, info: '异常错误'}
      };
      opts = jQuery.extend({
        width: 100,
        height: 100,
        imgBox: null,
        maxSize: 300,
        isalert: true,
        noimg: '/images/loading.gif',
        imgType: ["gif", "jpeg", "jpg", "bmp", "png"],
        validatorerror: null,
        validatorback: null,
        callback: function () {
          return false;
        },
        errorback: null
      }, opts || {});
      var _this = $(this);
      if (_this.data('defalut')) {
        opts['noimg'] = _this.data('defalut');
      }
      var _load = false;
      var imgbox = opts.imgBox;
      var $img = null;
      var $fit = null;//用于滤镜处理
      var version = 7;
      var filters = imgbox[0].filters ? true : false;//ie10内核filters是舍弃了的
      var v = {//判断是否是ie
        getie: function () {
          if (window.attachEvent) {
            return true;
          }
          else {
            return false;
          }
        },
        //是否是ie678
        getoldie: function () {
          if (this.getie()) {
            if (window.addEventListener) {
              return false;
            }
            else {
              return true;
            }
          }
          else {
            return false;
          }
        },
        ie9: function () {
          if (navigator.userAgent.indexOf('MSIE 9.0') > 0) {
            return true;
          }
        }
      };
      version = (v.getoldie || v.ie9) ? 9 : 10;
      var fit = (version <= 9 && filters) || (version >= 10 && filters);

      var myalert = function (msg) {
        if (!opts.isalert) {
          return;
        }
        alert(msg);
      };
      var autoScaling = function (o) {
        var $imgshow = $img;
        if (fit) $imgshow = $fit;
        var box_width = opts.width, img_width = opts.width;
        var box_height = opts.height, img_height = opts.height;
        if (o) {
          img_width = o['width'];
          img_height = o['height'];
        }
        if (box_width != img_width) {
          var rate = (opts.width / img_width < opts.height / img_height) ? opts.width / img_width : opts.height / img_height;
          if (rate <= 1) {
            img_width = img_width * rate;
            img_height = img_height * rate;
          }
          $imgshow.width(img_width);
          $imgshow.height(img_height);
          var left = (opts.width - img_width) * 0.5;
          var top = (opts.height - img_height) * 0.5;
          if (fit) {
            $imgshow[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").sizingMethod = "scale";
          }
          if ($imgshow === $fit) {
            $imgshow.css({"margin-left": left, "margin-top": top}).show();
          }
          else {
            $imgshow.fadeIn();
          }
        }
        if (opts.callback) {
          opts.callback();
        }
      };
      var createImg = function () {
        imgbox.html('');
        $img = $("<img style='display:none;vertical-align: middle;' width='" + opts.width + "' height='" + opts.height + "'/>");
        imgbox.html($img).css('text-align', 'center');
        imgbox.append('<span style="vertical-align: middle;display: inline-block;height: 100%;vertical-align: middle;visibility: hidden;width: 0px;overflow:hidden;">&nbsp;</span>');
      };
      var createfit = function () {
        $fit = $("<div style='display:none;float:left;zoom:1;'></div>");
        imgbox.html($fit);
      }
      var init = function (clear) {
        if (!_load) {
          _load = true;
          if (opts.width) {
            imgbox.css('width', opts.width);
          }
          if (opts.height) {
            imgbox.css('height', opts.height);
          }
        }
        if (fit) {
          imgbox.css({filter: ""});
        }
        createImg();
        $img.on('load', function () {
          $img.show();
          $img.off('load');
        });
        $img.on('error', function () {
          $img.off('load');
        });
        $img.attr('src', opts.noimg);
      };
      init();
      _this.change(function () {
        if (this.value) {
          if (!RegExp("\.(" + opts.imgType.join("|") + ")$", "i").test(this.value.toLowerCase())) {
            myalert("图片类型必须是" + opts.imgType.join("，") + "中的一种");
            _this.val('');
            init();
            if (opts.validatorerror) {
              opts.validatorerror(infocode.code1);
            }
            return false;
          }
          var file, size = 0;
          if (this.files && this.files[0]) {
            file = this.files[0];
            size = file.size;
          } else if (this.files && this.files.item(0)) {
            file = this.files.item(0);
            size = file.fileSize;
          }
          if ((size / 1024) > opts.maxSize) {
            myalert('图片大小不能超过' + opts.maxSize + 'K');
            _this.val('');
            if (opts.errorback) {
              opts.errorback(infocode.code2);
            }
            return false;
          }
          //ie7\8\9 滤镜处理
          if (fit) {
            try {
              this.select();
              if (top != self) {
                window.parent.document.body.focus();
              } else {
                this.blur()
              }
              var imgSrc = document.selection.createRange().text;
              imgSrc = imgSrc ? imgSrc : this.value;
              createfit();
              $fit.css({
                filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)",
                width: 50,
                height: 50
              });
              $fit[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").sizingMethod = "image";
              $fit[0].filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = imgSrc;
              if (opts.validatorback)
                opts.validatorback();
              setTimeout(function () {
                autoScaling({'width': $fit.width(), 'height': $fit.height()});
              }, 100);
            } catch (e) {
              myalert("无效的图片文件！");
              if (opts.errorback) {
                opts.errorback(infocode.code1);
              }
              return;
            }
          }
          else {
            try {
              //支持html5的浏览器,比如高版本的firefox、chrome、ie10
              if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                  $img.hide().attr('src', e.target.result).css({width: 'auto', height: 'auto'});
                  setTimeout(function () {
                    autoScaling({'width': $img.width(), 'height': $img.height()});
                  }, 100);
                };
                reader.readAsDataURL(this.files[0]);
                if (opts.validatorback)
                  opts.validatorback();
              }
            } catch (e) {
              if (opts.errorback) {
                opts.errorback(infocode.code3);
              }
              myalert('系统错误，请重试！');
            }
          }
        } else {
          createImg();
          $img.attr('src', opts.noimg);
          $img.on('load', function () {
            $img.show();
            $img.off('load');
          });
          $img.on('error', function () {
            $img.off('load');
          });
        }
      }).on('blur.fileview', function () {
        if (opts.callback2) {
          opts.callback2();
        }
        if (this.value) {
          // console.log($(this).val());
        }
        else {
          createImg();
          $img.attr('src', opts.noimg);
          $img.on('load', function () {
            $img.show();
            $img.off('load');
          });
          $img.on('error', function () {
            $img.off('load');
          });
        }
      });
    }
  });
}));