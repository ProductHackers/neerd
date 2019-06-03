const EventEmitter = require('events');
const redis = require('redis');

export default class Neerd extends EventEmitter {
  constructor(config) {
    super();
    if (!config || (typeof (config) !== 'object')) throw new TypeError('Config for redis must be an object');
    const { port, host } = config;
    this.redisClient = redis.createClient(config);

    this.redisClient.on('connect', () => {
      this.emit('connection', `Redis PUBSUB client connected on ${host}:${port}`);
    });

    this.redisClient.on('error', (error) => {
      this.emit('error', `Something went wrong connecting to redis (PUBSUB): ${error}`);
      this.redisClient = null;
    });
  }

  startSub(subChannel = '') {
    this.redisClient.on('message', (channel, message) => {
      if (channel === subChannel) {
        try {
          this.emit(subChannel, message);
        } catch (e) {
          this.emit('error', `Error emitting message on ${subChannel}: ${e}`);
        }
      }
    });
    this.redisClient.subscribe(subChannel);
    this.emit('subscription', `Subscribed to ${subChannel}`);
  }

  publish(channel, message = '') {
    // Message must be serialized i.e. JSON.stringify(message)
    if (typeof (channel) !== 'string') throw new TypeError('Channel param must be a string');
    if (typeof (message) !== 'string') throw new TypeError('Message param must be an object');

    try {
      this.redisClient.publish(channel, message);
    } catch (e) {
      this.emit('error', `There was an error publishing to redis: ${e}`);
    }
  }
}