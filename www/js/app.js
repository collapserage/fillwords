angular.module('fillwords', ['ionic', 'fillwords.controllers'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar)
        StatusBar.styleDefault()
    })
  })

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.transition('none');
    $urlRouterProvider.otherwise('/');
    $stateProvider

      .state('menu', {
        url: '/',
        templateUrl: 'templates/menu.html',
        controller: 'MainMenu'
      })

      .state('stats', {
        url: '/stats',
        templateUrl: 'templates/stats.html',
        controller: 'Stats'
      })

      .state('lobby', {
        url: '/lobby',
        templateUrl: 'templates/lobby.html',
        controller: 'Lobby'
      })

      .state('game', {
        url: '/game',
        templateUrl: 'templates/game.html',
        controller: 'Game'
      })

      .state('nextRound', {
        url: '/game/nextRound',
        templateUrl: 'templates/nextRound.html',
        controller: 'NextRound'
      })
  })

  .factory('Loader', function() {
    var loader = false;

    return {
      show: function() {
        loader = true;
      },
      hide: function() {
        loader = false;
      },
      get: function() {
        return loader
      }
    }
  })
