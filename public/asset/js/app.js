angular
    .module('TemplateDemo', [])
    .directive('tplCheckButton', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el = angular.element(element);

                if (el.hasClass('active')) {
                    el.prepend($('<i/>').addClass('fa fa-check'));
                }

                el.on('click', function() {
                    el.parent('.btn-group').find('button').removeClass('active').find('i').remove();
                    if (!el.hasClass('active')) {
                        el.addClass('active').prepend($('<i/>').addClass('fa fa-check'));
                    }
                    scope.criteria[attrs['tplCheckButton']] = el.val();
                });
            }
        };
    })
    .directive('tplTag', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el = angular.element(element);
                el.on('click', function() {
                    el.parents('ul').find('.badge').removeClass('badge');
                    el.addClass('badge');

                    scope.criteria.tag = attrs['tplTag'];
                });
            }
        };
    })
    .constant('defaultCriteria', {
        year: null,
        tag: null,
        responsive: null,
        high_resolution: null
    })
    .controller('DemoController', function($rootScope, $scope, $http, defaultCriteria) {
        $scope.criteria = defaultCriteria;
        console.log($scope.criteria);

        $scope.activeTab = 'templates';
        $scope.total     = 0;
        $scope.templates = [];

        $scope.activateTab = function(tab) {
            $scope.activeTab = tab;
        };

        $scope.filter = function() {
            $http.post('/filter', $scope.criteria).success(function(data) {
                $scope.total     = data.total;
                $scope.templates = data.templates;
            });
        };

        // Load the data
        $scope.filter();
    });