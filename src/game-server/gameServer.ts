import {
  createTransportApi,
  createTransportHandler,
} from '@cheep/transport'
import { NatsTransport } from '@cheep/transport-nats'
import { GameServerApi } from './gameServer.api'

async function run() {
  const transport = new NatsTransport({ moduleName: 'Server' })

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
