export function toUpperCase(arg: string) {
  return arg.toUpperCase()
}

export type stringInfo = {
  lowerCase: string
  upperString: string
  characters: string[]
  length: number
  extraInfo: Object | undefined
}

export function getStringInfo(arg: string): stringInfo {
  return {
    lowerCase: arg.toLowerCase(),
    upperString: arg.toUpperCase(),
    characters: Array.from(arg),
    length: arg.length,
    extraInfo: {},
  }
}
