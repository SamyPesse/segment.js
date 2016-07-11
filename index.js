var axios = require('axios');
var assert = require('assert');
var _ = require('lodash');
var uid = require('uid');
var base64 = require('js-base64').Base64;

var pkg = require('./package.json');

function Segment(opts) {
    if (!(this instanceof Segment)) return (new Segment(opts));

    this.opts = _.defaults(opts || {}, {
        // Endpoint for the Segment.com API
        endpoint: 'https://api.segment.io/v1/',

        // Write key for your project
        writeKey: "",

        // The number of milliseconds to delay flushing events
        flushWait: 1000,

        // The maximum time flush is allowed to be delayed before it’s invoked
        flushMaxWait: 100
    });

    this.pending = [];


    _.bindAll(this, _.functionsIn(this));
    this.deplayedFlush = _.debounce(this.flush, this.opts.flushWait, {
        maxWait: this.flushMaxWait
    });
}

// Execute an Segment HTTP API request
Segment.prototype.request = function(httpMethod, method, data, sync, callback) {
    httpMethod = httpMethod.toLowerCase();
    var url = this.opts.endpoint+method;
    var authHeader = 'Basic '+base64.encode(this.opts.writeKey+':');

    if (sync) {
        var res = new XMLHttpRequest();
        res.open(httpMethod.toUpperCase(), url, false);
        res.setRequestHeader('Authorization', authHeader);
        res.send((data && httpMethod == 'post')? JSON.stringify(data) : null);

        if (res.status === 200) {
            callback();
        } else {
            callback(new Error('Error '+res.status));
        }
    } else {
        axios({
            method: httpMethod,
            url: url,
            headers: {
                'Authorization': authHeader
            },
            data: data
        })
        .then(function(res) {
            var err = undefined;

            if (res && res.status !== 200) {
                err = new Error('Error '+res.status);
                err.res = res;
            }

            callback(err);
        }, function(err) {
            callback(err);
        });
    }
}

// Flush pending actions to be sent to the server
Segment.prototype.flush = function(sync, callback) {
    if (_.isFunction(sync)) {
        callback = sync;
        sync = false;
    }

    var topush = this.pending;
    this.pending = [];

    var actions = _.map(topush, 'action');
    var callbacks = _.chain(topush)
        .map('callback')
        .concat([
            callback
        ])
        .compact()
        .value();

    var finish = function(err) {
        _.each(callbacks, function(cb) {
            cb(err);
        });
    };

    if (actions.length == 0) return finish();

    this.request('post', 'batch', {
        batch: actions,
        timestamp: new Date(),
        sentAt: new Date(),
        messageId: uid(8)
    }, sync, finish);
};

// Push an action to the server
Segment.prototype.enqueue = function(action, properties, callback) {
    properties.context = _.extend(properties.context || {},{
        library: {
            name: pkg.name,
            version: pkg.version
        }
    });
    properties.timestamp = properties.timestamp || new Date();


    this.pending.push({
        action: _.extend(properties, {
            action: action
        }),
        callback: callback
    });

    this.deplayedFlush();
};

// Track an event
Segment.prototype.track = function(event, callback) {
    assert(event.event, 'You must pass an "event".');
    assert(event.anonymousId || event.userId, 'You must pass either an "anonymousId" or a "userId".');

    this.enqueue('track', event, callback);
};

// Identify an user
Segment.prototype.identify = function(user, callback) {
    assert(message.anonymousId || message.userId, 'You must pass either an "anonymousId" or a "userId".');

    this.enqueue('identify', user, callback);
};


module.exports = Segment;
