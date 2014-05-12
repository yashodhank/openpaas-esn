'use strict';

var expect = require('chai').expect;

describe.skip('The local pubsub for MongoDB configuration', function() {

  it('should fire a publish when mongodb configuration is available', function(done) {
    var mongodbConfiguration = { connectionString: 'mongodb://localhost:23456/tests' };
    var core = require(this.testEnv.basePath + '/backend/core');
    var pubsub = core.pubsub.local;
    var topic = pubsub.topic('mongodb:configurationAvailable');

    topic.subscribe(function(config) {
      expect(config).to.deep.equal(mongodbConfiguration);
      done();
    });

    core.configured();
  });

});
