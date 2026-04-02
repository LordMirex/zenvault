-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2026 at 01:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qfs_wallet`
--

-- --------------------------------------------------------

--
-- Table structure for table `kyc_cases`
--

CREATE TABLE `kyc_cases` (
  `id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_type` varchar(190) NOT NULL,
  `submitted_at_label` varchar(120) DEFAULT '',
  `country` varchar(80) DEFAULT '',
  `risk_level` varchar(40) DEFAULT '',
  `status` varchar(40) DEFAULT '',
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kyc_cases`
--

INSERT INTO `kyc_cases` (`id`, `user_id`, `document_type`, `submitted_at_label`, `country`, `risk_level`, `status`, `note`) VALUES
('kyc-19', 19, 'Passport + Utility Bill', 'Sep 06, 2025 01:20', 'Nigeria', 'Low', 'Approved', 'Approved after manual document review.'),
('kyc-8', 8, 'Awaiting submission', '', 'Nigeria', 'Medium', 'Pending', 'No documents submitted yet.');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(80) NOT NULL,
  `setting_value` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('adminDashboard', '{\"alerts\":[\"2 withdrawals are pending review above the configured threshold.\",\"One KYC case remains pending and requires operator action.\",\"TRC20 settlement rail is healthy and processing normally.\"],\"timeline\":[{\"id\":\"timeline-1775122219106-182\",\"title\":\"Admin Admin created a Transfer transaction\",\"detail\":\"1000 USDT USDT record added for user #28 via the admin console.\",\"time\":\"Apr 02, 2026 10:30\"},{\"id\":\"timeline-1775122101225-691\",\"title\":\"Admin Admin updated dfdf\'s USDT wallet\",\"detail\":\"Asset USDT on TRC20 was adjusted from the admin wallet controls.\",\"time\":\"Apr 02, 2026 10:28\"},{\"id\":\"timeline-1775092984748-391\",\"title\":\"Admin Admin updated Ofofonobs Developer\'s profile\",\"detail\":\"Fields updated: note.\",\"time\":\"Apr 02, 2026 02:23\"},{\"id\":\"timeline-1775092984487-229\",\"title\":\"Admin Admin updated transaction txn-1\",\"detail\":\"Status changed to Completed for Transfer of 100,000 USDT.\",\"time\":\"Apr 02, 2026 02:23\"},{\"id\":\"timeline-1775092984374-749\",\"title\":\"Admin Admin updated KYC case kyc-19\",\"detail\":\"Status set to Approved for case kyc-19.\",\"time\":\"Apr 02, 2026 02:23\"},{\"id\":\"timeline-1775092984275-602\",\"title\":\"Admin Admin deleted transaction txn-1775092983863-499\",\"detail\":\"Deposit of 500 USDT (USDT) was removed from the ledger.\",\"time\":\"Apr 02, 2026 02:23\"}]}', '2026-04-02 09:30:19'),
