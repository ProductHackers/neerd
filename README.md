# neerd - Node Event Emitter Redis

[![Build Status](https://travis-ci.org/ProductHackers/neerd.svg?branch=master)](https://travis-ci.org/ProductHackers/neerd)
[![Coverage Status](https://coveralls.io/repos/github/ProductHackers/neerd/badge.svg?branch=master)](https://coveralls.io/github/ProductHackers/neerd?branch=master)

Neerd is a little wrapper around `node_redis` pub/sub feature, which essentially emit events to other node modules on subscriptions messages.

## Install
`npm i --save @product-hackers/neerd`

## Usage
```js
const Neerd = require('@product-hackers/neerd');

// All config from node_redis is available to pass in the constructor.
// See https://github.com/NodeRedis/node_redis
const redisConfig = {
  host: 'localhost',
  port: 6379,
};

const neerd = new Neerd(redisConfig);

neerd.on('connection', async (message) => {
  console.log(`Connected: ${message}`);
  testSub();
  testPub();
});

neerd.on('error', (error) => {
  console.error(`There was an error connecting to redis: ${error}`);
});

const testSub = () => {
  neerd.on('test-channel', (message) => {
    console.log(`Message received on test-channel: ${message}`);
  });
  neerd.startSub('test-channel');
};

const testPub = (message = '') => {
  const neerdPub = new Neerd(redisConfig);
  neerdPub.publish('test-channel', 'This is a test message sent via redis pubsub');
  neerdPub.publish('test-channel', JSON.stringify({ message: 'You can also serialize messages' }));
};
```

## Testing
Running `npm t` builds the library, runs the tests and report coverage.

## License
[MIT](LICENSE).