// const redis = require('redis');
const Neerd = require('..');
// jest.mock('..');

jest.mock('redis', () => ({
  createClient: () => {
    const redisMock = require('redis-mock');
    return redisMock.createClient();
  },
  redisClient: () => {
    const redisMock = require('redis-mock');
    return redisMock.createClient();
  },
}));

describe('neerd general implementation', () => {
  // beforeEach(() => {
  //   Neerd.mockClear();
  // });

  test('Check if the class constructor has been called one time', () => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });
    const neerd = new Neerd(conf());
    expect(conf).toBeTruthy();
    expect(conf).toHaveBeenCalledTimes(1);
  });

  test('Check if throws TypeError when no config is provided', () => {
    expect(() => {
      new Neerd();
    }).toThrow(TypeError);
  });

  test('Check if throws TypeError when config provided is not an object', () => {
    expect(() => {
      new Neerd('host: localhost');
    }).toThrow(TypeError);
  });

  test('Check if constructor emits when the connection has been successful', done => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());

    neerd.on('connection', (message) => {
      expect(message).toEqual('Redis PUBSUB client connected on localhost:6379');
      done();
    });
  });

  test('Check if constructor emits an error when connection has not been successful', done => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());
    
    neerd.on('error', (error) => {
      expect(error).toEqual('Something went wrong connecting to redis (PUBSUB): Error: Host is not reachable');
      done();
    });
    neerd.redisClient.emit('error', new Error('Host is not reachable'));
  });

  test('Check if subscription works properly', done => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());

    neerd.on('subscription', (message) => {
      expect(message).toEqual('Subscribed to test-channel');
      done();
    });
    neerd.startSub('test-channel');
  });

  test('Check if throws TypeError when trying to pass channel as a non-string', () => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());
    expect(() => {
      neerd.publish({ 'test': 'test' });
    }).toThrow(TypeError);
  });

  test('Check if throws TypeError when trying to pass message as a non-string', () => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());
    expect(() => {
      neerd.publish('test-channel', {});
    }).toThrow(TypeError);
  });

  test('Check if message is correctly published and received', done => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());

    neerd.on('test-channel', (message) => {
      expect(message).toEqual('This is a serialized message');
      done();
    });
    neerd.startSub('test-channel');

    neerd.publish('test-channel', 'This is a serialized message');
  });

  test('Check if multiple subscriptions works correctly', done => {
    const conf = jest.fn();
    conf.mockReturnValue({
      host: 'localhost',
      port: 6379,
    });

    const neerd = new Neerd(conf());

    neerd.on('test-channel', (message) => {
      expect(message).toEqual('This is a serialized message');
    });
    neerd.startSub('test-channel');

    neerd.on('another-test-channel', (message) => {
      expect(message).toEqual('This is a serialized message');
      done();
    });
    neerd.startSub('another-test-channel');

    neerd.publish('test-channel', 'This is a serialized message');
    neerd.publish('another-test-channel', 'This is a serialized message');
  });
});