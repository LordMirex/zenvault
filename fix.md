# Zenvault Wallet — Fix List

All reported issues from user feedback. Nothing here is assumed to be done. Implement each item from scratch.

---

## 1. Dashboard — UUID / Wallet ID Display

- The UUID/copy button on the dashboard portfolio section is dropping down instead of staying pinned to the top-right. It must always be anchored top-right regardless of screen size.
- The UUID shown on the dashboard is too long and breaks layout. Truncate or shorten the visible portion. Show only a short prefix (e.g. first 8 chars) with a copy icon.
- **Rename "UUID" to "Wallet ID" everywhere** — on the dashboard, in P2P transfer fields, in the database column labels, and anywhere the word UUID is shown to the user. The P2P "Pay ID" field should also say "Wallet ID". Update the DB schema label if needed.

---

## 2. P2P Transfer — Full Fix Required

### Sending flow
- When a user initiates a P2P transfer it goes to Pending. The sender must immediately receive a debit notification email showing the amount, recipient wallet ID, and asset. Format should mirror the admin-to-user send email already working.
- The pending transaction must be visible in the user's transaction history on the sender side right away.

### Admin approval
- When admin approves a pending P2P transaction, the recipient must receive the coin in their wallet. Currently the coin is never credited. Fix the auto-credit logic so it always works.
- After admin approval, the recipient's transaction history must be updated with a credit entry.
- After admin approval, the recipient must receive an email notification showing the credited amount, asset, and sender wallet ID.
- After admin approval, both sender and recipient dashboards/transaction lists should reflect the completed state.

### Coin restriction
- Only coins that are currently active on the system (set by admin in wallet settings) should be available for P2P transfer. The sender's asset dropdown must only show system-active coins.
- If the recipient does not have that coin in their wallet, the system must auto-activate it on their dashboard when the credit is applied. Recipient does not need to manually add the coin.

---

## 3. Admin User Creation Form — Fix Required

- Password and passcode fields must always be required and must always be filled in. There is no scenario where they can be left blank.
- The "Don't send email" checkbox must NOT make the password temporary. Password stays exactly as the admin typed it.
- If admin checks "Send email", the email must look legitimate — not a raw dump like "this is your password and details". Format the welcome email properly.
- Remove the outdated message on the creation page that says the wallet was auto-created in "user.001" format. That text is stale and should be deleted entirely.

---

## 4. Bots — Remove Completely

- Remove bots from the entire system. No bot references, no bot users, no bot transaction generators, no bot-related UI or backend logic anywhere. Total removal.

---

## 5. Generate Fake Transaction History (Admin Feature)

- On the admin user detail page, add a "Generate Transactions" action (separate from the real create transaction).
- Modal should allow: number of transactions to generate, type (credit, debit, or both mixed), date range (from date → to date), and the admin-configured min/max amount range.
- When generated, these create random transaction history records for the user within the given parameters.
- These generated transactions must NOT affect the user's actual balance. They are purely history/display records.
- These should appear in the user's transaction history list just like real ones.

---

## 6. Admin Action Icon Buttons — Tooltips / Labels

- Admins report they do not understand what the icon-only action buttons do.
- On hover (desktop) or on tap (mobile), show a small popover or tooltip that shows the button name and a short description of what it does.
- Examples: "Login as User — Opens a session as this user", "Reset Password — Send password reset link", "Crypto Records — View this user's crypto holdings", etc.

---

## 7. Login As User — Fix Impersonation

- "Login as user" is currently failing. It logs in but does not properly authenticate or redirect as that user.
- When admin clicks login as user, the full session should switch to that user's account — dashboard, wallet, everything should show as if that user is logged in.
- On logout or back navigation, session should return to admin.

---

## 8. New User — Hide KYC Verification Banner

- New users (just signed up, never submitted KYC) must NOT see the "Identity Verification Required" banner on their dashboard.
- This banner is unwelcoming and should only show for users who have started KYC and are still pending, or who have been explicitly flagged for re-verification.
- Brand new users should see a clean, welcoming dashboard with no compliance warnings.

---

## 9. Navbar — Remove Stale "Zenbolt" Text

- The top navbar is still showing text like "Zenbolt Dashboard", "Zenbolt ..." in certain states or pages.
- Remove all instances of this stale site name text from the navbar and any page headers. The logo is enough.

---

## 10. Page-Level Back Button + Page Title (Mobile)

- On all user-facing inner pages (coin detail, deposit, withdraw, swap, P2P, settings sub-pages, etc.), add a back button at the top of the page content area and the page title next to it.
- This is critical for mobile — users cannot rely on browser back button. The back button should go to the logically previous page (e.g. coin page → back to wallet/dashboard).
- This is NOT the sidebar. This is a top-of-page navigation bar for each individual page.

---

## 11. Page Load Speed

- Page transitions are very slow. Clicking between pages (landing → login → dashboard → admin → users) has no loading indicator and feels frozen.
- Improve React route transition speed. Add a visible loading/progress indicator so users know something is happening when they click.
- Sign up, login, forgot password, and all user pages must feel fast and responsive.
- Do not let pages appear blank or frozen without feedback.

---

## 12. Admin Profile — Email Update Not Saving

- When an admin updates their profile email in profile settings, the change is not saving properly.
- After updating, the admin cannot log in with the new email (incorrect password error). Implies the update is failing silently or partially.
- Fix the admin profile update: email and password must save correctly and immediately be usable for login.
- The admin profile email is also the address used for all outgoing system admin emails (KYC applications, alerts, etc.) — so it must be correct and up to date.

---

## 13. Admin Emails — All System Alerts Must Reach Admin

- Admin is not receiving system emails: KYC application submissions, alerts, and other admin-addressed notifications.
- All system emails meant for admin must be sent to the admin's profile email address.
- Confirm KYC submission emails, transaction alerts, user flagging — all of these must route to admin email.

---

## 14. Admin Dashboard — Note Input Breaks Layout

- When a note is typed or added in the admin dashboard note/alert field, the entire page layout breaks and stretches outside the viewport.
- The note input must be contained with proper overflow handling. It must never break or stretch the dashboard grid.

---

## 15. Admin — BTC Wallet Pair ID Input Breaks Layout

- On the send-BTC-via-pair-ID admin page (or wallet settings), entering a BTC wallet address/pair ID causes the page to elongate and break the layout.
- The input field must not overflow or break surrounding layout. Apply proper max-width and overflow containment.

---

## 16. User Transactions Page — Remove Create Transaction Button

- The "Create Transaction" button on the user-facing transactions page must be removed. Users should not see or access this.
- (Note: A real create/generate action for admins belongs on the admin user detail page, not the user-facing side.)

---

## 17. Admin User Detail — Action Buttons Area UX

- The action buttons row on the user detail page (FilePlus, KeyRound, Coins, CreditCard, LogIn icons) is not clearly understandable to admins.
- Each button needs a visible label or tooltip so admins know what each one does at a glance without guessing.

---

## Notes

- All email templates for P2P should mirror the existing admin-to-user email format already working — real name, real amount, asset icon/symbol, transaction reference.
- Mobile testing is the primary testing environment — all UI fixes must be verified on small screens.
- Wallet ID (formerly UUID) must be consistent across all pages, DB labels visible to users, and email templates.
