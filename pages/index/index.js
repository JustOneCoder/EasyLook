/* * @Author: linfeng  
 * @createDate: 2018-12-27 11:24:35  
 * @Last Modified by: lingfeng
 * @Last Modified time: 2019-01-21 20:31:33
 * @description: 首页
 * */
import imageUtil from "../../utils/imageUtil";
var pageIndex = 1;
var pageSize = 10;//每页请求的条数
var state = false;
var loading = false;

//获取应用实例s
const app = getApp()
Page({
  data: {
    listData: [],
    bannerList:[]
  },

  /**
 * 生命周期方法，页面初始化时加载
 */
  onLoad: function (options) {
    console.log('66666onLoad')
    var that = this;
    that.imgUtil = new imageUtil(that);
    that.loadResourceList();
    that.getBannerList();
  },

  /**
 * 系统方法 下拉刷新
 */
  onPullDownRefresh: function () {
    console.log('66666Refresh');
    pageIndex = 1;
    this.data.listData = [];
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
        userid: '00248a0c8f014f08b73cedadd9c0532d',
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
        var dataList = that.data.listData;
        for (var i = 0; i < res.data.data.length; i++) {
          var dataArray = res.data.data[i];
          dataArray.pic = that.imageUrlTransform(dataArray.pic);
          dataList.push(dataArray);
        }
        if (that.pageIndex == 1) {
          that.setData({ listData: res.data.data })
        } else {
          that.setData({ listData: that.data.listData })
        }
        console.log('66666成功：' + JSON.stringify(res.data.data))
      }
    })
  },

  getBannerList:function(){
    var that = this;
    wx.request({
      url: 'https://fz.meibbc.com/information-core/controller/BannerController/getBanner.html', // 仅为示例，并非真实的接口地址
      method: 'GET',
      fail(res) {
        console.log('66666获取banner失败：' + res.data)
      },
      success(res) {
        var bannerData = [];
        for (var i = 0; i < res.data.data.length; i++) {
          var dataArray = res.data.data[i];
          dataArray.pic = that.imageUrlTransform(dataArray.pic);
          bannerData.push(dataArray);
        }
        that.setData({bannerList: bannerData })
        console.log('66666获取banner成功：' + JSON.stringify(that.data.bannerList))
      }
    })
  }
})
