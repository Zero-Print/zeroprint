ZeroPrint Dashboards

Routes
- /dashboard → redirects to role dashboard
- /dashboard/citizen, /dashboard/entity, /dashboard/govt, /admin
- Details: /dashboard/govt/ward/[wardId], /dashboard/entity/class/[classId]

Data
- Core: users, wallets, subscriptions, payments, games, gameScores
- Trackers: carbonLogs, mentalHealthLogs, animalWelfareLogs, digitalTwinSimulations, msmeReports
- Meta: leaderboards, rewards, redemptions, auditLogs, activityLogs

Citizen
- WalletCard, EcoScore + CO₂ trend, Mood/EcoMind, Kindness, Digital Twin preview, Activity feed, Leaderboards, Games carousel, Export CSV

Entity (School/MSME)
- KPI bar, Class/Unit leaderboard, Game heatmap, Badges, ESG report (PDF), Exports

Government
- Ward selector, React-Leaflet map (GeoJSON heatmap), KPI panels, Trends, Ward detail, Exports (CSV/PDF)

Admin
- User management, Wallet audit viewer, Config editor, Rewards, Bulk import, Logs, Feature flags, Deployment logs

Exports
- APIs: /api/export/csv, /api/export/pdf

Monitoring & Logging
- All actions hit backend to write auditLogs (immutable) and activityLogs.

Testing
- E2E: Auth → Wallet → Subscription → Redemption → Tracker → Admin CSV → Govt map
- Unit: hooks (useWallet, useEcoStats), components (KPIBox, MapCard, LeaderboardWidget)


