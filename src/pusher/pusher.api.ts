import { ApiWithExecutableKeys } from '@cheep/transport'

export type Api = {
  Command: {
    Pusher: {
      _(
        region: string,
      ): {
        sendToSocket(props: {
          socketId: string
          data: unknown
        }): Promise<void>
      }
    }
  }

  Query: {
    Pusher: {
      _(
        region: string,
      ): {
        getConnectedSocketIdsCount(): Promise<number>
      }
    }
  }

  Event: {
    Pusher: {
      socketConnected(props: { socketId: string }): void

      socketDisconnected(props: { socketId: string }): void
    }
  }
}

export type PusherApi = ApiWithExecutableKeys<
  Api,
  'Command' | 'Query'
>
