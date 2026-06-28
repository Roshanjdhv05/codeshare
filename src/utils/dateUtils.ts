export const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return options?.addSuffix ? 'just now' : 'now'
  } else if (diffInMinutes < 60) {
    return options?.addSuffix ? `${diffInMinutes} minutes ago` : `${diffInMinutes}m`
  } else if (diffInHours < 24) {
    return options?.addSuffix ? `${diffInHours} hours ago` : `${diffInHours}h`
  } else {
    return options?.addSuffix ? `${diffInDays} days ago` : `${diffInDays}d`
  }
}