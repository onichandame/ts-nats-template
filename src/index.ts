import { Server } from './server';

const server = new Server();
server.listen({
  subject: process.env.NATS_SUBJECT || 'NatsExample',
  servers: [process.env.NATS_ADDR || 'nats://nats']
}).then(() => {
  console.log('service up');
});
