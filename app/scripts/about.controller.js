'use strict';

angular
  .module('app')
  .controller('AboutController', AboutController);

AboutController.$inject = ['$scope'];

function AboutController ($scope)
{
  $scope.text = 'This could be a dynamic text'
}