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
                    scope.filterCriteria[attrs['tplCheckButton']] = el.val();
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

                    scope.filterCriteria.tag = attrs['tplTag'];
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
        $scope.filterCriteria  = defaultCriteria;

        $scope.activeTab       = 'templates';
        $scope.total           = 0;
        $scope.templates       = [];
        $scope.currentTemplate = null;
        $scope.frameUrl        = null;

        $scope.w = $(document).width();
        $scope.h = $(document).height();
        $scope.t = 0;
        $scope.l = 0;

        // Pagination
        $scope.pagination = {
            page: 1,
            numPages: 1,
            range: []
        };

        $scope.activateTab = function(tab) {
            $scope.activeTab = ($scope.activeTab == tab) ? null : tab;
        };

        $scope.load = function() {
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
            $scope.load();
        };

        $scope.filter = function() {
            $scope.criteria      = $scope.filterCriteria;
            $scope.criteria.page = 1;
            $scope.load();
        };

        $scope.showTemplate = function(template, theme) {
            $scope.activeTab       = null;
            $scope.currentTemplate = template;
            $scope.frameUrl        = theme ? theme.demo_url : template.demo_url;
        };

        /**
         * Resize the main frame to given size
         * If both width and height are not specified, then resize to current window's size
         *
         * @param {Int} width
         * @param {Int} height
         */
        $scope.resizeTo = function(width, height) {
            if ($scope.currentTemplate == null) {
                return;
            }

            var screenWidth = $(document).width(), screenHeight = $(document).height();

            if (width && height) {
                $scope.w = width;
                $scope.h = height;
                $scope.t = (height >= screenHeight) ? 0 : (screenHeight - height) / 2;
                $scope.l = (width  >= screenWidth)  ? 0 : (screenWidth  - width)  / 2;
            } else {
                $scope.w = screenWidth;
                $scope.h = screenHeight;
                $scope.t = 0;
                $scope.l = 0;
            }
        };

        // Load the data
        $scope.load();
    });