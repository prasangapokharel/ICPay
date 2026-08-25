const ICP_MENTION_RE = /\$icp\b/i

export function messageMentionsIcp(text: string): boolean {
  return ICP_MENTION_RE.test(text)
}
