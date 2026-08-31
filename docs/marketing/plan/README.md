# ICPay Marketing Plan

**Last Updated:** 2026-08-19  
**Status:** Active  
**Owner:** Marketing Team

---

## Executive Summary

ICPay is a custodial ICP wallet where **your username is your address**. No account IDs, no principal strings — just send to `@handle`. This marketing plan outlines our strategy to grow adoption across three core audiences: crypto users, Web3 developers, and online merchants.

**Core Value Propositions:**
1. **Human-readable addresses** — Send to `@alice`, not `6vbhm-nqaaa-aaaan-q6muq-cai`
2. **Multi-token custody** — ICP, ckBTC, ckETH, ckUSDC, ckUSDT, all SNS tokens
3. **Token swaps** — Integrated DEX via ICPSwap
4. **Token launches** — Create ICRC-1 tokens without dfx
5. **Cloud storage** — On-chain file hosting (ICPay Bucket)
6. **Internet Identity auth** — No passwords, no seed phrases

**Current State:**
- Live at `icpay.app` and `ic-pay.vercel.app`
- Backend canister: `6vbhm-nqaaa-aaaan-q6muq-cai` (on-chain, auditable)
- Frontend: Static export on Vercel
- Phase 6 complete (swaps, cloud storage, live streaming)
- Phase 7 next (decentralizing custody, security audit)

---

## Target Audiences

### 1. ICP Ecosystem Natives (Primary)

**Who they are:**
- Current ICP users frustrated by principal/account-ID UX
- SNS token holders wanting easier transfer flow
- Developers building ICP dApps needing custodial wallets for users
- NNS stakers looking for username-based identity

**Pain points:**
- Sharing a 63-character principal is embarrassing
- Every dApp reinvents custody poorly
- No username layer across the ecosystem

**Our message:**
- "Stop copying principals. Start sending to @handle."
- "The ICP wallet that non-crypto people can actually use."

**Where to reach them:**
- DFINITY Forum
- OpenChat channels (ICP, SNS governance)
- Twitter/X: #ICP, #InternetComputer hashtags
- Reddit: r/dfinity
- Discord: DFINITY Dev, ICP League

---

### 2. DeFi Users (Cross-Chain Growth)

**Who they are:**
- Ethereum, Solana, Arbitrum users curious about ICP
- Bridge users tired of $50 gas fees
- Stablecoin traders (USDC, USDT)
- DEX users looking for lower-fee swaps

**Pain points:**
- ENS costs money and doesn't work everywhere
- Every chain has a different wallet
- High fees for small transfers

**Our message:**
- "Chain-key tokens = native BTC/ETH/USDC without bridges"
- "Swap tokens for pennies, not $40"
- "One username across every token"

**Where to reach them:**
- Twitter/X: #DeFi, #CryptoTwitter
- Reddit: r/CryptoCurrency, r/defi
- YouTube: DeFi explainer channels
- Telegram: DeFi trading groups

---

### 3. Web3 Developers (Builder Segment)

**Who they are:**
- Motoko/Rust devs building ICP dApps
- Full-stack devs wanting Web3 wallets for their users
- Teams launching tokens via SNS or direct ICRC-1

**Pain points:**
- Building custody from scratch is hard and risky
- Token launches require dfx and cycles management
- No good custodial wallet-as-a-service

**Our message:**
- "Integrate ICPay as your app's wallet layer"
- "Launch ICRC-1 tokens in one screen, no CLI"
- "ICPay Bucket = S3-compatible storage on-chain"

**Where to reach them:**
- GitHub (star/fork outreach)
- DFINITY Dev Forum
- Dev.to, Hashnode
- ICP hackathons and bounties
- Twitter/X: #Motoko, #ICPDev
- Discord: DFINITY Dev, ICP community servers

---

### 4. Online Merchants (Phase 8 Prep)

**Who they are:**
- E-commerce shops tired of Stripe's 2.9% + $0.30
- Digital goods sellers (courses, ebooks, software)
- Content creators accepting tips

**Pain points:**
- Card processing fees eat margins
- Chargebacks are unilateral theft
- Fiat settlement takes days

