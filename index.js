var axios = require('axios');
var _ = require('lodash');
var Q = require('q');

var Segment = function(opts) {
    this.opts = _.defaults(opts || {}, {
        writeKey: "",

        flushWait: 1000,
        flushMaxWait: 10
    });

    this.pending = [];


    this.bindAll(this);
    this.flush = _.debounce(this._flush, this.opts.flushWait, {
        maxWait: this.flushMaxWait
    });
};

// Flush pending actions to be sent to the server
Segment.prototype._flush = function() {

};

// Push an action to the server
Segment.prototype.pushAction = function(action) {
    this.pending.push(action);


};

// Track an event
Segment.prototype.track = function(name, properties, options) {
    options = _.defaults(options || {}, {
        userId: null,
        timestamp: Date.now()
    });

    return this.pushAction({
        "action": "track",
        "userId": options.userId,
        "event": e,
        "properties": properties,
        "timestamp": (new Date(options.timestamp)).toISOString()
    });
};

// Identify an user
Segment.prototype.identify = function(userId, traits, options) {
    if (_.isObject(userId)) {
        traits = userId;
        userId = traits.userId;
        delete traits.userId;
    }

    if (!userId) return Q.reject(new Error("identify requires an 'userId'"));

    options = _.defaults(options || {}, {
        timestamp: Date.now()
    });

    return this.pushAction({
        "action": "identify",
        "userId": userId,
        "traits": traits,
        "timestamp": (new Date(options.timestamp)).toISOString()
    });
};


module.exports = Segment;
