import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Star, 
  Eye, 
  Sliders,
  Layers,
  Award,
  Maximize2,
  MessageSquarePlus,
  Bell,
  ArrowLeft,
  Filter,
  Square,
  Moon,
  Sun,
  ShieldCheck,
  Globe,
  Heart,
  Video,
  Play,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Monitor,
  MousePointer,
  Share2,
  Link2,
  X,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Review, WidgetType, WidgetSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

export type CmsPlatform = 'wordpress' | 'webflow' | 'wix' | 'shopify' | 'squarespace' | 'framer' | 'react' | 'nextjs' | 'html' | 'other' | 'iframe';

/**
 * Widget layouts the public /embed.js runtime can actually render on a
 * customer website. The studio preview supports more formats, but an embed
 * snippet must never promise a layout the runtime cannot deliver.
 */
type EmbeddableWidgetType = 'wall' | 'carousel' | 'spotlight' | 'badge';
const EMBEDDABLE_TYPES: EmbeddableWidgetType[] = ['wall', 'carousel', 'spotlight', 'badge'];
const isEmbeddableType = (t: string): t is EmbeddableWidgetType =>
  (EMBEDDABLE_TYPES as string[]).includes(t);
export type WallTheme = 'light_gradient' | 'dark' | 'minimalist';

// Custom Brand Icons
const GoogleIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const LinkedInIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-widget)" />
    <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1zm4.9-8.1a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" fill="#FFF"/>
    <defs>
      <linearGradient id="ig-grad-widget" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFDC80" />
        <stop offset="0.25" stopColor="#F77737" />
        <stop offset="0.5" stopColor="#F56040" />
        <stop offset="0.75" stopColor="#FD1D1D" />
        <stop offset="1" stopColor="#C13584" />
      </linearGradient>
    </defs>
  </svg>
);

const FacebookIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface VerifyWidgetResult {
  verified: boolean;
  code:
    | 'DETECTED_ACTIVE'
    | 'SCRIPT_FOUND_CONTAINER_MISSING'
    | 'CONTAINER_FOUND_SCRIPT_MISSING'
    | 'NOT_FOUND'
    | 'INVALID_URL'
    | 'FORBIDDEN_HOST'
    | 'TIMEOUT'
    | 'UNREACHABLE'
    | 'ERROR';
  url: string;
  hasScript: boolean;
  hasContainer: boolean;
  hasMatchingProject: boolean;
  details: string;
  hint: string;
}

