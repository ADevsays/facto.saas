import { supabase } from '~/server/lib/supabase'

export function getTodayDateString(timeZone = 'America/Bogota'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

export async function recordDailyView(dateStr?: string, increment = 1): Promise<void> {
  const targetDate = dateStr || getTodayDateString()

  // 1. Try to record in daily_views table if available
  try {
    const { data: existing, error: selectErr } = await supabase
      .from('daily_views')
      .select('views')
      .eq('date', targetDate)
      .maybeSingle()

    if (!selectErr) {
      if (existing) {
        await supabase
          .from('daily_views')
          .update({
            views: (existing.views || 0) + increment,
            updated_at: new Date().toISOString()
          })
          .eq('date', targetDate)
      } else {
        await supabase
          .from('daily_views')
          .insert({
            date: targetDate,
            views: increment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
      return
    }
  } catch {
    // Table not created yet, proceed to snapshot fallback
  }

  // 2. Fallback to notification_snapshots (snapshot_type: 'daily_views')
  try {
    const { data: snapList } = await supabase
      .from('notification_snapshots')
      .select('id, state')
      .eq('snapshot_type', 'daily_views')
      .order('created_at', { ascending: false })
      .limit(1)

    const latestSnap = snapList?.[0]
    const stateObj = (latestSnap?.state as any) || {}
    const history: Record<string, number> = { ...(stateObj.history || {}) }
    history[targetDate] = (history[targetDate] || 0) + increment

    if (latestSnap?.id) {
      await supabase
        .from('notification_snapshots')
        .update({
          state: {
            ...stateObj,
            date: targetDate,
            today: history[targetDate],
            history
          }
        })
        .eq('id', latestSnap.id)
    } else {
      await supabase
        .from('notification_snapshots')
        .insert({
          snapshot_type: 'daily_views',
          state: {
            date: targetDate,
            today: history[targetDate],
            history
          }
        })
    }
  } catch {
    // Non-fatal
  }
}

export async function getDailyViewsMap(): Promise<Map<string, number>> {
  const viewsMap = new Map<string, number>()

  // 1. Attempt to read from daily_views table
  try {
    const { data, error } = await supabase
      .from('daily_views')
      .select('date, views')
      .order('date', { ascending: true })

    if (!error && Array.isArray(data) && data.length > 0) {
      for (const row of data) {
        if (row.date && typeof row.views === 'number') {
          viewsMap.set(row.date, row.views)
        }
      }
      return viewsMap
    }
  } catch {
    // Fall back to snapshots
  }

  // 2. Check notification_snapshots for daily_views records
  try {
    const { data: snapList } = await supabase
      .from('notification_snapshots')
      .select('state')
      .eq('snapshot_type', 'daily_views')
      .order('created_at', { ascending: false })
      .limit(1)

    const snap = snapList?.[0]
    if (snap?.state?.history) {
      const history = snap.state.history as Record<string, number>
      for (const [date, count] of Object.entries(history)) {
        if (!viewsMap.has(date) || (viewsMap.get(date) || 0) < count) {
          viewsMap.set(date, count)
        }
      }
    }
  } catch {
    // Non-fatal
  }

  return viewsMap
}
