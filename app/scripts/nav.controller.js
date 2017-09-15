'use strict';

angular
  .module('app')
  .controller('NavController', NavController);

NavController.$inject = ['$rootScope','GrpcSvc'];

function NavController ($scope, GrpcSvc)
{
    var vm = this;
    vm.protos = GrpcSvc.getProtos()

    vm.currentStateParams = {};

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      vm.currentStateParams = toParams;
    });

    vm.removeProto = function(proto) {
      GrpcSvc.removeProto(proto);
    }
}