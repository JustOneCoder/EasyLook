/* * @Author: linfeng  
* @createDate: 2018-12-27 11:24:35  
 * @Last Modified by: lingfeng
 * @Last Modified time: 2018-12-27 16:03:19
* @description: */

var pageIndex = 1;
var pageSize = 10;//每页请求的条数
var state = false;
var loading = false;

//获取应用实例
const app = getApp()
Page({
  data: {
    list: [],
  },

  /**
 * 生命周期方法，页面初始化时加载
 */
  onLoad: function (options) {
    console.log('66666onLoad')
    this.loadResourceList();
  },

  /**
 * 系统方法 下拉刷新
 */
  onPullDownRefresh: function () {
    console.log('66666Refresh');
    pageIndex = 1;
    this.data.list = [];
    this.loadResourceList();
  },

  /**
   * 系统方法 上滑加载更多
   */
  onReachBottom: function () {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    if (state == false) {
      pageIndex += 1;
      this.loadResourceList();
    }
    console.log('999999onLoadMore:' + pageIndex)
  },

  loadResourceList: function () {
    var that = this
    wx.request({
      url: 'https://fz.meibbc.com/information-core/controller/InformationController/listByType.html', // 仅为示例，并非真实的接口地址
      data: {
        page: pageIndex,
        pageSize: pageSize,
        userid: 'b87fc65c974f47258fa1544164967419',
        informationtypeid: '1'
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      fail(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        console.log('66666失败：' + res.data)
      },
      success(res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        var dataList = that.data.list;
        for (var i = 0; i < res.data.data.length; i++) {
          dataList.push(res.data.data[i]);
        }
        if (that.pageIndex == 1) {
          that.setData({ list: res.data.data })
        } else {
          that.setData({ list: that.data.list })
        }
        console.log('66666成功：' + JSON.stringify(res.data.data))
      }
    })
  }
})
