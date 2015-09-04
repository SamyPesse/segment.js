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

###### Identify

The identify method is how you tie one of your users to a recognizable userId and traits. This method returns a promise.

```js
analytics.identify('1e810c197e', {
    name: 'Bill Lumbergh',
    email: 'bill@initech.com'
});
```

:warning: `analytics.identify` doesn't set the `userId` for following `analytics.track`.

###### Track

The track method lets you record any actions your users perform. This method returns a promise. Here’s a basic example:

```js
analytics.track('Signed Up', {
    plan: 'Startup',
    source: 'Analytics Academy'
});
```

:warning: `analytics.track` only send given properties, no browser-specific properties are tracked.