('adminProfile', '{\"fullName\":\"Admin Admin\",\"email\":\"support@developerplug.com\",\"role\":\"Super Operator\",\"timezone\":\"Africa/Lagos\",\"profileNote\":\"Test.\"}', '2026-04-02 00:25:10'),
('adminTwoFactor', '{\"enabled\":true,\"recoveryCodes\":[\"OP7X-4PEP\",\"5DGI-Z4CQ\",\"NVBS-IADR\",\"SW5K-KQL8\"],\"lastUpdated\":\"Apr 02, 2026 02:23\"}', '2026-04-02 01:23:03'),
('email', '{\"mailDriver\":\"SMTP\",\"mailHost\":\"mail.flashroute.co\",\"mailPort\":\"465\",\"mailUsername\":\"support@flashroute.co\",\"mailPasswordMasked\":\"********\",\"mailEncryption\":\"SSL\",\"fromAddress\":\"support@flashroute.co\",\"fromName\":\"ZenVault Wallet\",\"notifyOnUserRegistration\":true,\"notifyOnKycSubmission\":true,\"notifyOnKycApproval\":true,\"templates\":[{\"id\":\"tmpl-1\",\"name\":\"Welcome Email\",\"subject\":\"Welcome to QFS Trading\",\"status\":\"Live\",\"updatedAt\":\"Today\"},{\"id\":\"tmpl-2\",\"name\":\"KYC Approval\",\"subject\":\"Your account verification is approved\",\"status\":\"Live\",\"updatedAt\":\"Yesterday\"},{\"id\":\"tmpl-3\",\"name\":\"Withdrawal Review\",\"subject\":\"Your transfer is under review\",\"status\":\"Draft\",\"updatedAt\":\"2 days ago\"}],\"mailPassword\":\"I&$+}j_k1A3axk]M\"}', '2026-04-02 09:26:07'),
('general', '{\"siteName\":\"ZenVault Wallet\",\"appName\":\"QFS Wallet\",\"siteUrl\":\"http://127.0.0.1:4173\",\"logoUrl\":\"/marketing/vb-logo-colour.svg\",\"faviconUrl\":\"/crypto/btc-icon.png\",\"publicTopbarLabel\":\"ZenVault Wallet\",\"publicTopbarText\":\"Buy and sell crypto in ZenVault  with guided support, transparent pricing, and local branches.\",\"publicHeroTitle\":\"Buy Bitcoin with a local desk, not a cold exchange.\",\"publicHeroDescription\":\"Cash, e-Transfer, wire transfer, and OTC support with clear pricing, human guidance, and local branches that make first-time buys feel straightforward.\",\"footerSummary\":\"Local crypto exchange support in ZenVault   with transparent pricing, human assistance, and a smoother path for first-time buyers.\",\"authHeadline\":\"Sign in to your ZenVault  Wallet account\",\"authDescription\":\"Access your wallet, portfolio activity, and account controls through a secure login flow for traders and operators.\",\"companyName\":\"Qfs Trading\",\"companyAddress\":\"39, church way\",\"companyPhone\":\"+2348114313795\",\"companyEmail\":\"support@developerplug.com\",\"referralEnabled\":true,\"referralBonusAmount\":\"0\",\"bonusDistribution\":\"Instant Bonus\"}', '2026-04-02 09:21:40'),
('referralMilestones', '[{\"label\":\"Starter Circle\",\"reward\":\"100 USDT\",\"requirement\":\"Invite 1 verified trader\"},{\"label\":\"Growth Desk\",\"reward\":\"500 USDT\",\"requirement\":\"Invite 5 active wallets\"},{\"label\":\"Prime Ambassador\",\"reward\":\"1,500 USDT\",\"requirement\":\"Invite 15 funded accounts\"}]', '2026-03-30 23:23:32'),
('wallets', '{\"rails\":[{\"id\":\"rail-eth\",\"name\":\"Ethereum\",\"network\":\"ETH\",\"status\":\"Healthy\",\"minDeposit\":\"0.005 ETH\",\"minWithdrawal\":\"0.01 ETH\",\"fee\":\"0.0025 ETH\",\"confirmations\":\"12 confirmations\"},{\"id\":\"rail-usdt-trc20\",\"name\":\"Tether\",\"network\":\"TRC20\",\"status\":\"Healthy\",\"minDeposit\":\"10 USDT\",\"minWithdrawal\":\"25 USDT\",\"fee\":\"1 USDT\",\"confirmations\":\"20 confirmations\"},{\"id\":\"rail-usdt-erc20\",\"name\":\"Tether\",\"network\":\"ERC20\",\"status\":\"Watch\",\"minDeposit\":\"10 USDT\",\"minWithdrawal\":\"25 USDT\",\"fee\":\"8 USDT\",\"confirmations\":\"12 confirmations\"},{\"id\":\"rail-sol\",\"name\":\"Solana\",\"network\":\"SOL\",\"status\":\"Healthy\",\"minDeposit\":\"0.15 SOL\",\"minWithdrawal\":\"0.20 SOL\",\"fee\":\"0.01 SOL\",\"confirmations\":\"32 confirmations\"}]}', '2026-04-02 09:27:19');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(40) NOT NULL,
  `asset` varchar(80) NOT NULL,
  `amount` varchar(120) NOT NULL,
  `channel` varchar(120) DEFAULT '',
  `destination` varchar(190) DEFAULT '',
  `status` varchar(40) NOT NULL,
  `created_at_label` varchar(120) DEFAULT '',
  `from_asset` varchar(80) DEFAULT '',
  `to_asset` varchar(80) DEFAULT '',
  `which_crypto` varchar(80) DEFAULT '',
  `network_fee` varchar(80) DEFAULT '',
  `rate` varchar(80) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `asset`, `amount`, `channel`, `destination`, `status`, `created_at_label`, `from_asset`, `to_asset`, `which_crypto`, `network_fee`, `rate`) VALUES
