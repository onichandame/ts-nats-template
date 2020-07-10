import { connect, Client, Payload } from 'ts-nats';

import { Server } from './server';

const subject = process.env.NATS_SUBJECT || 'NatsExample';

describe('server', () => {
  let nats: Client;
  let server: Server;
  beforeAll(async done => {
    nats = await connect({
      servers: [process.env.NATS_ADDR || 'nats://nats'],
      payload: Payload.JSON
    });
    server = new Server();
    await server.listen({
      subject,
      servers: [process.env.NATS_ADDR || 'nats://nats']
    });
    done();
  });
  test('is able to handle requests', async done => {
    const reply = await nats.request(subject);
    expect(reply.data).toHaveProperty('status', 'success');
    done();
  });
  afterAll(async () => {
    await nats.drain();
    await server.stop();
  });
});
