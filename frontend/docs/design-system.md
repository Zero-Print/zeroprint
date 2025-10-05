ZeroPrint Design System

Tokens
- Colors: primaryGreen (#2E7D32), solarYellow (#FBC02D), infoBlue (#0288D1), darkGray (#424242), white (#FFFFFF), lightGray (#F5F5F5), success (#2E7D32), danger (#E53935)
- Spacing: 4, 8, 12, 16, 24, 32
- Radii: 4, 8, 12, 16
- Shadows: small, medium, large
- Fonts: Poppins (heading), Inter (body), Roboto Mono (mono)

Typography
- h1: 24px, h2: 20px, h3: 18px, body: 14–16px

Components
- ZPButton: primary, secondary, ghost, icon
- ZPCard: header/body/footer
- ZPModal: focus-trapped, aria-labeled
- ZPInput/ZPSelect/ZPTextArea/ZPCheckbox/ZPRadio
- ZPBadge: status tags
- ZPAvatar: initials fallback
- ZPTable: sortable, paginated
- ZPToast: notifications
- ZPSkeleton: loading
- ZPNav: header/sidebar
- Domain: WalletCard, LeaderboardList, GameCard, ChartCard, TrackerCard, DigitalTwinSimulator UI

Patterns
- Dashboard layouts: grids, cards
- Game UI: header, play area, footer
- Trackers: inputs → outputs
- Leaderboard: pagination, realtime updates

Accessibility
- Keyboard navigable, aria labels
- Contrast WCAG AA
- Modals trap focus and return focus on close

Theming
- ThemeProvider in `src/styles/theme.tsx`
- CSS variables configured in `src/styles/globals.css`
- Dark mode via class strategy


