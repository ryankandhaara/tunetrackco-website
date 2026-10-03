TUNETRACK ADMIN LOGIN FIX

Files:
- login-page.html
- dashboard.js

Fixes:
1. Login "Preparing your account" overlay now runs its 1.2s progress animation instead of staying at 0%.
2. Login waits for that short animation only after successful Firebase sign-in, then redirects.
3. Dashboard reveals immediately after Firebase auth + profile verification, before optional dashboard render helpers, so a secondary UI helper cannot trap the page behind the preloader.
4. Existing custom-claim admin detection remains in dashboard.js: admin:true bypasses the 3-hour session timer; normal users retain the 3-hour limit.

Replace the corresponding website files:
assets/js/dashboard.js <- dashboard.js
login-page.html <- login-page.html
