/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

angular
    .module('TemplateDemo', [])
    .directive('tplToggle', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el     = angular.element(element),
                    target = angular.element(attrs['target']),
                    zIndex = parseInt(target.css('z-index'));
                if (zIndex) {
                    el.css('z-index', zIndex + 1);
                }
                el.find('a').on('click', function() {
                    target.toggle();
                    scope.$broadcast('toggle', target.css('display') == 'none');
                });
            }
        };
    })
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
                    el
                        .parents('ul')
                            .find('.badge').removeClass('badge').end()
                            .end()
                        .addClass('badge');

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
                    el.parents('.pagination').find('li').removeClass('active').filter('[data-page="' + scope.pagination.page + '"]').addClass('active');
                });
            }
        };
    })
    .directive('tplFrameLoading', function($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el          = angular.element(element),
                    loader      = angular.element('<div/>').addClass('tpl-loader hide').html('<i class="fa fa-refresh fa-spin fa-inverse fa-3x"></i>').prependTo(el.parent()),
                    srcProperty = attrs['track'];
                $compile(loader)(scope);

                el.on('load', function() {
                    loader.removeClass('show').addClass('hide');
                });

                // Show the loader indicator when the URL is changed
                scope.$watch(srcProperty, function() {
                    if (scope[srcProperty]) {
                        loader.removeClass('hide').addClass('show');
                    }
                });
            }
        };
    })
    .directive('tplFrameResponsive', function($window) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el         = angular.element(element),
                    paddingTop = el.offset().top;

                scope.deviceWidth  = null;
                scope.deviceHeight = null;

                scope.$on('resizeTo', function(e, width, height) {
                    var screenWidth  = $(document).width(),
                        screenHeight = $(document).height() - paddingTop,
                        w, h, t, l;
                    if (width && height) {
                        // 15px is the width of scroll bar
                        w = width + 15;
                        h = height;
                        t = (height >= screenHeight) ? 0 : (screenHeight - height) / 2;
                        l = (width  >= screenWidth)  ? 0 : (screenWidth  - width)  / 2;

                        scope.deviceWidth  = w;
                        scope.deviceHeight = h;
                    } else {
                        w = '100%';
                        h = '100%';
                        t = 0;
                        l = 0;

                        scope.deviceWidth  = null;
                        scope.deviceHeight = null;
                    }
                    el.css({
                        width: w,
                        height: h,
                        marginTop: t,
                        marginLeft: l
                    });
                });

                scope.$on('toggle', function(e, toggled) {
                    if (scope.deviceWidth == null && scope.deviceHeight == null) {
                        el.css('top', toggled ? 0 : paddingTop);
                    }
                });

                angular.element($window).on('resize', function() {
                    var screenWidth  = $(document).width(),
                        screenHeight = $(document).height() - paddingTop,
                        w, h, t, l;
                    if (scope.deviceWidth && scope.deviceHeight) {
                        if (scope.deviceWidth < screenWidth) {
                            w = scope.deviceWidth;
                            h = scope.deviceHeight;
                            t = (scope.deviceHeight >= screenHeight) ? 0 : (screenHeight - scope.deviceHeight) / 2;
                            l = (screenWidth - scope.deviceWidth) / 2;
                        } else {
                            w = screenWidth;
                            h = screenHeight;
                            t = 0;
                            l = 0;
                        }
                        el.css({
                            width: w,
                            height: h,
                            marginTop: t,
                            marginLeft: l
                        });
                    }
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
    .config(function($locationProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
    })
    .controller('DemoController', function($rootScope, $scope, $http, $location, defaultCriteria) {
        $scope.criteria        = defaultCriteria;
        $scope.filterCriteria  = defaultCriteria;

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
            $scope.activeTab = ($scope.activeTab == tab) ? null : tab;
        };

        $scope.load = function() {
            return $http.post('/filter', $scope.criteria).success(function(data) {
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

            if (theme == null && template.themes && template.themes.length > 0) {
                theme = template.themes[Math.floor(Math.random() * template.themes.length)];
            }
            $scope.frameUrl = theme ? theme.demo_url : template.demo_url;
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
            $scope.$broadcast('resizeTo', width, height);
        };

        $scope.init = function() {
            // Load the data
            $scope.load().success(function(data) {
                var hash = $location.hash(), templates = data.templates;

                if (hash && templates && templates.length > 0) {
                    // Try to load template with slug as hash
                    $http.post('/demo', { slug: hash }).success(function(response) {
                        response.template ? $scope.showTemplate(response.template) : $scope.showTemplate(templates[0]);
                    });
                } else {
                    if (templates && templates.length > 0) {
                        $scope.showTemplate(templates[0]);
                    }
                }
            });
        };

        $scope.init();
    });