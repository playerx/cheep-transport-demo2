import { createTransportHandler } from '@cheep/transport'
import { RabbitMQTransport } from '@cheep/transport-rabbitmq'
import { getRegionCode } from '../pusher/pusher.domain'
import { ServerRemoteApi } from './server.api'

async function run() {
  const transport = new RabbitMQTransport({
    moduleName: 'Server',
    amqpConnectionString: 'amqp://localhost',
    publishExchangeName: 'Hub',
    failedMessagesQueueName: 'FailedMessages',
  })

  await transport.init()

  const handler = createTransportHandler<ServerRemoteApi>(transport)

  const state = {
    pendingSockets: [],
    activeGamesCount: 0,
  }

  // handle sendToSocket for a specific region
  handler.on(
    x => x.Event.Pusher.socketConnected,
    async (api, props) => {
      state.pendingSockets.push(props.socketId)

      if (state.pendingSockets.length >= 4) {
        await api.execute.Command.GameServer.createGame(
          state.pendingSockets.splice(0, 4),
        )
      }
    },
  )

  handler.on(
    x => x.Event.GameServer.gameCreated,
    async (api, props) => {
      const { id: gameId, socketIds } = props

      const tasks = socketIds.map(socketId => {
        const regionCode = getRegionCode(socketId)

        return api.publish.Command.Pusher._(regionCode).sendToSocket({
          socketId,
          data: 'GameStarting!',
        })
      })

      await Promise.all(tasks)

      await api.execute.Command.GameServer.startGame(gameId)
    },
  )

  handler.on(
    x => x.Event.GameServer.gameStarted,
    () => {
      state.activeGamesCount++
    },
  )

  handler.on(
    x => x.Event.GameServer.gameFinished,
    () => {
      state.activeGamesCount--
    },
  )

  await transport.start()

  // Dummy process just to avoid instant exit
  setInterval(() => {}, 1000)

  console.log(`[Server] Started ✅`)
}

run()
