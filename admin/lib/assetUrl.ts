export function appendAssetCacheKey(
  value: string | null | undefined,
  cacheKey: number,
) {
  const source = value?.trim();
  if (!source) return "";

  const hashIndex = source.indexOf("#");
  const url = hashIndex >= 0 ? source.slice(0, hashIndex) : source;
  const hash = hashIndex >= 0 ? source.slice(hashIndex) : "";
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${cacheKey}${hash}`;
}