**Our message:**
- "Accept crypto without volatility — settle in stablecoins"
- "No chargebacks. On-chain payment is final."
- "Pay @shop instead of a 34-character address"

**Where to reach them:**
- Shopify forums
- Reddit: r/ecommerce, r/EntrepreneurRideAlong
- Twitter/X: #Shopify, #ecommerce
- Email outreach to crypto-friendly merchants

**Status:** Not actively targeting until Phase 8 (Merchant & Payments) ships.

---

## Marketing Channels

### 1. Twitter/X (Primary Channel)

**Handle:** `@IcpayOfficial`  
**Goal:** Thought leadership, product updates, community engagement  
**Posting frequency:** 1-2x daily

**Content pillars:**
- Product updates (new features, improvements)
- User stories and testimonials
- ICP ecosystem news and commentary
- Educational content (how-to threads, tips)
- Memes and community engagement

**Hashtags to use:**
- `#ICP` `#InternetComputer` `#Web3` `#DeFi`
- `#CryptoWallet` `#Blockchain` `#ICPSwap`

**Engagement strategy:**
- Reply to mentions within 2 hours
- Quote-tweet positive user experiences
- Engage with DFINITY, Dominic Williams, ICP ecosystem projects
- Weekly Twitter Space (Friday 3pm UTC)

---

### 2. GitHub (Developer Channel)

**Repo:** `github.com/prasangapokharel/ICPay`  
**Goal:** Developer adoption, transparency, contributions

**Content:**
- Detailed README with live demo
- Architecture diagrams in `docs/architecture/`
- Contribution guide in `CONTRIBUTING.md`
- Canister source (already public on-chain)

**Strategy:**
- Tag releases with changelogs
- Label "good first issue" for contributors
- Respond to issues within 24 hours
- Accept PRs for frontend/docs (not backend without review)

---

### 3. YouTube (Educational Channel)

**Goal:** Tutorials, product demos, ecosystem updates  
**Posting frequency:** 1x weekly

**Video types:**
- "How to send ICP by username" (2-3 min)
- "Launch a token without dfx" (5-7 min)
- "ICPay Bucket: S3 on-chain" (4-5 min)
- "How ICPay custody works" (explainer, 8-10 min)
- "Weekly ICP ecosystem roundup" (news, 10-12 min)

**Production:**
- Screen recordings with voiceover
- Animated explainers (Figma → After Effects)
- Guest interviews with ICP builders

**Distribution:**
- YouTube (primary)
- Embed on `icpay.app/videos` (if created)
- Share clips on Twitter/X

---

### 4. Medium / Hashnode (Long-Form Content)

**Goal:** SEO, thought leadership, technical deep dives  
**Posting frequency:** 2x monthly

**Topics:**
- "Why usernames are the future of crypto addresses"
- "How ICPay's layered architecture prevents fund theft"
- "Chain-key tokens vs. bridges: a security comparison"
- "The economics of on-chain file storage"
- "Case study: Launching an SNS token via ICPay"

**Distribution:**
- Publish on Medium first (wider reach)
- Cross-post to Hashnode (dev audience)
- Link from Twitter/X with summary thread

---

### 5. Reddit (Community Building)

**Subreddits:**
- r/dfinity (home base)
- r/CryptoCurrency (for reach)
- r/defi (DeFi features)
- r/webdev (developer features)

**Strategy:**
- Participate authentically — no spam
- Share updates as "builder reflections" not ads
- Answer questions about ICP custody/wallets
- AMA once per quarter

---

### 6. DFINITY Forum (Ecosystem Integration)

**Goal:** Developer mindshare, governance participation  
**Posting frequency:** Weekly participation

**Content:**
- Product launch announcements
- Feature roadmap discussions
- Technical Q&A (custody, ICRC-1, cycles)
- Governance proposals (when SNS-ready)

---

### 7. Paid Ads (Future / Phase 8+)

**Status:** Not active yet. Re-evaluate when Phase 8 (Merchants) ships.

**Potential channels:**
- Twitter/X ads (promoted tweets)
- Google search ads (keywords: "ICP wallet", "Internet Computer wallet")
- YouTube pre-roll (explainer videos)

**Budget:** TBD. Start with $500/month test budget.

---

## Content Strategy

### Post Types

