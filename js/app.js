//引入 'myModele' 模块
var app = angular.module('app', ['myModule']);

app.contriller('myCtrl', function($scope){

 //设置分页的参数
 $scope.option = {
   curr: 1, //当前页数
   all: 20, //总页数
   count: 10, //最多显示的页数，默认为10

   //点击页数的回调函数，参数page为点击的页数
   click: function (page) {
     console.log(page);
     //这里可以写跳转到某个页面等...
   }
 }
});