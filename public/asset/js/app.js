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
    .directive('tplPagination', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el = angular.element(element);
                el.on('click', function() {
                    el.parents('.pagination').find('li').removeClass('active');
                    el.parent().addClass('active');
                });
            }
        };
    })
    .constant('defaultCriteria', {
        page: 1,
        year: null,
        tag: null,
        responsive: null,
        high_resolution: null
    })
    .controller('DemoController', function($rootScope, $scope, $http, defaultCriteria) {
        $scope.criteria        = defaultCriteria;

        $scope.activeTab       = 'templates';
        $scope.total           = 0;
        $scope.templates       = [];
        $scope.currentTemplate = null;
        $scope.frameUrl        = null;

        // Pagination
        $scope.pagination = {
            page: 1,
            numPages: 1,
            range: []
        };

        $scope.activateTab = function(tab) {
            $scope.activeTab = tab;
        };

        $scope.filter = function() {
            $http.post('/filter', $scope.criteria).success(function(data) {
                $scope.total      = data.total;
                $scope.templates  = data.templates;
                $scope.pagination = {
                    page: data.page,
                    numPages: data.numPages,
                    range: []
                };

                for (var i = data.startRange; i <= data.endRange; i++) {
                    $scope.pagination.range.push(i);
                }
            });
        };

        $scope.goPage = function(page) {
            $scope.pagination.page = page;
            $scope.criteria.page   = page;
            $scope.filter();
        };

        $scope.showTemplate = function(template) {
            $scope.currentTemplate = template;
            $scope.frameUrl        = template.demo_url;
        };

        // Load the data
        $scope.filter();
    });