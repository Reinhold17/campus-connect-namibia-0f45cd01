# Project rules
- Keep phone installability manifest-only with public app icons and head metadata; no app-shell service worker unless offline support is explicitly requested, to avoid stale previews.
- Preserve existing role-based routes and tutoring flows across browser and standalone displays, so installation never bypasses account permissions.