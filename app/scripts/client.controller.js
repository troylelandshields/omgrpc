'use strict';

angular
  .module('app')
  .controller('ClientController', ClientController);

NewController.$inject = ['GrpcSvc', '$stateParams', '$scope'];

function ClientController (GrpcSvc, $stateParams, $scope) {
  var vm = this;

  vm.connection = {
    hasConnection: false,
  };

  vm.result = null;
  vm.argStr = "{}";

  function convertToExampleJSON(field) {
    var json = {};

    if (field.type && typeof field.type != "object") { 
      return field.defaultValue;
    }
    
    field.type.fields.forEach(function(childField){
      json[childField.name] = convertToExampleJSON(childField);
    });

    return json;
  }

  vm.connectClient = function(addr) {
    vm.client = GrpcSvc.createClient($stateParams.serviceID, addr);
    vm.connection.hasConnection = true;

    vm.setMethod(vm.client.methods[0])
  };

  vm.setMethod = function(method) {
    vm.selectedMethod = method.name;

    vm.argStr = JSON.stringify(convertToExampleJSON(method.requestType), undefined, 2);
  };

  vm.execute = function(methodName, argStr) {
    vm.result = null;
    vm.client[methodName](JSON.parse(argStr), function(err, reply) {
      if (err) {
        vm.result = {
          error_code: err.code,
          message: err.message
        }
      } else {
        vm.result = reply;
      }
      $scope.$apply();
    });
  };
}
