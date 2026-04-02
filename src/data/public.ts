export type ContentSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

export type PublicService = {
  slug: string;
  path: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  quoteLabel: string;
  highlights: {
    label: string;
    value: string;
    detail: string;
  }[];
  sections: ContentSection[];
  checklist: string[];
};

export type PublicKnowledgePage = {
  slug: string;
  path: string;
  category: string;
  title: string;
  description: string;
  readTime: string;
  sections: ContentSection[];
  callout: string;
};

export type PublicLocation = {
  slug: string;
  path: string;
  city: string;
  title: string;
  address: string;
  phone: string;
  hours: string[];
  description: string;
  specialties: string[];
  note: string;
};

export type LegalPage = {
  slug: string;
  path: string;
  title: string;
  intro: string;
  sections: ContentSection[];
};

export type PublicTestimonial = {
  name: string;
  avatar: string;
  avatarAlt: string;
  quote: {
    text: string;
    emphasis?: boolean;
  }[];
};

export const publicAnnouncement =
  'Our Calgary branch is now open for walk-in cash trades, e-Transfer pickups, and OTC appointments.';

export const publicStats = [
  {
    label: 'Serving Canadians',
    value: 'Since 2018',
    detail: 'A storefront-first crypto desk built around transparent pricing and real support.',
  },
  {
    label: 'Transaction experience',
    value: 'Face-to-face',
    detail: 'Cash, Interac e-Transfer, wire, and high-touch OTC execution in one flow.',
  },
  {
    label: 'Settlement style',
    value: 'Non-custodial',
    detail: 'Funds go straight to your wallet or bank. We never warehouse client balances.',
  },
];

export const publicCoins = [
  { name: 'Bitcoin', symbol: 'BTC', icon: '/crypto/btc.png' },
  { name: 'Ethereum', symbol: 'ETH', icon: '/crypto/eth.png' },
  { name: 'Litecoin', symbol: 'LTC', icon: '/crypto/ltc.png' },
  { name: 'Ripple', symbol: 'XRP', icon: '/crypto/xlm.png' },
  { name: 'Dogecoin', symbol: 'DOGE', icon: '/crypto/dash.png' },
  { name: 'USD Coin', symbol: 'USDC', icon: '/crypto/usdt.png' },
  { name: 'Solana', symbol: 'SOL', icon: '/crypto/sol.png' },
];

