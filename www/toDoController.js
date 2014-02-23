var todoApp = angular.module('todoApp', ['ngRoute', 'ngCookies', 'myLoginCheck']);

todoApp.controller('toDosCtrl', function toDosCtrl($scope, $http, $location) {

    $scope.toDos = {};
    $scope.allChecked = false;

    $scope.toDo = function() {
        $http({
            url: '/item',
            method: 'GET',
        }).success(function(todos) {
                $scope.toDos.dones = todos.dones;
                $scope.toDos.remaining = todos.remaining;
                $scope.toDos.items = [];
                angular.forEach(todos.items, function(item) {
                    $scope.toDos.items.push(item);
                });
            }).error(function(err) {
                alert('session timed out. please login again');
                $location.path('/login');
            });
    };

    $scope.addItem = function() {
        var ret;
        var tempToDo = $scope.newToDoText;
        var tempId = Math.random();
        if (tempToDo) {
            $http({
                url:'/item',
                method:'POST',
                data: {
                    id: tempId,
                    value: tempToDo
                }
            }).success(function(todos) {
                    $scope.toDos.dones = todos.dones;
                    $scope.toDos.remaining = todos.remaining;
                    $scope.toDos.items = [];
                    angular.forEach(todos.items, function(item) {
                        $scope.toDos.items.push(item);
                    });
                    ret = 0;
                }).error(function(data, status) {
                    console.log(status);
                    if (status === 500) {
                        alert('something went wrong please try again');
                    }
                    if (status === 400) {
                        alert('session timed out. please login again');
                        $location.path('/login');
                    }
                    ret = 1;
                });
            $scope.newToDoText = '';
            return ret;
        }

    };

    $scope.remain = function() {
        if ($scope.toDos.remaining > 1) return $scope.toDos.remaining + " items left";
        else if ($scope.toDos.remaining === 1) return "1 item left";
        else if($scope.toDos.remaining === 0 && $scope.toDos.items.length !== 0) return "0 items left";
        else return "";
    }

    $scope.deleteDone = function() {
        for (i in $scope.toDos.items) {
            if($scope.toDos.items[i].done) {
                $scope.remove($scope.toDos.items[i]);
            }
        }
    }

    $scope.checker = function() {
        if ($scope.remain() === '0 items left' || $scope.toDos.dones === $scope.toDos.items.length) {
            $scope.allChecked = true;
            return true;
        }
        else {
            $scope.allChecked = false;
            return false;
        }
    }

    $scope.checkAll = function() {
        angular.forEach($scope.toDos.items, function(todo) {
            todo.done = !$scope.allChecked;
            $scope.update(todo);
        });
    }

    $scope.remove = function(todo) {
        var ret;
        $http({
            url:'/item',
            method:'DELETE',
            data: {
                id: todo.id
            }
        }).success(function(todos) {
                $scope.toDos.dones = todos.dones;
                $scope.toDos.remaining = todos.remaining;
                $scope.toDos.items = [];
                angular.forEach(todos.items, function(item) {
                    $scope.toDos.items.push(item);
                });
                ret = 0;
            }).error(function(err) {
                alert('session timed out. please login again');
                $location.path('/login');
                ret = 1;
            });
        return ret;
    }

    $scope.update = function(todo) {
        var ret;
        $http({
            url:'/item',
            method:'PUT',
            data: {
                id: todo.id,
                value: todo.data,
                status: (todo.done) ? 1 : 0
            }
        }).success(function(todos) {
                $scope.toDos.dones = todos.dones;
                $scope.toDos.remaining = todos.remaining;
                $scope.toDos.items = [];
                angular.forEach(todos.items, function(item) {
                    $scope.toDos.items.push(item);
                });
                ret = 0;
            }).error(function(err) {
                alert('session timed out. please login again');
                $location.path('/login');
                ret = 1;
            });
    }


    $scope.checkboxPressed = function(todo) {
        todo.done = !todo.done;
        $scope.update(todo);
    }

    $scope.filter = "All";
    $scope.possFilt = {All:"All", Comp:"Completed", Act:"Active"};
    $scope.changeFilter = function(filt) {
        $scope.filter = filt;
    }

    $scope.getFilter = function() {
        switch ($scope.filter) {
            case "All":
                return "";
            case "Completed":
                return {done:true};
            case "Active":
                return {done:false};
        }
    }

    $scope.edit = function(item){
        item.editing = true;

    }

    $scope.doneEditing = function(item){
        item.editing = false;
        $scope.update(item);
    }
});

todoApp.controller('loginCtrl', function($scope, $location, $http) {

    $scope.verify = function() {
        $http({
            url: '/login',
            method: 'POST',
            data: {
                username: $scope.username,
                password: $scope.password
            }
        }).success(function(sessionId) {
                $location.path('/todo/');
            }).error(function() {
                alert("wrong password or username. try again");
            });
    }

    $scope.register = function() {
        if (!$scope.regUsername || !$scope.regFullname || !$scope.regPassword) {
            alert("all fields must be filled out");
        }
        else {
            $http({
                url: '/register',
                method: 'POST',
                data: {
                    username: $scope.regUsername,
                    fullname: $scope.regFullname,
                    password: $scope.regPassword
                }
            }).success(function(sessionId) {
                    $location.path('/todo/');
                }).error(function() {
                    alert("username already in use, try another one.");
                });
        }
    }
});

var login = angular.module('myLoginCheck',['ngCookies']).
    factory('$logincheck', function(){
        return function(userid) {
            if(userid) return true;
            return false;
        };
    });

todoApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/todo/', {
            templateUrl: 'todo.html',
            controller: 'toDosCtrl'
        })
        .otherwise({
            templateUrl: 'login.html',
            controller: 'loginCtrl'
        })
}).run(function($logincheck, $location, $cookies, $http) {
        var userExists;
        $http({
            url: '/item',
            method: 'GET'
        }).success(function() {
                userExists = true;
            }).error(function() {
                userExists = false;
            });
        if($logincheck($cookies.sessionId) && userExists) {
            $location.path('/todo/');
        }
        else {
            $location.path('/login');
        }
    });



