export interface DateGroup<T = unknown> {
  date: string // YYYY-MM-DD format
  dayDisplay: string // "Monday, June 28"
  times: Array<{
    id: string
    time: string
    timeDisplay: string // "6:00 PM"
    originalData: T
  }>
}

export function groupDatesByDay<T extends { id?: string; date: string; time: string }>(
  dates: T[]
): DateGroup<T>[] {
  const groups = new Map<string, DateGroup<T>>()

  dates.forEach((dateItem) => {
    const { date, time, id } = dateItem
    
    if (!groups.has(date)) {
      // Create day display
      const dayDisplay = formatDayDisplay(date)
      
      groups.set(date, {
        date,
        dayDisplay,
        times: []
      })
    }

    const group = groups.get(date)!
    const timeDisplay = formatTimeDisplay(time)
    
    group.times.push({
      id: id || `${date}-${time}`,
      time,
      timeDisplay,
      originalData: dateItem
    })
  })

  // Sort groups by date and times within each group
  const sortedGroups = Array.from(groups.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Sort times within each group
  sortedGroups.forEach(group => {
    group.times.sort((a, b) => a.time.localeCompare(b.time))
  })

  return sortedGroups
}

function formatDayDisplay(date: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  } catch {
    return date
  }
}

function formatTimeDisplay(time: string): string {
  try {
    const [hours, minutes] = time.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  } catch {
    return time
  }
}