export const publicServices: PublicService[] = [
  {
    slug: 'buy-with-cash',
    path: '/buy-with-cash',
    navLabel: 'Buy With Cash',
    eyebrow: 'In-person service',
    title: 'Buy and sell crypto with cash at a local branch',
    description:
      'Walk into our Vancouver or Calgary office, meet a real team, and settle your Bitcoin or altcoin transaction in person with a live quote before you commit.',
    summary:
      'This route is ideal for fast walk-in trades, first-time buyers, and clients who prefer human support over exchange dashboards.',
    quoteLabel: 'Cash trades start from a clear in-store quote',
    highlights: [
      {
        label: 'Walk-in speed',
        value: 'Same visit',
        detail: 'Most standard trades are quoted and completed during the appointment.',
      },
      {
        label: 'Threshold guidance',
        value: 'Under $1,000',
        detail: 'We guide clients through the lightest-possible onboarding path available for the trade size.',
      },
      {
        label: 'Support level',
        value: 'Hands-on',
        detail: 'We can help you verify your wallet and double-check addresses before sending.',
      },
    ],
    sections: [
      {
        title: 'What to expect',
        body: [
          'You arrive at the branch, receive a live quote, and confirm the destination wallet before the transaction is executed.',
          'Our team can help you understand wallet basics, network choices, and how settlement works before funds move.',
        ],
        bullets: [
          'In-person quote before funds change hands',
          'Friendly support for beginners and repeat traders',
          'Immediate settlement to your own wallet when the trade completes',
        ],
      },
      {
        title: 'Best fit',
        body: [
          'Cash service is strongest for people who want privacy, speed, or a more personal exchange process than a self-serve platform can offer.',
        ],
        bullets: [
          'First-time buyers who want help setting up a wallet',
          'Clients who prefer an in-branch transaction record',
          'Sellers who want to complete the exchange face to face',
        ],
      },
    ],
    checklist: [
      'Bring the wallet address you want to receive into, or let us help you create one.',
      'Confirm the network before you send or receive any asset.',
      'Ask for the live quote first so you know the full price before proceeding.',
    ],
  },
  {
    slug: 'buy-with-e-transfer',
    path: '/buy-with-e-transfer',
    navLabel: 'Buy With E-Transfer',
    eyebrow: 'Online settlement',
    title: 'Buy crypto online with Interac e-Transfer',
    description:
      'Get a fast digital quote, fund the order with Interac e-Transfer, and receive your crypto the same day once the payment clears.',
    summary:
      'This path is designed for everyday purchases and clients who want a simple Canadian payment rail without visiting the store.',
    quoteLabel: 'Fast quotes for same-day digital orders',
    highlights: [
      {
        label: 'Funding rail',
        value: 'Interac',
        detail: 'A familiar Canadian payment flow with a low-friction onboarding experience.',
      },
      {
        label: 'Settlement target',
        value: 'Same day',
        detail: 'Most qualifying orders are processed the day they are received and confirmed.',
      },
      {
        label: 'Best for',
        value: 'Everyday buys',
        detail: 'A practical choice for recurring purchases and mid-sized personal orders.',
      },
    ],
    sections: [
      {
        title: 'How it works',
        body: [
          'You create the order, receive payment instructions, send the e-Transfer, and then we deliver directly to your destination wallet once the order clears.',
          'We use clear quotes and straightforward status communication so there is no mystery about what happens next.',
        ],
        bullets: [
          'Clear quote before funding',
          'Wallet delivery after payment confirmation',
          'Human support if the bank or wallet flow needs clarification',
        ],
      },
      {
        title: 'Why clients choose it',
        body: [
          'E-Transfer combines convenience and speed for buyers who do not need the higher limits or scheduling of a wire or OTC desk.',
        ],
        bullets: [
          'No store visit required',
          'Simple online funding path',
          'Ideal for repeat personal purchases',
        ],
      },
    ],
    checklist: [
      'Use a wallet you control before you fund the order.',
      'Double-check the reference details on the transfer instructions.',
      'Watch for the order confirmation message so you know when settlement starts.',
    ],
  },
  {
    slug: 'buy-with-wire-transfer',
    path: '/buy-with-wire-transfer',
    navLabel: 'Wire Transfer',
    eyebrow: 'High-value transfers',
    title: 'Use bank wire transfers for larger crypto purchases',
    description:
      'Wire orders are built for larger ticket sizes, treasury funding, and clients who need stronger banking rails with predictable settlement.',
    summary:
      'This service gives higher-capacity clients a more structured flow and a rate path suited to bigger trades.',
    quoteLabel: 'Structured execution for larger bank-funded orders',
    highlights: [
      {
        label: 'Trade profile',
        value: 'Large size',
        detail: 'Useful for treasury moves, business purchases, and clients who need a formal banking trail.',
      },
      {
        label: 'Settlement window',
        value: '1 to 2 days',
        detail: 'Most orders complete as the wire clears and the allocation is prepared.',
      },
      {
        label: 'Execution style',
        value: 'Guided',
        detail: 'We coordinate wallet details, quote timing, and execution expectations before the order is funded.',
      },
    ],
    sections: [
      {
        title: 'Order flow',
        body: [
          'The process begins with the trade request and quote discussion, then moves through banking instructions, confirmation, and final delivery to your wallet.',
          'Because the payment rail is bank-based, we can support more formal procurement and treasury use cases than lighter payment methods.',
        ],
        bullets: [
          'Designed for larger transactions',
          'Banking record for operational or treasury teams',
          'Rate clarity before settlement',
        ],
      },
      {
        title: 'Where it shines',
        body: [
          'Wire transfers work especially well for business clients, OTC-style personal buyers, and anyone who needs limits beyond e-Transfer comfort zones.',
        ],
        bullets: [
          'Business and treasury purchases',
          'Structured bank-to-wallet flow',
          'More room for larger allocations',
        ],
      },
    ],
    checklist: [
      'Confirm the receiving wallet with extra care before the wire is sent.',
      'Use the exact banking reference details provided with your quote.',
      'Coordinate timing if you need the trade settled against a specific market window.',
    ],
  },
  {
    slug: 'otc-trading-desk',
    path: '/otc-trading-desk',
    navLabel: 'OTC Desk',
    eyebrow: 'Desk execution',
    title: 'Use our OTC desk for higher-touch crypto execution',
    description:
      'Our over-the-counter desk supports larger and more sensitive trades with personal execution support, better trade management, and coordinated settlement.',
    summary:
      'OTC is the right fit when the order deserves more attention than a standard retail flow.',
    quoteLabel: 'Dedicated execution support for larger and more nuanced trades',
    highlights: [
      {
        label: 'Execution style',
        value: 'Handled by desk',
        detail: 'We coordinate the quote, timing, and destination details with you directly.',
      },
      {
        label: 'Trade context',
        value: 'Higher touch',
        detail: 'Built for larger orders and clients who need a more bespoke settlement process.',
      },
      {
        label: 'Relationship value',
        value: 'Repeat-ready',
        detail: 'A strong option for clients who expect ongoing trade coordination rather than one-off retail orders.',
      },
    ],
    sections: [
      {
        title: 'Why OTC is different',
        body: [
          'OTC is designed to reduce friction around larger orders by coordinating pricing, funding, and delivery with an actual human desk.',
          'Instead of navigating market noise on your own, you get a cleaner transaction experience and a clearer sense of what the execution will look like.',
        ],
        bullets: [
          'Execution support from a live desk',
          'Better suited to larger orders than self-serve channels',
          'Useful for repeat clients with treasury or business needs',
        ],
      },
      {
        title: 'Common use cases',
        body: [
          'Clients often use OTC for treasury allocation, large Bitcoin accumulation, and coordinated cash-out activity that deserves a more guided process.',
        ],
        bullets: [
          'Institutional-style personal trades',
          'Business treasury allocations',
          'Planned market entries or exits',
        ],
      },
    ],
    checklist: [
      'Share your timing and settlement expectations before the quote is locked.',
      'Use a wallet and banking path that match the transaction size and urgency.',
      'Let the desk know if you need recurring or scheduled execution support.',
    ],
  },
  {
    slug: 'fees-and-pricing',
    path: '/fees-and-pricing',
    navLabel: 'Fees & Pricing',
    eyebrow: 'Transparent quotes',
    title: 'See how pricing works before you transact',
    description:
      'Every transaction starts with a quote. We keep pricing straightforward, visible, and easy to compare before you commit to the exchange.',
    summary:
      'This page explains how fees behave across in-store, electronic, and quote-based OTC flows.',
    quoteLabel: 'Know the price before your order is funded',
    highlights: [
      {
        label: 'Cash trades',
        value: 'In-store quote',
        detail: 'Designed around local walk-in execution with upfront pricing clarity.',
      },
      {
        label: 'Electronic rails',
        value: 'Transparent spread',
        detail: 'Bank and digital funding routes follow a clear quote model with no last-minute surprises.',
      },
      {
        label: 'OTC orders',
        value: 'Custom rate',
        detail: 'Higher-value trades are quoted directly based on trade size and conditions.',
      },
    ],
    sections: [
      {
        title: 'Pricing philosophy',
        body: [
          'The goal is simple: quote the transaction clearly, show the economics before the trade starts, and avoid burying the real cost in a confusing user flow.',
          'That means retail clients and larger OTC buyers both understand what they are accepting before funds move.',
        ],
        bullets: [
          'Upfront quotes',
          'No hidden pricing surprises',
          'A simpler comparison against other local options',
        ],
      },
      {
        title: 'What affects your quote',
        body: [
          'Payment method, transaction size, market conditions, and execution style all shape the final quote. OTC orders are usually handled on a more tailored basis than everyday retail transactions.',
        ],
        bullets: [
          'Funding rail',
          'Trade size',
          'Order urgency and market conditions',
        ],
      },
    ],
    checklist: [
      'Ask for the quote before sending funds.',
      'Confirm whether your payment method changes the final pricing.',
      'Use OTC routing for larger transactions that need tailored execution.',
    ],
  },
];