interface WidgetStudioProps {
  reviews: Review[];
  onBack?: () => void;
  onOpenProof?: () => void;
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ reviews, onBack, onOpenProof }) => {
  const { project } = useAuth();
  const projectWidgetId = project?.id;

  const [settings, setSettings] = useState<WidgetSettings>({
    type: 'wall',
    theme: 'light',
    primaryColor: '#6701e6',
    showRating: true,
    showAvatar: true,
    showDate: true,
    showCompany: true,
    maxCount: 9,
    onlyFeatured: false,
    autoAddByRating: 0,
    autoAddByTags: [],
  });

  // Wall of Love Theme & Source Filters
  const [wallTheme, setWallTheme] = useState<WallTheme>('light_gradient');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'google',
    'linkedin',
    'instagram',
    'facebook',
    'direct',
  ]);

  const [cmsPlatform, setCmsPlatform] = useState<CmsPlatform>('wordpress');
  const [showVideoStoryboard, setShowVideoStoryboard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTab, setShareTab] = useState<'embed' | 'link'>('embed');
  const [linkCopied, setLinkCopied] = useState(false);

  // Automated Live Website Verification State (Step 4 & Share Modal)
  const [verifyUrl, setVerifyUrl] = useState('https://papasystem.in');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyWidgetResult | null>(null);

  const handleVerifyWebsite = async (overrideUrl?: string) => {
    const target = (overrideUrl || verifyUrl || 'https://papasystem.in').trim();
    if (!target) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/verify-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: target,
          projectId: projectWidgetId,
        }),
      });
      const data = (await res.json()) as VerifyWidgetResult;
      setVerifyResult(data);
    } catch {
      setVerifyResult({
        verified: false,
        code: 'ERROR',
        url: target,
        hasScript: false,
        hasContainer: false,
        hasMatchingProject: false,
        details: 'Failed to contact verification service.',
        hint: 'Please check your connection and retry.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const publicWallUrl = project?.slug
    ? `https://pandapraise.com/love/${project.slug}`
    : `https://pandapraise.com/w/${projectWidgetId || ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicWallUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  // All approved reviews from project or fallback demo reviews
  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  // Dynamic filtered reviews with source platform support & rating filter
  const filteredReviews = useMemo(() => {
    let list = approvedReviews;
    if (minRating > 0) {
      list = list.filter((r) => r.rating >= minRating);
    }
    if (selectedSources.length > 0) {
      list = list.filter((r: any) => {
        const src = (r.source || 'direct').toLowerCase();
        return selectedSources.some((s) => src.includes(s));
      });
    }
    return list;
  }, [approvedReviews, minRating, selectedSources]);

  const displayReviews = filteredReviews.slice(0, settings.maxCount);

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.length > 1
          ? prev.filter((s) => s !== source)
          : prev
        : [...prev, source]
    );
  };

  const runtimeScriptUrl = 'https://pandapraise.com/embed.js';

  const getEmbedSnippet = () => {
    const projId = projectWidgetId || '';
    const sourcesStr = selectedSources.join(',');
    // The embed runtime renders exactly these layouts. Types that the runtime
    // does not support yet must never reach the snippet (honesty: what the
    // user configures is what renders on their website).
    const embedType: EmbeddableWidgetType = isEmbeddableType(settings.type) ? settings.type : 'wall';
    const containerAttrs = `data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}" data-widget-type="${embedType}" data-max-count="${settings.maxCount}"`;
    const htmlSnippet = `<div id="panda-praise-wall" ${containerAttrs}></div>\n<script src="${runtimeScriptUrl}" async></script>`;

    switch (cmsPlatform) {
      case 'wordpress':
        return `<!-- WordPress: Add a Custom HTML block and paste this code -->\n${htmlSnippet}`;

      case 'webflow':
        return `<!-- Webflow: Add a Code Embed element (shortcut A or Cmd+E) and paste this code -->\n${htmlSnippet}`;

      case 'wix':
        return `<!-- Wix: Add Elements (+) > Embed Code > Embed HTML -->\n${htmlSnippet}`;

      case 'shopify':
        return `<!-- Shopify: Theme Editor > Add section > Custom Liquid -->\n${htmlSnippet}`;

      case 'squarespace':
        return `<!-- Squarespace: Add a Code Block (set mode to HTML) and paste this code -->\n${htmlSnippet}`;

      case 'framer':
        return `<!-- Framer: Insert > Utility > Embed > HTML -->\n${htmlSnippet}`;

      case 'react':
        return `// In your React component:\nimport { useEffect } from 'react';\n\nexport function WallOfLove() {\n  useEffect(() => {\n    const script = document.createElement('script');\n    script.src = '${runtimeScriptUrl}';\n    script.async = true;\n    document.body.appendChild(script);\n    return () => { script.remove(); };\n  }, []);\n\n  return (\n    <div\n      id="panda-praise-wall"\n      data-project-id="${projId}"\n      data-theme="${wallTheme}"\n      data-min-rating="${minRating}"\n      data-sources="${sourcesStr}"\n      data-widget-type="${embedType}"\n      data-max-count="${settings.maxCount}"\n    />\n  );\n}`;

      case 'nextjs':
        return `// In your Next.js component (App Router or Pages):\n'use client';\nimport Script from 'next/script';\n\nexport function WallOfLove() {\n  return (\n    <section>\n      <div\n        id="panda-praise-wall"\n        data-project-id="${projId}"\n        data-theme="${wallTheme}"\n        data-min-rating="${minRating}"\n        data-sources="${sourcesStr}"\n        data-widget-type="${embedType}"\n        data-max-count="${settings.maxCount}"\n      />\n      <Script src="${runtimeScriptUrl}" strategy="lazyOnload" />\n    </section>\n  );\n}`;

      case 'html':
      case 'other':
      default:
        return `<!-- Panda Praise Embed: Works on any static HTML or website builder -->\n${htmlSnippet}`;

      case 'iframe':
        return `<iframe src="https://pandapraise.com/w/${projId}?theme=${wallTheme === 'dark' ? 'dark' : 'light'}" width="100%" height="600" frameborder="0" style="border:none;border-radius:16px;width:100%;min-height:600px;"></iframe>`;
    }
  };

  const PLATFORM_GUIDES: Record<CmsPlatform, {
    id: CmsPlatform;
    label: string;
    badge: string;
    badgeColor: string;
    whatToOpen: string;
    targetPage: string;
    embedElement: string;
    afterPasting: string;
    howToPublish: string;
    howToVerify: string;
    steps: string[];
    note?: string;
  }> = {
    wordpress: {
      id: 'wordpress',
      label: 'WordPress',
      badge: 'Verified Compatible',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Log in to your WordPress admin dashboard (e.g. yourdomain.com/wp-admin).',
      targetPage: 'Go to Pages (or Posts) in the left sidebar and click "Edit" on the specific page where testimonials should appear.',
      embedElement: 'In Gutenberg, click the "+" (Add block) button and search for "Custom HTML". In Elementor, drag in the "HTML" widget.',
      afterPasting: 'You will see the raw embed code inside the block. Click the "Preview" tab on the block to see the live widget container.',
      howToPublish: 'Click the blue "Update" (or "Publish") button in the top-right corner of the editor.',
      howToVerify: 'Open your live page as a visitor in a new incognito window and verify the testimonials wall appears.',
      steps: [
        'Log in to your WordPress admin dashboard (yourdomain.com/wp-admin).',
        'Open Pages and edit the page where you want testimonials.',
        'Click the + button and search for "Custom HTML".',
        'Add the Custom HTML block into your page layout.',
        'Paste the Panda Praise code into that block.',
        'Click Preview above the block to verify rendering.',
        'Click Update or Publish in the top right.',
        'Open the live page in a browser and confirm testimonials appear.',
      ],
    },
    webflow: {
      id: 'webflow',
      label: 'Webflow',
      badge: 'Verified Compatible',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Open Webflow Dashboard and launch your site in Webflow Designer.',
      targetPage: 'Navigate to the page and section where you want customer testimonials.',
      embedElement: 'Open the Add panel (shortcut A or Cmd+E) → scroll to Advanced / Components → drag "Code Embed" onto your canvas.',
      afterPasting: 'Paste the snippet inside the HTML Embed Code Editor modal. (Webflow displays an "HTML Embed" placeholder in Designer because custom scripts run on published pages).',
      howToPublish: 'Click "Save & Close" on the embed modal, then click "Publish" (top right) → "Publish to Selected Domains".',
      howToVerify: 'Open your published Webflow domain in a browser and confirm the widget renders.',
      steps: [
        'Open your site in Webflow Designer.',
        'Open the page where testimonials should appear.',
        'Open the Add panel (shortcut A or Cmd+E).',
        'Add a Code Embed element to your section.',
        'Paste the Panda Praise code into the modal.',
        'Save and close the code editor.',
        'Publish the site to your custom domain.',
        'Open the live page and confirm the widget appears.',
      ],
    },
    wix: {
      id: 'wix',
      label: 'Wix',
      badge: 'Verified (Iframe Sandbox)',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      whatToOpen: 'Log in to Wix and click "Edit Site" to launch the Wix Editor or Wix Studio.',
      targetPage: 'Navigate to the target page and section where you want testimonials.',
      embedElement: 'Click "Add Elements (+)" on the left toolbar → select "Embed Code" → click "Embed HTML".',
      afterPasting: 'In the HTML Settings panel, keep "Code" selected, paste your snippet, and click "Update". Drag the box corners to 100% width and min. 600px height.',
      howToPublish: 'Click the blue "Publish" button in the top right header.',
      howToVerify: 'Click "View Site" in a new browser window and confirm the testimonials wall renders.',
      note: 'Wix executes custom code in an isolated sandbox iframe. Ensure you stretch the HTML box frame to full width (100%) and at least 600px height so the testimonials have room to display without internal scrollbars.',
      steps: [
        'Open your site in the Wix Editor.',
        'Navigate to the target page and section.',
        'Click Add Elements (+) on the left toolbar.',
        'Select Embed Code → click Embed HTML.',
        'Select "Code", paste the Panda Praise code, and click Update.',
        'Resize the HTML box to full width and min. 600px height.',
        'Click Publish in the top right header.',
        'Open the live site URL and confirm the widget appears.',
      ],
    },
    shopify: {
      id: 'shopify',
      label: 'Shopify',
      badge: 'Verified Compatible',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Log in to Shopify Admin (admin.shopify.com) and go to Online Store → Themes.',
      targetPage: 'Click "Customize" on your active theme, then select your target page from the top dropdown.',
      embedElement: 'In the left template sidebar, click "Add section" and choose "Custom Liquid" (or "Custom HTML").',
      afterPasting: 'Paste the snippet into the Custom Liquid code field in the sidebar. The center canvas will preview the layout.',
      howToPublish: 'Click the green "Save" button in the top right corner.',
      howToVerify: 'Click the three dots (...) → "View" to open your live storefront and confirm testimonials appear.',
      steps: [
        'Log in to Shopify Admin → Online Store → Themes.',
        'Click Customize on your active theme.',
        'Select the target page from the top dropdown.',
        'Click Add section in the sidebar and choose Custom Liquid.',
        'Paste the Panda Praise code into the code field.',
        'Adjust section padding if needed.',
        'Click Save in the top right.',
        'View your live storefront and verify the testimonials appear.',
      ],
    },
    squarespace: {
      id: 'squarespace',
      label: 'Squarespace',
      badge: 'Verified (Business+ / iFrame for Personal)',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      whatToOpen: 'Log in to Squarespace and open your website editor.',
      targetPage: 'Navigate to the target page and click "EDIT" in the top-left corner.',
      embedElement: 'Hover over the section and click "Add Block" → choose "Code Block" (icon looks like </>).',
      afterPasting: 'Set Format to "HTML" and turn OFF "Display Source". (Squarespace displays "Script Disabled" in edit mode for security).',
      howToPublish: 'Click "SAVE" in the top-left corner and exit editor mode.',
      howToVerify: 'Open your live site in a new browser window as a visitor and verify testimonials appear.',
      note: 'Squarespace Personal Plan restricts custom JavaScript execution. If you are on a Personal plan, switch to our iFrame fallback snippet, which works on all Squarespace tiers.',
      steps: [
        'Log in to Squarespace and open your site editor.',
        'Click EDIT in the top left on the target page.',
        'Click Add Block and select Code Block (</>).',
        'Set Format to HTML and ensure Display Source is off.',
        'Paste the Panda Praise embed code into the block.',
        'Click SAVE in the top left and exit edit mode.',
        'Open the live page to verify the testimonials appear.',
        '(Personal Plan: Use iFrame snippet if JS is blocked).',
      ],
    },
    framer: {
      id: 'framer',
      label: 'Framer',
      badge: 'Verified Compatible',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Open your project in Framer web app or desktop app.',
      targetPage: 'Navigate to the canvas frame and section where you want customer reviews.',
      embedElement: 'Press I (Insert menu) → navigate to "Utility" → drag the "Embed" component onto your canvas.',
      afterPasting: 'In the right properties panel, change Type from "URL" to "HTML", and paste the snippet into the code input.',
      howToPublish: 'Set the Embed layer width to "Fill" (100%) and height to fit content. Then click "Publish" in the top right.',
      howToVerify: 'Visit your published Framer site URL and confirm the testimonials wall displays.',
      steps: [
        'Open your site in Framer.',
        'Open the page and frame where testimonials belong.',
        'Press I (or click Insert) and go to Utility.',
        'Drag the Embed component onto your canvas.',
        'In the right inspector, switch Type to HTML.',
        'Paste the Panda Praise embed code.',
        'Set width to Fill (100%) and height to Fit content.',
        'Click Publish and verify on your live site.',
      ],
    },
    react: {
      id: 'react',
      label: 'React',
      badge: 'Verified Compatible',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Open your React project repository in your IDE (VS Code, WebStorm, etc.).',
      targetPage: 'Navigate to the components or sections folder where your testimonials section lives.',
      embedElement: 'Create a WallOfLove.tsx (or .jsx) component that loads the script dynamically via useEffect.',
      afterPasting: 'Paste the component code below. It renders the #panda-praise-wall container and cleans up on unmount.',
      howToPublish: 'Import <WallOfLove /> into your page, run npm run build, and deploy your frontend.',
      howToVerify: 'Run npm run dev or view your production deployment URL in a browser.',
      steps: [
        'Open your React project in your IDE.',
        'Create a component file: WallOfLove.tsx.',
        'Paste the React snippet provided below.',
        'Import WallOfLove into your target page.',
        'Run npm run dev to verify locally.',
        'Deploy your app to production.',
        'Open live URL and confirm testimonials appear.',
      ],
    },
    nextjs: {
      id: 'nextjs',
      label: 'Next.js',
      badge: 'Verified Compatible',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Open your Next.js project repository in your IDE.',
      targetPage: 'Open your App Router (app/page.tsx) or Pages Router route.',
      embedElement: 'Create a client component with next/script and strategy="lazyOnload".',
      afterPasting: 'Paste the component snippet below. The "use client" directive and lazyOnload strategy ensure zero hydration mismatch.',
      howToPublish: 'Import the component into your page, build (npm run build), and deploy to Vercel/host.',
      howToVerify: 'Open the deployed Next.js site in your browser to verify testimonials render.',
      steps: [
        'Open your Next.js project in your code editor.',
        'Create a client component, e.g. components/WallOfLove.tsx.',
        'Add "use client" at the top of the file.',
        'Paste the Next.js snippet using next/script.',
        'Import WallOfLove into your page route.',
        'Build and deploy to Vercel or your hosting provider.',
        'Open live website and confirm testimonials load.',
      ],
    },
    html: {
      id: 'html',
      label: 'Custom HTML',
      badge: 'Verified in Production (Tested Live on papasystem.in)',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      whatToOpen: 'Open your website source files in your code editor (e.g. VS Code) or web hosting File Manager / cPanel.',
      targetPage: 'Open the specific HTML file (e.g. index.html) where reviews should be displayed.',
      embedElement: 'Locate the target section in your HTML markup (e.g. <section id="testimonials"> or right before <footer>).',
      afterPasting: 'Paste the <div id="panda-praise-wall"> container and <script src="https://pandapraise.com/embed.js" async></script> snippet.',
      howToPublish: 'Save the HTML file and upload/deploy it to your web server (via Git, FTP, cPanel, or host).',
      howToVerify: 'Open https://papasystem.in/ (or your domain) in your browser as a visitor and verify testimonials appear.',
      steps: [
        'Open your project in your code editor or hosting file manager.',
        'Open the specific HTML file (e.g. index.html).',
        'Locate the section where testimonials belong (e.g. above footer).',
        'Paste the div container and script tag into your markup.',
        'Save the file.',
        'Upload or push changes to your web server.',
        'Open https://papasystem.in/ in a fresh browser tab.',
        'Confirm the Wall of Love renders cleanly with zero console errors.',
      ],
    },
    other: {
      id: 'other',
      label: 'Other',
      badge: 'Universal Compatibility',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      whatToOpen: 'Log in to your website builder or CMS admin interface.',
      targetPage: 'Open the specific page where you want testimonials to appear.',
      embedElement: 'Search for an element named: Custom HTML, Embed Code, Code Block, or Raw HTML.',
      afterPasting: 'Paste the universal Panda Praise embed code into that element. Adjust width to 100%.',
      howToPublish: 'Click Save or Publish in your builder.',
      howToVerify: 'Open the live URL in an incognito window as a visitor and confirm testimonials display.',
      note: 'If your website builder prohibits custom <script> tags for security, switch to our universal iFrame Fallback snippet below.',
      steps: [
        'Log in to your website builder or CMS admin.',
        'Open the specific page where testimonials should appear.',
        'Add a Custom HTML, Embed, or Code element.',
        'Paste the Panda Praise snippet into the element.',
        'Set element width to 100%.',
        'Save and publish your website.',
        'Open the live page in a browser and verify testimonials.',
        '(If script is blocked, use iFrame fallback snippet).',
      ],
    },
    iframe: {
      id: 'iframe',
      label: 'iFrame Fallback',
      badge: 'Universal Sandbox',
      badgeColor: 'text-gray-700 bg-gray-100 border-gray-300',
      whatToOpen: 'Use this if your CMS or security policy restricts third-party JavaScript.',
      targetPage: 'Open the page where testimonials belong.',
      embedElement: 'Add an Embed (URL or iframe) or HTML element.',
      afterPasting: 'Paste the <iframe> tag. It runs in an isolated frame hosted directly by Panda Praise.',
      howToPublish: 'Save and publish your page.',
      howToVerify: 'Open the live page to confirm the iframe loads testimonials.',
      note: 'The hosted iFrame renders the Wall of Love layout. For Carousel, Single Card, or Trust Badge layouts, use the script embed for your platform instead.',
      steps: [
        'Copy the iframe embed code below.',
        'Open your website builder and target page.',
        'Add an Embed or HTML block.',
        'Paste the <iframe> snippet.',
        'Set iframe width to 100% and height to min. 600px.',
        'Save and publish your page.',
        'Confirm testimonials render in your browser.',
      ],
    },
  };

  const handlePublishSetup = () => {
    const projectId = project?.id;
    if (!projectId) return;
    localStorage.setItem(`panda-praise:publish-complete:${projectId}`, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('panda-praise:publish-complete'));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedSnippet());
      setCopied(true);
      handlePublishSetup();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const guide = PLATFORM_GUIDES[cmsPlatform] || PLATFORM_GUIDES.wordpress;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1 transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold uppercase tracking-wider border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              Wall of Love & Widget Studio
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-950 tracking-tight">
            Embeddable Testimonial Widgets
          </h2>
          <p className="text-sm text-gray-500">
            Publish once. When you approve new testimonials in Panda Praise, your live website Wall of Love updates automatically.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto">
          {/* Widget Format Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
            {[
              { id: 'wall', label: 'Wall of Love', icon: Layers },
              { id: 'carousel', label: 'Carousel', icon: Maximize2 },
              { id: 'spotlight', label: 'Single Card', icon: Sparkles },
              { id: 'badge', label: 'Trust Badge', icon: Award },
              { id: 'floating_tab', label: 'Floating Tab', icon: MessageSquarePlus, soon: true },
              { id: 'social_toast', label: 'Social Toast', icon: Bell, soon: true },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = settings.type === item.id;
              if (item.soon) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled
                    title="Coming soon — not yet available for website embed"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-gray-100/60 cursor-not-allowed opacity-70"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">
                      Soon
                    </span>
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, type: item.id as WidgetType }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#6701e6] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Senja-Style Share & Embed CTA */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Share & Embed</span>
          </button>
        </div>
      </div>

      {/* Universal 4-Step Installation Journey */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 p-5 rounded-2xl border border-purple-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6701e6] text-white text-xs font-black">
              ✓
            </span>
            How to Add Panda Praise to Your Website (4 Universal Steps)
          </h2>
          <span className="text-[11px] font-semibold text-purple-700 bg-white/80 px-2.5 py-1 rounded-full border border-purple-200">
            Tailored platform instructions provided below
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">1</span>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">COPY</p>
            </div>
            <p className="text-xs font-bold text-[#6701e6]">Copy your embed code</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Select your website builder below and click <strong>Copy Embed Code</strong>. Your snippet already includes your project ID and display rules.
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">2</span>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">OPEN & ADD ELEMENT</p>
            </div>
            <p className="text-xs font-bold text-[#6701e6]">Open builder & add code element</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Open the website builder used to build your site, open the specific page where reviews should appear, and add your builder's <strong>Custom HTML / Embed element</strong>.
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">3</span>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">PASTE & PUBLISH</p>
            </div>
            <p className="text-xs font-bold text-[#6701e6]">Paste snippet & publish</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Paste the code into that element and hit <strong>Publish</strong> or <strong>Update</strong> to deploy your live changes.
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">4</span>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">LIVE VERIFICATION</p>
            </div>
            <p className="text-xs font-bold text-emerald-700">Check your live website</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Click <strong>Share & Embed</strong> below and test your live URL (e.g. <code>papasystem.in</code>) with our automated verification bot.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Customizer (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Dynamic Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 1. Theme Customization */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6701e6]" />
              1. Theme & Appearance
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light_gradient', label: 'Light Gradient', icon: Sun, desc: 'Pastel purple glow' },
                { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Sleek onyx & neon' },
                { id: 'minimalist', label: 'Minimalist', icon: Square, desc: 'Clean wireframe' },
              ].map((th) => {
                const isSelected = wallTheme === th.id;
                const Icon = th.icon;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      setWallTheme(th.id as WallTheme);
                      setSettings((prev) => ({ ...prev, theme: th.id === 'dark' ? 'dark' : 'light' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#6701e6] bg-purple-50/70 ring-2 ring-[#6701e6]/20'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#6701e6]' : 'text-gray-500'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#6701e6]" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#6701e6]' : 'text-gray-900'}`}>
                        {th.label}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-tight">{th.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Rating & Platform Source Filters */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6701e6]" />
              2. Filter Rating & Sources
            </h3>

            {/* Minimum Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Minimum Star Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 0, label: 'All Reviews', desc: '1–5 Stars' },
                  { value: 4, label: '4+ Stars', desc: 'High satisfaction' },
                  { value: 5, label: '5 Stars Only', desc: 'Top praise only' },
                ].map((r) => {
                  const isSelected = minRating === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setMinRating(r.value)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#6701e6] text-white border-[#6701e6] shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div>{r.label}</div>
                      <div className={`text-[10px] font-normal ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                        {r.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Sources (Google, LinkedIn, Instagram, Facebook, Direct) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700 block">
                Included Review Sources
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'google', label: 'Google', icon: <GoogleIcon /> },
                  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
                  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
                  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
                  { id: 'direct', label: 'Direct Form', icon: <Globe className="w-3.5 h-3.5 text-gray-500" /> },
                ].map((src) => {
                  const isChecked = selectedSources.includes(src.id);
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => toggleSource(src.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-50/70 border-[#6701e6]/40 text-gray-900 font-bold'
                          : 'bg-gray-50/70 border-gray-200 text-gray-400 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {src.icon}
                        <span>{src.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6] pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Items */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Display Limit</span>
                <span className="text-[#6701e6] font-bold">{settings.maxCount} testimonials</span>
              </div>
              <input
                type="range"
                min="3"
                max="18"
                step="3"
                value={settings.maxCount}
                onChange={(e) => setSettings((prev) => ({ ...prev, maxCount: Number(e.target.value) }))}
                className="w-full accent-[#6701e6] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Embed Code & Platform-Specific Guide */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#6701e6]" />
                  3. Install on Your Website
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Zero Layout Shift
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-900">
                What website builder are you using?
              </p>
            </div>

            {/* Platform Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-gray-100 rounded-xl text-xs font-semibold">
              {[
                { id: 'wordpress', label: 'WordPress' },
                { id: 'webflow', label: 'Webflow' },
                { id: 'wix', label: 'Wix' },
                { id: 'shopify', label: 'Shopify' },
                { id: 'squarespace', label: 'Squarespace' },
                { id: 'framer', label: 'Framer' },
                { id: 'react', label: 'React' },
                { id: 'nextjs', label: 'Next.js' },
                { id: 'html', label: 'Custom HTML' },
                { id: 'other', label: 'Other' },
              ].map((p) => {
                const isSelected = cmsPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setCmsPlatform(p.id as CmsPlatform)}
                    className={`px-2 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6701e6] text-white font-bold shadow-xs'
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* iFrame Fallback link */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
              <span>Need an isolated container or CMS blocks custom JS?</span>
              <button
                onClick={() => setCmsPlatform('iframe')}
                className={`font-semibold cursor-pointer underline hover:text-[#6701e6] ${
                  cmsPlatform === 'iframe' ? 'text-[#6701e6] font-bold' : ''
                }`}
              >
                Use Universal iFrame
              </button>
            </div>

            {/* Platform Specific Instruction Card */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/90 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#6701e6]" />
                  <span className="text-xs font-bold text-gray-900">
                    {guide.label} Installation Guide
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${guide.badgeColor}`}>
                  {guide.badge}
                </span>
              </div>

              {/* Customer Journey Quick Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                  <span className="font-bold text-gray-500 uppercase text-[9px] block">What to open:</span>
                  <p className="text-gray-800">{guide.whatToOpen}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                  <span className="font-bold text-gray-500 uppercase text-[9px] block">Target Page:</span>
                  <p className="text-gray-800">{guide.targetPage}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                  <span className="font-bold text-gray-500 uppercase text-[9px] block">Element to Add:</span>
                  <p className="text-[#6701e6] font-bold">{guide.embedElement}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                  <span className="font-bold text-gray-500 uppercase text-[9px] block">After Pasting:</span>
                  <p className="text-gray-800">{guide.afterPasting}</p>
                </div>
              </div>

              {/* Numbered Step-by-Step Flow */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-gray-700 block uppercase tracking-wider">
                  Step-by-Step Clicks:
                </span>
                <ol className="space-y-1 text-xs text-gray-700">
                  {guide.steps.map((st, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-purple-200 text-[#6701e6] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{st}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Special Platform Note */}
              {guide.note && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{guide.note}</p>
                </div>
              )}
            </div>

            {/* Code Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Generated Code Snippet</span>
                <span className="text-[10px] font-mono text-gray-400">Auto-configured</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950 font-mono text-[11px] text-emerald-400 border border-gray-800 overflow-x-auto select-all max-h-36 scrollbar-thin">
                <pre className="whitespace-pre-wrap">{getEmbedSnippet()}</pre>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              className="w-full py-3 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '✓ Snippet Copied to Clipboard!' : 'Copy Embed Code'}</span>
            </button>

            {/* Video Walkthrough Storyboard Toggle Button */}
            <button
              onClick={() => setShowVideoStoryboard((prev) => !prev)}
              className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-[#6701e6] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>
                {showVideoStoryboard ? 'Hide Video Walkthrough Storyboard' : '🎬 View 60-Second Video Walkthrough (Actual Screen & Cursor)'}
              </span>
              {showVideoStoryboard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Expandable Video Walkthrough Storyboard */}
            {showVideoStoryboard && (
              <div className="p-4 rounded-xl bg-gray-900 text-white border border-gray-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold">Instructional Video Storyboard (60s Walkthrough)</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-900/60 px-2 py-0.5 rounded-full">
                    Target: 30–90s
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    {
                      time: '0:00 - 0:10',
                      action: 'Panda Praise Studio',
                      cursor: 'Cursor clicks "Copy Embed Code"',
                      desc: 'User customizes theme (e.g. Light Gradient), clicks purple button. Green toast confirms "Snippet Copied to Clipboard!".',
                    },
                    {
                      time: '0:10 - 0:25',
                      action: 'Open Website Builder',
                      cursor: 'Cursor switches to builder tab & opens target page',
                      desc: 'Opens builder (e.g. WordPress Admin, Webflow Designer, or HTML editor). Clicks edit on the exact page where reviews belong.',
                    },
                    {
                      time: '0:25 - 0:40',
                      action: 'Add Embed / Code Element',
                      cursor: 'Cursor clicks Add (+), searches for code element',
                      desc: 'Searches for "Custom HTML" (WordPress), "Code Embed" (Webflow), or "Custom Liquid" (Shopify) and drags into the section.',
                    },
                    {
                      time: '0:40 - 0:50',
                      action: 'Paste Code & Close Editor',
                      cursor: 'Cursor clicks inside block & pastes code',
                      desc: 'Pastes embed code snippet (Cmd/Ctrl + V). Verifies snippet is inserted. Clicks "Preview" or "Save & Close".',
                    },
                    {
                      time: '0:50 - 0:65',
                      action: 'Save & Publish',
                      cursor: 'Cursor clicks "Publish" / "Update"',
                      desc: 'Clicks the top-right Publish button. Builder compiles and updates the live production site.',
                    },
                    {
                      time: '0:65 - 0:80',
                      action: 'Verify as Live Visitor',
                      cursor: 'Cursor opens fresh incognito browser tab',
                      desc: 'Navigates to live website URL (e.g. https://papasystem.in/), scrolls down to testimonials section: Panda Praise Wall of Love renders cards smoothly with 0 layout shift!',
                    },
                  ].map((sc, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-gray-800/80 border border-gray-700/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-300 font-bold text-[11px]">{sc.time}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{sc.action}</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                        <MousePointer className="w-3 h-3 text-emerald-400" />
                        {sc.cursor}
                      </p>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{sc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Widget Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[620px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6701e6]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Live Interactive Wall of Love Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Showing {displayReviews.length} matching reviews</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div
            className={`flex-1 rounded-2xl p-6 transition-all duration-300 overflow-y-auto max-h-[750px] scrollbar-thin ${
              wallTheme === 'dark'
                ? 'bg-[#0f172a] border border-gray-800 text-white'
                : wallTheme === 'minimalist'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-xs'
                  : 'bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 border border-purple-100 text-gray-900'
            }`}
          >
            {displayReviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6701e6] flex items-center justify-center mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">No Matching Testimonials</h4>
                <p className="text-xs text-gray-500 max-w-sm mb-4">
                  Approve at least one testimonial to preview and publish your proof here.
                </p>
                <button
                  onClick={() => {
                    if (onOpenProof) onOpenProof();
                    else {
                      setMinRating(0);
                      setSelectedSources(['google', 'linkedin', 'instagram', 'facebook', 'direct']);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Go to Proof
                </button>
              </div>
            ) : settings.type === 'wall' ? (
              /* Masonry Wall of Love */
              <div className="space-y-6">
                <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
                  {displayReviews.map((r: any) => {
                    const source = (r.source || 'direct').toLowerCase();
                    return (
                      <div
                        key={r.id}
                        className={`break-inside-avoid mb-4 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                          wallTheme === 'dark'
                            ? 'bg-[#1e293b] border border-white/10 text-gray-100 shadow-md hover:border-purple-500/50'
                            : wallTheme === 'minimalist'
                              ? 'bg-white border border-gray-200 text-gray-900 hover:border-gray-950'
                              : 'bg-white border border-purple-100/80 text-gray-900 shadow-xs hover:shadow-md hover:border-[#6701e6]/40'
                        }`}
                      >
                        {/* Top row: Stars + Source */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Source badge */}
                          {source === 'google' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <GoogleIcon /> Google
                            </span>
                          )}
                          {source === 'linkedin' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0A66C2] border border-sky-200">
                              <LinkedInIcon /> LinkedIn
                            </span>
                          )}
                          {source === 'instagram' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#E4405F] border border-pink-200">
                              <InstagramIcon /> Instagram
                            </span>
                          )}
                          {source === 'facebook' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1877F2] border border-blue-200">
                              <FacebookIcon /> Facebook
                            </span>
                          )}
                        </div>

                        {/* Review text */}
                        <p className={`text-xs leading-relaxed mb-4 ${
                          wallTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          "{r.content || r.text}"
                        </p>

                        {/* Author info */}
                        <div className={`flex items-center gap-3 pt-3 border-t ${
                          wallTheme === 'dark' ? 'border-white/10' : 'border-gray-100'
                        }`}>
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 shrink-0 border border-gray-200">
                            {r.avatarUrl ? (
                              <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-[#6701e6] flex items-center justify-center h-full">
                                {r.name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className={`text-xs font-bold leading-tight truncate ${
                                wallTheme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {r.name}
                              </p>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[10.5px] text-gray-400 truncate leading-tight">
                              {r.role || r.authorTitle || ''} {r.company ? `• ${r.company}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Attribution Badge */}
                <div className="text-center pt-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                    wallTheme === 'dark'
                      ? 'bg-white/5 text-gray-400 border-white/10'
                      : 'bg-white text-gray-600 border-gray-200 shadow-2xs'
                  }`}>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    Verified with Panda Praise
                  </span>
                </div>
              </div>
            ) : (
              /* Other widget formats fallback preview */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayReviews.map((r: any) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border ${
                      wallTheme === 'dark'
                        ? 'bg-gray-900 border-gray-800 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed italic mb-3">"{r.content || r.text}"</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-100 shrink-0">
                        {r.avatarUrl ? (
                          <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-[#6701e6] flex items-center justify-center h-full">
                            {r.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{r.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {r.role} {r.company ? `• ${r.company}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Senja-Style Share & Embed Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6701e6] flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Share & Embed {settings.type === 'wall'
                      ? 'Wall of Love'
                      : settings.type === 'carousel'
                        ? 'Carousel'
                        : settings.type === 'spotlight'
                          ? 'Single Card Spotlight'
                          : settings.type === 'badge'
                            ? 'Trust Badge'
                            : 'Widget'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add to your website or share as a standalone hosted link.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs: Embed on Website vs Share Public Link */}
            <div className="flex border-b border-gray-100 px-5 pt-3 bg-white gap-4">
              <button
                onClick={() => setShareTab('embed')}
                className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                  shareTab === 'embed'
                    ? 'border-[#6701e6] text-[#6701e6]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Embed on Website</span>
              </button>
              <button
                onClick={() => setShareTab('link')}
                className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                  shareTab === 'link'
                    ? 'border-[#6701e6] text-[#6701e6]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Share Public Link</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin">
              {shareTab === 'link' ? (
                /* Tab 2: Standalone Public Hosted Link */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                    <span className="text-xs font-bold text-[#6701e6] uppercase tracking-wider block">
                      Standalone Hosted Wall of Love
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Don't have a website or want to share directly with clients? Use this permanent public link to showcase all your approved testimonials.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Public URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={publicWallUrl}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono text-gray-700 select-all"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {linkCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                      <a
                        href={publicWallUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 1: Embed on Website (Senja Journey) */
                <div className="space-y-5">
                  {/* Top One-Click Embed Bar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">
                        Ready to add to your website?
                      </p>
                      <p className="text-[11px] text-gray-600">
                        1-click copy your pre-configured snippet for {guide.label}.
                      </p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? '✓ Copied to Clipboard!' : 'Copy Embed Code'}</span>
                    </button>
                  </div>

                  {/* Builder Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        What website builder are you using?
                      </label>
                      <span className="text-[10px] text-gray-500 font-medium">Select to view exact clicks</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-gray-100 rounded-xl text-xs font-semibold">
                      {[
                        { id: 'wordpress', label: 'WordPress' },
                        { id: 'webflow', label: 'Webflow' },
                        { id: 'wix', label: 'Wix' },
                        { id: 'shopify', label: 'Shopify' },
                        { id: 'squarespace', label: 'Squarespace' },
                        { id: 'framer', label: 'Framer' },
                        { id: 'react', label: 'React' },
                        { id: 'nextjs', label: 'Next.js' },
                        { id: 'html', label: 'Custom HTML' },
                        { id: 'other', label: 'Other' },
                      ].map((p) => {
                        const isSelected = cmsPlatform === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setCmsPlatform(p.id as CmsPlatform)}
                            className={`px-2 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#6701e6] text-white font-bold shadow-xs'
                                : 'bg-white/70 text-gray-700 hover:bg-white hover:text-gray-900'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Platform Detailed Guide */}
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/90 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-[#6701e6]" />
                        <span className="text-xs font-bold text-gray-900">
                          {guide.label} Step-by-Step Clicks
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${guide.badgeColor}`}>
                        {guide.badge}
                      </span>
                    </div>

                    {/* Customer Journey Quick Reference Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                        <span className="font-bold text-gray-500 uppercase text-[9px] block">1. What to open:</span>
                        <p className="text-gray-800">{guide.whatToOpen}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                        <span className="font-bold text-gray-500 uppercase text-[9px] block">2. Target Page:</span>
                        <p className="text-gray-800">{guide.targetPage}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                        <span className="font-bold text-gray-500 uppercase text-[9px] block">3. Element to Add:</span>
                        <p className="text-[#6701e6] font-bold">{guide.embedElement}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 space-y-0.5">
                        <span className="font-bold text-gray-500 uppercase text-[9px] block">4. After Pasting:</span>
                        <p className="text-gray-800">{guide.afterPasting}</p>
                      </div>
                    </div>

                    {/* Step-by-Step List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-gray-700 block uppercase tracking-wider">
                        Detailed Walkthrough:
                      </span>
                      <ol className="space-y-1 text-xs text-gray-700">
                        {guide.steps.map((st, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-purple-200 text-[#6701e6] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{st}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Caution note if applicable */}
                    {guide.note && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{guide.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Code Snippet Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Embed Code Snippet</span>
                      <button
                        onClick={() => setCmsPlatform('iframe')}
                        className="text-[11px] text-purple-700 underline font-semibold hover:text-[#6701e6] cursor-pointer"
                      >
                        Switch to Universal iFrame
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-950 font-mono text-[11px] text-emerald-400 border border-gray-800 overflow-x-auto select-all max-h-36 scrollbar-thin">
                      <pre className="whitespace-pre-wrap">{getEmbedSnippet()}</pre>
                    </div>
                  </div>

                  {/* Step 4: Automated Live Website Verifier */}
                  <div className="p-4 rounded-2xl bg-white border border-purple-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                          4
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          Automated Live Website Verifier
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500">
                        Zero-guesswork installation check
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Enter your live page URL where you pasted the code (e.g. <span className="font-semibold text-gray-800">https://papasystem.in</span>). Our bot checks whether your script and container are successfully published.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={verifyUrl}
                          onChange={(e) => setVerifyUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isVerifying) {
                              e.preventDefault();
                              handleVerifyWebsite();
                            }
                          }}
                          placeholder="https://papasystem.in"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6701e6]/30 focus:border-[#6701e6] bg-gray-50/50 text-gray-900 font-medium"
                        />
                      </div>
                      <button
                        onClick={() => handleVerifyWebsite()}
                        disabled={isVerifying}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Verify My Website</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Pre-fill / Testing Button */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-gray-500 font-medium">Quick Test:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyUrl('https://papasystem.in');
                          handleVerifyWebsite('https://papasystem.in');
                        }}
                        className="text-[10px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-colors cursor-pointer"
                      >
                        ⚡ Test papasystem.in
                      </button>
                    </div>

                    {/* Verification Result Feedback */}
                    {verifyResult && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs animate-fade-in ${
                          verifyResult.verified && verifyResult.code === 'DETECTED_ACTIVE'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                            : verifyResult.verified
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 ring-2 ring-emerald-400/20 shadow-xs'
                            : verifyResult.code === 'CONTAINER_FOUND_SCRIPT_MISSING'
                            ? 'bg-amber-50 border-amber-300 text-amber-950'
                            : 'bg-rose-50 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {verifyResult.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : verifyResult.code === 'CONTAINER_FOUND_SCRIPT_MISSING' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 flex-1">
                            <p className="font-bold text-[12px]">{verifyResult.details}</p>
                            <p className="text-[11px] opacity-90 leading-relaxed">{verifyResult.hint}</p>
                            {verifyResult.verified && (
                              <div className="pt-1.5 flex items-center gap-3 text-[10px] font-semibold text-emerald-800">
                                <span>✓ Script Tag: {verifyResult.hasScript ? 'Active' : 'Not Found'}</span>
                                <span>✓ Container: {verifyResult.hasContainer ? 'Found' : 'Auto-Mounting'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Walkthrough Accordion */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowVideoStoryboard((prev) => !prev)}
                      className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 text-[#6701e6]">
                        <Video className="w-4 h-4" />
                        <span>🎬 View 60-Second Video Walkthrough (Actual Screen & Cursor)</span>
                      </div>
                      {showVideoStoryboard ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {showVideoStoryboard && (
                      <div className="p-4 bg-gray-900 text-white space-y-2 text-xs">
                        {[
                          { time: '0:00 - 0:10', action: 'Panda Praise Studio', cursor: 'Cursor clicks "Copy Embed Code"', desc: 'Customizes theme and clicks Copy button.' },
                          { time: '0:10 - 0:25', action: 'Open Website Builder', cursor: 'Cursor switches to builder tab & opens page', desc: 'Opens builder and navigates to target page.' },
                          { time: '0:25 - 0:40', action: 'Add Embed / Code Element', cursor: 'Cursor clicks Add (+), searches for code element', desc: 'Adds Custom HTML / Code Embed element into section.' },
                          { time: '0:40 - 0:50', action: 'Paste Code', cursor: 'Cursor clicks inside block & pastes snippet', desc: 'Pastes code snippet (Cmd+V).' },
                          { time: '0:50 - 0:65', action: 'Save & Publish', cursor: 'Cursor clicks "Publish" / "Update"', desc: 'Pushes changes live.' },
                          { time: '0:65 - 0:80', action: 'Live Verification', cursor: 'Cursor opens new incognito tab', desc: 'Verifies testimonials render live with zero layout shift.' },
                        ].map((sc, i) => (
                          <div key={i} className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/60 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-purple-300 font-bold text-[11px]">{sc.time}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{sc.action}</span>
                            </div>
                            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                              <MousePointer className="w-3 h-3 text-emerald-400" />
                              {sc.cursor}
                            </p>
                            <p className="text-[11px] text-gray-300 leading-relaxed">{sc.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Approved reviews update dynamically with zero code changes.</span>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
