#Zenvault Wallet Fix List

This file is a complete working note for all reported issues. Do not assume any item is already fixed. Document and handle everything listed here.

## 1. P2P transfer and wallet credit flow

1. When a user sends crypto to another user, the transfer must create a pending transaction first.
2. The sender must immediately receive a debit notification email after sending.
3. The sender must see the pending transaction in their transaction history right away.
4. The recipient must not receive the final credit email until the admin approves the transaction.
5. When the admin approves the transaction, the recipient wallet must actually receive the coin.
6. After approval, both sender and recipient histories must update correctly.
7. The recipient must also see the credited coin in the wallet dashboard.
8. The approval action must update the full transaction record on both sides.
9. The system must not allow a transfer to complete without the recipient balance and history being updated.
10. The transfer approval should trigger the normal P2P credit email only after admin approval.

## 2. Active coin rules for sending

1. A user should only be able to send coins that are active on the system side.
2. The sender coin list must only show active coins from system settings.
3. It should not matter whether the recipient manually activated the coin.
4. If the recipient does not already have that coin active, the system must activate it automatically when the transfer is approved.
5. The coin action must appear on the recipient dashboard after approval.

## 3. Wallet ID naming

1. Replace all visible UUID wording with Wallet ID.
2. The same wording should be used on the dashboard, transfer pages, labels, emails, and admin views.
3. The pay ID field should also be renamed to Wallet ID or a similar clear label.
4. Update the database naming or display naming wherever the UUID label is exposed to users.

## 4. User dashboard and navigation issues

1. New users should not see the Identity Verification Required banner on first login.
2. The dashboard top navbar should not show stale text like Zenbolt Dashboard or other leftover branding text.
3. Keep only the logo or the correct current branding.
4. Add a visible back button on every inner page level.
5. The back button should sit near the page title at the top of the page content, not in the sidebar.
6. This is especially important for mobile navigation.
7. Page titles should also be visible at the top of each page.
8. The user should not need to keep using the browser back button.

## 5. Page speed and loading feedback

1. Page navigation is too slow between landing page, login, user pages, and admin pages.
2. Improve route switching speed in the React app.
3. Add a visible loading indicator or progress state when pages are changing.
4. Sign up, login, forgot password, admin pages, and user pages must all feel faster.
5. Pages should not appear frozen or blank without feedback.

## 6. Admin profile and admin email routing

1. Admin email changes in profile settings must save properly.
2. After editing the admin email, the new email must work for login.
3. The admin profile email should be the main email used for system admin notifications.
4. All admin directed emails such as KYC alerts, application notices, and system alerts must route to that email.
5. The email update flow must not silently fail.
6. The password or login state must not break after saving the profile.

## 7. Admin user creation form

1. Password and passcode must always be required.
2. They should never be left blank.
3. Do not make them temporary just because email sending is disabled.
4. The Don't send email option must only control whether email is sent.
5. It must not weaken or alter the account credentials.
6. If Send email is enabled, the email content must be clean and professional.
7. Remove the old message that says the wallet was auto created in user.001 format.
8. Remove any outdated or confusing copy from the creation page.

## 8. Admin dashboard layout issues

1. Adding a note on the admin dashboard breaks the layout.
2. The note area must be contained properly and must not stretch the page.
3. Adding a BTC wallet pair ID on the send BTC via pair ID page also breaks the layout.
4. The BTC pair ID input must stay responsive and must not elongate the page.
5. Fix overflow, width handling, wrapping, and spacing in those sections.

## 9. Action buttons, labels, and tooltips

1. Admin action buttons are not clear enough.
2. Add labels or tooltips so admins understand what each icon does.
3. This should work on desktop hover and mobile tap.
4. The same clarity should apply to all action icons on admin user pages.
5. The buttons should feel self explanatory without guessing.

## 10. Login as user

1. Login as user is currently failing.
2. It should not log the admin out.
3. It should open the selected user account properly and securely.
4. The user session should display the user dashboard without showing admin control text at the top.
5. No security email should be sent to the user for this action.
6. This action is for admin preview or security checking only.
7. It should not create a misleading security log entry for the user as if the user themselves logged in.

## 11. Forgot password flow

1. Add forgot password to the login page.
2. The reset flow should send a 6 digit OTP.
3. The user enters the OTP and then resets the password.
4. The admin side reset flow should not use confusing wording like password and credentials in a messy way.
5. Keep the reset process simple and secure.

## 12. Remove bots completely

1. Remove bots from the entire system.
2. Remove bot related UI.
3. Remove bot related backend logic.
4. Remove any bot users or bot transaction generators.
5. Nothing on the system should reference bots anymore.

## 13. Transaction history and fake history generation

1. The user side should have a real account history or transaction history area.
2. Remove the Create Transaction button from the user page.
3. That button does not belong on the user side.
4. On the admin side, add a proper Generate Transactions action for user history only.
5. This admin action should allow generating a chosen number of records.
6. It should allow credit, debit, or both.
7. It should allow a date range from and to.
8. It should use the admin configured minimum and maximum amount range.
9. These generated entries must only affect history display.
10. They must not affect the real user balance.
11. The generated records should look like normal history entries.

## 14. Admin approval button behavior

1. On KYC, card, or any approval table, once one action is selected as approved, the other related buttons should become inactive.
2. Do not allow pending or cancel actions to remain active after an approve state is chosen.
3. The same rule should apply across all approval tables.
4. The status should be protected from accidental changes.

## 15. User transaction and P2P page behavior

1. The user transaction page must show transaction history clearly.
2. When a user sends money, the transaction should appear as pending.
3. Pending records should be visible and understandable.
4. The system should support proper history display for transfers done through Wallet ID.
5. The page should be easy to understand on mobile.

## 16. General UI cleanup

1. Remove stale text across the interface.
2. Fix any page that stretches too wide after inputs are added.
3. Keep text responsive so important items stay in place.
4. Make sure the admin and user interfaces feel clean and consistent.
5. Keep mobile layout as a priority.

## 17. Email behavior summary

1. Sender email goes out immediately when a transfer is created as pending.
2. Recipient email goes out only after admin approval.
3. Admin emails must always go to the admin profile email.
4. Email templates should look legitimate and consistent.
5. Do not send extra or confusing notifications during admin preview actions.

## 18. Important reminders

1. Do not document only part of the issue.
2. Keep every reported problem in the notes.
3. Do not remove items just because they might already be fixed.
4. Treat this as the master issue list for the system.