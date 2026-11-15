function toIsoString(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null)
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null
}

export function filterJournalEntries(entries = [], searchTerm = '') {
  const normalizedTerm = searchTerm.trim().toLocaleLowerCase()
  if (!normalizedTerm) return entries

  return entries.filter((entry) =>
    [entry.title, entry.body].some((value) =>
      String(value || '').toLocaleLowerCase().includes(normalizedTerm),
    ),
  )
}

export function createJournalExport(entries = []) {
  const exportedEntries = entries.map((entry) => ({
    id: entry.id,
    title: entry.title || '',
    body: entry.body || '',
    kind: entry.kind || 'free',
    ...(entry.prompt ? { prompt: entry.prompt } : {}),
    ...(entry.moodId ? { moodId: entry.moodId } : {}),
    createdAt: toIsoString(entry.createdAt),
    updatedAt: toIsoString(entry.updatedAt),
  }))

  return JSON.stringify({
    format: 'MindBloom journal export',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: exportedEntries,
  }, null, 2)
}
