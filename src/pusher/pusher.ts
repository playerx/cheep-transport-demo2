import {
  createTransportApi,
  createTransportHandler,
} from '@cheep/transport'
import { NatsTransport } from '@cheep/transport-nats'
import { PusherApi } from './pusher.api'

async function run(regionCode: string) {
  const transport = new NatsTransport({ moduleName: 'Server' })

  await transport.init()

  const handler = createTransportHandler<PusherApi>(transport)
  const api = createTransportApi<PusherApi>(transport)

  // handle sendToSocket for a specific region
  handler.on(
    x => x.Command.Pusher._(regionCode).sendToSocket,
    (_, props) => {
      console.log(
        `[Pusher][${regionCode}] data sent to the socket`,
        props.socketId,
        props.data,
      )
    },
  )

  handler.on(
    x => x.Query.Pusher._(regionCode).getConnectedSocketIdsCount,
    () => state.connectionsCount,
  )

  // Emulate new connection received on every 3 seconds
  const state = {
    connectionsCount: 0,
  }

  setInterval(async () => {
    state.connectionsCount++
    await api.publish.Event.Pusher.socketConnected({
      socketId: Date.now().toString(),
    })
  }, 3000)

  console.log(`[Pusher][${regionCode}] Started ✅`)
}

run(process.env.REGION)
