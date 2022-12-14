/**
 * @module elasticsearch/delete/city_council
 * @version 1.0.2
 * @author Peter Schmalfeldt <me@peterschmalfeldt.com>
 */

var config = require('../../config');
var client = require('./../client');
var debug = require('../../debug');

var env = config.get('env');
var indexType = env + '_city_council';
var indexName = config.get('elasticsearch.indexName') + '_' + indexType;

/**
 * Delete City Council Index
 * @type {object}
 */
var Tag = client.indices.delete({
  index: indexName
})
.then(function() {
  debug.success('Index Deleted: ' + indexName);
})
.catch(function(error) {
  debug.error(error.status + ' ' + error.message);
});

module.exports = Tag;
