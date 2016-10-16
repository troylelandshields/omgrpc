'use strict';

require('nw.gui').Window.get().showDevTools()

var appDependencies = [
  'ng',
  'ui.router'
];

angular
  .module('app', appDependencies)
  .config(appConfig)
  .constant('config', require('../config.json'));

appConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

function appConfig ($stateProvider, $urlRouterProvider) {
  var routes = [{
      name: 'main',
      path: ''
    }, {
      name: 'about',
      path: 'about'
    }, {
      name: 'new',
      path: 'new'
    }, {
      name: 'client',
      path: 'proto/:protoID/service/:serviceID/client'
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
