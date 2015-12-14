angular.module('fillwords.controllers', [])

    .controller('MainMenu', function($scope, $rootScope, $timeout, Loader) {
        $scope.$on('$ionicView.enter', function() {
            $rootScope.topSlided = false;
            $rootScope.bottomSlided = false;
            $rootScope.getLoader = function() {
                return Loader.get()
            };
        });

        $scope.showStats = function() {
            window.location = '#/stats'
        };

        $scope.playSingleplayer = function() {
            $rootScope.loaderMessage = 'Загрузка..';
            $rootScope.topSlided = true;
            Loader.show();
            $timeout(function() {
                window.location = '#/game'
            }, 3000)
        };

        $scope.playMultiplayer = function() {
            $rootScope.loaderMessage = 'Поиск противника..';
            $rootScope.bottomSlided = true;
            Loader.show();
            $timeout(function() {
                window.location = '#/lobby'
            }, 3000)
        };
    })

    .controller('Game', function($scope, $rootScope, $timeout, $interval, $document, Loader) {
        $scope.round = 1;
        $scope.$on('$ionicView.enter', function() {
            $scope.startRound($scope.round);
        });

        $scope.startRound = function() {
            var int = $interval(function() {
                if ($scope.time == 0) {
                    window.location = '#/game/nextRound';
                    //$scope.startRound(++$scope.round);
                    $interval.cancel(int);
                }
                $scope.time--;
            }, 1000);

            Loader.hide();
            $rootScope.bottomSlided = true;
            $rootScope.logoHidden = true;

            $scope.roundString = 'Раунд ' + $scope.round;
            $scope.word = '';
            $scope.wordCoordinates = [];
            $scope.score = 0;
            $scope.time = 10;
            $scope.serverData = {
                gameID: 1,
                gameField: [
                    ['д', 'л', 'о', 'т', 'д'],
                    ['а', 'т', 'м', 'е', 'а'],
                    ['р', 'и', 'р', 'н', 'а'],
                    ['к', 'а', 'б', 'и', 'а'],
                    ['д', 'л', 'о', 'т', 'д']
                ],
                gameAnswers: [
                    'кабинет',
                    'ритм',
                    'лом',
                    'дар',
                    'тир'
                ]
            };
        };

        $document.on('mousedown touchstart', function() {
            $scope.canSelect = true;
        });

        $document.on('mouseup touchend', function() {
            if ($scope.serverData.gameAnswers.indexOf($scope.word) > -1) {
                $scope.$apply(function() {
                    $scope.score++
                })
            }

            $scope.word = '';
            $scope.wordCoordinates = [];
            $scope.canSelect = false;
            [].forEach.call( // deselect all selected cells
                document.querySelectorAll('.cell-selected'),
                function(el) { el.classList.remove('cell-selected') }
            )
        });

        $document.on('mousemove touchmove', function($event) {
            var el;

            if ($event.type != 'mousemove') // if mobile
                el = document.elementFromPoint($event.changedTouches[0].pageX, $event.changedTouches[0].pageY);
            else // if desktop
                el = $event.target;

            if ($scope.canSelect && el.classList && el.classList.contains('field-cell')) { // look up this bug
                var rows = Array.prototype.slice.call( el.parentNode.parentNode.children ),
                    cells = Array.prototype.slice.call( el.parentNode.children );

                if ($scope.wordCoordinates.length)
                    var prev = $scope.wordCoordinates[$scope.wordCoordinates.length-1];
                var last = [rows.indexOf( el.parentNode ), cells.indexOf( el )];

                if ($scope.wordCoordinates.length == 0 || Math.abs(last[0] - prev[0]) + Math.abs(last[1] - prev[1]) == 1) {
                    if (!el.classList.contains('cell-selected')) {
                        $scope.wordCoordinates.push(last);
                        el.classList.add('cell-selected');
                        $scope.$apply(function () {
                            $scope.word += el.textContent;
                        })
                    } else if ($scope.wordCoordinates.length) {
                        var prevElement = $scope.wordCoordinates[$scope.wordCoordinates.length-2];
                        if (el == rows[prevElement[0]].children[prevElement[1]]) {
                            var lastElement = $scope.wordCoordinates[$scope.wordCoordinates.length-1];
                            rows[lastElement[0]].children[lastElement[1]].classList.remove('cell-selected');
                            delete $scope.wordCoordinates[$scope.wordCoordinates.length];
                            $scope.wordCoordinates.length-=1;
                        }
                    }
                }
            }
        });

        $scope.$on('$ionicView.leave', function() {
            $rootScope.logoHidden = false;
        });
    })

    .controller('NextRound', function($scope, $rootScope, $timeout) {
        $scope.$on('$ionicView.enter', function() {
            $timeout(function() {
                window.location = '#/game';
            }, 4000)
        })
    })

    .controller('Lobby', function($scope, $rootScope, $timeout, Loader) {
        $scope.$on('$ionicView.enter', function() {
            $rootScope.bottomSlided = false;

            $timeout(function() {
                $rootScope.bottomSlided = false;
                Loader.hide();
            }, 500);

            $timeout(function() {
                $rootScope.bottomSlided = true;
                window.location = '#/game'
            }, 4500);
        })
    })

    .controller('Stats', function($scope, $rootScope, $timeout, Loader) {
        $rootScope.logoHidden = true;
        $rootScope.bottomSlided = true;
        $scope.data = [
            {
                name: "Kate",
                score: 9000
            },
            {
                name: "Random guy",
                score: 666
            },
            {
                name: "Loser",
                score: 50
            }
        ]
    });