('txn-1', 19, 'Transfer', 'USDT_TRC20', '100,000 USDT', 'QFS PayID', 'settlements@qfs', 'Completed', 'Mar 27, 2026 18:58', 'USDT_TRC20', '', 'USDT_TRC20', '0.00', '1.0000'),
('txn-1775122218938-933', 28, 'Transfer', 'USDT', '1000 USDT', 'TRC20 Wallet', 'Treasury funding', 'Completed', 'Apr 02, 2026 10:30', '', '', 'USDT', '', ''),
('txn-2', 19, 'Transfer', 'BTC', '3.2384 BTC', 'External Wallet', 'cold-vault-01', 'Completed', 'Mar 12, 2026 06:03', 'BTC', '', 'BTC', '0.00035000', '1.0000'),
('txn-3', 19, 'Deposit', 'USDT_TRC20', '1,000,000 USDT', 'TRC20 Wallet', 'Treasury replenishment', 'Completed', 'Feb 26, 2026 21:37', '', 'USDT_TRC20', 'USDT_TRC20', '0.00', '1.0000'),
('txn-4', 27, 'Reward', 'USDT', '250 USDT', 'Referral', 'Rewards ledger', 'Completed', 'Feb 06, 2026 21:10', '', 'USDT', 'USDT', '0.00', '1.0000'),
('txn-5', 8, 'Withdrawal', 'ETH', '4 ETH', 'External Wallet', 'review-address-1', 'Pending', 'Jan 28, 2026 08:14', 'ETH', '', 'ETH', '0.0025', '2013.80'),
('txn-6', 19, 'Transfer', 'BTC', '0.824 BTC', 'QFS PayID', 'prime-member@qfs', 'Pending', 'Jan 27, 2026 10:50', 'BTC', '', 'BTC', '0.00', '66728.89');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role` varchar(16) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(40) DEFAULT '',
  `city` varchar(80) DEFAULT '',
  `uuid` varchar(80) DEFAULT '',
  `country` varchar(80) DEFAULT '',
  `desk_label` varchar(120) DEFAULT '',
  `tier` varchar(40) DEFAULT '',
  `status` varchar(40) DEFAULT '',
  `kyc_status` varchar(40) DEFAULT '',
  `risk_level` varchar(40) DEFAULT '',
  `portfolio_usd` decimal(18,2) DEFAULT 0.00,
  `available_usd` decimal(18,2) DEFAULT 0.00,
  `portfolio_change_usd` decimal(18,2) DEFAULT 0.00,
  `portfolio_change_pct` decimal(10,2) DEFAULT 0.00,
  `wallet_connected` tinyint(1) DEFAULT 1,
  `plan_name` varchar(120) DEFAULT '',
  `last_seen` varchar(120) DEFAULT '',
  `note` text DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `passcode_hash` varchar(255) NOT NULL,
  `holdings_json` longtext NOT NULL,
  `cards_json` longtext NOT NULL,
  `deposit_activity_json` longtext NOT NULL,
  `withdrawal_activity_json` longtext NOT NULL,
  `notifications_json` longtext NOT NULL,
  `address_book_json` longtext NOT NULL,
  `referrals_json` longtext NOT NULL,
  `sessions_json` longtext NOT NULL,
  `kyc_checklist_json` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role`, `name`, `email`, `phone`, `city`, `uuid`, `country`, `desk_label`, `tier`, `status`, `kyc_status`, `risk_level`, `portfolio_usd`, `available_usd`, `portfolio_change_usd`, `portfolio_change_pct`, `wallet_connected`, `plan_name`, `last_seen`, `note`, `password_hash`, `passcode_hash`, `holdings_json`, `cards_json`, `deposit_activity_json`, `withdrawal_activity_json`, `notifications_json`, `address_book_json`, `referrals_json`, `sessions_json`, `kyc_checklist_json`, `created_at`) VALUES