export const publicKnowledgePages: PublicKnowledgePage[] = [
  {
    slug: 'crypto-wallets',
    path: '/crypto-wallets',
    category: 'Education',
    title: 'Crypto wallets explained without the jargon',
    description:
      'Learn the difference between custodial and self-custody setups, how addresses work, and how to choose a wallet that matches your experience level.',
    readTime: '6 min read',
    sections: [
      {
        title: 'Why wallets matter',
        body: [
          'A wallet is where you control access to your crypto. When you buy through a non-custodial exchange flow, the destination wallet is the most important part of the transaction.',
          'Choosing the right setup affects recovery, convenience, and how much responsibility you keep in your own hands.',
        ],
      },
      {
        title: 'Common wallet paths',
        body: [
          'Hot wallets are easier for frequent use, while hardware wallets are preferred for larger long-term balances.',
        ],
        bullets: [
          'Mobile wallets for daily convenience',
          'Desktop wallets for active personal use',
          'Hardware wallets for stronger long-term custody',
        ],
      },
      {
        title: 'Beginner guardrails',
        body: [
          'Always back up your recovery phrase offline, verify addresses before sending, and avoid copying wallet details from untrusted messages.',
        ],
      },
    ],
    callout:
      'Need help choosing a wallet before your first order? Our support team can walk you through practical options.',
  },
  {
    slug: 'crypto-basics',
    path: '/crypto-basics',
    category: 'Education',
    title: 'Crypto basics for first-time buyers',
    description:
      'A short, practical introduction to Bitcoin, altcoins, settlement networks, and what new buyers should understand before their first transaction.',
    readTime: '7 min read',
    sections: [
      {
        title: 'Start with the purpose',
        body: [
          'Bitcoin is often used as a long-term reserve asset, while many alternative cryptocurrencies focus on payments, settlement speed, or application ecosystems.',
          'You do not need to know everything before your first purchase, but you should understand what you are buying and where it will be delivered.',
        ],
      },
      {
        title: 'The key ideas',
        body: [
          'Most beginner mistakes come from mixing up coins, networks, and wallet addresses. Learning those three ideas eliminates a lot of avoidable friction.',
        ],
        bullets: [
          'The asset and the network are not always the same thing',
          'Addresses must match the network you use',
          'The wallet you control is where your funds actually arrive',
        ],
      },
      {
        title: 'Before you buy',
        body: [
          'Know your payment method, set up your wallet first, and decide whether your purchase is a one-time order or part of a longer-term plan.',
        ],
      },
    ],
    callout:
      'If you are totally new, we recommend reading this page first and then reviewing the wallet guide before placing a live order.',
  },
  {
    slug: 'what-is-bitcoin',
    path: '/resources/what-is-bitcoin',
    category: 'Crypto Basics',
    title: 'What is Bitcoin?',
    description:
      'A beginner-friendly overview of what Bitcoin is, why it was created, and why people use it as both money and a long-term digital asset.',
    readTime: '5 min read',
    sections: [
      {
        title: 'The short version',
        body: [
          'Bitcoin is a decentralized digital money system that lets people hold and transfer value without relying on a bank to custody the asset.',
          'Many people first encounter it as an investment, but its design also matters for payments, custody, and financial sovereignty.',
        ],
      },
      {
        title: 'Why it matters',
        body: [
          'Bitcoin introduced a durable, scarce digital asset that can be held directly by the user rather than by an institution on their behalf.',
        ],
        bullets: [
          'Finite supply',
          'Global transferability',
          'Self-custody by design',
        ],
      },
    ],
    callout:
      'Think of Bitcoin as digital property with money-like transfer features, not just another stock-like ticker.',
  },
  {
    slug: 'crypto-taxes-canada',
    path: '/resources/crypto-taxes-canada',
    category: 'Crypto Basics',
    title: 'Crypto taxes in Canada: what to keep track of',
    description:
      'A plain-language overview of why records matter, what events often trigger tax consequences, and how to prepare your transaction history.',
    readTime: '8 min read',
    sections: [
      {
        title: 'Keep records from day one',
        body: [
          'Even small early purchases are easier to manage if you save quotes, wallet records, and transfer timestamps from the beginning.',
          'Good records make tax season, bookkeeping, and cost-basis reconstruction much easier later.',
        ],
      },
      {
        title: 'Common trigger points',
        body: [
          'Buying, selling, swapping, and sometimes spending crypto can all create events that matter for accounting or tax review.',
        ],
        bullets: [
          'Buy and sell records',
          'Swap history across assets or networks',
          'Wallet transfers that need internal documentation',
        ],
      },
    ],
    callout:
      'This page is educational, not tax advice. For filing decisions, work with a qualified Canadian tax professional.',
  },
  {
    slug: 'vancouver-bitcoin-atm-guide',
    path: '/resources/vancouver-bitcoin-atm-guide',
    category: 'Bitcoin Guides',
    title: 'Vancouver Bitcoin ATM guide',
    description:
      'A quick comparison between ATM-style crypto access and an in-person exchange desk, including where a staffed branch tends to offer a better experience.',
    readTime: '6 min read',
    sections: [
      {
        title: 'Why people compare the two',
        body: [
          'ATMs feel simple because they are physical, but they often come with higher effective costs and less guidance than a staffed exchange branch.',
          'A retail crypto office gives you the same in-person comfort while adding clearer support and pricing visibility.',
        ],
      },
      {
        title: 'Where a staffed branch wins',
        body: [
          'When you want better help, clearer pricing, or a smoother beginner experience, a branch with knowledgeable support usually feels much less intimidating.',
        ],
        bullets: [
          'Human support instead of a kiosk workflow',
          'Better context around wallet setup',
          'Clearer quote conversation before the trade executes',
        ],
      },
    ],
    callout:
      'If you want the in-person experience without the ATM confusion, a live branch visit is usually the cleaner path.',
  },
];

