var assert = require('chai').assert;
var sinon = require('sinon');

var SearchDomain = require('../../../../../app/api/v1/domain/search');
var client = require('../../../../../app/elasticsearch/client');

describe('Domain Search', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('should be defined', function() {
    assert.isDefined(SearchDomain);
  });

  it('search should be defined', function() {
    assert.isDefined(SearchDomain.search);
  });

  describe('search should return correct data', function() {
    beforeEach(function () {
      this.elasticsearchStub = this.sandbox.stub(client, 'search');
    });

    afterEach(function () {
      client.search.restore();
    });

    var searchQuery = {
      keyword: 'test'
    };

    it('should fail without params', function(done) {

      this.elasticsearchStub.returns(Promise.reject('Fake Error'));

      SearchDomain.search({})
        .catch(function(error) {
          assert.isDefined(error);
          done();
        });
    });

    it('should return results with search params', function(done) {

      this.elasticsearchStub.returns(Promise.resolve({
        hits: { total: 1, hits: [] }
      }));

      SearchDomain.search(searchQuery)
        .then(function(results) {
          assert.isDefined(results);
          done();
        });
    });
  });
});