#### 1. Product Updates
**Format:** Screenshot + description  
**Example:**
```
🚀 New: Swap any ICRC-1 token in one click via @ICPSwap

Real-time quotes, slippage protection, and instant settlement.

Try it: icpay.app/swap
```

**Frequency:** Every feature release  
**Channels:** Twitter/X, Reddit, DFINITY Forum

---

#### 2. Educational Threads
**Format:** 5-8 tweet thread with visuals  
**Example:**
```
🧵 How to send ICP by username (no more copying principals)

1/ Create an account at icpay.app with Internet Identity
2/ Claim your @handle for free (5-8 chars)
3/ Share @yourhandle — anyone can send you ICP/ckBTC/ckUSDC
4/ That's it. No seed phrases. No account IDs.

[Screenshots in thread]
```

**Frequency:** 1x per week  
**Channels:** Twitter/X (primary), Reddit (summarized)

---

#### 3. User Testimonials
**Format:** Quote + screenshot  
**Example:**
```
"Finally, a crypto wallet my non-crypto friends can use."

— @username, ICPay early adopter

Send to @handle, not a 63-character string.
Try it: icpay.app
```

**Frequency:** 2x per month  
**Channels:** Twitter/X, landing page

**How to collect:**
- Ask in Discord/Telegram
- Monitor Twitter mentions
- Email outreach to active users

---

#### 4. Ecosystem Collaboration
**Format:** Joint announcement  
**Example:**
```
🤝 ICPay x @ICPSwap integration is live

Swap any token, settle instantly, pay by username.

Built on #ICP, powered by @DFINITYorg

Try: icpay.app/swap
```

**Frequency:** Every integration/partnership  
**Channels:** Twitter/X (co-promoted), DFINITY Forum

---

#### 5. Behind-the-Scenes / Transparency
**Format:** Development update or architecture explainer  
**Example:**
```
📊 ICPay by the numbers (Aug 2026):
- 170 reserved brand usernames
- 33 test files (100% passing)
- 6 phases shipped (swaps, storage, live)
- 0 security incidents

Source code: github.com/prasangapokharel/ICPay
Canister: 6vbhm-nqaaa-aaaan-q6muq-cai
```

**Frequency:** Monthly  
**Channels:** Twitter/X, GitHub, Medium

---

### Content Calendar Template

| Day | Channel | Post Type | Example Topic |
|---|---|---|---|
| Monday | Twitter/X | Product Update | "New: File tagging in Bucket" |
| Tuesday | Medium | Long-form | "Custody architecture deep dive" |
| Wednesday | Twitter/X | Educational Thread | "How to claim a username" |
| Thursday | Reddit | Discussion | "What features should we add?" |
| Friday | Twitter/X | User Testimonial | Quote from community |
| Friday | Twitter Space | Live Q&A | "This week in ICPay" |
| Saturday | YouTube | Tutorial | "Launch a token in 5 minutes" |
| Sunday | Twitter/X | Ecosystem News | "ICP ecosystem roundup" |

**Adjust based on:**
- Breaking news (emergency announcements)
- Feature launches (prioritize those)
- Community engagement (reply > new posts)

---

## Collaboration Opportunities

### 1. ICP Ecosystem Projects

**Who to collaborate with:**
- **ICPSwap** — DEX integration (already live)
- **OpenChat** — Embed wallet for tipping
- **DSCVR** — Username integration for social tipping
- **Distrikt** — Social profiles linked to @handles
- **Modclub** — Content moderation via ICPay identity
- **Kinic** — Search results with payment via @handle
- **Sonic** — Additional DEX integration
- **Catalyze** — Analytics for ICPay metrics

**Collaboration terms:**
- **Co-marketing:** Both parties announce on Twitter/X
- **Technical integration:** We provide API docs, they integrate
- **Revenue share:** If applicable (e.g., swap fees)
- **No exclusivity:** ICPay integrates with all major ICP projects

**How to initiate:**
1. DM project team on Twitter/X or Discord
2. Propose specific integration (be concrete)
3. Share API docs or technical spec
4. Co-announce after integration goes live

---

### 2. Content Creators / Influencers

