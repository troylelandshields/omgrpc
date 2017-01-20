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
  vm.metadataArgs = [];

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
    vm.selectedMethod = method;

    vm.argStr = JSON.stringify(convertToExampleJSON(method.requestType), undefined, 2);
  };

  vm.addMetadata = function() {
    vm.metadataArgs.push({})
  }

  vm.removeMetadata = function(md) {
    var index = vm.metadataArgs.indexOf(md);
    if (index > -1) {
      vm.metadataArgs.splice(index, 1);
    }
  }

  function displayResult(err, reply) {
      if (err) {
        vm.result = {
          error_code: err.code,
          message: err.message
        }
      } else {
        vm.result = reply;
      }
      $scope.$apply();
  }

  vm.execute = function(method, argStr) {
    vm.result = null;
    var meta = new grpc.Metadata();

    vm.metadataArgs.forEach(function(ma) {
      meta.add(ma.key, ma.value)
    });

    vm.client[method.name](JSON.parse(argStr), meta, displayResult);
  };

  vm.connectStream = function(method) {
    vm.result = null;
    var meta = new grpc.Metadata();

    vm.metadataArgs.forEach(function(ma) {
      meta.add(ma.key, ma.value)
    });

    vm.stream = vm.client[method.name](meta);
    vm.stream.isConnected = true;
    vm.stream.setMaxListeners(1);

    vm.stream.on("data", function(data) {
      displayResult(null, data);
    });
  };

  vm.sendStream = function(stream, argStr) {
    vm.result = null;
    stream.write(JSON.parse(argStr));
  };

  vm.closeStream = function(stream) {
    stream.end();
    vm.stream.isConnected = false;
  }


}
