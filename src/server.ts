import { Client, Payload, connect, NatsConnectionOptions } from 'ts-nats';
import debug from 'debug';

const logger = debug('NatsService:Server');

export class Server {
  private nats?: Client;
  public async listen ({ subject, ...options }: NatsConnectionOptions & {subject: string}) {
    options.payload = Payload.JSON;
    this.nats = await connect(options);
    return Promise.all([
      this.nats.subscribe(subject, (e, msg) => {
        let reply;
        try {
          if (e) throw e;
          reply = { status: 'success' };
        } catch (e) {
          logger(
            `failed to process request ${JSON.stringify(
              msg.data
            )} due to ${JSON.stringify(e.message || e)}`
          );
          reply = {
            status: 'failed',
            message: JSON.stringify(e.message || e)
          };
        }
        if (msg.reply) this.nats?.publish(msg.reply, reply);
      })
        .then(() =>
          logger(`listening for requests on ${subject}`)
        ),
    ]).then(() => this.nats?.flush()); // awaits the subscriptions
  }
  public async stop () {
    return this.nats?.drain();
  }
}
