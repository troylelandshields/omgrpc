'use strict';

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