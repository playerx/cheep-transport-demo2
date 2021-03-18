import { ApiWithExecutableKeys } from '@cheep/transport'

export type Api = {
  Command: {
    GameServer: {
      /**
       * Creates new Game
       * @param sockets - socketIds to join the game
       * @returns created game id
       */
      createGame(sockets: string[]): Promise<string>

      startGame(id: string): Promise<void>
    }
  }

  Query: {
    GameServer: {
      activeGamesCount(): Promise<number>
    }
  }

  Event: {
    GameServer: {
      gameCreated(props: { id: string; socketIds: string[] }): void

      gameStarted(props: { id: string }): void

      gameFinished(props: { id: string }): void
    }
  }
}

export type GameServerApi = ApiWithExecutableKeys<
  Api,
  'Command' | 'Query'
>
