'use strict';

angular
  .module('app')
  .controller('NavController', NavController);

NewController.$inject = ['GrpcSvc'];

function NavController (GrpcSvc)
{
    var vm = this;
    vm.protos = GrpcSvc.getProtos()
}