(function() {
  'use strict';

  angular.module('linagora.esn.controlcenter')
    .controller('controlcenterGeneralController', controlcenterGeneralController);

  function controlcenterGeneralController(
    $q,
    $window,
    esnUserConfigurationService,
    asyncAction,
    rejectWithErrorNotification,
    controlcenterGeneralService,
    _,
    ESN_ROUTER_DEFAULT_HOME_PAGE,
    CONTROLCENTER_GENERAL_CONFIGS
  ) {
    var self = this,
        saveHandlers = [_saveConfiguration],
        initialConfigs;
    var HOMEPAGE_KEY = 'homePage';

    self.$onInit = $onInit;
    self.save = save;
    self.registerSaveHandler = registerSaveHandler;

    /////

    function $onInit() {
      var homePageCandidates = controlcenterGeneralService.getHomePageCandidates();

      self.homePages = _objectWithKeysSorted(homePageCandidates);

      esnUserConfigurationService.get(CONTROLCENTER_GENERAL_CONFIGS)
        .then(function(configurations) {
          self.configurations = _buildConfigs(configurations);
          initialConfigs = angular.copy(self.configurations);
        });
    }

    function save() {
      return asyncAction(
        _buildNotificationMessage(),
        _executeSaveHandlers,
        _includeReloadButtonAfterSave()
      );
    }

    function registerSaveHandler(handler) {
      saveHandlers.push(handler);
    }

    function _saveConfiguration() {
      var configurations = _.map(self.configurations, function(value, key) {
        return { name: key, value: value };
      });

      return esnUserConfigurationService.set(configurations);
    }

    function _executeSaveHandlers() {
      return $q.all(saveHandlers.map(function(handler) {
        return handler();
      }));
    }

    function _buildConfigs(configurations) {
      var output = {};

      configurations.forEach(function(configuration) {
        output[configuration.name] = configuration.value;
      });

      if (!output[HOMEPAGE_KEY]) {
        output[HOMEPAGE_KEY] = ESN_ROUTER_DEFAULT_HOME_PAGE;
      }

      return output;
    }

    function _objectWithKeysSorted(object) {
      var result = {};
      var keysSorted = Object.keys(object).sort();

      _.forEach(keysSorted, function(key) {
        result[key] = object[key];
      });

      return result;
    }

    function _includeReloadButtonAfterSave() {
      if (_shouldReloadAfterSave()) {
        return {
          onSuccess: {
            linkText: 'Reload',
            action: function() { $window.location.reload(); }
          }
        };
      }
    }

    function _buildNotificationMessage() {
      var messages = {
        progressing: 'Saving configuration...',
        success: 'Configuration saved.',
        failure: 'Failed to save configuration'
      };

      if (_shouldReloadAfterSave()) {
        messages.success = 'Configuration saved. Click on \'Reload\' to apply changes';
      }

      return messages;
    }

    function _shouldReloadAfterSave() {
      return _.some(CONTROLCENTER_GENERAL_CONFIGS, function(configName) {
        return !_.isEqual(self.configurations[configName], initialConfigs[configName]);
      });
    }
  }
})();
