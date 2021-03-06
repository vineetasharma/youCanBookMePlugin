'use strict';

(function (angular, buildfire) {
  angular.module('youCanBookMePluginContent', ['ui.bootstrap'])
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'STATUS_CODE', 'TAG_NAMES', 'DataStore', 'Utils', '$timeout',
      function ($scope, Buildfire, STATUS_CODE, TAG_NAMES, DataStore, Utils, $timeout) {
        var ContentHome = this;

        ContentHome.validUrl = false;
        ContentHome.inValidUrl = false;

        ContentHome.data = {
          content: {
            "subDomain": "",
            "custom": ""
          }
        };

        ContentHome.gotToPage = function () {
          window.open('https://youcanbook.me/', '_blank');
        };

        ContentHome.saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          ContentHome.success = function (result) {
            console.info('Saved data result: ', result);
          };
          ContentHome.error = function (err) {
            console.error('Error while saving data : ', err);
          };
          DataStore.save(newObj, tag).then(ContentHome.success, ContentHome.error);
        };

        ContentHome.validateUrl = function () {
          if (ContentHome.subDomain)
            ContentHome.data.content.subDomain = ContentHome.subDomain;
          if (ContentHome.custom && Utils.validateUrl(ContentHome.custom)) {
            ContentHome.data.content.custom = ContentHome.custom;
            ContentHome.validUrl = true;
            $timeout(function () {
              ContentHome.validUrl = false;
            }, 3000);
            ContentHome.inValidUrl = false;
            ContentHome.saveData(ContentHome.data, TAG_NAMES.SCHEDULING_INFO);
          } else {
            ContentHome.inValidUrl = true;
            $timeout(function () {
              ContentHome.inValidUrl = false;
            }, 3000);
            ContentHome.validUrl = false;
          }
        };

        ContentHome.addSubDomain = function () {
          if (ContentHome.subDomain) {
            ContentHome.custom = "https://" + ContentHome.subDomain + ".youcanbook.me";
          }
          else {
            ContentHome.data.content.subDomain = null;
            ContentHome.saveData(ContentHome.data, TAG_NAMES.SCHEDULING_INFO);
          }
        };

        ContentHome.clearUrl = function () {
          if (!ContentHome.custom) {
            ContentHome.data.content.custom = null;
            ContentHome.data.content.subDomain = null;
            ContentHome.subDomain = null;
            ContentHome.saveData(ContentHome.data, TAG_NAMES.SCHEDULING_INFO);
          }
        };

        /*
         * Go pull any previously saved data
         * */
        var init = function () {
          var success = function (result) {
              console.info('init success result:', result);
              if (Object.keys(result.data).length > 0) {
                ContentHome.data = result.data;
              }
              if (ContentHome.data) {
                if (!ContentHome.data.content)
                  ContentHome.data.content = {};
                if (ContentHome.data.content.subDomain)
                  ContentHome.subDomain = ContentHome.data.content.subDomain;
                if (ContentHome.data.content.custom)
                  ContentHome.custom = ContentHome.data.content.custom;
              }
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
              }
              else if (err && err.code === STATUS_CODE.NOT_FOUND) {
                ContentHome.saveData(JSON.parse(angular.toJson(ContentHome.data)), TAG_NAMES.SCHEDULING_INFO);
              }
            };
          DataStore.get(TAG_NAMES.SCHEDULING_INFO).then(success, error);
        };
        init();
      }
    ])
})(window.angular, window.buildfire);