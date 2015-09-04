# segment.js

[![NPM version](https://badge.fury.io/js/segment.js.svg)](http://badge.fury.io/js/segment.js)

Segment.com client that works in the browser (browserify) and Node.js.

#### Installation

```
$ npm install segment.js
```

#### Usage

Create a Segment.com client:

```js
var Segment = require('segment.js');

var analytics = new Segment({
    writeKey: "your-project-write-key"
});
```

Default options are:

```js
{
    // Endpoint for the Segment.com API
    endpoint: 'https://api.segment.io/v1/',

    // Write key for your project
    writeKey: "",

    // The number of milliseconds to delay flushing events
    flushWait: 1000,

    // The maximum time flush is allowed to be delayed before it’s invoked
    flushMaxWait: 100
}
```

###### Identify

The identify method is how you tie one of your users to a recognizable userId and traits.

```
analytics.identify([userId], [traits], [options], [callback]);
```

```js
analytics.identify({
    userId: '1e810c197e',
    traits: {
        name: 'Bill Lumbergh',
        email: 'bill@initech.com'
    }
});
```

###### Track

The track method lets you record any actions your users perform.

```
analytics.track(event, [properties], [options], [callback]);
```

Here’s a basic example:

```js
analytics.track({
    event: 'Signed Up',
    properties: {
        plan: 'Startup',
        source: 'Analytics Academy'
    }
});
```

###### Flush

You can manually flush events to Segment.com using the `analytics.flush([sync])` method:

```js
analytics.flush();
```

It's also possible in the browser to synchronously send events, for example:

```js
window.onbeforeunload = function() {
    analytics.track('Page Closed');
    analytics.flush(true);
};
```

