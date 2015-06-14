/**
 * Created by xavier on 12/07/14.
 */
/**
 * Directive widget notifications<br />
 *
 * Usage :
 *
 * <pre>
 * &lt;widget-notifications /&gt;
 * @author Xavier MARIN
 * @class qaobee.directives.widgets.notifications
 * @requires {@link qaobee.rest.prive.profileRestAPI|qaobee.rest.prive.profileRestAPI}
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('widget.notifications', ['notificationsRestAPI', 'eventbus'])

    .directive('widgetNotifications', function (eventbus, notificationsRestAPI, $filter) {
        'use strict';
        return {
            restrict: 'AE',
            scope: {
                height: '=?',
                nbNotif: '=?'
            },
            controller: function ($scope, $element) {
                var statCell = $element.children(1).children(1).children(1).children(1).children(1);
                var statPanel = $element.children(1).children(1).children(1).children(1);
                $scope.flipped = false;
                $scope.inheight = $scope.height || Math.min(statCell.outerHeight(), 120);
                $scope.nbNotif = $scope.nbNotif || 5;
                $scope.notifications = Array.create();
                $scope.unreadNum = 0;
                $scope.$on('eventbus', function () {
                    if ("refreshNotifications" === eventbus.message) {
                        $scope.getNotifications();
                    }
                });

                /**
                 * @name $scope.getNotifications
                 * @function
                 * @memberOf qaobee.directives.widgets.notifications
                 * @description Fetch user notifications
                 */
                $scope.getNotifications = function () {
                    notificationsRestAPI.getuserNotifications($scope.nbNotif).success(function (data) {
                        $scope.unreadNum = data.count(function (n) {
                            return n.read === false;
                        });
                        $scope.notifications = data;
                        $scope.inheight = statPanel.outerHeight();
                        $element.children(1).height(statPanel.outerHeight());
                    });
                };

                $scope.getNotifications();

                /**
                 * @name $scope.markRead
                 * @function
                 * @param {String} id notification id
                 * @memberOf qaobee.directives.widgets.notifications
                 * @description Mark as read
                 */
                $scope.markRead = function (id) {
                    var notif = $scope.notifications.find(function (n) {
                        return n._id === id;
                    });
                    notificationsRestAPI.markAsRead(id).success(function (data, status, headers, config) {
                        notif.read = !notif.read;
                        eventbus.prepForBroadcast("refreshNotifications", "");
                    });
                };
                /**
                 * @name $scope.del
                 * @function
                 * @param {String} id notification id
                 * @memberOf qaobee.directives.widgets.notifications
                 * @description Delete a notification
                 */
                $scope.del = function (id) {
                    var notif = $scope.notifications.find(function (n) {
                        return n._id === id;
                    });

                    modalConfirm($filter('translate')('popup.title.delete.notification'), $filter('translate')('popup.message.delete') + title + ".<br />" + $filter('translate')('popup.confirm.ask'), function () {
                        notificationsRestAPI.del(id).success(function (data) {
                            $scope.notifications.remove(notif);
                            eventbus.prepForBroadcast("refreshNotifications", "");
                            toastr.success(notif.title + $filter('translate')('popup.success.delete'));
                        });
                    });
                };
                $scope.toggle = function () {
                    $scope.flipped = !$scope.flipped;
                };

                $scope.flipFront = function () {
                    $scope.flipped = false;
                };

                $scope.flipBack = function () {
                    $scope.flipped = true;
                };
            },
            templateUrl: 'app/components/widgets/notifications/notifications.html'
        };
    });