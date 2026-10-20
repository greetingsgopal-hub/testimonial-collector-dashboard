/**
 * Programmatic SEO Engine Dataset for PandaPraise
 * Defines structured competitor comparisons and industry use-case landing pages.
 */

export interface CompetitorComparison {
  slug: string;
  name: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  competitorPrice: string;
  pandaPraisePrice: string;
  pricingTeardown: string;
  featureMatrix: Array<{
    feature: string;
    pandaPraise: string | boolean;
    competitor: string | boolean;
    note?: string;
  }>;
  whySwitch: string[];
  migrationSteps: Array<{ step: number; title: string; desc: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export interface UseCaseLanding {
  slug: string;
  industry: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubtitle: string;
  recommendedLayout: string;
  keyBenefits: Array<{ title: string; desc: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const COMPETITORS: CompetitorComparison[] = [
  {
    slug: 'senja',
    name: 'Senja',
    tagline: 'The #1 High-Speed Alternative to Senja for SaaS & Creators',
    metaTitle: 'PandaPraise vs Senja: Best Senja Alternative (2026 Comparison)',
    metaDescription: 'Looking for a Senja alternative? Compare PandaPraise vs Senja on pricing, widget speed, Shadow DOM isolation, and video testimonial collection.',
    competitorPrice: '$39/mo (Starter)',
    pandaPraisePrice: 'Free tier (15 reviews) or $19/mo Pro / $149 Lifetime',
    pricingTeardown: 'Senja charges $39/month with steep seat limits. PandaPraise gives you 15 reviews free forever, or upgrade to Pro for $19/mo with zero branding and unlimited testimonials.',
    featureMatrix: [
      { feature: 'Free Plan', pandaPraise: '15 Reviews (Forever)', competitor: '15 Reviews' },
      { feature: 'Pro Pricing', pandaPraise: '$19/month', competitor: '$39/month' },
      { feature: 'Lifetime Deal Available', pandaPraise: '$149 (Founding Pass)', competitor: false },
      { feature: 'Shadow DOM Widget Isolation', pandaPraise: true, competitor: false, note: 'Zero CSS bleed on Shopify/Webflow' },
      { feature: 'All 5 Widget Layouts (Marquee, Wall, Carousel, Spotlight, Badge)', pandaPraise: true, competitor: 'Restricted by tier' },
      { feature: '1080p HD Video Testimonials', pandaPraise: true, competitor: true },
      { feature: 'Inbound Webhooks & REST API', pandaPraise: true, competitor: 'Higher tier only' },
      { feature: 'Load Speed (Average Script Size)', pandaPraise: '< 15 KB', competitor: '> 85 KB' },
    ],
    whySwitch: [
      'Save over 50% on monthly software costs while unlocking unlimited testimonials.',
      'Impenetrable Shadow DOM widgets that never break your site styles on WordPress or Shopify.',
      '1-Click automated CSV & Google review imports with zero data loss.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export from Senja', desc: 'Download your testimonial CSV from your Senja dashboard.' },
      { step: 2, title: 'Upload to PandaPraise', desc: 'Use our 1-click CSV bulk importer in your PandaPraise dashboard.' },
      { step: 3, title: 'Embed New Widget', desc: 'Swap out the script tag for high-speed, zero-CLS PandaPraise widgets.' },
    ],
    faqs: [
      {
        question: 'Can I import my existing testimonials from Senja?',
        answer: 'Yes! Export your reviews as a CSV from Senja and import them into PandaPraise in under 60 seconds with author names, avatars, and ratings fully preserved.',
      },
      {
        question: 'Why is PandaPraise faster than Senja?',
        answer: 'PandaPraise embed runtime is under 15KB with zero third-party dependencies and renders directly inside the browser Shadow DOM for sub-50ms paint times.',
      },
    ],
  },
  {
    slug: 'testimonial-to',
    name: 'Testimonial.to',
    tagline: 'Modern, Lightning-Fast Alternative to Testimonial.to',
    metaTitle: 'PandaPraise vs Testimonial.to: The Best Alternative in 2026',
    metaDescription: 'Compare PandaPraise and Testimonial.to. Discover faster widgets, superior branding customizability, and better value pricing.',
    competitorPrice: '$50/mo (Premium)',
    pandaPraisePrice: '$19/mo Pro or $149 Lifetime Pass',
    pricingTeardown: 'Testimonial.to starts at $50-$70/mo for modern features. PandaPraise delivers complete video & text collection for $19/mo.',
    featureMatrix: [
      { feature: 'Monthly Price', pandaPraise: '$19/mo', competitor: '$50/mo' },
      { feature: 'Lifetime License', pandaPraise: '$149 one-time', competitor: false },
      { feature: 'Continuous Marquee Ticker', pandaPraise: true, competitor: false },
      { feature: 'Google Business Reviews Auto-Sync', pandaPraise: true, competitor: 'Limited' },
      { feature: 'Slack & Discord Webhook Alerts', pandaPraise: true, competitor: true },
      { feature: 'Zero-CLS Core Web Vitals Optimization', pandaPraise: true, competitor: 'Partial' },
    ],
    whySwitch: [
      'Stop paying $600/year for basic social proof widgets.',
      'Native Google Places and social review syncing in one unified dashboard.',
      'Beautiful glassmorphic design that elevates high-ticket conversion rates.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export from Testimonial.to', desc: 'Download your testimonials file from Testimonial.to settings.' },
      { step: 2, title: 'Import with 1 Click', desc: 'Drop the file into PandaPraise Universal Importer.' },
      { step: 3, title: 'Go Live', desc: 'Embed your new Wall of Love or Marquee ticker on your landing page.' },
    ],
    faqs: [
      {
        question: 'Is PandaPraise better for Core Web Vitals than Testimonial.to?',
        answer: 'Yes. PandaPraise embeds include zero-CLS skeleton loaders and async asset decoding, guaranteeing 100/100 Lighthouse performance scores.',
      },
    ],
  },
  {
    slug: 'trustpilot',
    name: 'Trustpilot',
    tagline: 'Self-Serve, Founder-Friendly Alternative to Trustpilot',
    metaTitle: 'PandaPraise vs Trustpilot: Why Growing Brands Switch to PandaPraise',
    metaDescription: 'Avoid Trustpilot enterprise sales traps and thousands in hidden costs. Collect verified customer reviews on your own terms with PandaPraise.',
    competitorPrice: '$250 - $1,000+/mo (Contract Required)',
    pandaPraisePrice: 'Free or $19/mo Pro (No Contracts)',
    pricingTeardown: 'Trustpilot locks businesses into expensive multi-thousand-dollar annual contracts. PandaPraise offers transparent self-serve pricing with zero lock-in.',
    featureMatrix: [
      { feature: 'Pricing', pandaPraise: 'Self-Serve from $19/mo', competitor: '$2,500+/year contracts' },
      { feature: 'Sales Calls Required', pandaPraise: 'Zero (Sign up in 30s)', competitor: 'Mandatory' },
      { feature: 'Video Testimonial Collection', pandaPraise: true, competitor: false },
      { feature: 'Google Rich Snippet Stars (SEO)', pandaPraise: true, competitor: true },
      { feature: 'Custom Brand Styling', pandaPraise: 'Full CSS & Themes', competitor: 'Strict Trustpilot badge only' },
    ],
    whySwitch: [
      'Never get trapped by high-pressure annual enterprise contracts.',
      'Full ownership and portability of your customer testimonials.',
      'Collect video reviews alongside star ratings without third-party tools.',
    ],
    migrationSteps: [
      { step: 1, title: 'Connect Trustpilot', desc: 'Paste your public Trustpilot business URL into PandaPraise.' },
      { step: 2, title: 'Verify Reviews', desc: 'PandaPraise imports your public 4 and 5-star praise automatically.' },
      { step: 3, title: 'Embed Everywhere', desc: 'Display reviews in custom branded widgets that match your store.' },
    ],
    faqs: [
      {
        question: 'Can I display Trustpilot reviews alongside direct customer testimonials?',
        answer: 'Yes! PandaPraise unifies reviews from Google, Trustpilot, LinkedIn, and direct form submissions in one Wall of Love.',
      },
    ],
  },
  {
    slug: 'boast',
    name: 'Boast',
    tagline: 'High-Converting Video Testimonial Alternative to Boast',
    metaTitle: 'PandaPraise vs Boast: The Modern Video Testimonial Tool',
    metaDescription: 'Compare PandaPraise and Boast. Collect authentic video testimonials and display them in stunning widgets at a fraction of the cost.',
    competitorPrice: '$59/mo (Basic)',
    pandaPraisePrice: '$19/mo Pro',
    pricingTeardown: 'Boast charges $59-$119/mo with strict video response caps. PandaPraise provides HD video collection for $19/mo.',
    featureMatrix: [
      { feature: 'Starting Price', pandaPraise: '$19/mo', competitor: '$59/mo' },
      { feature: 'Video Testimonials', pandaPraise: true, competitor: true },
      { feature: 'Text Testimonials & Social Sync', pandaPraise: true, competitor: 'Limited' },
      { feature: 'Marquee & Wall Layouts', pandaPraise: true, competitor: 'Basic' },
      { feature: 'Setup Time', pandaPraise: '< 2 Minutes', competitor: '15+ Minutes' },
    ],
    whySwitch: [
      'Frictionless browser-based video recording with no apps or downloads required.',
      'Sleek modern UI templates engineered specifically for SaaS and e-commerce conversion.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export Boast Videos', desc: 'Download your Boast testimonial data.' },
      { step: 2, title: 'Upload to PandaPraise', desc: 'Add your videos to PandaPraise.' },
      { step: 3, title: 'Embed New Player', desc: 'Replace your widget with our ultra-fast player.' },
    ],
    faqs: [
      {
        question: 'Do customers need to download an app to record video testimonials?',
        answer: 'Never. Customers can record and submit high-definition video testimonials right from their browser on any smartphone, tablet, or desktop.',
      },
    ],
  },
  {
    slug: 'endorsal',
    name: 'Endorsal',
    tagline: 'Affordable, Cloudflare Edge-Powered Endorsal Alternative',
    metaTitle: 'PandaPraise vs Endorsal: Why Teams Choose PandaPraise',
    metaDescription: 'Endorsal alternative comparison: See how PandaPraise beats Endorsal with faster widgets, simpler onboarding, and better pricing.',
    competitorPrice: '$29/mo (Starter)',
    pandaPraisePrice: '$19/mo Pro',
    pricingTeardown: 'Endorsal charges $29-$79/mo. PandaPraise provides identical or superior automation and styling from $19/mo.',
    featureMatrix: [
      { feature: 'Monthly Price', pandaPraise: '$19/mo', competitor: '$29/mo' },
      { feature: 'Lifetime Deal', pandaPraise: '$149 one-time', competitor: false },
      { feature: 'Shadow DOM Encapsulation', pandaPraise: true, competitor: false },
      { feature: 'Automated Review Request Drips', pandaPraise: true, competitor: true },
    ],
    whySwitch: [
      'Modern glassmorphic aesthetics that look built-in rather than bolted on.',
      'Edge CDN delivery via Cloudflare with global sub-30ms latency.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export CSV', desc: 'Download your Endorsal reviews.' },
      { step: 2, title: 'Import to PandaPraise', desc: 'Import into your project.' },
      { step: 3, title: 'Update Embeds', desc: 'Use our zero-CLS script.' },
    ],
    faqs: [
      {
        question: 'Does PandaPraise support automated review requests?',
        answer: 'Yes! PandaPraise includes multi-channel drip campaign triggers via webhooks and email.',
      },
    ],
  },
  {
    slug: 'vocalvideo',
    name: 'VocalVideo',
    tagline: 'Affordable Video Proof Alternative to VocalVideo',
    metaTitle: 'PandaPraise vs VocalVideo: Video Testimonials Without Enterprise Costs',
    metaDescription: 'VocalVideo alternative: Get high-definition customer video reviews and custom Wall of Love widgets for a fraction of the cost.',
    competitorPrice: '$99/mo (Pro)',
    pandaPraisePrice: '$19/mo Pro',
    pricingTeardown: 'VocalVideo costs $99/mo minimum. PandaPraise gives you HD video collection and all widget layouts for $19/mo.',
    featureMatrix: [
      { feature: 'Monthly Price', pandaPraise: '$19/mo', competitor: '$99/mo' },
      { feature: 'Video Recording in Browser', pandaPraise: true, competitor: true },
      { feature: 'Combined Text & Video Wall', pandaPraise: true, competitor: 'Video-only focus' },
      { feature: 'Social Review Import (Google, LinkedIn)', pandaPraise: true, competitor: false },
    ],
    whySwitch: [
      'Save over $900/year on video testimonial infrastructure.',
      'Blend authentic video proof with high-volume text reviews from Google and LinkedIn.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export Videos', desc: 'Download your VocalVideo videos.' },
      { step: 2, title: 'Import', desc: 'Upload into your PandaPraise project.' },
      { step: 3, title: 'Display', desc: 'Embed anywhere in seconds.' },
    ],
    faqs: [
      {
        question: 'Can I mix video and text testimonials in the same widget?',
        answer: 'Yes! PandaPraise lets you showcase text reviews and video cards side-by-side in all widget layouts.',
      },
    ],
  },
  {
    slug: 'shoutout',
    name: 'ShoutOut',
    tagline: 'The Reliable, Fast Alternative to ShoutOut.so',
    metaTitle: 'PandaPraise vs ShoutOut: Modern Social Proof for Creators & SaaS',
    metaDescription: 'Compare PandaPraise and ShoutOut. Faster embeds, richer layouts, and zero-bleed Shadow DOM protection.',
    competitorPrice: '$19/mo',
    pandaPraisePrice: '$19/mo Pro / $149 Lifetime',
    pricingTeardown: 'PandaPraise matches and exceeds ShoutOut features with 5 widget layouts and lifetime access.',
    featureMatrix: [
      { feature: 'Price', pandaPraise: '$19/mo or $149 Lifetime', competitor: '$19/mo' },
      { feature: 'Layout Variety', pandaPraise: '5 Layouts (Wall, Marquee, Carousel, Spotlight, Badge)', competitor: 'Wall only' },
      { feature: 'Shadow DOM Isolation', pandaPraise: true, competitor: false },
    ],
    whySwitch: [
      '5 versatile widget layouts including continuous marquee tickers and trust badges.',
      'Active product roadmap and high-speed edge infrastructure.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export', desc: 'Get your reviews from ShoutOut.' },
      { step: 2, title: 'Import', desc: 'Upload into PandaPraise.' },
      { step: 3, title: 'Embed', desc: 'Enjoy cleaner widgets.' },
    ],
    faqs: [
      {
        question: 'Why should I switch from ShoutOut?',
        answer: 'PandaPraise offers 5 layout variations, automatic Google Business review syncing, and Shadow DOM CSS protection.',
      },
    ],
  },
  {
    slug: 'walloflove',
    name: 'WallOfLove',
    tagline: 'Advanced Wall of Love Alternative with Multi-Platform Embeds',
    metaTitle: 'PandaPraise vs WallOfLove: Complete Social Proof Engine',
    metaDescription: 'Need more than a static wall? PandaPraise provides dynamic collection forms, automated moderation, and 5 widget styles.',
    competitorPrice: '$24/mo',
    pandaPraisePrice: '$19/mo Pro',
    pricingTeardown: 'PandaPraise provides complete collection, auto-moderation, and multi-layout display for $19/mo.',
    featureMatrix: [
      { feature: 'Price', pandaPraise: '$19/mo', competitor: '$24/mo' },
      { feature: 'Collection Forms', pandaPraise: 'Branded + Custom Questions', competitor: 'Basic' },
      { feature: 'Video Collection', pandaPraise: true, competitor: 'Add-on fee' },
    ],
    whySwitch: [
      'Comprehensive collection forms with custom video prompts and ratings.',
      'Automated sentiment analysis and auto-approval workflows.',
    ],
    migrationSteps: [
      { step: 1, title: 'Export', desc: 'Export your reviews.' },
      { step: 2, title: 'Import', desc: 'Upload to PandaPraise.' },
      { step: 3, title: 'Embed', desc: 'Embed your new Wall of Love.' },
    ],
    faqs: [
      {
        question: 'Does PandaPraise include a dedicated public Wall of Love URL?',
        answer: 'Yes! Every project gets a dedicated URL at pandapraise.com/love/your-space to share with prospective customers.',
      },
    ],
  },
];

