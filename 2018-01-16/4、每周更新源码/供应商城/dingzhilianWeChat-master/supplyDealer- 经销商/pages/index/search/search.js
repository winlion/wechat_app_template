//获取应用实例
var app = getApp();
Page({
  data: {
    imageCtx: app.globalData.imageCtx,
    search: '',
    list: [],
    page: 1,
    hidden: false,
    emptyShow: false,
    hasMore: true,
    scrollTop: 0,
    scrollHeight: 0
  },
  onLoad: function (option) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });

    console.log('搜索条件:' + option.search)
    that.setData({
      search: option.search
    })
    that.getOrders();
  },
  scroll: function (e) {
    //  该方法绑定了页面滚动时的事件，这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      scrollTop: e.detail.scrollTop
    });
  },
  search: function (e) {
    this.setData({
      search: e.detail.value
    })
  },
  goDetail: function (e) {
    var no = e.currentTarget.dataset.orderno, supplierType = e.currentTarget.dataset.type;
    if('out' == supplierType){
      wx.navigateTo({
        url: '/pages/index/orderlist2/orderDetail2/orderDetail2?orderNo=' + no
      })
    }else{
      wx.navigateTo({
        url: '/pages/index/orderlist1/orderDetail1/orderDetail1?orderNo=' + no
      })
    }
  },
  goExpress: function (e) {
    var no = e.currentTarget.dataset.expressno, code = e.currentTarget.dataset.expresscode;;
    wx.navigateTo({
      url: '/pages/index/logistics/logistics?express_code=' + code + '&express_no=' + no
    })
  },
  getOrders: function () {
    var that = this, search = that.data.search, reg = /^\s*|\s*$/g;
    search = search.replace(reg, '');
    if (!search) {
      app.warning('请输入订单名称或单号');
      return;
    }
    that.setData({
      list: [],
      page: 1,
      emptyShow: false,
      hidden: false,
      scrollTop: 0
    })
    that.commonSearch(that, 'one');
  },
  bindDownLoad: function () {
    var that = this;
    that.commonSearch(that, 'more');
  },
  goTop: function () {
    this.setData({
      scrollTop: 0
    });
  },
  commonSearch: function (that, difference) {
    var search = that.data.search, reg = /^\s*|\s*$/g;
    search = search.replace(reg, '');
    if (!search) {
      app.warning('请输入订单名称或单号');
      return;
    }
    var params = {}, page = that.data.page, adminObj = app.globalData.adminObj;
    params.query = that.data.search;
    params.pageNumber = page;
    params.phone = adminObj.phone;
    params.password = app.globalData.password;
    params.sessionId = adminObj.sessionId;

    wx.request({
      url: app.globalData.requestUrl + "weixinMerchant/searchOrders",
      header: {
        'content-type': 'multipart/x-www-form-urlencoded;charset=UTF-8'
      },
      data: params,
      success: function (res) {
        that.setData({
          hidden: true
        })
        if (res.data.code == '0') {
          var reqList = res.data.pageResults.list;
          if (reqList != null && reqList.length > 0) {
            var listNew = that.data.list.concat(reqList);
            that.setData({
              list: listNew,
              page: page + 1,
              hasMore: true
            })
          } else {
            that.setData({
              hasMore: false
            })
            //one为点击搜索,more为上拉加载
            if (difference == 'one') {
              that.setData({
                emptyShow: true
              })
            } else {
              that.setData({
                emptyShow: false
              })
            }
          }
        } else {
          app.noLogin(res.data.msg);
        }
      },
      fail: function (res) {
        that.setData({
          hidden: true
        })
        app.warning("服务器无响应");
      }
    })
  }
})