'use strict';

var jQuery = require('jquery');
var $ = jQuery

// window.angular = require('angular');
// let angularuirouter = require('angular-ui-router');
// let bootstrap = require('bootstrap');

var appDependencies = [
  'ng',
  'ui.router'
];

angular
  .module('app', appDependencies)
  .config(appConfig)
  .constant('config', require('../../config.json'));

require('./app.controller');
require('./about.controller');

appConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

function appConfig ($stateProvider, $urlRouterProvider) {
  var routes = [
    {
      name: 'main',
      path: ''
    },
    {
      name: 'about',
      path: 'about'
    }
  ];

  routes.forEach(function(route){
    $stateProvider.state(route.name, {
      url: "/" + route.path,
      views: {
        guest: { templateUrl: 'views/' + route.name + '.html' }
      }
    });
  });

  $urlRouterProvider.otherwise("/");
}


window.angular
  .module('app')
  .controller('AppController', AppController);

AppController.$inject = ['$rootScope'];

function AppController ($scope, grpcDefinitonSvc)
{
  // grpcDefinitonSvc.GetGrpcDefintion()
  //   var file = {
  //     root: process.cwd() + "/exampleSvc",
  //     file: "example.proto"
  // }
  // let parsed = grpc.load(file)
  // let serviceName = "exampleSvc"

  // let creds = grpc.credentials.createInsecure()
  // let client = new parsed["exampleSvc"].ExampleService("127.0.0.1:6565", creds)
}
