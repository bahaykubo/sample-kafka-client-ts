import { config } from '../config';
import { Kafka, logLevel, Message, Producer } from 'kafkajs';

export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;

  /**
   * Kafka producer client
   */
  constructor(brokerURL?: string) {
    const broker = brokerURL ?? config.kafka.brokerURL;
    this.kafka = new Kafka({
      clientId: 'sample-producer',
      brokers: [broker],
      logLevel: logLevel.NOTHING,
    });
    this.producer = this.kafka.producer();
  }

  /**
   * Sends a message to a topic in kafka.
   *
   * This includes connecting and disconnecting after sending a message.
   * So it can be called without this producer instance explicitly
   * connecting and disconnecting.
   */
  async sendTopicMessage(options: { topic: string, messages: Message[] }) {
    try {
      await this.connect();
      await this.producer.send({
        topic: options.topic,
        messages: options.messages,
      });
      await this.disconnect();
    } catch (error) {
      throw new Error(`Failed to send message. ${error}`);
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }

  async connect() {
    await this.producer.connect();
  }
}
