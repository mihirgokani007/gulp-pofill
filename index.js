'use strict';

var pluginName = require('./package.json').name;
var through = require('through2');
var path = require('path');
var PoFile = require('pofile');

var gUtil = require('gulp-util');

module.exports = function (options) {
  options = options || {};

  return through.obj(function (file, enc, cb) {
    var self = this;

    if (file.isNull()) {
      self.push(file);
      return cb();
    }
    
    if (file.isStream()) {
      self.emit('error', new gUtil.PluginError(pluginName, 'Streaming not supported'));
      return cb();
    }

    var pofile = PoFile.parse(file.contents.toString());
    var context = {lang: pofile.headers['Language']};
    var p1 = Promise.resolve(true), p2 = Promise.resolve(true), p3 = Promise.resolve(true);

    // Comments
    if (options.comments) {
      p1 = Promise.all(pofile.comments.map(function(comment, index) {
        return options.comments.call(this, comment, context);
      })).then(function(comments) {
        pofile.comments = comments;
        return comments;
      });
    }

    // Headers
    if (options.headers) {
      p2 = Promise.all(pofile.headers.map(function(header, index) {
        return options.headers.call(this, header, context);
      })).then(function(headers) {
        pofile.headers = headers;
        return headers;
      });
    }

    // Contents
    if (options.items) {
      p3 = Promise.all(pofile.items.map(function(item, index) {
        return options.items.call(this, item, context);
      })).then(function(items) {
        pofile.items = items;
        return items;
      });
    }

    // Wait for everything to complete
    return Promise.all([p1, p2, p3]).then(function(result) {
      file.contents = new Buffer(pofile.toString());
      cb(null, file);
    }, function(err) {
      self.emit('error', new gUtil.PluginError(pluginName, err));
    });

  });
};
