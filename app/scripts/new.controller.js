'use strict';

angular
  .module('app')
  .controller('NewController', NewController);

NewController.$inject = ['GrpcSvc', '$state'];

function NewController (GrpcSvc, $state)
{
    var vm = this;
    vm.newConnection = {
    }

    vm.dzOptions = {
        acceptedFiles : '.proto',
        autoProcessQueue:false,
        url:"someurl"
    };
    
    vm.dzCallbacks = {
        'addedfile' : function(file){
            console.log(file);
            vm.add(file)

            vm.removeNewFile(file);
        }
    };

    vm.dzMethods = {};
    vm.removeNewFile = function(file){
        vm.dzMethods.removeFile(file);
    }

    vm.add = function(file) {
        var services = GrpcSvc.parseProtofile(file);
    }
}