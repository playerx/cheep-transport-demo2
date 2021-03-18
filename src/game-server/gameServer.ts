import {
  createTransportApi,
  createTransportHandler,
} from '@cheep/transport'
import { RabbitMQTransport } from '@cheep/transport-rabbitmq'
import { GameServerApi } from './gameServer.api'

async function run() {
  const transport = new RabbitMQTransport({
    moduleName: 'GameServer',
    amqpConnectionString: 'amqp://localhost',
    publishExchangeName: 'Hub',
    failedMessagesQueueName: 'FailedMessages',
  })

  await transport.init()

  const handler = createTransportHandler<GameServerApi>(transport)
  const rootApi = createTransportApi<GameServerApi>(transport)

  // state should NOT stored here in real application
  // instead use Redis, MongoDb, MySQL, Memcached or
  // any other storage based on your needs
  const state = {
    activeGames: [],
  }

  // handle game server Commands and Queries
  handler.on(
    x => x.Command.GameServer.createGame,
    async (api, socketIds) => {
      const newGameId = Date.now().toString()
      state.activeGames.push(newGameId)

      await api.publish.Event.GameServer.gameCreated({
        id: newGameId,
        socketIds,
      })

      return newGameId
    },
  )

  handler.on(
    x => x.Query.GameServer.activeGamesCount,
    () => state.activeGames.length,
  )

  await transport.start()

  // Simulate new connection received on every 3 seconds
  setInterval(async () => {
    if (!state.activeGames.length) {
      return
    }

    const finishedGameId = state.activeGames.pop()

    await rootApi.publish.Event.GameServer.gameFinished({
      id: finishedGameId,
    })
  }, 3000)

  console.log('[Game Server] Started ✅')
}

run()