**Who to partner with:**
- ICP YouTube explainers (e.g., ICP Hub, ICP Academy)
- Crypto Twitter influencers (5k-50k followers)
- Technical writers on Medium/Hashnode

**Collaboration types:**
- **Sponsored video:** $200-500 for 5-10min review/tutorial
- **Guest blog post:** No payment, but we share widely
- **Affiliate program:** (Future) 10% of username sales via referral link

**Conditions:**
- Honest review (not purely promotional)
- Disclose sponsorship if paid
- No misleading claims (e.g., "your keys, your crypto" — we're custodial)

**How to initiate:**
1. Find creators via Twitter/YouTube search (#ICP, #InternetComputer)
2. Email pitch: "Would you review ICPay for your audience?"
3. Offer free access + $200-500 for video/article
4. Provide demo account and talking points (not a script)

---

### 3. Developers / Open Source Contributors

**How to attract:**
- Label GitHub issues as "good first issue"
- Offer bounties for major features ($100-1000 per feature)
- Credit contributors in release notes
- Invite active contributors to private Discord channel

**Contribution areas:**
- Frontend UI improvements
- Additional language translations
- Documentation and tutorials
- Bug fixes and testing

**Conditions:**
- Backend changes require maintainer approval (security risk)
- Contributors must sign CLA (to be created)
- No payment for small PRs (docs, typos)
- Bounties paid in ICP after merge

---

### 4. Academic / Research Institutions

**Potential partners:**
- Universities with blockchain research labs
- Security audit firms (for Phase 7)
- UX research teams (for usability studies)

**Collaboration types:**
- **Case study:** ICPay as a research subject for custody UX
- **Security audit:** Paid engagement ($10k-50k) before Phase 7
- **Guest lectures:** Present ICPay architecture to students

**Conditions:**
- Results must be public (no NDAs for research)
- We provide technical access and documentation
- Acknowledge ICPay in publications

---

## Brand Guidelines

### Voice and Tone

**Brand Personality:**
- **Clear, not cute** — Explain crypto simply without condescension
- **Confident, not arrogant** — We're custodial by design; own it
- **Helpful, not salesy** — Educate first, convert second

**Do:**
- Use plain language ("Send to @alice" not "Leverage username-based routing")
- Be honest about trade-offs (custody = convenience, not sovereignty)
- Show, don't tell (screenshots > claims)

**Don't:**
- Use crypto jargon without explanation
- Promise "your keys, your crypto" (we're custodial)
- Attack competitors by name
- Use excessive emojis in formal docs

---

### Visual Identity

**Colors:**
- Primary: ICP Blue (#3B00B9)
- Accent: Bright Cyan (#00D4FF)
- Dark mode: True black backgrounds

**Typography:**
- Headings: Bold, sans-serif (Inter, SF Pro)
- Body: Regular sans-serif, 16px minimum
- Code: Monospace (JetBrains Mono, Fira Code)

**Logo:**
- ICPay wordmark (no standalone icon yet)
- Always on dark background or with sufficient contrast

**Screenshots:**
- Use dark mode by default (looks better)
- Annotate with arrows/highlights when needed
- Show real data, not "lorem ipsum" placeholders

---

## Metrics and KPIs

### Growth Metrics

| Metric | Current | Target (Q4 2026) | How to track |
|---|---|---|---|
| **Total users** | TBD | 5,000 | Query canister: `getUsernameCount` |
| **Active users (30-day)** | TBD | 2,000 | Track last-login via backend |
| **Usernames claimed** | 170 (reserved) | 3,000 | Query: `getUsernameCount` |
| **Twitter followers** | TBD | 2,500 | Twitter analytics |
| **GitHub stars** | TBD | 500 | GitHub insights |

### Engagement Metrics

| Metric | Current | Target | How to track |
|---|---|---|---|
| **Swaps per week** | TBD | 500 | Backend: filter transactions by type |
| **Tokens launched** | TBD | 100 | Query: `listTokens.length` |
| **Buckets created** | TBD | 200 | Query: `listBuckets` count |
| **Average transaction value** | TBD | 10 ICP | Backend analytics |

### Content Metrics

| Metric | Current | Target | How to track |
|---|---|---|---|
| **Twitter impressions/month** | TBD | 100k | Twitter analytics |
| **Medium reads/month** | TBD | 2,000 | Medium stats |
| **YouTube views/month** | TBD | 5,000 | YouTube analytics |
| **DFINITY Forum views** | TBD | 10k | Forum analytics |

**Review frequency:** Monthly. Adjust strategy if metrics stagnate.

---

## Posting Guidelines

### Before You Post

**Checklist:**
- [ ] Is this accurate? (No unverified claims)
- [ ] Is this clear? (Would a non-crypto person understand?)
- [ ] Is this on-brand? (Voice/tone match)
- [ ] Is this timely? (Not old news)
- [ ] Have we announced this before? (No repeat posts within 7 days)

**Approval process:**
- Marketing lead approves all tweets
- Technical team approves technical claims
- No approval needed for replies/engagement

---

### Crisis Communication

**If something goes wrong (hack, exploit, service outage):**

1. **Acknowledge immediately** (within 1 hour)
   ```
   We are aware of [issue] and investigating. 
   User funds are [safe/at risk - be honest].
   Updates in this thread. Do not trust DMs claiming to be us.
   ```

2. **Provide updates every 2 hours** until resolved

3. **Post-mortem within 24 hours** of resolution
   - What happened
   - Root cause
   - What we're doing to prevent recurrence

**Tone during crisis:**
- Calm and factual
- No deflection or blame
- Transparency over optics

---

## Budget Allocation

| Category | Monthly Budget | Notes |
|---|---|---|
| **Content creation** | $500 | Video editing, graphics |
| **Influencer partnerships** | $1,000 | 2-3 videos/articles per month |
| **Paid ads** | $0 (Phase 8+) | Re-evaluate after merchant features ship |
| **Tools** | $100 | Analytics, scheduling, design tools |
| **Events** | $200 | Sponsoring ICP meetups, hackathons |
| **Bounties** | $500 | Developer contributions |
| **Total** | **$2,300/month** | Scales with revenue |

**Funding source:** Username sales, token launch fees (5 ICP each)

---

## Next Steps

### Immediate (Week 1-2)
- [ ] Set up Twitter/X posting schedule (use Buffer/Hootsuite)
- [ ] Create 5 educational threads (username, swaps, bucket, token launch, custody)
- [ ] Reach out to 3 ICP YouTubers for collaboration
- [ ] Publish first Medium article: "Why usernames are the future of crypto"

### Short-term (Month 1-2)
- [ ] Launch YouTube channel with 4 tutorial videos
- [ ] Host first Twitter Space (Friday Q&A)
- [ ] Publish brand guidelines doc (this + visual assets)
- [ ] Track baseline metrics (users, swaps, engagement)

### Medium-term (Month 3-6)
- [ ] Reach 1,000 Twitter followers
- [ ] Integrate with 3 major ICP ecosystem projects (OpenChat, DSCVR, Distrikt)
- [ ] Publish 6 Medium articles
- [ ] Achieve 2,000 claimed usernames

### Long-term (6-12 months)
- [ ] Phase 7 launch (decentralized custody) → major PR push
- [ ] Phase 8 launch (merchants) → merchant outreach campaign
- [ ] 5,000 total users
- [ ] Featured on DFINITY official blog/newsletter

---

## Resources

**Internal:**
- Roadmap: `docs/roadmap/roadmap.md`
- Architecture: `docs/architecture/`
- Commands reference: `docs/command/README.md`
- Brand protection: `backend/docs/brand-protection/list`

**External:**
- Twitter/X: [@IcpayOfficial](https://twitter.com/icpayofficial)
- GitHub: [prasangapokharel/ICPay](https://github.com/prasangapokharel/ICPay)
- Live app: [icpay.app](https://icpay.app)
- Canister: `6vbhm-nqaaa-aaaan-q6muq-cai`

**Tools:**
- Design: Figma, Canva
- Scheduling: Buffer, Hootsuite
- Analytics: Twitter Analytics, Google Analytics
- Video: OBS, DaVinci Resolve

---

## Questions?

Contact marketing lead or open a discussion in:
- Discord: (TBD)
- Telegram: (TBD)
- Email: marketing@icpay.app (if created)

**This is a living document.** Update quarterly or when strategy shifts.
