# ICPay Frontend UX Audit & Improvement Map

## Overview
This document maps small UX improvements that can enhance user experience across the platform. Each improvement uses existing UI components and focuses on making the platform feel easier and more intuitive to use.

---

## 1. Dashboard / Home Page (`app/(app)/home/page.tsx`)

### Current State
- Basic balance card with hide/show toggle
- Dashboard actions (send, receive, swap)
- Recent transactions
- Holdings card (desktop only)

### Improvements Needed
- [ ] Add quick copy button for principal/account ID on balance card
- [ ] Add portfolio allocation pie chart showing token distribution
- [ ] Add "empty state" with call-to-action when balance is zero ("Get started by depositing ICP →")
- [ ] Add pull-to-refresh on mobile for live balance updates
- [ ] Show pending transactions indicator with count badge
- [ ] Add quick action shortcuts (keyboard: 's' for send, 'r' for receive)

---

## 2. Wallet Page (`app/(app)/wallet/page.tsx`)

### Current State
- Total portfolio value (USD + ICP)
- Asset table with balances
- Custom token addition

### Improvements Needed
- [ ] Add search/filter for tokens in asset table
- [ ] Add sort options (by value, by balance, alphabetically)
- [ ] Show "hidden tokens" toggle (hide tokens with zero balance)
- [ ] Add "refresh all" button with loading indicator
- [ ] Show last updated timestamp
- [ ] Add export portfolio as CSV/JSON
- [ ] Empty state when no tokens: "Add your first token →"
- [ ] Show percentage allocation for each token
- [ ] Add quick swap button inline in asset table rows

---

## 3. Settings Page (`app/(app)/settings/page.tsx`)

### Current State
- Searchable service tiles grid
- Categorized sections (money, storage, identity, activity, more)
- Settings drawer

### Improvements Needed
- [ ] Add keyboard shortcuts (/ to focus search, esc to clear)
- [ ] Add "recently used" section at top
- [ ] Add "favorites" functionality (star icon on tiles)
- [ ] Show badge counts on tiles (e.g., unread notifications, pending transactions)
- [ ] Add quick settings toggle in drawer (language, theme, notifications)
- [ ] Add session management (active devices, last login, logout all)
- [ ] Add "What's new" section with changelog

---

## 4. Market Overview (`components/public/market/market-overview.tsx`)

### Current State
- Tabs: Overview & Trading Data
- Highlight cards (trending, new listings, gainers, volume)
- Token table with search, filters, sorting, pagination
- Market stats cards

### Improvements Needed
- [ ] Add breadcrumbs navigation
- [ ] Add "add to watchlist" button on token rows (star icon)
- [ ] Add "compare tokens" functionality (select multiple, compare side-by-side)
- [ ] Add filter by market cap range
- [ ] Add filter by volume range
- [ ] Add export table data as CSV
- [ ] Add share button for specific views/filters
- [ ] Add tooltips on column headers explaining metrics
- [ ] Show loading skeleton during search/filter (not blank screen)
- [ ] Add "back to top" button on scroll

---

## 5. Market Rankings (`components/public/market/market-rankings.tsx`)

### Current State
- 4-card grid: Hot Coins, Top Gainers, Top Losers, Top Volume
- Top 10 per category
- "More" link to detail pages

### Improvements Needed
- [ ] Add time filter (24h, 7d, 30d) for each ranking
- [ ] Add percentage badges showing movement rank change
- [ ] Add sparkline mini-charts showing 24h price trend
- [ ] Add quick trade button on each row
- [ ] Show market cap on cards
- [ ] Add refresh indicator with last updated time
- [ ] Add "set alert" for when token enters/exits ranking

---

## 6. Market Ranking Detail (`components/public/market/market-ranking-detail.tsx`)

### Current State
- Full paginated table for one ranking type
- Sortable columns (Name, Price, Change, Volume, TVL)
- Back button to rankings overview

### Improvements Needed
- [ ] Add breadcrumbs (Market > Rankings > Top Gainers)
- [ ] Add search within ranking
- [ ] Add filter by exchange (ICPSwap, etc.)
- [ ] Add "compare selected" (checkbox + compare button)
- [ ] Add column visibility toggle (show/hide columns)
- [ ] Show trend indicators (↗ rank improving, ↘ rank falling)
- [ ] Add export functionality
- [ ] Show "you're viewing X of Y tokens" indicator

---

## 7. Trade Terminal (`components/public/market/trade/trade-terminal.tsx`)

### Current State
- Resizable panels (chart, order panel, info tabs)
- Pair toolbar with metrics
- Available assets & watchlist
- Swap history

### Improvements Needed
- [ ] Add "recent pairs" quick access (last 5 traded)
- [ ] Add favorites/watchlist sync across devices
- [ ] Show loading state during pair switch (not blank)
- [ ] Add price alerts ("notify me when BTC > $80k")
- [ ] Add confirmation dialog for large trades (> $100)
- [ ] Show estimated gas/fees before trade
- [ ] Add "quick amounts" buttons (25%, 50%, 75%, MAX)
- [ ] Show slippage tolerance setting
- [ ] Add trade preview before execution
- [ ] Show success animation after trade completion
- [ ] Add "share trade" functionality with screenshot