export const publicTestimonials: PublicTestimonial[] = [
  {
    name: 'Tam Mitchell',
    avatar: '/marketing/testimonial-tam.png',
    avatarAlt: 'Tam Mitchell profile photo',
    quote: [
      { text: 'Super easy and secure transaction.', emphasis: true },
      { text: ' No stress deposit to the wallet. They can even ' },
      { text: 'handle a deposit from my bank,', emphasis: true },
      { text: ' sending funds to a Bitcoin wallet of my choice. Very friendly and helpful staff.' },
    ],
  },
  {
    name: 'Philip Struthers',
    avatar: '/marketing/testimonial-philip.png',
    avatarAlt: 'Philip Struthers headshot image',
    quote: [
      { text: 'Attendants were ' },
      { text: 'super attentive and helpful.', emphasis: true },
      { text: ' The process of bitcoin takes some time and they ' },
      { text: 'had the patience to walk me through every step of the way', emphasis: true },
      { text: ' and helped with error checking.' },
    ],
  },
  {
    name: 'Judy Davis',
    avatar: '/marketing/testimonial-judy.png',
    avatarAlt: 'Judy Davis headshot image',
    quote: [
      {
        text: 'Responded quickly to all of my inquiries, and I am very pleased with their customer service. I would not hesitate to ',
      },
      { text: 'recommend them to anyone looking for a crypto exchange and BTC wallet.', emphasis: true },
    ],
  },
  {
    name: 'Ada George',
    avatar: '/marketing/testimonial-ada.svg',
    avatarAlt: 'Ada George profile graphic',
    quote: [
      { text: 'I liked that the team ' },
      { text: 'explained the wallet setup before taking any payment.', emphasis: true },
      { text: ' It felt organized, calm, and much easier than trying to figure everything out on a trading app.' },
    ],
  },
  {
    name: 'Marcus Lee',
    avatar: '/marketing/testimonial-marcus.svg',
    avatarAlt: 'Marcus Lee profile graphic',
    quote: [
      { text: 'The quote process was ' },
      { text: 'clear and straightforward from the start.', emphasis: true },
      { text: ' No hidden confusion, no guessing, and the transfer landed exactly where I expected.' },
    ],
  },
  {
    name: 'Elena Brooks',
    avatar: '/marketing/testimonial-elena.svg',
    avatarAlt: 'Elena Brooks profile graphic',
    quote: [
      { text: 'I was new to crypto and still felt comfortable because the support was ' },
      { text: 'patient, practical, and very human.', emphasis: true },
      { text: ' That made a big difference for me.' },
    ],
  },
  {
    name: 'Noah Peters',
    avatar: '/marketing/testimonial-noah.svg',
    avatarAlt: 'Noah Peters profile graphic',
    quote: [
      { text: 'The service felt ' },
      { text: 'more serious and more trustworthy than a self-serve exchange screen.', emphasis: true },
      { text: ' I could ask questions, confirm details, and move forward without pressure.' },
    ],
  },
];