(1, 'admin', 'Admin Admin', 'support@developerplug.com', '+2348114313795', 'Lagos', 'ADMIN-001', 'Nigeria', 'Operations Control', 'Tier 3', 'Active', 'Approved', 'Low', 0.00, 0.00, 0.00, 0.00, 1, 'Admin', 'Active now', 'Primary administrator account.', '$2b$10$iVrgJsqOSoriolwL3UNCB.rdVhdKFE7TZ8KAt.9AbVhIsWhRjywfy', '$2b$10$qEH5Rh5gTnll9ENbdlA.cucKgdYtUNN4/NIeASlmBGlgFH3o4iGlu', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[{\"id\":\"e46e4a44-4148-4517-961e-21840ad4584c\",\"device\":\"Windows Edge desktop\",\"location\":\"Localhost session\",\"status\":\"Current session\",\"lastSeen\":\"Apr 02, 2026 10:19\"}]', '[]', '2026-03-30 23:23:30'),
(8, 'user', 'dfdf', 'c0d3g0d.01@gmail.com', '+2348000000008', 'Benin City', 'TS1EXBU', 'Nigeria', 'Growth Operations', 'Tier 1', 'Review', 'Pending', 'Medium', 10000.00, 10000.00, 0.00, 0.00, 1, 'Starter', 'Updated Apr 02, 2026 10:28', 'Needs KYC completion before outbound limits increase.', '$2b$10$skfL/.MYIml5nvl3Kezt5eemOLKil.vzx7PFHtmHR5./bT604MOpO', '$2b$10$fW/5xlcmXOlTlcR1LYvB/.hfumja2H7VjycP1P3E8z6W0uqxlvU2.', '[{\"id\":\"btc-native\",\"symbol\":\"BTC\",\"name\":\"Bitcoin\",\"network\":\"Bitcoin\",\"icon\":\"/crypto/btc.png\",\"balance\":0,\"price\":66728.89,\"change\":0.06,\"valueUsd\":0,\"address\":\"1Fhv4jtqv6bChqgyRr86FeAH6Mi8zEr8HD\",\"payId\":\"dfdf+btc@qfs\",\"minimumDeposit\":0.0002,\"minimumWithdrawal\":0.00035,\"withdrawFee\":0.00035,\"confirmations\":\"2 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Major\",\"Native\"],\"status\":\"Enabled\"},{\"id\":\"usdt-trc20\",\"symbol\":\"USDT\",\"name\":\"Tether\",\"network\":\"TRC20\",\"icon\":\"/crypto/usdt.png\",\"balance\":10000,\"price\":1,\"change\":0,\"valueUsd\":10000,\"address\":\"TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6\",\"payId\":\"dfdf+usdt@qfs\",\"minimumDeposit\":10,\"minimumWithdrawal\":25,\"withdrawFee\":1,\"confirmations\":\"20 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Stablecoin\",\"TRC20\"],\"status\":\"Enabled\"}]', '[]', '[]', '[]', '[]', '[{\"id\":\"addr-1\",\"label\":\"Primary OTC Desk\",\"network\":\"Bitcoin\",\"address\":\"bc1q4q8h0z7n2s6x9p5k1r3v8m2u6f4d0t5y8n1c4\",\"kind\":\"Treasury\",\"trustedSince\":\"Trusted since Feb 12, 2026\"},{\"id\":\"addr-2\",\"label\":\"Liquidity Partner A\",\"network\":\"TRC20\",\"address\":\"TY8tq9Q5vC1rJ6Lw3Fh4Kp2Nz0s7Ua5YcR\",\"kind\":\"Vendor\",\"trustedSince\":\"Trusted since Jan 28, 2026\"}]', '[]', '[]', '[{\"id\":\"kyc-1\",\"title\":\"Government ID uploaded\",\"detail\":\"Awaiting manual review.\",\"status\":\"Pending\"},{\"id\":\"kyc-2\",\"title\":\"Proof of address missing\",\"detail\":\"Upload required before approval.\",\"status\":\"Review\"}]', '2026-03-30 23:23:30'),
(19, 'user', 'Ofofonobs Developer', 'ofofonobs@gmail.com', '+2348000000019', 'Lagos', 'QFS-9823-1904', 'Nigeria', 'Prime Treasury Desk', 'Tier 3', 'Active', 'Approved', 'Low', 109363502.05, 107894210.12, 124532.12, 2.40, 1, 'Prime Treasury', 'Updated Apr 02, 2026 02:23', 'Updated via API test.', '$2b$10$Dy0ZOB5Cn2JnN.B9WDGJa.Dz8EDXLPlJOH10f.VAMVlicqOtVpqrO', '$2b$10$sAAQx8Oge2NgjOGPHCb/kudBq6NZPrTFCLautnvWCHm6hyZEzDafC', '[{\"id\":\"btc-native\",\"symbol\":\"BTC\",\"name\":\"Bitcoin\",\"network\":\"Bitcoin\",\"icon\":\"/crypto/btc.png\",\"price\":66728.89,\"change\":0.06,\"balance\":3.2399,\"valueUsd\":216194.93,\"address\":\"1Fhv4jtqv6bChqgyRr86FeAH6Mi8zEr8HD\",\"payId\":\"ofofonobs+btc@qfs\",\"minimumDeposit\":0.0002,\"minimumWithdrawal\":0.00035,\"withdrawFee\":0.00035,\"confirmations\":\"2 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Major\",\"Native\",\"Treasury\"],\"status\":\"Enabled\"},{\"id\":\"usdt-trc20\",\"symbol\":\"USDT\",\"name\":\"Tether\",\"network\":\"TRC20\",\"icon\":\"/crypto/usdt.png\",\"price\":1,\"change\":0,\"balance\":20150040.71,\"valueUsd\":20150040.71,\"address\":\"TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6\",\"payId\":\"ofofonobs+usdt@qfs\",\"minimumDeposit\":10,\"minimumWithdrawal\":25,\"withdrawFee\":1,\"confirmations\":\"20 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Stablecoin\",\"Fast Settlement\",\"Treasury\"],\"status\":\"Enabled\"},{\"id\":\"usdt-bnb\",\"symbol\":\"USDT\",\"name\":\"Tether\",\"network\":\"BNB\",\"icon\":\"/crypto/usdt.png\",\"price\":1,\"change\":0,\"balance\":36411193.9964,\"valueUsd\":36411193.99,\"address\":\"0x247c9a48e6713c38f046709f084d82b67ad7f3a0\",\"payId\":\"ofofonobs+usdtbsc@qfs\",\"minimumDeposit\":10,\"minimumWithdrawal\":25,\"withdrawFee\":0.8,\"confirmations\":\"15 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Stablecoin\",\"BEP20\",\"Treasury\"],\"status\":\"Enabled\"},{\"id\":\"usdt-erc20\",\"symbol\":\"USDT\",\"name\":\"Tether\",\"network\":\"ERC20\",\"icon\":\"/crypto/usdt.png\",\"price\":1,\"change\":0,\"balance\":1362825.3834,\"valueUsd\":1362825.38,\"address\":\"0x247c9a48e6713c38f046709f084d82b67ad7f3a0\",\"payId\":\"ofofonobs+usdteth@qfs\",\"minimumDeposit\":10,\"minimumWithdrawal\":25,\"withdrawFee\":8,\"confirmations\":\"12 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Stablecoin\",\"ERC20\",\"Treasury\"],\"status\":\"Watch\"},{\"id\":\"eth-native\",\"symbol\":\"ETH\",\"name\":\"Ethereum\",\"network\":\"native\",\"icon\":\"/crypto/eth.png\",\"price\":2013.8,\"change\":0.36,\"balance\":448.5243,\"valueUsd\":903238.24,\"address\":\"0x247c9a48e6713c38f046709f084d82b67ad7f3a0\",\"payId\":\"ofofonobs+eth@qfs\",\"minimumDeposit\":0.01,\"minimumWithdrawal\":0.02,\"withdrawFee\":0.0025,\"confirmations\":\"12 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Major\",\"Native\",\"EVM\"],\"status\":\"Enabled\"},{\"id\":\"trx-native\",\"symbol\":\"TRX\",\"name\":\"Tron\",\"network\":\"native\",\"icon\":\"/crypto/trx.png\",\"price\":0.32,\"change\":1.77,\"balance\":119287724.6171,\"valueUsd\":38410727.88,\"address\":\"TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6\",\"payId\":\"ofofonobs+trx@qfs\",\"minimumDeposit\":50,\"minimumWithdrawal\":100,\"withdrawFee\":1,\"confirmations\":\"20 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Payments\",\"Fast Settlement\",\"Native\"],\"status\":\"Enabled\"},{\"id\":\"bnb-native\",\"symbol\":\"BNB\",\"name\":\"Binance Coin\",\"network\":\"native\",\"icon\":\"/crypto/bnb.png\",\"price\":613.32,\"change\":-0.01,\"balance\":18430.9466,\"valueUsd\":11304068.17,\"address\":\"0x247c9a48e6713c38f046709f084d82b67ad7f3a0\",\"payId\":\"ofofonobs+bnb@qfs\",\"minimumDeposit\":0.03,\"minimumWithdrawal\":0.06,\"withdrawFee\":0.0015,\"confirmations\":\"15 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Major\",\"BSC\",\"Trading\"],\"status\":\"Enabled\"},{\"id\":\"dot-native\",\"symbol\":\"DOT\",\"name\":\"Polkadot\",\"network\":\"native\",\"icon\":\"/crypto/dot.png\",\"price\":1.27,\"change\":0.71,\"balance\":222536.4055,\"valueUsd\":282538.84,\"address\":\"13ZdgQfCTLMJ84v7wVH9rFBT8YhKuFJu9vCVJvXZHJvA\",\"payId\":\"ofofonobs+dot@qfs\",\"minimumDeposit\":5,\"minimumWithdrawal\":10,\"withdrawFee\":0.25,\"confirmations\":\"Block finality under 1 minute\",\"enabledByDefault\":true,\"tags\":[\"Treasury\",\"Native\",\"Staking\"],\"status\":\"Watch\"},{\"id\":\"ltc-native\",\"symbol\":\"LTC\",\"name\":\"Litecoin\",\"network\":\"native\",\"icon\":\"/crypto/ltc.png\",\"price\":53.93,\"change\":-0.35,\"balance\":4111.8796,\"valueUsd\":221753.67,\"address\":\"LRXLeDjnKbFcBitygNcptJuLwo7tDekiZm\",\"payId\":\"ofofonobs+ltc@qfs\",\"minimumDeposit\":0.1,\"minimumWithdrawal\":0.2,\"withdrawFee\":0.001,\"confirmations\":\"6 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Major\",\"Payments\",\"Native\"],\"status\":\"Enabled\"},{\"id\":\"xlm-native\",\"symbol\":\"XLM\",\"name\":\"Stellar\",\"network\":\"native\",\"icon\":\"/crypto/xlm.png\",\"price\":0.17,\"change\":-0.3,\"balance\":246.7898,\"valueUsd\":41.36,\"address\":\"GDT7ARDYZRBXXYOCSQ3MUMISTITSSRWZI6KR2A5L5Q3KB4QIZHGYMTIH\",\"payId\":\"ofofonobs+xlm@qfs\",\"minimumDeposit\":25,\"minimumWithdrawal\":50,\"withdrawFee\":0.35,\"confirmations\":\"Network finality under 10 seconds\",\"enabledByDefault\":true,\"tags\":[\"Payments\",\"Native\",\"Fast Settlement\"],\"status\":\"Enabled\"},{\"id\":\"sol-native\",\"symbol\":\"SOL\",\"name\":\"Solana\",\"network\":\"native\",\"icon\":\"/crypto/sol.png\",\"price\":82.78,\"change\":0.17,\"balance\":6.9988,\"valueUsd\":579.36,\"address\":\"EPlSTRXpvwUZydsHm62mqqUyZNThdrn4rLCowK7wYfv2\",\"payId\":\"ofofonobs+sol@qfs\",\"minimumDeposit\":0.15,\"minimumWithdrawal\":0.2,\"withdrawFee\":0.01,\"confirmations\":\"32 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Native\",\"Fast Settlement\",\"Trading\"],\"status\":\"Enabled\"}]', '[{\"id\":\"card-19-1\",\"label\":\"Operations Visa\",\"brand\":\"Visa\",\"last4\":\"5855\",\"status\":\"Inactive\",\"spendLimitUsd\":50000,\"utilizationUsd\":0,\"issuedAt\":\"Issued Sep 10, 2025\",\"expiry\":\"01/29\",\"cvv\":\"732\",\"billingAddress\":\"651 N Broad Street, Middletown, Delaware, US\",\"zipCode\":\"19709\",\"balance\":0}]', '[{\"id\":\"dep-1\",\"assetId\":\"usdt-trc20\",\"amount\":\"250,000 USDT\",\"method\":\"TRC20 Wallet\",\"destination\":\"Treasury replenishment\",\"status\":\"Completed\",\"time\":\"Today, 09:24\"},{\"id\":\"dep-2\",\"assetId\":\"btc-native\",\"amount\":\"0.824 BTC\",\"method\":\"QFS PayID\",\"destination\":\"Prime member transfer\",\"status\":\"Pending\",\"time\":\"Today, 07:10\"}]', '[{\"id\":\"wd-1\",\"assetId\":\"btc-native\",\"amount\":\"0.500 BTC\",\"method\":\"External Wallet\",\"destination\":\"btc-algo-vault-01\",\"status\":\"Completed\",\"time\":\"Today, 11:42\"},{\"id\":\"wd-2\",\"assetId\":\"usdt-trc20\",\"amount\":\"45,000 USDT\",\"method\":\"QFS PayID\",\"destination\":\"settlements@qfs\",\"status\":\"Pending\",\"time\":\"Today, 08:55\"}]', '[{\"id\":\"notif-1\",\"title\":\"Withdrawal approved\",\"message\":\"0.500 BTC was approved for release after passcode and review.\",\"category\":\"Transfers\",\"time\":\"12 minutes ago\",\"unread\":true,\"tone\":\"success\"},{\"id\":\"notif-2\",\"title\":\"New device sign-in\",\"message\":\"A Windows session was detected from Lagos and marked as trusted.\",\"category\":\"Security\",\"time\":\"1 hour ago\",\"unread\":true,\"tone\":\"warning\"},{\"id\":\"notif-3\",\"title\":\"Referral bonus settled\",\"message\":\"A 250 USDT referral reward has been credited to your rewards ledger.\",\"category\":\"Rewards\",\"time\":\"Yesterday\",\"unread\":false,\"tone\":\"success\"},{\"id\":\"notif-4\",\"title\":\"USDT market update\",\"message\":\"Stablecoin routing remains healthy across TRC20 and BNB rails.\",\"category\":\"Market\",\"time\":\"Yesterday\",\"unread\":false,\"tone\":\"info\"}]', '[{\"id\":\"addr-1\",\"label\":\"Primary OTC Desk\",\"network\":\"Bitcoin\",\"address\":\"bc1q4q8h0z7n2s6x9p5k1r3v8m2u6f4d0t5y8n1c4\",\"kind\":\"Treasury\",\"trustedSince\":\"Trusted since Feb 12, 2026\"},{\"id\":\"addr-2\",\"label\":\"Liquidity Partner A\",\"network\":\"TRC20\",\"address\":\"TY8tq9Q5vC1rJ6Lw3Fh4Kp2Nz0s7Ua5YcR\",\"kind\":\"Vendor\",\"trustedSince\":\"Trusted since Jan 28, 2026\"}]', '[{\"id\":\"ref-1\",\"name\":\"Ava Martins\",\"joinedAt\":\"Mar 18, 2026\",\"status\":\"Verified\",\"reward\":\"250 USDT\"}]', '[{\"id\":\"session-1\",\"device\":\"Windows 11 / Chrome\",\"location\":\"Lagos, Nigeria\",\"status\":\"Current session\",\"lastSeen\":\"Active now\"},{\"id\":\"session-2\",\"device\":\"iPhone 15 / Safari\",\"location\":\"Abuja, Nigeria\",\"status\":\"Trusted mobile\",\"lastSeen\":\"Yesterday at 21:08\"}]', '[{\"id\":\"kyc-1\",\"title\":\"Government ID verified\",\"detail\":\"Passport scan passed liveness and identity review.\",\"status\":\"Completed\"},{\"id\":\"kyc-2\",\"title\":\"Proof of address approved\",\"detail\":\"Utility bill accepted and stamped within 90 days.\",\"status\":\"Completed\"},{\"id\":\"kyc-3\",\"title\":\"Source of funds review\",\"detail\":\"Treasury statements confirmed during compliance review.\",\"status\":\"Completed\"}]', '2026-03-30 23:23:30'),
(27, 'user', 'Ava Martins', 'ava.martins@qfstrading.com', '+2348000000027', 'Abuja', 'QFS-4410-0088', 'Nigeria', 'Growth Desk', 'Tier 2', 'Active', 'Approved', 'Low', 6457004.41, 5826001.53, 18554.29, 1.20, 1, 'Growth Desk', 'Today, 11:13', 'Stable desk account used for referrals and internal transfers.', '$2b$10$RVuP4DAhQiDpWeJq9CFIxOYG9i3.DYueeiHDKii/01jd2Z21bHt1C', '$2b$10$oJaOtBTvStdVZC.gCcUC0eCv.G4k2B/jdgp75BGlWqjxbkUoTebm6', '[{\"id\":\"btc-native\",\"symbol\":\"BTC\",\"name\":\"Bitcoin\",\"network\":\"Bitcoin\",\"icon\":\"/crypto/btc.png\",\"balance\":0,\"price\":66728.89,\"change\":0.06,\"valueUsd\":0,\"address\":\"1Fhv4jtqv6bChqgyRr86FeAH6Mi8zEr8HD\",\"payId\":\"dfdf+btc@qfs\",\"minimumDeposit\":0.0002,\"minimumWithdrawal\":0.00035,\"withdrawFee\":0.00035,\"confirmations\":\"2 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Major\",\"Native\"],\"status\":\"Enabled\"},{\"id\":\"usdt-trc20\",\"symbol\":\"USDT\",\"name\":\"Tether\",\"network\":\"TRC20\",\"icon\":\"/crypto/usdt.png\",\"balance\":0,\"price\":1,\"change\":0,\"valueUsd\":0,\"address\":\"TYqzd9FnZs9WQ8SR6S1HdvXeJPCbLyStL6\",\"payId\":\"dfdf+usdt@qfs\",\"minimumDeposit\":10,\"minimumWithdrawal\":25,\"withdrawFee\":1,\"confirmations\":\"20 confirmations\",\"enabledByDefault\":true,\"tags\":[\"Stablecoin\",\"TRC20\"],\"status\":\"Enabled\"}]', '[]', '[]', '[]', '[]', '[{\"id\":\"addr-1\",\"label\":\"Primary OTC Desk\",\"network\":\"Bitcoin\",\"address\":\"bc1q4q8h0z7n2s6x9p5k1r3v8m2u6f4d0t5y8n1c4\",\"kind\":\"Treasury\",\"trustedSince\":\"Trusted since Feb 12, 2026\"},{\"id\":\"addr-2\",\"label\":\"Liquidity Partner A\",\"network\":\"TRC20\",\"address\":\"TY8tq9Q5vC1rJ6Lw3Fh4Kp2Nz0s7Ua5YcR\",\"kind\":\"Vendor\",\"trustedSince\":\"Trusted since Jan 28, 2026\"}]', '[]', '[]', '[{\"id\":\"kyc-1\",\"title\":\"Government ID verified\",\"detail\":\"Passport scan passed liveness and identity review.\",\"status\":\"Completed\"},{\"id\":\"kyc-2\",\"title\":\"Proof of address approved\",\"detail\":\"Utility bill accepted and stamped within 90 days.\",\"status\":\"Completed\"},{\"id\":\"kyc-3\",\"title\":\"Source of funds review\",\"detail\":\"Treasury statements confirmed during compliance review.\",\"status\":\"Completed\"}]', '2026-03-30 23:23:30'),
(28, 'user', 'as sassaas', 'phcw91wo6f@xkxkud.com', '+2347263123242', 'ssa', 'USR-0028-7374', 'Nigeria', 'New Account', 'Tier 1', 'Active', 'Pending', 'Medium', 0.00, 0.00, 0.00, 0.00, 1, 'Starter', 'Active now', 'New signup awaiting funding.', '$2b$10$JfgPD8LSy6mIN76Xhv7JpekzbwI1vinoBiquvVGyQqhM6NzNIu1UG', '$2b$10$2orqiRfbiLdHD4Rik8x1OOCbn2WjeTwTa2OS57zHLMN0DPrb6jOGe', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[{\"id\":\"f345d3b8-a466-4c72-b27c-072ed34dd7a3\",\"device\":\"Windows Chrome desktop\",\"location\":\"Localhost session\",\"status\":\"Current session\",\"lastSeen\":\"Apr 02, 2026 10:09\"}]', '[]', '2026-04-02 09:08:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kyc_cases`
--
ALTER TABLE `kyc_cases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
