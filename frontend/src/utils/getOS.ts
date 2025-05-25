export const detectOS = (): string => {
  const userAgent = navigator.userAgent
  if (/Windows NT/.test(userAgent)) {
    return 'Windows'
  } else if (/Mac OS X/.test(userAgent)) {
    return 'Mac OS'
  } else if (/Android/.test(userAgent)) {
    return 'Android'
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'iOS'
  } else if (/Linux/.test(userAgent)) {
    return 'Linux'
  } else {
    return 'Unknown'
  }
}