export const publicFaqs = [
  {
    question: 'What payment methods can I use to buy cryptocurrency?',
    answer:
      'We support walk-in cash trades, Interac e-Transfer, and bank wire-based funding depending on the order size and execution path.',
  },
  {
    question: 'Can I buy Bitcoin with cash?',
    answer:
      'Yes. Cash trades are available in person at our branch locations, and we quote the transaction before anything is finalized.',
  },
  {
    question: 'Do I need a wallet before I buy?',
    answer:
      'Yes. Because the service is non-custodial, your crypto is delivered to a wallet you control. We can help you choose one if you are new.',
  },
  {
    question: 'Do you help beginners?',
    answer:
      'Absolutely. A major part of the service is helping first-time buyers understand wallets, networks, and safe transaction habits.',
  },
  {
    question: 'Which cryptocurrencies do you support?',
    answer:
      'We focus on major assets such as Bitcoin, Ethereum, Litecoin, Solana, XRP, stablecoins, and other commonly requested coins.',
  },
  {
    question: 'Can I get support for larger trades?',
    answer:
      'Yes. Larger or more time-sensitive orders are best handled through the OTC desk so execution and settlement can be coordinated directly.',
  },
];

export const publicLocations: PublicLocation[] = [
  {
    slug: 'vancouver',
    path: '/locations/vancouver',
    city: 'Vancouver',
    title: 'Visit our Vancouver crypto exchange office',
    address: '1807 Burrard St #202, Vancouver, BC V6J 1H9',
    phone: '+1 (604) 256-7936',
    hours: ['Monday to Friday: 10AM - 6PM', 'Saturday: 11AM - 4PM'],
    description:
      'Our Vancouver branch is designed for walk-in cash trades, beginner support, and high-trust in-person crypto transactions.',
    specialties: [
      'Walk-in Bitcoin and crypto trades',
      'Wallet setup guidance',
      'Support for first-time buyers and sellers',
    ],
    note:
      'Best for clients who want local support, same-visit service, and direct help with wallet setup.',
  },
  {
    slug: 'calgary',
    path: '/locations/calgary',
    city: 'Calgary',
    title: 'Visit our Calgary crypto exchange office',
    address: '5809 Macleod Trail SW, Unit 209, Calgary, AB T2J 0H9',
    phone: '+1 (587) 871-5022',
    hours: ['Monday to Friday: 10AM - 6PM', 'Saturday: 11AM - 4PM'],
    description:
      'Our Calgary branch extends the same human-first exchange experience to clients who want local access without a self-serve platform.',
    specialties: [
      'In-person cash service',
      'Support for e-Transfer and wire coordination',
      'High-touch OTC appointment support',
    ],
    note:
      'A strong choice for clients who want a branch experience in Calgary for both everyday and larger crypto orders.',
  },
];

