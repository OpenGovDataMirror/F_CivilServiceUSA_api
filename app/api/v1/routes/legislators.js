/**
 * @module routes/legislators
 * @version 1.0.0
 * @author Peter Schmalfeldt <me@peterschmalfeldt.com>
 * @todo Create Unit Tests for Routes
 */

var express = require('express');
var validator = require('validator');

var external = require('../../../external');
var config = require('../../../config');
var util = require('./util');
var router = express.Router(config.router);

var GeolocationDomain = require('../domain/geolocation');

/**
 * Legislators
 * @memberof module:routes/legislators
 * @name [GET] /legislators
 * @property {string} [zipcode] - Zip Code ( must be a valid US Zip Code )
 * @property {string} [latitude] - GPS Latitude ( required if also passing over `longitude` )
 * @property {string} [longitude] - GPS Longitude ( required if also passing over `latitude` )
 */
/* istanbul ignore next */
router.route('/legislators').get(function(request, response) {
  if (request.query.latitude && request.query.longitude && validator.isDecimal(request.query.latitude) && validator.isDecimal(request.query.longitude)) {

    var url = 'https://v3.openstates.org/people.geo?lat=' + request.query.latitude + '&lng=' + request.query.longitude + '&apikey=' + config.get('openStates.key');

    external.getContent(url).then(function (content){
      var json = JSON.parse(content);

      if (json && json[0] === 'Bad Request') {
        response.json(util.createAPIResponse({
          errors: json
        }, request.query.fields));
      } else {
        response.json(util.createAPIResponse({
          data: {
            results: json.results,
            request: {
              city: null,
              state: null,
              latitude: request.query.latitude,
              longitude: request.query.longitude,
              zipcode: null
            }
          }
        }, request.query.fields));
      }
    }).catch(function (error){
      response.json(util.createAPIResponse({
        errors: ['Unable to Fetch Open States Data']
      }, request.query.fields));
    });
  } else if (request.query.zipcode && validator.isNumeric(request.query.zipcode) && validator.isLength(request.query.zipcode, { min: 5, max: 5})) {
    GeolocationDomain.getLocation({ zipcode: request.query.zipcode })
      .then(function(results){

        var url = 'https://v3.openstates.org/people.geo?lat=' + results.data[0].location.lat + '&lng=' + results.data[0].location.lon + '&apikey=' + config.get('openStates.key');

        external.getContent(url).then(function (content){

          var json = JSON.parse(content);

          if (json && json[0] === 'Bad Request') {
            response.json(util.createAPIResponse({
              errors: json
            }, request.query.fields));
          } else {
            response.json(util.createAPIResponse({
              data: {
                results: json.results,
                request: {
                  city: results.data[0].city,
                  state: results.data[0].state,
                  latitude: results.data[0].location.lat,
                  longitude: results.data[0].location.lon,
                  zipcode: request.query.zipcode
                }
              }
            }, request.query.fields));
          }
        }).catch(function (error){
          response.json(util.createAPIResponse({
            errors: ['Unable to Fetch Open States Data']
          }, request.query.fields));
        });
      })
      .catch(function (error) {
        response.json(util.createAPIResponse({
          errors: ['Unable to Fetch Open States Data']
        }, request.query.fields));
      });
  } else {
    response.json(util.createAPIResponse({
      errors: ['Invalid Request. Requires `latitude` & `longitude` or `zipcode`.']
    }, request.query.fields));
  }
});

module.exports = router;
