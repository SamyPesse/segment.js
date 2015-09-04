var axios = require('axios');
var _ = require('lodash');
var Q = require('q');
var base64 = require('js-base64').Base64;

var Segment = function(opts) {
    this.opts = _.defaults(opts || {}, {
        endpoint: 'https://api.segment.io/v1/',
        writeKey: "",

        flushWait: 1000,
        flushMaxWait: 10
    });

    this.pending = [];


    _.bindAll(this);
    this.deplayedFlush = _.debounce(this.flush, this.opts.flushWait, {
        maxWait: this.flushMaxWait
    });
};

// Flush pending actions to be sent to the server
Segment.prototype.flush = function(sync) {
    var topush = this.pending;
    this.pending = [];

    var actions = _.pluck(topush, 'action');
    var callbacks = _.chain(topush)
        .pluck('callback')
        .compact()
        .value();

    var finish = function(err) {
        _.each(callbacks, function(callback) {
            callback(err);
        });
    };

    return Q(axios({
        method: 'post',
        url: this.opts.endpoint+'import',
        headers: {
            'Authorization': 'Basic '+base64.encode(this.opts.writeKey)
        },
        data: {
            batch: actions
        }
    }))
    .then(function(res) {
        var err = undefined;

        if (res && res.status !== 200) {
            err = new Error('Error importing events '+res.status);
            err.res = res;
        }

        finish(err);
    }, function(err) {
        finish(err);
    });
};

// Push an action to the server
Segment.prototype.pushAction = function(action, callback) {
    this.pending.push({
        action: action,
        callback: callback
    });

    this.deplayedFlush();
};

// Track an event
Segment.prototype.track = function(event, properties, options, callback) {
    if (_.isFunction(properties)) {
        callback = properties;
        properties = {};
        options = {};
    }
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    options = _.defaults(options || {}, {
        userId: null,
        timestamp: Date.now()
    });

    this.pushAction({
        "action": "track",
        "userId": options.userId,
        "event": event,
        "properties": properties,
        "timestamp": (new Date(options.timestamp)).toISOString()
    }, callback);
};

// Identify an user
Segment.prototype.identify = function(userId, traits, options, callback) {
    if (_.isObject(userId)) {
        traits = userId;
        userId = traits.userId;
        delete traits.userId;
    }
    if (_.isFunction(traits)) {
        callback = traits;
        traits = {};
        options = {};
    }
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    if (!userId) return Q.reject(new Error("identify requires an 'userId'"));

    options = _.defaults(options || {}, {
        timestamp: Date.now()
    });

    this.pushAction({
        "action": "identify",
        "userId": userId,
        "traits": traits,
        "timestamp": (new Date(options.timestamp)).toISOString()
    }, callback);
};


module.exports = Segment;