---

## 8. Trade Order Panel (`components/public/market/trade/trade-order-panel.tsx`)

### Current State
- Input/output token selection
- Amount inputs
- Balance display
- Swap button
- History below

### Improvements Needed
- [ ] Add "flip" button to quickly reverse In/Out tokens
- [ ] Show real-time price impact indicator
- [ ] Add preset amount buttons (10 ICP, 50 ICP, 100 ICP)
- [ ] Show estimated execution time
- [ ] Add "advanced options" expander (slippage, deadline)
- [ ] Show route visualization (token A → pool → token B)
- [ ] Add insufficient balance warning with "deposit" link
- [ ] Show minimum received amount

---

## 9. Trade Available Assets (`components/public/market/trade/trade-available-assets.tsx`)

### Current State
- Table showing available tokens with balances
- Links to trade pairs

### Improvements Needed
- [ ] Add search/filter tokens
- [ ] Add sort by balance, name, value
- [ ] Show USD value next to balance
- [ ] Add "hide zero balances" toggle
- [ ] Add quick action buttons (Trade, Send, Deposit)
- [ ] Show price change indicator
- [ ] Add skeleton for balance loading states

---

## 10. Trade Market Watchlist (`components/public/market/trade/trade-market-watchlist.tsx`)

### Current State
- Paginated token list
- Filter: All, Favorites, Custom
- Price, change, volume display

### Improvements Needed
- [ ] Add drag-to-reorder for custom watchlist
- [ ] Add bulk actions (add multiple to favorites)
- [ ] Show sparkline chart on hover
- [ ] Add "remove from watchlist" quick action
- [ ] Show alert indicator if price alert triggered
- [ ] Add search within watchlist
- [ ] Remember scroll position on pair switch
- [ ] Add "add note" for each token in watchlist

---

## 11. General UI/UX Patterns

### Empty States
- [ ] Wallet with no tokens → "Add your first token" with button
- [ ] No recent transactions → "Your transactions will appear here"
- [ ] Search with no results → "No tokens found. Try different keywords."
- [ ] Watchlist empty → "Add tokens to your watchlist to track them"

### Loading States
- [ ] Consistent skeleton patterns across all tables
- [ ] Progress indicators for long operations (deploy, swap)
- [ ] Optimistic updates (show action immediately, confirm later)
- [ ] Avoid blank screens during data refetch

### Error States
- [ ] User-friendly error messages (not technical jargon)
- [ ] Retry button on failed operations
- [ ] "Something went wrong" with support link
- [ ] Network offline indicator with auto-retry

### Success Feedback
- [ ] Success toast notifications with undo option where applicable
- [ ] Completion animations (checkmark, confetti for milestones)
- [ ] Sound effects toggle in settings

### Tooltips & Help
- [ ] Contextual help icons (?) next to complex terms
- [ ] Onboarding tooltips for first-time users
- [ ] Keyboard shortcuts help modal (press ?)
- [ ] Link to documentation from relevant pages

### Accessibility
- [ ] Focus indicators on all interactive elements
- [ ] ARIA labels on icon-only buttons
- [ ] Keyboard navigation for all features
- [ ] Screen reader announcements for dynamic content
- [ ] Color contrast compliance

### Mobile Experience
- [ ] Swipe gestures (swipe back to go back)
- [ ] Bottom sheet modals instead of full-screen
- [ ] Sticky headers on tables during scroll
- [ ] Pull-to-refresh on data-heavy pages
- [ ] Touch-friendly button sizes (min 44x44px)

### Performance & Feel
- [ ] Reduce animation durations (150ms instead of 300ms)
- [ ] Prefetch next page data on hover
- [ ] Debounce search inputs (300ms)
- [ ] Virtual scrolling for long lists
- [ ] Image lazy loading
- [ ] Code splitting for heavy components

---

## Priority Recommendations

### High Priority (Quick Wins)
1. Add empty states across all pages
2. Add tooltips on complex metrics
3. Add loading skeletons consistently
4. Add copy buttons for IDs/addresses
5. Add "back to top" on long pages

### Medium Priority (Better UX)
1. Add search/filter on tables
2. Add keyboard shortcuts
3. Add price alerts
4. Add export functionality
5. Add confirmation dialogs for risky actions

### Low Priority (Nice to Have)
1. Add sparkline charts
2. Add compare functionality
3. Add drag-to-reorder
4. Add sound effects
5. Add onboarding tour

---

## Notes
- All improvements should use existing UI components from `components/ui/`
- Focus on psychology: reduce friction, provide feedback, prevent errors
- Maintain consistency with current design system
- Test on mobile and desktop
- Consider accessibility in all changes
