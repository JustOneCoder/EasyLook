/**
 * 微信统一接口类
 */
function wxapi(page) {
  var that = this;
  that.init(page);
}

wxapi.prototype = {
  /**
   * 接口地址
   */
  apiUrl: {
    checkUser: '/v1/vendors/wxApp/vendor/',
    getSession: '/v1/vendors/wxApp/session/',
    // 校验邀请码 
    checkInviteCode: '/v1/vendors/invite-code/check/',
  },

  data: {
    cacheK: {
      // 登录信息
      user_info: 'userInfo',
      vendor_preffix: 'vendor_',
      invite_code_preffix: 'invite_code_'
    },
    city: {},
    userInfo: null,
    vendor: null,
  },
  /**
   * 初始化方法
   */
  init: function (page) {
    var that = this;
    that.page = page;
  },

  saveInviteCode: function (inviteCode) {
    var that = this;
    wx.setStorageSync(that.data.cacheK.invite_code_preffix + getApp().apiHost,
      inviteCode);
  },

  getInviteCode: function () {
    var that = this;
    try {
      return wx.getStorageSync(that.data.cacheK.invite_code_preffix + getApp().apiHost);
    } catch (e) {
    }
    return '';
  },

  
  /**
   * 获取微信用户信息。先从
   * 处理逻辑：根据userInfo.nickName是否为空判断是否授权
   * userInfo.nickName ="" => 进行授权获取用户信息
   * userInfo.nickName !="" => 即已授权，调用success回调
   */
  getUserInfoForce: function (success, fail) {
    var that = this;
    // app上有，则从app获取
    if (getApp().globalData.userInfo != null && getApp().globalData.userInfo.nickName) {
      that.callback_page(success, getApp().globalData.userInfo);
      return;
    }
    var userInfo;
    try {
      userInfo = wx.getStorageSync(that.data.cacheK.user_info);
    } catch (e) {
    }
    // 如果缓存中有，则从缓存获取
    if (userInfo != null && userInfo.nickName) {
      getApp().globalData.userInfo = userInfo;
      that.callback_page(success, userInfo);
      return;
    }

    wx.getSetting({
      success(res) {
        var authSetting = res.authSetting;
        var u = authSetting['scope.userInfo'];
        // 未开启权限弹窗提示获取
        if (u == null || u == false || u == undefined || JSON.stringify(u) == "{}") {
          that.callback_page(fail, res);
        } else {
          wx.getUserInfo({
            success: function (res) {
              //获取用户信息成功
              getApp().globalData.userInfo = res.userInfo;
              that.callback_page(success, res.userInfo);
            },
            fail: function (res) {
                // console.log('getUserInfo 用户选择拒绝授权获取用户信息')
                console.log('getUserInfo 用户信息接口错误')
              that.callback_page(fail, res);
            }
          })
        }
      },
      fail(res) {
        console.log('getUserInfo 获取用户设置失败')
        that.callback_page(fail, res);
      }
    })
  
  },


  checkInviteCode: function (inviteCode, callback) {
    var that = this;
    wx.request({
      url: getApp().apiHost + that.apiUrl.checkInviteCode + inviteCode,
      method: "GET",
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {
        console.log('wxapi checkInviteCode success ' + JSON.stringify(res));
        // TODO

        if (res.data.code == 200) {
          that.data.vendor = res.data.data;
          that.callback_page(callback, res.data, 'success');
        } else {
          that.data.vendor = null;
          that.callback_page(callback, res.data, 'fail');
        }

      },
      fail: function () {
        // TODO
      }
    }) 
  },

  getCacheVendor: function () {
    var that = this;
    var vendorKey = that.data.cacheK.vendor_preffix + getApp().apiHost;
    // 先看看缓存有没有vendor信息
    var cacheVendor = null;
    try {
      // 使用一个前缀+头像url来做key，避免用户切换账号后的旧缓存
      cacheVendor = wx.getStorageSync(vendorKey);
    } catch (e) {
    }
    return cacheVendor;
  },

  /**
   * 授权登录
   */
  wxlogin: function (callback, forceRefresh) {
    var that = this;
    //调用登录接口
    wx.login({
      success: function (res) {
        console.log("wxapi wx.login code = " + res.code);
        wx.getUserInfo({
          success: function (user) {
            getApp().globalData.userInfo = user.userInfo;
            if (!getApp().globalData.nickName) {
              getApp().globalData.nickName = user.userInfo.nickName;
            }
            if (!getApp().globalData.avatarUrl) {
              getApp().globalData.avatarUrl = user.userInfo.avatarUrl;
            } 
            // 微信授权信息登录
            console.log("wxapi user.userInfo = " + JSON.stringify(user.userInfo));

          }, fail: function (failRes) {
            // 拒绝授权，再次唤醒
            console.log('wx.getUserInfo fail');
          }, complete: function (completeRes) {

            var vendorKey = that.data.cacheK.vendor_preffix + getApp().apiHost;
            // 先看看缓存有没有vendor信息
            var cacheVendor = null;
            try {
              // 使用一个前缀+头像url来做key，避免用户切换账号后的旧缓存
              cacheVendor = wx.getStorageSync(vendorKey);
            } catch (e) {
            }
            var callbackWhenResp = true;
            if (cacheVendor != null && cacheVendor.nickname) {
              console.log("wxapi get vendor from cache");
              getApp().globalData.vendor = cacheVendor;
              if (cacheVendor.nickname) {
                getApp().globalData.nickName = cacheVendor.nickname;
              }
              if (cacheVendor.avatar) {
                getApp().globalData.avatarUrl = cacheVendor.avatar;
              }
              that.data.vendor = cacheVendor;
              that.callback_page(callback, cacheVendor, 'success');
              callbackWhenResp = false;
            }

            wx.request({
              url: getApp().apiHost + that.apiUrl.checkUser + res.code,
              method: "GET",
              header: {
                'content-type': 'application/json',
              },
              success: function (res) {
                console.log('wxapi checkUser return ' + JSON.stringify(res));
                // TODO
                if (res.data.code == 200) {
                  console.log("wxapi get vendor from net " + vendorKey);
                  getApp().globalData.vendor = res.data.data;
                  if (!getApp().globalData.nickName) {
                    getApp().globalData.nickName = res.data.data.nickname;
                  }
                  if (!getApp().globalData.avatarUrl) {
                    getApp().globalData.avatarUrl = res.data.data.avatar;
                  }
                  that.data.vendor = res.data.data;
                  that.clearStorageVendor()
                  // 缓存vendor数据
                  wx.setStorage({
                    key: vendorKey,
                    data: res.data.data
                  });
                  if (callbackWhenResp || forceRefresh) {
                    that.callback_page(callback, res.data, 'success');
                  }
                } else {
                  that.data.vendor = null;
                  if (callbackWhenResp) {
                    that.callback_page(callback, null, 'fail');
                    console.log('wxapi checkUser fail callback_page ' + callback);
                  }
                }

              },
              fail: function () {
                console.log('wxapi checkUser fail');
                // TODO
              }
            }) 
          }
        })
      },
      fail: function () {
        console.log('login fail');
      }
    })
  },

  clearStorageVendor () {
    var that = this;
    wx.getStorageInfo({
      success: function(res) {
        for (var i = 0;i < res.keys.length;i++) {
          var key = res.keys[i];
          var isVendorKey = key.indexOf(that.data.cacheK.vendor_preffix) > -1;
          if (!isVendorKey) {
            continue;
          }
          wx.removeStorage({
            key: key,
            success: function(res) {
              console.log("Storage：删除上一个vendor成功")
            } 
          })
        }
      }
    })
  },

  updateStorageVendor (data) {
    this.clearStorageVendor();
    var vendorKey = this.data.cacheK.vendor_preffix + getApp().apiHost;
    // 缓存vendor数据
    wx.setStorage({
      key: vendorKey,
      data: data
    });
  },

  /**
   * 重新登录授权
   */
  reLogin: function (callback) {
    var that = this;
    wx.openSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {
          that.wxlogin(callback, true);;
        } else {
          console.log("alerady auth scope.userInfo");
        }
      }
    })
  },

  /**
   *  发送注册用的手机动态码
   */
  sendRegSmsCode: function (phone, callback) {
    console.log('call sendRegSmsCode ' + phone);
    var that = this;
    if (phone) {
      // 统一调用异步接口
      that.curlData('post', ('/v1/vendors/register-captcha?phone=' + phone), {}, callback);
    } else {
      console.log('phone is empty');
    }
  },

  /**
   *  发送注册用的手机动态码
   */
  sendLoginSmsCode: function (phone, callback) {
    console.log('call sendLoginSmsCode ' + phone);
    var that = this;
    if (phone) {
      // 统一调用异步接口
      that.curlData('post', ('/v1/vendors/login-captcha?phone=' + phone), {}, callback);
    } else {
      console.log('phone is empty');
    }
  },

  /**
   *  发送模板消息id
   */
  postFormId: function (formId) {
    if (formId == null || typeof formId == 'undefined') {
      return;
    }
    var that = this;
    wx.login({
      success: function (res) {
        var jsCode = res.code;
        var saveUrl = '/fcar/wechat/message/form/save';
        var rdata = { jsCode, formId }
        // console.log('postFormId', rdata)
        that.curlData('post', saveUrl, rdata, '', true);
      }
    })
  },

  setUserInfo: function (userInfo) {
    var that = this;
    // 用户登录信息
    wx.setStorage({
      key: that.data.cacheK.user_info,
      data: userInfo
    }) // end wx.setStorage
  },

  /**
   * 设置登录用户信息模板变量
   * 
   */
  setPageVars: function (userInfo) {
    var that = this;
    that.page.setData({
      userInfo: userInfo,
    })
  },


  /**
   * 页面统一回调方法
   */
  callback_page: function (func, res, opt) {
    var that = this;
    if (func && typeof (that.page[func]) == 'function') {
      console.log('wxapi callback function: ' + func);
      if (opt && typeof (opt) != 'undefined') {
        that.page[func](res, opt);
      } else {
        that.page[func](res);
      }
    }
  },
  
  /**
   * GET方式请求接口数据
   * 
   * @param enum    tag       [接口标识，详情见本类全局变量apiUrl]
   * @param array   args      [json数据，空为'[]']
   * @param string  callback  [页面回调方法名称]
   * 
   */
  getURLData: function (tag, args, callback) {
    var that = this;

    // 接口配置判断
    if (that.apiUrl[tag]) {
      // 统一调用异步接口
      that.curlData('get', that.apiUrl[tag], args, callback);

    } else {
      console.log('get error url tag, please check your url tag from wxapi apiUrl vars');
    }
  },

  /**
   * POST方式请求接口数据
   * 
   * @param enum    tag       [接口标识，详情见本类全局变量apiUrl]
   * @param array   args      [json数据，空为'[]']
   * @param string  callback  [页面回调方法名称]
   * 
   */
  postURLData: function (tag, args, callback) {
    var that = this;

    // 接口配置判断
    if (that.apiUrl[tag]) {
      // 统一调用异步接口
      that.curlData('post', that.apiUrl[tag], args, callback);

    } else {
      console.log('post error url tag, please check your url tag from wxapi apiUrl vars');
    }
  },

  //  异步接口调用
  curlData: function (rtype, path, rdata, callback, isNew) {
    if (rtype == 'post' || rtype == 'get') {
      var that = this;
      var apiHost = isNew ? getApp().apiHostNew : getApp().apiHost;
      // http请求
      wx.request({
        url: apiHost + path,
        method: rtype,
        data: rdata,
        header: {
          'content-type': 'application/json'
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          // 页面方法回调
          that.callback_page(callback, res.data, 'success');
        } 
      }); 

    } 
    else {
      console.log('request method error');
    } // end if else
  },

  showSuccessToast: function (title) {
    // 提示错误
    wx.showToast({
      icon: 'success',
      title: title,
      duration: 700,
      mask: true
    })
  },

}

module.exports.wxapi = wxapi;