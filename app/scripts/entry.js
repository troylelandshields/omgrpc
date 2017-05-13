'use strict';

// require('nw.gui').Window.get().showDevTools()
Dropzone.autoDiscover = false;

var appDependencies = [
  'ng',
  'ui.router',
  'thatisuday.dropzone',
  'ngSanitize'
];

angular
  .module('app', appDependencies)
  .config(appConfig)
  .constant('config', require('./config.json'));

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



angular
  .module('app')
  .filter('prettify', function () {
    function syntaxHighlight(obj) {
        var json = JSON.stringify(obj, undefined, 2);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    
    return syntaxHighlight;
});