export const USE_CASES: UseCaseLanding[] = [
  {
    slug: 'shopify',
    industry: 'Shopify Stores',
    path: '/best-shopify-testimonial-tools',
    metaTitle: 'Best Testimonial Tool for Shopify Stores (2026 Review)',
    metaDescription: 'Discover the best testimonial and review tool for Shopify e-commerce. Boost checkout buyer trust and reduce cart hesitation with zero-bleed widgets.',
    heroHeadline: 'Best Testimonial Tool for Shopify',
    heroSubtitle: 'Boost store conversion and average order value by embedding verified customer praise directly on your product & cart pages.',
    recommendedLayout: 'Continuous Marquee Ticker & Product Page Spotlight',
    keyBenefits: [
      { title: 'Zero CSS Bleed', desc: 'Rendered in Shadow DOM so Shopify theme styles never distort your testimonial cards.' },
      { title: 'Sub-50ms Load Speed', desc: 'Keep your Shopify store score at 95+ with under 15KB lightweight runtime.' },
      { title: 'Google Stars Rich Snippets', desc: 'Show orange aggregate rating stars on Google search results to double organic CTR.' },
    ],
    faqs: [
      {
        question: 'How do I add PandaPraise to Shopify?',
        answer: 'Simply copy our 1-line script tag and paste it into your Shopify theme Liquid file, or insert a custom Liquid section in your theme customizer.',
      },
    ],
  },
  {
    slug: 'saas',
    industry: 'B2B SaaS',
    path: '/best-saas-testimonial-tools',
    metaTitle: 'Best Testimonial Tool for B2B SaaS Companies (2026)',
    metaDescription: 'Turn customer love into pipeline growth. Learn why high-growth SaaS startups use PandaPraise for social proof collection.',
    heroHeadline: 'Best Testimonial Tool for B2B SaaS',
    heroSubtitle: 'Collect authentic praise from CTOs, product managers, and founders to shorten B2B sales cycles and increase trial conversions.',
    recommendedLayout: 'Masonry Wall of Love & Landing Page Carousel',
    keyBenefits: [
      { title: 'Developer-Friendly Ergonomics', desc: 'Clean script tag, React/Next.js snippets, and REST API access.' },
      { title: 'Slack & Discord Real-Time Alerts', desc: 'Celebrate new 5-star praise right inside your company team channels.' },
      { title: 'Viral Referral Watermark', desc: 'Free plan widgets turn every visitor on your site into potential PandaPraise referrals.' },
    ],
    faqs: [
      {
        question: 'Can I integrate PandaPraise with Next.js or React?',
        answer: 'Yes! PandaPraise provides copy-paste ready React and Next.js (App Router) components with client-side hydration.',
      },
    ],
  },
  {
    slug: 'agency',
    industry: 'Marketing & Design Agencies',
    path: '/best-agency-testimonial-tools',
    metaTitle: 'Best Testimonial Tool for Digital Agencies (2026)',
    metaDescription: 'Manage client social proof across multiple workspaces with PandaPraise agency multi-project infrastructure.',
    heroHeadline: 'Best Testimonial Tool for Agencies',
    heroSubtitle: 'Showcase high-ticket client results with stunning glassmorphic case study cards and multi-client project workspaces.',
    recommendedLayout: 'Interactive Wall of Love & Trust Badge',
    keyBenefits: [
      { title: 'Multi-Project Switching', desc: 'Switch between separate client projects from a single master dashboard.' },
      { title: 'White-Label Ready', desc: 'Remove all PandaPraise branding with 1 click on Pro plans.' },
      { title: 'High-Converting Case Studies', desc: 'Transform client quotes into publishable social cards for LinkedIn and Twitter.' },
    ],
    faqs: [
      {
        question: 'Can I manage multiple clients under one account?',
        answer: 'Yes! PandaPraise supports unlimited projects and workspaces with separate collection forms and embed scripts.',
      },
    ],
  },
  {
    slug: 'course-creators',
    industry: 'Course Creators & Educators',
    path: '/best-course-creators-testimonial-tools',
    metaTitle: 'Best Testimonial Tool for Course Creators & Coaches (2026)',
    metaDescription: 'Collect high-converting student video testimonials and display them on your course sales pages to double enrollment.',
    heroHeadline: 'Best Testimonial Tool for Course Creators',
    heroSubtitle: 'Gather authentic student transformations and video reviews in 2 minutes without awkward scheduling or downloads.',
    recommendedLayout: 'Student Video Spotlight & Testimonial Carousel',
    keyBenefits: [
      { title: '1-Click Video Recording', desc: 'Students can record video reviews directly from their phone camera in any browser.' },
      { title: 'Embed on Kajabi, Teachable & Skool', desc: 'Drop embed code seamlessly into any course platform or sales funnel builder.' },
    ],
    faqs: [
      {
        question: 'Can I embed PandaPraise on Skool or Kajabi?',
        answer: 'Yes, PandaPraise embed scripts work on Kajabi, Skool, Teachable, ClickFunnels, and custom landing page builders.',
      },
    ],
  },
  {
    slug: 'freelancers',
    industry: 'Freelancers & Consultants',
    path: '/best-freelancers-testimonial-tools',
    metaTitle: 'Best Testimonial Tool for Freelancers & Consultants (2026)',
    metaDescription: 'Win more high-paying clients with a professional Wall of Love portfolio. Start collecting client praise for free.',
    heroHeadline: 'Best Testimonial Tool for Freelancers',
    heroSubtitle: 'Send a simple collection link after every project and showcase glowing 5-star client recommendations on your personal portfolio.',
    recommendedLayout: 'Compact Trust Badge & Client Quote Cards',
    keyBenefits: [
      { title: 'Free Plan Forever', desc: 'Collect up to 15 testimonials completely free with zero credit card required.' },
      { title: 'Dedicated Portfolio Link', desc: 'Share your public Wall of Love link on proposals and Upwork profiles.' },
    ],
    faqs: [
      {
        question: 'Is PandaPraise free for solo freelancers?',
        answer: 'Yes, our Free plan allows up to 15 customer reviews forever with full access to collection forms and widgets.',
      },
    ],
  },
  {
    slug: 'local-business',
    industry: 'Local Businesses & Services',
    path: '/best-local-business-testimonial-tools',
    metaTitle: 'Best Testimonial & Review Tool for Local Businesses (2026)',
    metaDescription: 'Sync Google Business reviews and generate QR standees for physical counters to collect 5-star praise in person.',
    heroHeadline: 'Best Testimonial Tool for Local Businesses',
    heroSubtitle: 'Automatically pull Google Maps reviews and generate printable QR standees so in-person clients leave 5-star reviews instantly.',
    recommendedLayout: 'Google Review Badge & Verified Praise Wall',
    keyBenefits: [
      { title: 'Printable Counter QR Standee', desc: 'Download a beautifully styled PDF standee for your reception or checkout counter.' },
      { title: 'Automatic Google Place Sync', desc: 'Connect your Google Place ID and import verified reviews in seconds.' },
    ],
    faqs: [
      {
        question: 'Can I print a QR code for my counter?',
        answer: 'Yes! PandaPraise includes a built-in QR standee generator with custom colors and company logos ready for instant print.',
      },
    ],
  },
];