export const legalPages: LegalPage[] = [
  {
    slug: 'privacy-policy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    intro:
      'This privacy policy explains how contact details, account information, and support records are handled across the public site and account experience.',
    sections: [
      {
        title: 'Information we collect',
        body: [
          'We collect contact information, account setup details, onboarding responses, and transaction-support messages that you choose to provide through forms or support channels.',
          'Operational records may also include device details, session timing, and internal notes required to keep support and compliance workflows organized.',
        ],
      },
      {
        title: 'How we use it',
        body: [
          'Information is used to respond to inquiries, support account creation, provide transaction assistance, and meet security and compliance obligations.',
        ],
        bullets: [
          'Customer support and onboarding',
          'Security monitoring and fraud prevention',
          'Internal operational planning and compliance reviews',
        ],
      },
      {
        title: 'Your controls',
        body: [
          'You may request corrections to personal details, ask questions about stored records, or request account deactivation subject to applicable recordkeeping requirements.',
        ],
      },
    ],
  },
  {
    slug: 'terms-of-service',
    path: '/terms-of-service',
    title: 'Terms of Service',
    intro:
      'These terms describe how the public site, account access, and transaction-support workflows are intended to operate.',
    sections: [
      {
        title: 'Service scope',
        body: [
          'The service includes public information pages, account onboarding, dashboard access, and support workflows for funding, verification, and account management.',
          'Quotes, approvals, payments, and compliance checks remain subject to operating procedures and review requirements.',
        ],
      },
      {
        title: 'User responsibilities',
        body: [
          'You are responsible for providing accurate onboarding information, using wallet addresses you control, and reviewing transaction details before confirming any live trade.',
        ],
        bullets: [
          'Maintain accurate account details',
          'Secure your wallet credentials and device access',
          'Review the quote and destination details before any transaction',
        ],
      },
      {
        title: 'Operational reservation',
        body: [
          'We may pause, review, or decline account actions and transactions when additional verification, security review, or compliance confirmation is required.',
        ],
      },
    ],
  },
];

export const getPublicServiceBySlug = (slug: string) =>
  publicServices.find((service) => service.slug === slug);

export const getPublicKnowledgePageBySlug = (slug: string) =>
  publicKnowledgePages.find((page) => page.slug === slug);

export const getPublicLocationBySlug = (slug: string) =>
  publicLocations.find((location) => location.slug === slug);

export const getLegalPageBySlug = (slug: string) =>
  legalPages.find((page) => page.slug === slug);
