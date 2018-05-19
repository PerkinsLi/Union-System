(function () {
  var app = window.us = angular.module("secondKill", ['ui.router', 'ngCookies']);

  app.constant('constantMethod', {
    getMembersCountAPI: "http://localhost:8081/api/getMembersCount",
    getMembersAPI: "http://localhost:8081/api/getMembers",
    loginPath: "http://localhost:8081/api/login"
  });

  // 初始化一些$rootScope全局变量
  app.run(function($rootScope) {
    // 存储members信息
    $rootScope.members = [];
});
  // stateProvider.
  app.config(function ($stateProvider, $urlRouterProvider) {
    var loginState = {
      name: 'login',
      url: '/login',
      templateUrl: '../html/login.html',
      controller: 'login'
    };

    var membersState = {
      name: 'members',
      url: '/members?pageIndex',
      templateUrl: '../html/members.html',
      controller: 'members'
    };

    var detailState = {
      name: 'detail',
      url: '/detail/:id',
      templateUrl: '../html/detail.html',
      controller: 'detail',
    };

    $stateProvider.state(loginState);
    $stateProvider.state(membersState);
    $stateProvider.state(detailState);

    $urlRouterProvider.otherwise('/login');
  });

  // Login controller.
  app.controller("login", function ($rootScope, $scope, $http, $state, $cookies, constantMethod) {
    $rootScope.title = "Login";
    $rootScope.loginBgState = false;
    $scope.showState = false;
    $scope.loginError = "";
    $rootScope.loginBgState = $rootScope.title === "Login";

    $scope.login = function () {
      $http({
        method: "POST",
        url: constantMethod.loginPath,
        data: { username: $scope.username, password: $scope.password }
      }).then(function (response) {
        if (response.data) {
          $cookies.put("userName", $scope.username);
          $state.go("members");
        } else {
          $scope.loginError = "无效的用户名或密码";
          $scope.showState = true;
        }
      });
    }

    $scope.keyDownEvent = function () {
      if (event.keyCode == "13") {
        $scope.login();
      }
    }
  });

  // Navigation controller.
  app.controller("navigationController", function ($rootScope, $scope, $http, $cookies) {
    $scope.currentLevelOneSelecteIndex = 0;
    $scope.currentLevelTwoSelecteIndex = 0;
    $scope.userName = $cookies.get("userName");

    $scope.nav = [
      {
        name: "工会",
        signIcon: "../images/union_icn@2x.png",
        stateIcon: "../images/up_arrow.png",
        selected: false,
        expand: false,
        subNavs: [
          {
            name: "工会会员信息",
            signIcon: "../images/union_icn@2x.png",
            selected: false
          },
          {
            name: "工会组织架构",
            signIcon: "../images/union_icn@2x.png",
            selected: false
          },
          {
            name: "审批入会",
            signIcon: "../images/union_icn@2x.png",
            selected: false
          },
          {
            name: "导入员工信息",
            signIcon: "../images/union_icn@2x.png",
            selected: false
          }]
      },

      {
        name: "临时群组",
        signIcon: "../images/union_icn@2x.png",
        stateIcon: "../images/up_arrow.png",
        selected: false,
        expand: false,
        subNavs: [
          {
            name: "群组一",
            signIcon: "../images/union_icn@2x.png",
            selected: false,
          },
          {
            name: "群组二",
            signIcon: "../images/union_icn@2x.png",
            selected: false
          }]
      },
      {
        name: "实体劵发放管理",
        signIcon: "../images/union_icn@2x.png",
        selected: false,
        subNavs: []
      },
      {
        name: "第三方电子劵管理",
        signIcon: "../images/union_icn@2x.png",
        selected: false,
        subNavs: []
      }
    ];

    //Level one menu IsSelected, change background color.
    $scope.navLevelOneSelected = function (index) {
      var navindex = $scope.nav[index];
      app.selected = !app.selected;

      for (var oneIndex in $scope.nav) {
        var elementOne = $scope.nav[oneIndex];
        elementOne.selected = false;
        for (var twoIndex in elementOne.subNavs) {
          elementOne.subNavs[twoIndex].selected = false;
        }
      }

      if (navindex !== $scope.currentSelecteIndex) {
        $scope.nav[$scope.currentLevelOneSelecteIndex].selected = false;
        $scope.nav[index].selected = true;
        $scope.currentLevelOneSelecteIndex = index;
      }
    };

    // Level two menu IsSelected then change background color.
    $scope.navLevelTwoSected = function (levelOneIndex, levelTwoIndex) {
      for (var oneIndex in $scope.nav) {
        var elementOne = $scope.nav[oneIndex];
        elementOne.selected = false;
        for (var twoIndex in elementOne.subNavs) {
          elementOne.subNavs[twoIndex].selected = false;
        }
      }

      $scope.nav[levelOneIndex].subNavs[levelTwoIndex].selected = true;
      $scope.currentLevelTwoSelecteIndex = levelTwoIndex;
    }

    // Expand menu.
    $scope.navExpand = function (index) {
      if ($scope.nav[index].expand) {
        $scope.nav[index].expand = false;
        $scope.nav[index].stateIcon = "../images/up_arrow.png";
      } else {
        $scope.nav[index].expand = true;
        $scope.nav[index].stateIcon = "../images/down_arrow.png";
      }
    }
  });

  // members controller
  window.us.controller("members", function ($rootScope, $scope, $http, $cookies, $location, $state, $stateParams, constantMethod) {
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.membersCount = 0;
    $scope.pagesCount = 9;
    $scope.maxButtonNum = 5;
    $scope.buttonNums = 1;


    $scope.userName = $cookies.get("userName");
    $scope.currentPage = $stateParams["pageIndex"];
    $rootScope.title = "Members";
    $rootScope.loginBgState = $rootScope.title === "Login";

      init();


    // Members page default information.
    function init() {
      $http({
        method: "GET",
        url: constantMethod.getMembersCountAPI
      }).then(function (response) {
        if (response.data) {
          $scope.membersCount = response.data;
          $scope.pagesCount = 1 + parseInt(($scope.membersCount - 1) / $scope.pageSize);
          $scope.currentPage = $stateParams["pageIndex"] ? $stateParams["pageIndex"] : 1;

          $scope.loadMembers($scope.currentPage, $scope.pageSize);
        }
      });
    }

    // load members information.
    $scope.loadMembers = function (currentPage, pageSize) {
      $http({
        method: "POST",
        url: constantMethod.getMembersAPI,
        data: {
          pageIndex: currentPage,
          pageSize: pageSize
        }
      }).then(function (response) {
        $rootScope.members = response.data;
      });
    }

    // go current page.
    $scope.goPage = function (index) {
      $state.go("members", { "pageIndex": index });
    }
  });

  window.us.controller("detail", function ($rootScope, $scope, $http, $stateParams, constantMethod) {
    $scope.id = $stateParams["id"];
    $scope.member = [];
    $rootScope.title = "Detail";
    $rootScope.loginBgState = $rootScope.title === "Login";

    $http({
      method: "POST",
      url: constantMethod.getMembersAPI,
      data: {
        pageIndex: $scope.id,
        pageSize: 1
      }
    }).then(function (response) {
      $scope.member = response.data;
    });
  });

  // Information list div model directive.
  window.us.directive("usInformation", function () {
    return {
      restrict: "A",
      replace: true,
      templateUrl: "../html/informationList.html"
    }
  });

  // Pagination directive.
  window.us.directive("usPagination", function () {
    return {
      restrict: "A",
      scope: {
        currentPage: "=currentPage",
        totalPageCount: "=totalPageCount",
        goPage: "&goPage"
      },
      replace: true,
      templateUrl: "../html/pagination.html",
      link: function (scope) {
        // 获取要显示页数长度
        scope.maxButtonNum = Math.min(5, scope.totalPageCount);
        //获取要显示页数页码
        scope.pages = getRange(scope.currentPage,scope.totalPageCount,scope.maxButtonNum);


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