
(function () {
    var app = window.us = angular.module("secondKill", ['ui.router']);

    // 初始化一些$rootScope全局变量
    app.run(function ($rootScope) {
        // 存储members信息
        $rootScope.goodsList = [];

        // goods 只有""和skgoods 两个值
        $rootScope.listPageParam = { "searchText": "", 
                                    "sort": "", 
                                    "pageSize": "", 
                                    "currentPage": "",
                                    "pageCount": "",
                                    "totalCount": "", 
                                    "goods": "",
                                    "minPrice": "",
                                    "maxPrice": "" };
        $rootScope.user = {};
        $rootScope.wcome = " ";
        $rootScope.name = " ";
    });

    // 路由
    app.config(function ($stateProvider, $urlRouterProvider) {
        var loginState = {
            name: 'login',
            url: '/login',
            templateUrl: '../html/login.html',
            controller: 'login'
        };

        var goodsListState = {
            name: 'goodsList',
            url: '/goodsList?pageIndex',
            templateUrl: '../html/Goods_List.html',
            controller: 'goodsList'
        };

        var detailState = {
            name: 'detail',
            url: '/detail?id&goods',
            templateUrl: '../html/detail.html',
            controller: 'detail'
        };

        var createOrderState = {
            name: 'createOrder',
            url: '/create_order?orderNumber',
            templateUrl: '../html/create_order.html',
            controller: 'createOrder'
        };

        var managerAddressState = {
            name: 'managerAddress',
            url: '/managerAddress',
            templateUrl: '../html/managerAddress.html',
            controller: 'managerAddress'
        };

        var shopingCartState = {
            name: 'shopingCart',
            url: '/shopingCart',
            templateUrl: '../html/shopingCart.html',
            controller: 'shopingCart'
        };

        $stateProvider.state(loginState);
        $stateProvider.state(goodsListState);
        $stateProvider.state(detailState);
        $stateProvider.state(createOrderState);
        $stateProvider.state(managerAddressState);
        $stateProvider.state(shopingCartState);

        $urlRouterProvider.otherwise('/goodsList');
    });

    // topController top页面的controller
    app.controller("top", function($rootScope, $scope, $http, $state){

        init();

        function init(){
            $http({
                method: "GET",
                url: "http://localhost:8080/user/get",
                withCredentials: true
            }).then(function(resp){
                var user = resp.data;
                if(user) {
                    $rootScope.user = user; 
                    $rootScope.name = $rootScope.user.name;
                    $rootScope.wcome = "你好 ";
                } else {
                    $rootScope.wcome = "Hi, 请 ";
                    $rootScope.name = "登录";
                }
            });
        }

         // 转到登录页面
         $scope.toLogin = function () {
            if (JSON.stringify($rootScope.user) === '{}') {
                $state.go("login");
            } else {
                return false;
            }
        };

        // 转到地址管理页面
        $scope.toAddress = function() {
            $state.go("managerAddress");
        }

        //转到首页
        $scope.toGoodsList = function() {
            $state.go("goodsList");
        }

        // 转到购物车
        $scope.toShopingCart = function() {
            $state.go("shopingCart");
        }

        // 注销用户
        $scope.logoff = function () {
            if (JSON.stringify($rootScope.user) === '{}') {
                return false;
            }

            $http({
                method: "POST",
                url: "http://localhost:8080/login/logoff",
                withCredentials: true
            }).then(function (resp) {
                var data = resp.data;
                if (data.data == true) {
                    $rootScope.user = {};
                    layer.open({
                        content: "注销成功！",
                        time: 2000,
                        offset: '400px'
                    });
                    $rootScope.wcome = "Hi, 请 ";
                    $rootScope.name = "登录";
                    loadInformation();
                }
            });
        };
        
    });

    // loginController
    app.controller("login", function ($rootScope, $scope, $http, $state) {
        $scope.login = function () {
            $http({
                method: "POST",
                withCredentials: true,
                url: "http://localhost:8080/login/do_login",
                params: { 'mobile': $scope.mobile, 'password': $scope.password }
            }).then(function (resp) {
                var data = resp.data;
                if (data.code === 0) {
                    $state.go("goodsList");
                } else {
                    layer.open({
                        content: data.msg,
                        time: 2000,
                        offset: '400px'
                    });
                }
            });
        }
    });

    // goodsListController
    app.controller("goodsList", function ($rootScope, $scope, $http, $state, $stateParams) {

        $scope.pageData = {
            currentPage: 0,
            totalPageCount:0
        };
        
        $scope.pageData.currentPage = $stateParams["pageIndex"] ? $stateParams["pageIndex"] : 1;
        $rootScope.listPageParam.currentPage = $scope.pageData.currentPage;

        loadInformation();

        //  页面初始化
        function loadInformation() {
            
            $http({
                method: "POST",
                url: "http://localhost:8080/goods/to_list",
                withCredentials: true,
                params: {
                    'searchText': $rootScope.listPageParam.searchText,
                    'sort': $rootScope.listPageParam.sort,
                    'pageSize': $rootScope.listPageParam.pageSize,
                    'currentPage': $rootScope.listPageParam.currentPage,
                    'goods': $rootScope.listPageParam.goods,
                    'minPrice': $rootScope.listPageParam.minPrice,
                    'maxPrice': $rootScope.listPageParam.maxPrice
                }
            }).then(function (resp) {
                var data = resp.data;
                if (data != null) {
                    $rootScope.goodsList = data.goodsList;

                    if (data.page) {
                        var page = data.page;
                        $rootScope.listPageParam.sort = page.sort;
                        $rootScope.listPageParam.pageSize = page.pageSize;
                        
                        $scope.pageData.totalPageCount = page.pageCount;
                        $rootScope.listPageParam.pageCount = page.pageCount;
                        $rootScope.listPageParam.totalCount = page.totalCount; 
                    }
                } else {
                    layer.open({
                        content: "没有加载到商品信息！",
                        time: 2000,
                        offset: '400px'
                    });
                }
            });
        };


        // 获取秒杀商品信息
        var isSelectSkill = false;
        $scope.getSkGoods = function ($event) {
            if (!isSelectSkill) {
                $rootScope.listPageParam.goods = "skgoods";
                $scope.pageData.currentPage = $rootScope.listPageParam.currentPage = 1;
                isSelectSkill = true;
                $($event.target).addClass("skill-selected");
            } else {
                $rootScope.listPageParam.goods = "";
                isSelectSkill = false;
                $($event.target).removeClass("skill-selected");
            }
            
            loadInformation();
        };

        // 更新购买商品数量
        $scope.modifyBuyNum = function (id, num) {

            id = "buyNum_" + id;
            // 获取当前购买数量
            var curNum = $("#" + id).parent().find("input").val();

            if (parseInt(curNum) > 99 && num > 0) {
                layer.open({
                    content: "最大购买数为99",
                    time: 2000,
                    offset: '400px'
                });
                return false;
            } else if (parseInt(curNum) <= 1 && num < 0) {
                layer.open({
                    content: "最小购买数为1",
                    time: 2000,
                    offset: '400px'
                });
                return false;
            }
            curNum = parseInt(curNum) + parseInt(num);
            // 更新购买数量
            $("#" + id).parent().find("input").val(curNum);

        };

        //加入购物车
        $scope.addCart = function (goodsId) {
            if (JSON.stringify($rootScope.user) === '{}') {
                layer.open({
                    content: "您还没有登录，请先登录",
                    time: 2000,
                    offset: '400px'
                });
            } else {
                id = "buyNum_" + goodsId;
                // 获取当前购买数量
                var curNum = $("#" + id).parent().find("input").val();

                if (curNum > 99) {
                    layer.open({
                        content: "最大购买数为99",
                        time: 2000,
                        offset: '400px'
                    });
                    return false;
                }

                $http({
                    method: "POST",
                    url: "http://localhost:8080/cart/add_cart",
                    params: {
                        'goodsId': goodsId,
                        'userId': $rootScope.user.id,
                        'goodsNumber': curNum
                    }
                }).then(function (resp) {
                    var data = resp.data;
                    if (data.code === 0) {
                        layer.open({
                            content: "加入购物车成功",
                            time: 2000,
                            offset: '400px'
                        });
                    } else {
                        layer.open({
                            content: "加入购物车失败",
                            time: 2000,
                            offset: '400px'
                        });
                    }
                });
            }
        };

        //转到detail页面
        $scope.toDetail = function (id) {
            var goodsNumber = $("#buyNum_"+id).val()
            $state.go("detail",{"id" : id, "goodsNumber" : goodsNumber, "goods": $rootScope.listPageParam.goods});
        };

        //搜索商品
        $scope.searchName = function ($event) {
            var searchText = $($event.target).parent().parent().find("input").val();
            if (searchText.length == 0) {
                $rootScope.listPageParam.searchText = "";
                loadInformation();
            } else {
                $rootScope.listPageParam.searchText = searchText;
                loadInformation();  
            }
        };

        // 价格筛选
        $scope.searchPrice = function () {
           var minPrice =  $("input[name='minPrice']").val();
           var maxPrice =  $("input[name='maxPrice']").val();
           $rootScope.listPageParam.minPrice = minPrice;
           $rootScope.listPageParam.maxPrice = maxPrice;
           loadInformation();
        };

        // 取消价格筛选
        $scope.resetSearchPrice = function () {
            $("input[name='minPrice']").val("");
            $("input[name='maxPrice']").val("")
            $rootScope.listPageParam.minPrice = "";
            $rootScope.listPageParam.maxPrice = "";
            loadInformation();
         };

         // go current page.
        $scope.goPage = function (index) {
        $state.go("goodsList", { "pageIndex": index });
        };

        // 转到购物车
        $scope.toShopingCart = function() {
            $state.go("shopingCart");
        }

    });

    // detail Controller
    app.controller("detail", function($rootScope, $scope, $http, $filter, $state, $stateParams, $interval){

        var id = $stateParams["id"];
        var goods = $stateParams["goods"];
        var goodsNumber = $stateParams["goodsNumber"];
        //秒杀状态 :0 未开始, 1 正在进行中, 2 秒杀已结束
        $scope.secondkillStatus = 0;
        $scope.remainSeconds = 0;
        $scope.goods = {};
        $scope.skStatusText = "";
        $scope.skDate = "";
        $scope.orderId = "";

        init();

        // 获取商品信息
        function init() {
            $http({
                method: "GET",
                url: "http://localhost:8080/goods/to_detail",
                withCredentials: true,
                params: {
                    'id': id,
                    'goods': goods,
                }
            }).then(function(resp){
                var data = resp.data;
                if (data) {
                    $scope.goods = data.goods;
                    $scope.secondkillStatus = data.secondkillStatus;
                    $scope.remainSeconds = data.remainSeconds;
                    

                    if ($scope.secondkillStatus == 0) {
                        $scope.skStatusText = "秒杀未开始";
                        formatSkDate($scope.remainSeconds);
                    } else if ($scope.secondkillStatus == 1) {
                        $scope.skStatusText = "秒杀进行中";
                    } else {
                        $scope.skStatusText = "秒杀已结束";
                    }
                }
            });
        };

        // 倒计时
        function formatSkDate(date) {
            timeHander = $interval(function(){
                
                if ($scope.remainSeconds < 0) {
                    $interval.cancel(timeHander);
                    $scope.skStatusText = "秒杀进行中";
                } else {
                    $scope.remainSeconds = parseInt($scope.remainSeconds) - 1;
                    $scope.skDate = formatDate($scope.remainSeconds);
                }


            }, 1000)   
        }

        // 格式化时间
        function formatDate(time) {
            mytime = parseInt(time);
            var seconds = 0;
            var mins = 0;
            var hours = 0;
            var days = 0;
            var date = "";

            if (mytime >= 60) {
                mins = parseInt(mytime/60) ;
                seconds = parseInt(mytime%60);
            }

            if (mins >= 60) {
                hours = parseInt(mins/60);
                mins = parseInt(mins%60);
            }

            if (hours >= 24) {
                days = parseInt(hours/24);
                hours = parseInt(hours%24);
            }

            if (days > 0) {
                date = date + days + " 天";
            }

            if (hours > 0) {
                date = date + hours + " 时";
            }

            if (mins > 0) {
                date = date + mins + " 分";
            }

            if (seconds > 0) {
                date = date + seconds + " 秒";
            }

            return date;
        }

        // 立即购买
        $scope.shopingNow = function (goodsId) {
            id = "buyNum_" + goodsId;
            // 获取当前购买数量
            var curNum = $("#" + id).parent().find("input").val();
            var goodsInformation = goodsId+":"+curNum;

            $http({
                method: "POST",
                url: "http://localhost:8080/order/create_order",
                withCredentials: true,
                params: {
                    'goodsInformation': goodsInformation
                }
            }).then(function(resp){
                if (resp.data) {
                    var orderNumber = resp.data;
                    $state.go("createOrder", {"orderNumber":orderNumber});
                }
            });
            
        }


         // 更新购买商品数量
         $scope.modifyBuyNum = function (id, num) {

            id = "buyNum_" + id;
            // 获取当前购买数量
            var curNum = $("#" + id).parent().find("input").val();

            if (parseInt(curNum) > 99 && num > 0) {
                layer.open({
                    content: "最大购买数为99",
                    time: 2000,
                    offset: '400px'
                });
                return false;
            } else if (parseInt(curNum) <= 1 && num < 0) {
                layer.open({
                    content: "最小购买数为1",
                    time: 2000,
                    offset: '400px'
                });
                return false;
            }
            curNum = parseInt(curNum) + parseInt(num);
            // 更新购买数量
            $("#" + id).parent().find("input").val(curNum);

        };

        //加入购物车
        $scope.addCart = function (goodsId) {
            if (JSON.stringify($rootScope.user) === '{}') {
                layer.open({
                    content: "您还没有登录，请先登录",
                    time: 2000,
                    offset: '400px'
                });
            } else {
                id = "buyNum_" + goodsId;
                // 获取当前购买数量
                var curNum = $("#" + id).parent().find("input").val();

                if (curNum > 99) {
                    layer.open({
                        content: "最大购买数为99",
                        time: 2000,
                        offset: '400px'
                    });
                    return false;
                }

                $http({
                    method: "POST",
                    url: "http://localhost:8080/cart/add_cart",
                    withCredentials: true,
                    params: {
                        'goodsId': goodsId,
                        'userId': $rootScope.user.id,
                        'goodsNumber': curNum
                    }
                }).then(function (resp) {
                    var data = resp.data;
                    if (data.code === 0) {
                        layer.open({
                            content: "加入购物车成功",
                            time: 2000,
                            offset: '400px'
                        });
                    } else {
                        layer.open({
                            content: "加入购物车失败",
                            time: 2000,
                            offset: '400px'
                        });
                    }
                });
            }
        };

 
    });

    // createOrder Controller
    app.controller("createOrder", function($rootScope, $scope, $http, $filter, $state, $stateParams){

        $scope.orderNumber = $stateParams['orderNumber'];
        $scope.countMoney = 0;
        $scope.orderInfos = [];
        $scope.addresses = [];
        $scope.addressId = 0;

        init();

        function init() {
            $http({
                method: "GET",
                url: "http://localhost:8080/order/order_detail",
                withCredentials: true,
                params: {
                    'orderNumber': $scope.orderNumber
                }
            }).then(function(resp){
                if (resp.data) {
                    var data = resp.data;
                    $scope.orderInfos = data.orderInfos;
                    $scope.addresses = data.addresses;

                    for(var i=0; i<$scope.orderInfos.length; i++) {
                        $scope.countMoney = parseInt($scope.orderInfos[i].goodsPrice)  * parseInt($scope.orderInfos[i].goodsCount) + $scope.countMoney;
                    }
                }
            });
        }

        //改变选中地址样式
        $scope.selectAddress = function(id) {
            $scope.addressId = id;
            var addressObjs = $(".address-list .address");

            for(var i = 0; i < addressObjs.length; i++) {
                var addressId = $(addressObjs[i]).attr("id");

                if(id == addressId) {
                    $(addressObjs[i]).css("border", "3px dashed red");
                } else {
                    $(addressObjs[i]).css("border", "1px dashed #666666");
                }
            }  
        };

        $scope.createOrder = function() {
            if ($scope.addressId === 0) {
                layer.open({
                    content: "请选择地址",
                    time: 2000,
                    offset: '400px'
                });
            } else {
                alert("创建订单");
            }
        };

        // 新增地址
        $scope.createAddress = function(){
            $scope.showCreateAddress();
        }

        // 去地址管理页面
        $scope.managerAddress = function(){
            $state.go("managerAddress");
        }

        // 取消注册
        $scope.addCancle = function(){
            $("#consigneeName").val("");
            $("#mobile").val("");
            $("#address").val("");
            $scope.closeCreateAddress();
        }

        //提交数据
        $scope.addSubmit = function(){
            var consigneeName =$("#consigneeName").val(); 
            var mobile = $("#mobile").val();
            var address = $("#address").val();

            if(consigneeName.length <= 0 || mobile.length <= 0 || address.length <= 0) {
                return false;
            } else {
                $http({
                    method: "POST",
                    url: "http://localhost:8080/address/insert",
                    withCredentials: true,
                    params: {
                        'consigneeName': consigneeName,
                        'mobile': mobile,
                        'address': address
                    }
                }).then(function(resp){
                    var data = resp.data;
                    var msg = data.data.msg;
                    layer.open({
                        content: "添加成功！",
                        time: 2000,
                        offset: '400px'
                    });

                    $scope.closeCreateAddress();
                    init();
                });
            }
        }

        //通用数据检查
        $scope.validation =  function ($event){
            var text = $($event.target).val();
            var id = $($event.target).parent().parent().attr("id");
            var idstr = '#'+id;
            if (text.length <= 0) {
                layer.tips('输入内容不符合格式', idstr, {tips:[2, 'red']});
            }
        }

        // 检查手机号格式
        $scope.validationMobile =  function ($event){
            var macth = /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,2,3,5-9]))\\d{8}$/; 
            var text = $($event.target).val();
            var macthResult = macth.test(text);
            var id = $($event.target).parent().parent().attr("id");
            var idstr = '#'+id;
            if (text.length <= 0 || text.length != 11) {
                layer.tips('手机号不符合格式', idstr, {tips:[2, 'red']});
            }
        }

        // 关闭弹窗
        $scope.closeCreateAddress = function() {
            $(".create-address").css("display", "none");
            $(".content").css("display", "none");
            $(".pop").css("display", "none"); 
        }

        // 弹出弹窗
        $scope.showCreateAddress = function() {
            $(".create-address").css("display", "block");
            $(".content").css("display", "block");
            $(".pop").css("display", "block"); 
        }
    });

    // 管理地址页面controller
    app.controller("managerAddress", function($rootScope, $scope, $http, $filter, $state, $stateParams){
        $scope.addresses = [];
        $scope.singleAddress = {};
        init();

        function init() {
            $http({
                method: "GET",
                url: "http://localhost:8080/address/list",
                withCredentials: true
            }).then(function(resp){
                var data = resp.data;
                if(data.data) {
                    $scope.addresses = data.data;
                }

            });
        }

        // 删除地址
        $scope.deleteAddress = function(id){
            $http({
                method: "POST",
                url: "http://localhost:8080/address/delete",
                withCredentials: true,
                params: {
                    'id': id
                }
            }).then(function(resp){
                var data = resp.data;
                if(data.data) {
                    var msg = data.data.msg;
                    layer.open({
                        content: msg,
                        time: 2000,
                        offset: '400px'
                    });
                    init();
                }

            });
        }

        // 修改地址
        $scope.showUpdateDiv = function(id){
            $http({
                method: "GET",
                url: "http://localhost:8080/address/get_address",
                withCredentials: true,
                params: {
                    'addressId': id
                }
            }).then(function(resp){
                var data = resp.data;
                if(data.data) {
                    $scope.singleAddress = data.data;
                    $(".pop #consigneeName").val($scope.singleAddress.consigneeName);
                    $(".pop #mobile").val($scope.singleAddress.mobile);
                    $(".pop #address").val($scope.singleAddress.address);
                    $scope.showCreateAddress();
                }

            });
        }

         // 取消注册
         $scope.updateCancle = function(){
            $(".pop #consigneeName").val("");
            $(".pop #mobile").val("");
            $(".pop #address").val("");
            $scope.closeCreateAddress();
        }

        //提交数据
        $scope.updateAddress = function(){
            var consigneeName =$(".pop #consigneeName").val(); 
            var mobile = $(".pop #mobile").val();
            var address = $(".pop #address").val();

            if(consigneeName.length <= 0 || mobile.length <= 0 || address.length <= 0) {
                return false;
            } else {
                $http({
                    method: "POST",
                    url: "http://localhost:8080/address/update",
                    withCredentials: true,
                    params: {
                        'id': $scope.singleAddress.id,
                        'consigneeName': consigneeName,
                        'mobile': mobile,
                        'address': address
                    }
                }).then(function(resp){
                    var data = resp.data;
                    var msg = data.data.msg;
                    layer.open({
                        content: msg,
                        time: 2000,
                        offset: '400px'
                    });

                    $scope.closeCreateAddress();
                    init();
                });
            }
        }

        //通用数据检查
        $scope.validation =  function ($event){
            var text = $($event.target).val();
            var id = $($event.target).parent().parent().attr("id");
            var idstr = '#'+id;
            if (text.length <= 0) {
                layer.tips('输入内容不符合格式', idstr, {tips:[2, 'red']});
            }
        }

        // 检查手机号格式
        $scope.validationMobile =  function ($event){
            var macth = /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,2,3,5-9]))\\d{8}$/; 
            var text = $($event.target).val();
            var macthResult = macth.test(text);
            var id = $($event.target).parent().parent().attr("id");
            var idstr = '#'+id;
            if (text.length <= 0 || text.length != 11) {
                layer.tips('手机号不符合格式', idstr, {tips:[2, 'red']});
            }
        }

         // 关闭弹窗
         $scope.closeCreateAddress = function() {
            $(".create-address").css("display", "none");
            $(".pop .content").css("display", "none");
            $(".pop").css("display", "none"); 
        }

        // 弹出弹窗
        $scope.showCreateAddress = function() {
            $(".create-address").css("display", "block");
            $(".pop .content").css("display", "block");
            $(".pop").css("display", "block"); 
        }
    });

    //购物车列表页面
    app.controller("shopingCart", function($rootScope, $scope, $http, $filter, $state, $stateParams){

        $scope.currentPage = 0;
        $scope.goods = [];
        $scope.countNumber = 0;


        init();
        function init() {
            $http({
                method: "GET",
                url: "http://localhost:8080/cart/list",
                withCredentials: true,
                params: {
                    "currentPage": $scope.currentPage
                }
            }).then(function(resp){
                var data = resp.data;
                if(data) {
                    $scope.goods = data.list;
                } else {
                    layer.open({
                        content: "获取购物车信息失败",
                        time: 2000,
                        offset: '400px'
                    });
                }

            });
        }

         // 更新购买商品数量
         $scope.modifyBuyNum = function (scId, num) {

            id = "buyNum_" + scId;
            // 获取当前购买数量
            var curNum = $("#" + id).parent().find("input").val();

            if (parseInt(curNum) > 99 && num > 0) {
                layer.open({
                    content: "最大购买数为99",
                    time: 2000,
                    offset: '400px'
                });
                return false;
            } else if (parseInt(curNum) <= 1 && num < 0) {
                layer.open({
                    content: "最小购买数为1",
                    time: 2000,
                    offset: '400px'
                });
                return false;
            }
            curNum = parseInt(curNum) + parseInt(num);

            $http({
                method: "POST",
                url: "http://localhost:8080/cart/update",
                withCredentials: true,
                params: {
                    "id": scId,
                    "goodsNumber": curNum
                }
            }).then(function(resp){
                var data = resp.data;
                if(data) {
                    // 更新购买数量
                $("#" + id).parent().find("input").val(curNum);
                $("#numberSpan_"+scId).html(curNum);
                } 
            });

            

        };

        //计算选中购买商品总金额
        $scope.checkBoxClick = function(price, number, scId) {
            var countMoney = parseInt(price)  * parseInt(number)

            var isChecked = $("#checkBox_"+scId).prop("checked");

            if(isChecked) {
                $scope.countNumber = $scope.countNumber +countMoney;
            } else {
                $scope.countNumber = $scope.countNumber - countMoney;
            }
        }

        // 选中所有的商品
        $scope.checkAll = function() {
            var isChecked = $("#checkedAll").prop("checked");
            var goodsObjects = $(".goods-content .goods .check-box");

            if(isChecked) {
                for(var i=0; i<goodsObjects.length; i++) {
                    $(goodsObjects[i]).attr("checked",true);
                    var price = $(goodsObjects[i]).parent().find(".goods-price").text();
                    var number = $(goodsObjects[i]).parent().find(".input-border").val();
                    $scope.countNumber = parseInt(price) * parseInt(number) + $scope.countNumber;
                }
            } else {
                for(var i=0; i<goodsObjects.length; i++) {
                    $(goodsObjects[i]).attr("checked",false);
                    $scope.countNumber = 0;
                }
            }
        }

        //结算
        $scope.createOrder = function() {
            $scope.goodsInfomation = "";
            var goodsObjects = $(".goods-content .goods .check-box");

            for(var i=0; i<goodsObjects.length; i++) {
                var isChecked = $(goodsObjects[i]).prop("checked");
                if(isChecked) {
                    var number = $(goodsObjects[i]).parent().find(".input-border").val();
                    var id = $(goodsObjects[i]).parent().attr("id");
                    if (i === (goodsObjects.length -1)) {
                        $scope.goodsInfomation = $scope.goodsInfomation +id+":"+number;
                    } else {
                        $scope.goodsInfomation = $scope.goodsInfomation +id+":"+number+",";
                    }
                }
            }

            $http({
                method: "POST",
                url: "http://localhost:8080/order/create_order",
                withCredentials: true,
                params: {
                    'goodsInformation': $scope.goodsInfomation
                }
            }).then(function(resp){
                if (resp.data) {
                    var orderNumber = resp.data;
                    $state.go("createOrder", {"orderNumber":orderNumber});
                }
            });

        }
    });

    //Top directive
    window.us.directive("usTop", function () {
        return {
          restrict: "A",
          replace: true,
          templateUrl: "../html/top.html",
          controller: "top"
        }
      });

      // Pagination directive.
    window.us.directive("usPagination", function () {
    return {
      restrict: "A",
      scope: {
        pageData: '=pageData',
        goPage: "&goPage"
      },
      replace: true,
      templateUrl: "../html/pagenation.html",
      link: function (scope) {
          scope.pages = [];
          scope.totalPageCount = scope.pageData.totalPageCount;
          scope.currentPage = scope.pageData.currentPage;

        // 获取要显示页数长度
        scope.maxButtonNum = Math.min(5, scope.totalPageCount);
        //获取要显示页数页码
        scope.pages = getRange(scope.currentPage,scope.totalPageCount,scope.maxButtonNum);

        scope.$watch('pageData', (newValue, oldValue) => {
            scope.maxButtonNum = Math.min(5, newValue.totalPageCount);
            scope.totalPageCount = newValue.totalPageCount;
            scope.currentPage = newValue.currentPage;
            scope.pages = getRange(newValue.currentPage, newValue.totalPageCount, scope.maxButtonNum);
        }, true);

        // 分页算法
        function getRange(curr, all, count) {
          //计算显示的页数
          curr = parseInt(curr);
          all = parseInt(all);
          count = parseInt(count);
          var from = curr - parseInt(count / 2);
          var to = curr + parseInt(count / 2) + (count % 2) - 1;
          //显示的页数容处理
          if (from <= 0) {
            from = 1;
            to = from + count - 1;
            if (to > all) {
              to = all;
            }
          }
          if (to > all) {
            to = all;
            from = to - count + 1;
            if (from <= 0) {
              from = 1;
            }
          }
          var range = [];
          for (var i = from; i <= to; i++) {
            range.push(i);
          }
          return range;
        }

        scope.click = function (pageIndex) {
          scope.goPage(pageIndex);
        }
      }
    }
  });

})();