import { Kafka, logLevel, Consumer } from 'kafkajs';
import { pause } from '../utils';
import { config } from '../config';

export class KafkaConsumer {
  private kafka: Kafka;
  private consumer: Consumer;
  private _messages: any[];

  /**
   * Kafka consumer client.
   */
  constructor(options?: { groupId?: string, brokerURL?: string }) {
    const broker = options?.brokerURL ?? config.kafka.brokerURL;

    try {
      this.kafka = new Kafka({
        clientId: 'sample-consumer',
        brokers: [broker],
        logLevel: logLevel.NOTHING,
      });
      this.consumer = this.kafka.consumer({ groupId: options?.groupId ?? 'sample-group' });
    } catch {
      throw new Error(`Failed to create a consumer connection to kafka from ${broker}`);
    }
    this._messages = [];
  }

  get messages() {
    return this._messages;
  }

  async connect() {
    await this.consumer.connect();
  }

  async disconnect() {
    await this.consumer.disconnect();
  }

  /**
   * Subscribes and listens to a topic(s) and starts pushing messages it receives
   * to this kafka consumer instance messages property.
   */
  async subscribeAndListenToTopics(topics: string[] | RegExp[]) {
    try {
      await this.subscribeToTopics(topics);
      await this.startListening();
    } catch (error) {
      throw new Error(`Failed to subscribe and listen for messages. ${error}`);
    }
  }

  /**
   * Subscribe to a topic(s).
   */
  async subscribeToTopics(topics: string[] | RegExp[]) {
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }
  }

  /**
   * Start listening to kafka and push messages it receives
   * to this kafka consumer instance message property.
   *
   * Will need to have subscribed to a topic beforehand otherwise no messages will be received.
   */
  async startListening() {
    this.clearMessagesList();
    try {
      await this.consumer.run({
        // eslint-disable-next-line require-await
        eachMessage: async ({ message }) => {
          let value: any;
          try {
            if (message.value) {
              value = JSON.parse(message.value?.toString());
            }
          } catch (error) {
            value = message.value?.toString() ?? '';
          }
          this._messages.push(value);
        },
      });
    } catch (error) {
      throw new Error(`Failed to listen for messages. ${error}`);
    }
  }

  private clearMessagesList() {
    this._messages.length = 0;
  }

  /**
   * Find messages that are getting added to the messages property of this
   * kafka consumer instance as it listens to subscribed topics.
   *
   */
  async findMessages({ message, expectedNumberOfMessages = null, retries = 3, retryInterval = 2 }: {
    message: any; expectedNumberOfMessages?: number | null; retries?: number; retryInterval?: number;
  }): Promise<any[]> {
    let filteredMessages = [];
    for (let retry = 1; retry <= retries; retry++) {
      try {
        if (this.noMessagesReceived()) {
          throw new Error('No messages received.');
        }

        filteredMessages = this.filterMessages(message);
        if (this.noMessagesFound(filteredMessages)) {
          throw new Error('No messages found matching the given value.');
        }
        if (
          expectedNumberOfMessages &&
          this.doesNotMatchExpectedNumberOfMessages(filteredMessages, expectedNumberOfMessages)
        ) {
          throw new Error(
            `Expecting ${expectedNumberOfMessages} messages from the batch but got ${filteredMessages.length}`
          );
        }
        break;
      } catch (error: any) {
        if (retry >= retries) {
          throw new Error(error.message);
        }
        await pause(retryInterval);
      }
    }
    return filteredMessages;
  }

  private filterMessages(filter: any) {
    return this.messages.filter((message) => {
      return Object.keys(filter).every((key: any) => message[key] === filter[key]);
    });
  }

  private noMessagesFound(filteredMessages: any[]) {
    return filteredMessages.length === 0;
  }

  private noMessagesReceived() {
    return this.messages.length === 0;
  }

  private doesNotMatchExpectedNumberOfMessages(messages: any[], expectedNumberOfMessages: number) {
    return messages.length !== expectedNumberOfMessages;
  }
}
