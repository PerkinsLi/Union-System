(function () {
  var app = window.us = angular.module("unionSystem", ['ui.router', 'ngCookies']);

  app.constant('constantMethod', {
    getMembersCountAPI: "http://localhost:8081/api/getMembersCount",
    getMembersAPI: "http://localhost:8081/api/getMembers",
    loginPath: "http://localhost:8081/api/login"
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
    $scope.members = [];

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
        $scope.members = response.data;
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
        scope.maxButtonNum = Math.min(5, scope.totalPageCount);
        if (scope.currentPage > 2 && scope.currentPage <= scope.totalPageCount - 2) {
          scope.startIndex = scope.currentPage - 2;
        } else if (scope.currentPage > 2 && scope.currentPage > scope.totalPageCount - 2) {
          scope.startIndex = scope.currentPage - 4;
        } else {
          scope.startIndex = 1;
        }

        scope.pages = [];

        for (var index = 0; index < scope.maxButtonNum; index++) {
          scope.pages.push(index + scope.startIndex);
        }

        scope.click = function (pageIndex) {
          scope.goPage(pageIndex);
        }
      }
    }
  });
})();