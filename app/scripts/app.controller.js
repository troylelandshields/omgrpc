'use strict';

angular
  .module('app')
  .controller('AppController', AppController);

AppController.$inject = ['$rootScope', 'GrpcSvc', 'StorageSvc'];

function AppController ($scope, GrpcSvc, StorageSvc)
{
  // var file = {
  //     root: process.cwd() + "/exampleSvc",
  //     file: "example.proto"
  // }
  // let parsed = grpc.load(file)
  // let serviceName = "exampleSvc"

  // let creds = grpc.credentials.createInsecure()
  // let client = new parsed["exampleSvc"].ExampleService("127.0.0.1:6565", creds)

  // window.client = client


  StorageSvc.loadRecentProtos(function(recent){
    if (!recent) {
      return;
    }

    recent.forEach(function(recentFile){
      if (!recentFile) {
          return
      }

      GrpcSvc.parseProtofile(recentFile, true);

      $scope.$apply();
    });
  });
}
