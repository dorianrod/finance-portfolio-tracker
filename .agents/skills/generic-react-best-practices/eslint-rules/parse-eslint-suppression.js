export function parseEslintSuppression(comment) {
  const directive =
    /^\s*(eslint-disable(?:-next-line|-line)?)(?=\s|$)([\s\S]*)$/u.exec(
      comment.value,
    )
  if (!directive) return null
  if (directive[1] === 'eslint-disable') {
    return {
      problem:
        'Use a line-scoped suppression instead of disabling a block or file.',
    }
  }

  const parts = /^(.*?)\s--\s([\s\S]*)$/u.exec(directive[2])
  const rules = (parts?.[1] ?? directive[2])
    .trim()
    .split(',')
    .map((rule) => rule.trim())
  if (rules.some((rule) => !/^[^\s,]+$/u.test(rule))) {
    return {
      problem: 'Name each suppressed rule explicitly, separated by commas.',
    }
  }

  const review = /^reviewed:\s*(\d{4}-\d{2}-\d{2});\s*([\s\S]*)$/u.exec(
    parts?.[2].trim() ?? '',
  )
  if (!review) {
    return {
      problem:
        'Add "-- reviewed: YYYY-MM-DD; concrete technical reason" after the rule names.',
    }
  }
  const reviewed = review[1]
  const date = new Date(`${reviewed}T00:00:00.000Z`)
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== reviewed
  ) {
    return {
      problem:
        'Use a valid calendar date in YYYY-MM-DD format for the last review.',
    }
  }
  const reason = review[2].trim()
  if (!reason) {
    return {
      problem: 'Explain the concrete technical reason after the review date.',
    }
  }
  return { rules, reviewed, reason }
}
