import { RabbitMQTransport } from '@cheep/transport-rabbitmq'

async function run() {
  const transport = new RabbitMQTransport({
    moduleName: 'Logger',
    amqpConnectionString: 'amqp://localhost',
    publishExchangeName: 'Hub',
    failedMessagesQueueName: 'FailedMessages',
  })

  await transport.init()

  transport.onEvery([''], x => {
    console.log(x.route, x.payload)
  })

  await transport.start()

  setInterval(() => {}, 1000)
}

run()
