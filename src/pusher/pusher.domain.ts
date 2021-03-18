const separator = '|'

export function buildSocketId(
  regionCode: string,
  connectionId: string,
) {
  return [regionCode, connectionId].join(separator)
}

export function getRegionCode(socketId: string) {
  return socketId.split(separator)[0]
}
