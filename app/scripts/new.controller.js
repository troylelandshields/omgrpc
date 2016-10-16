'use strict';

angular
  .module('app')
  .controller('NewController', NewController);

NewController.$inject = ['GrpcSvc'];

function NewController (GrpcSvc)
{
    var vm = this;
    vm.newConnection = {
    }

    vm.connect = function(connectionParams) {
        //TODO don't access the element directly here'
        connectionParams.file = $('#proto-file')[0].files[0]

        var services = GrpcSvc.parseProtofile(connectionParams);
        console.log(services)

        //Add the services to the side menu I guess and go to a different menu so the user can send requests?
    }
}