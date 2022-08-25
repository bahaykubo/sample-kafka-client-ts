import { KafkaConsumer } from '../app/kafka/consumer';
import { KafkaProducer } from '../app/kafka/producer';
import { DateUtils, log, pause, timerRunning } from '../app/utils';

describe('Kafka', function () {
  this.timeout(0);
  const kafkaProducer = new KafkaProducer();

  beforeEach('Connect kafka', async function () {
    await kafkaProducer.connect();
  });

  afterEach('Disconnect kafka', async function () {
    await kafkaProducer.disconnect();
  });

  it('should produce a message on account credit to the credit topic', async function () {
    const startTime = DateUtils.dateInISOString();
    const runTime = 40;
    const messagesPerBatch = 10;
    const batchInterval = 20;
    const retries = 6;
    const retryInterval = 4;

    while (timerRunning({ startTime, runTime, unit: 'seconds' })) {
      const batchStartTime = DateUtils.dateInISOString();
      log('Starting kafka messages batch');

      const kafkaConsumer = new KafkaConsumer();
      await kafkaConsumer.connect();
      await kafkaConsumer.subscribeAndListenToTopics(['testing']);

      const createDate = DateUtils.formatDate();
      const messages = [];
      for (let message = 1; message <= messagesPerBatch; message++) {
        messages.push({
          topic: 'testing',
          message: JSON.stringify({ id: message, bing: 'bong', date: createDate }),
        });
      }
      await kafkaProducer.sendTopicMessage({
        topic: 'testing',
        messages: messages.map((message) => ({
          value: message.message,
        })),
      });

      await kafkaConsumer
        .findMessages({
          message: {
            date: createDate,
          },
          expectedNumberOfMessages: messagesPerBatch,
          retries,
          retryInterval
        })
        .then((messages) => {
          log(`Received ${messages.length}/${messagesPerBatch} from batch`);
        })
        .catch((error) => {
          log(`Failed to find kafka messages from batch. ${error}`);
          // TODO - compare what we published and what we received and write to csv file messages
          // that have not been found when we started listening
        })
        .finally(() => {
          kafkaConsumer.disconnect();
        });

      const batchElapsedTime = DateUtils.timeSince({ startTime: batchStartTime });
      if (batchElapsedTime < batchInterval) {
        const waitTime = batchInterval - batchElapsedTime;
        log(`Done in ${batchElapsedTime}s, waiting for ${waitTime}s`);
        await pause(waitTime);
      }
      log('Finished processing batch');
    }
  });
});
