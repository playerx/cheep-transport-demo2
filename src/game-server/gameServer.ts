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

  const state = {
    activeGames: [],
  }

  // handle sendToSocket for a specific region
  handler.on(
    x => x.Command.GameServer.createGame,
    async (api, socketIds) => {
      const newGameId = Date.now().toString()

      state.activeGames.push(newGameId)

      await api.publish.Event.GameServer.gameCreated({
        id: newGameId,
        socketIds,
      })

      console.log('[GameServer] New game created', newGameId)

      return newGameId
    },
  )

  handler.on(
    x => x.Query.GameServer.activeGamesCount,
    () => state.activeGames.length,
  )

  await transport.start()

  // Emulate new connection received on every 3 seconds
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
