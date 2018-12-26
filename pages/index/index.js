//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    list: [],
  },

  onLoad: function (options) {
    console.log('66666onLoad')
    var that = this
    wx.request({
      url: 'https://fz.meibbc.com/information-core/controller/InformationController/listByType.html', // 仅为示例，并非真实的接口地址
      data: {
        page: '1',
        pageSize: '20',
        userid: 'b87fc65c974f47258fa1544164967419',
        informationtypeid: '1'
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      fail(res) {
        
        console.log('66666失败：' + res.data)
      },
      success(res) {
        that.setData({list: res.data.data})
        console.log('66666成功：' + JSON.stringify(res.data.data))
      }
    })
  }
})
