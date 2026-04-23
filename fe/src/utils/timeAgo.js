export function timeAgo(unixSeconds) {
  if (!unixSeconds) return ''
  const now = Math.floor(Date.now() / 1000)
  const diff = now - unixSeconds
  const plural = (n, unit) => `${n} ${unit}${n !== 1 ? 's' : ''} ago`
  if (diff < 60) return plural(diff, 'second')
  if (diff < 3600) return plural(Math.floor(diff / 60), 'minute')
  if (diff < 86400) return plural(Math.floor(diff / 3600), 'hour')
  if (diff < 2592000) return plural(Math.floor(diff / 86400), 'day')
  if (diff < 31536000) return plural(Math.floor(diff / 2592000), 'month')
  return plural(Math.floor(diff / 31536000), 'year')
}
