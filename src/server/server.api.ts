import { GameServerApi } from '../game-server/gameServer.api'
import { PusherApi } from '../pusher/pusher.api'

export type ServerRemoteApi = PusherApi & GameServerApi
