import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Star, 
  Eye, 
  Sliders,
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
  Tablet,
  Smartphone,
  MousePointer,
  Share2,
  X
} from 'lucide-react';
import { Review, WidgetSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getSampleReviews } from '../../lib/mockData';
import { EmbedCodeModal } from './EmbedCodeModal';

export type CmsPlatform = 'wordpress' | 'webflow' | 'wix' | 'shopify' | 'squarespace' | 'framer' | 'react' | 'nextjs' | 'html' | 'vibe' | 'other' | 'iframe';

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

interface WidgetStudioProps {
  reviews: Review[];
  onBack?: () => void;
  onOpenProof?: () => void;
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ reviews, onOpenProof }) => {
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

  const publicWallUrl = project?.slug
    ? `https://pandapraise.com/love/${project.slug}`
    : `https://pandapraise.com/w/${projectWidgetId || ''}`;

  // Builder tab & responsive device preview state
  const [activeBuilderTab, setActiveBuilderTab] = useState<'all' | 'style' | 'filters' | 'platform'>('all');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isGuideDismissed, setIsGuideDismissed] = useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  // All approved reviews from project
  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  // Out-of-the-box fallback injection: automatically inject sample reviews if no approved reviews exist
  const isUsingSampleReviews = approvedReviews.length === 0;

  const baseReviews = useMemo(() => {
    if (approvedReviews.length > 0) return approvedReviews;
    return getSampleReviews(project?.id || 'demo_project');
  }, [approvedReviews, project?.id]);

  // Dynamic filtered reviews with source platform support & rating filter
  const filteredReviews = useMemo(() => {
    let list = baseReviews;
    if (minRating > 0) {
      list = list.filter((r) => r.rating >= minRating);
    }
    if (selectedSources.length > 0) {
      list = list.filter((r: any) => {
        const src = (r.source || 'direct').toLowerCase();
        return (
          selectedSources.some((s) => src.includes(s)) ||
          (isUsingSampleReviews && (src === 'sample' || r.isSample))
        );
      });
    }
    return list;
  }, [baseReviews, minRating, selectedSources, isUsingSampleReviews]);

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

      case 'vibe':
        return `<!-- AI & Vibe Coded (Cloudflare Pages, Netlify, Cursor, Lovable, Bolt, v0) -->\n<!-- Prompt for AI: "Embed this Panda Praise testimonial widget in my landing page reviews section" -->\n${htmlSnippet}`;

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
    vibe: {
      id: 'vibe',
      label: 'AI & Vibe Coded (Cloudflare / Netlify)',
      badge: '1-Prompt AI Install',
      badgeColor: 'text-violet-700 bg-violet-50 border-violet-200',
      whatToOpen: 'Open your AI coding tool (Cursor, Lovable, Bolt.new, v0) or hosting dashboard (Cloudflare Pages, Netlify).',
      targetPage: 'The landing page, hero section, or testimonials component where you want reviews to display (e.g. papasystem.in).',
      embedElement: 'Ask your AI assistant: "Embed this Panda Praise widget into my testimonials section", or use Netlify/Cloudflare snippet injection.',
      afterPasting: 'The AI adds the container div and loads the script. For Cloudflare/Netlify edge injection, it serves automatically without touching code.',
      howToPublish: 'Push changes with Git, or let Cloudflare / Netlify automatically deploy your site.',
      howToVerify: 'Visit your live site in an incognito window and verify the testimonials wall appears and animates.',
      note: 'Perfect for vibe-coded sites hosted on Cloudflare Pages, Netlify, or Vercel. You can prompt your AI assistant or inject at the edge without manual coding.',
      steps: [
        'Method A (AI Assistant): Copy the code and ask Cursor, Lovable, Bolt, or v0 to place it in your reviews section.',
        'Method B (Static HTML): Paste the container <div> into index.html and the script before </body>.',
        'Method C (Netlify): Go to Site Settings → Build & Deploy → Snippet injection → Add snippet before </body>.',
        'Method D (Cloudflare): Go to Domain Dashboard → Rules / Snippets or Zaraz → Inject HTML before </body>.',
        'Deploy and verify your live website in a new browser tab.',
      ],
    },
  };

  const [copiedAiPrompt, setCopiedAiPrompt] = useState(false);

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

  const handleCopyAiPrompt = async () => {
    const aiPrompt = `Please embed this Panda Praise testimonial widget into my landing page's testimonials section. Place the container <div> where the reviews should display, and load the script:\n\n${getEmbedSnippet()}`;
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopiedAiPrompt(true);
      handlePublishSetup();
      setTimeout(() => setCopiedAiPrompt(false), 2000);
    } catch {
      setCopiedAiPrompt(false);
    }
  };

  const guide = PLATFORM_GUIDES[cmsPlatform] || PLATFORM_GUIDES.wordpress;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ── Two Equal Top Cards Side-by-Side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        {/* Left Card: Widget Installation (White) */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Widget Installation</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/80 dark:border-emerald-800">
                    Live Auto-Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Embed live testimonials in 10 seconds. Place snippet before &lt;/body&gt; or in your builder.
                </p>
              </div>
            </div>
          </div>

          {/* Compact Code Snippet Box */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-2xs">
            <code className="text-[11px] font-mono truncate text-purple-200">
              {`<div id="pandapraise-widget" data-project-id="${project?.id || 'demo'}"></div>`}
            </code>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Embed Code'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mr-2 font-medium">
              Supports WordPress, Webflow, Shopify, Framer, Next.js & static HTML.
            </span>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Full Guide & Platforms →</span>
            </button>
          </div>
        </div>

        {/* Right Card: PandaPraise 1-Click Clipper (Dark Purple Gradient) */}
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1e1035] via-[#2d1254] to-[#0f0728] text-white p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-4 border border-purple-500/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-purple-200">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    PandaPraise 1-Click Clipper
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-extrabold text-purple-200 border border-white/20 backdrop-blur-md">
                    Chrome Extension
                  </span>
                </div>
                <p className="text-xs text-purple-200/80 leading-snug">
                  Clip customer praise from Twitter/X, LinkedIn, WhatsApp Web & Slack directly into your Proof Vault in 1 second.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 relative z-10">
            <div className="flex items-center gap-2 text-[11px] text-purple-200/80 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Primary Tool · Instant Social Proof Capture</span>
            </div>
            <a
              href="https://github.com/greetingsgopal-hub/testimonial-collector-dashboard/tree/main/extension"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
            >
              <span>Get Extension →</span>
            </a>
          </div>
        </div>

      </div>

      {/* ── Fast 3-Step Setup Banner (Light Purple) ── */}
      {!isGuideDismissed && (
        <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 p-4 sm:p-5 border border-purple-200/80 dark:border-purple-800/80 shadow-2xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-purple-600 text-white text-xs font-black shadow-xs shrink-0">
                ⚡
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Fast 3-Step Setup
                  </h3>
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    Ready in 2 min
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  1. Customize theme & filters → 2. Select platform → 3. Copy embed snippet & publish
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIsGuideExpanded((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-white text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <span>{isGuideExpanded ? 'Hide Steps ▴' : 'View 4 Steps ▾'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGuideDismissed(true)}
                title="Dismiss guide"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Dismiss guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded 4-Step Cards (shown on user demand) */}
          {isGuideExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-purple-200/60 animate-in fade-in duration-200">
              <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">1</span>
                  <p className="text-[11px] font-bold text-gray-900 uppercase">COPY</p>
                </div>
                <p className="text-xs font-bold text-[#6701e6]">Copy embed snippet</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Select your platform below and click <strong>Copy Embed Code</strong>.
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">2</span>
                  <p className="text-[11px] font-bold text-gray-900 uppercase">OPEN BUILDER</p>
                </div>
                <p className="text-xs font-bold text-[#6701e6]">Add Code Element</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Open your builder and add a <strong>Custom HTML / Code Embed</strong> element.
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">3</span>
                  <p className="text-[11px] font-bold text-gray-900 uppercase">PASTE & PUBLISH</p>
                </div>
                <p className="text-xs font-bold text-[#6701e6]">Paste snippet & publish</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Paste the code into that element and hit <strong>Publish</strong> or Update.
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">4</span>
                  <p className="text-[11px] font-bold text-gray-900 uppercase">LIVE CHECK</p>
                </div>
                <p className="text-xs font-bold text-emerald-700">Check live site</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Test your live URL with our automated verification bot in Share & Embed.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Builder Controls & Platform Guides (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Builder Section Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Settings' },
              { id: 'style', label: 'Theme & Style' },
              { id: 'filters', label: 'Filters' },
              { id: 'platform', label: 'Platform & Code' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveBuilderTab(tab.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                  activeBuilderTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. Theme & Appearance */}
          {(activeBuilderTab === 'all' || activeBuilderTab === 'style') && (
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                1. Theme & Appearance
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
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
                      type="button"
                      onClick={() => {
                        setWallTheme(th.id as WallTheme);
                        setSettings((prev) => ({ ...prev, theme: th.id === 'dark' ? 'dark' : 'light' }));
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                          : 'border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>
                          {th.label}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{th.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Rating & Platform Source Filters */}
          {(activeBuilderTab === 'all' || activeBuilderTab === 'filters') && (
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                2. Filter Rating & Sources
              </h3>

              {/* Minimum Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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
                        type="button"
                        onClick={() => setMinRating(r.value)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>{r.label}</div>
                        <div className={`text-[10px] font-normal ${isSelected ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'}`}>
                          {r.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Sources */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Included Review Sources
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'google', label: 'Google', icon: <GoogleIcon /> },
                    { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
                    { id: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
                    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
                    { id: 'direct', label: 'Direct Form', icon: <Globe className="w-3.5 h-3.5 text-slate-500" /> },
                  ].map((src) => {
                    const isChecked = selectedSources.includes(src.id);
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => toggleSource(src.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white font-bold'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 hover:opacity-90'
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
                          className="rounded border-slate-300 text-purple-600 focus:ring-purple-600 pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Items */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Display Limit</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{settings.maxCount} testimonials</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="18"
                  step="3"
                  value={settings.maxCount}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxCount: Number(e.target.value) }))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 3. Embed Code & Compact Platform Selection */}
          {(activeBuilderTab === 'all' || activeBuilderTab === 'platform') && (
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    3. Install on Your Website
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    Zero Layout Shift
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your website builder or framework:
                </p>
              </div>

              {/* Compact Quick Platform Buttons */}
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700">
                {[
                  { id: 'wordpress', label: 'WordPress' },
                  { id: 'webflow', label: 'Webflow' },
                  { id: 'shopify', label: 'Shopify' },
                  { id: 'framer', label: 'Framer' },
                  { id: 'vibe', label: 'AI & Vibe Coded' },
                  { id: 'react', label: 'React' },
                  { id: 'nextjs', label: 'Next.js' },
                  { id: 'iframe', label: 'iFrame' },
                ].map((p) => {
                  const isSelected = cmsPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCmsPlatform(p.id as CmsPlatform)}
                      className={`px-2.5 py-1.5 rounded-lg text-center transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-purple-600 text-white font-bold shadow-2xs'
                          : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Full Platform Dropdown with Verified Compatibility Badges */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">All Supported Platforms (12)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ 100% Tested Compatibility</span>
                </div>
                <div className="relative">
                  <select
                    value={cmsPlatform}
                    onChange={(e) => setCmsPlatform(e.target.value as CmsPlatform)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-all cursor-pointer appearance-none pr-9 shadow-2xs"
                  >
                    <option value="vibe">AI & Vibe Coded (Cloudflare Pages, Netlify, Cursor, Lovable, Bolt)</option>
                    <option value="wordpress">WordPress (CMS Block / Gutenberg / Elementor)</option>
                    <option value="webflow">Webflow (Code Embed Element)</option>
                    <option value="wix">Wix (Embed HTML Block)</option>
                    <option value="shopify">Shopify (Custom Liquid / Section)</option>
                    <option value="squarespace">Squarespace (Code Block)</option>
                    <option value="framer">Framer (Embed Utility Component)</option>
                    <option value="react">React (Component + useEffect)</option>
                    <option value="nextjs">Next.js (App Router / Pages Script)</option>
                    <option value="html">Custom HTML (Vanilla Website)</option>
                    <option value="iframe">Universal iFrame (Isolated Container)</option>
                    <option value="other">Other Website Builder / CMS</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Platform Specific Instruction Card */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-900/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {guide.label} Installation Guide
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${guide.badgeColor}`}>
                    {guide.badge}
                  </span>
                </div>

                {/* Customer Journey Quick Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/50 space-y-0.5 shadow-2xs">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">What to open:</span>
                    <p className="text-slate-800 dark:text-slate-200">{guide.whatToOpen}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/50 space-y-0.5 shadow-2xs">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Target Page:</span>
                    <p className="text-slate-800 dark:text-slate-200">{guide.targetPage}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/50 space-y-0.5 shadow-2xs">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Element to Add:</span>
                    <p className="text-purple-600 dark:text-purple-400 font-bold">{guide.embedElement}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/50 space-y-0.5 shadow-2xs">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">After Pasting:</span>
                    <p className="text-slate-800 dark:text-slate-200">{guide.afterPasting}</p>
                  </div>
                </div>

                {/* Numbered Step-by-Step Flow */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                    Step-by-Step Clicks:
                  </span>
                  <ol className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {guide.steps.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-900/70 text-purple-700 dark:text-purple-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Special Platform Note */}
                {guide.note && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{guide.note}</p>
                  </div>
                )}
              </div>

              {/* Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Generated Code Snippet</span>
                  <span className="text-[10px] font-mono text-slate-400">Auto-configured</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto select-all max-h-36 scrollbar-thin shadow-2xs">
                  <pre className="whitespace-pre-wrap">{getEmbedSnippet()}</pre>
                </div>
              </div>

              {/* Copy Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '✓ Snippet Copied!' : 'Copy Embed Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAiPrompt}
                  className="py-3 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                  title="Copy 1-click prompt for Cursor, Lovable, Bolt, or v0"
                >
                  {copiedAiPrompt ? <Check className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  <span>{copiedAiPrompt ? '✓ AI Prompt Copied!' : 'Copy AI Prompt'}</span>
                </button>
              </div>

              {/* Video Walkthrough Storyboard Toggle Button */}
              <button
                type="button"
                onClick={() => setShowVideoStoryboard((prev) => !prev)}
                className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Video className="w-4 h-4" />
                <span>
                  {showVideoStoryboard ? 'Hide Video Walkthrough Storyboard' : '🎬 View 60-Second Video Walkthrough (Actual Screen & Cursor)'}
                </span>
                {showVideoStoryboard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Expandable Video Walkthrough Storyboard */}
              {showVideoStoryboard && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 animate-in fade-in duration-200 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">Instructional Video Storyboard (60s Walkthrough)</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono bg-purple-900/60 px-2.5 py-0.5 rounded-full">
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
                      <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-purple-300 font-bold text-[11px]">{sc.time}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{sc.action}</span>
                        </div>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                          <MousePointer className="w-3 h-3 text-emerald-400" />
                          {sc.cursor}
                        </p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{sc.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WordPress Snippet Row / Permanent Quick-Action Dock */}
          <div className="sticky bottom-4 z-20 p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-purple-200/90 dark:border-purple-800 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {guide.label} Snippet
                </p>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to Paste
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Embed Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title="Share & verify live"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Interactive Widget Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 lg:sticky lg:top-20 z-10">
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col h-[calc(100vh-6rem)] max-h-[860px]">
            {/* Header with Title, Sample Badge & Device Switcher */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 gap-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                    Live Interactive Preview
                  </span>
                </div>
                {isUsingSampleReviews && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    Sample Preview
                  </span>
                )}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{displayReviews.length} reviews</span>
                </div>
              </div>

              {/* Device Preview Switcher (Desktop / Tablet / Mobile) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  title="Desktop Preview (100%)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  title="Tablet Preview (480px)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    previewDevice === 'tablet'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  title="Mobile Preview (320px)"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Scrollable Wrapper */}
            <div
              className={`flex-1 rounded-2xl p-5 sm:p-6 transition-all duration-300 overflow-y-auto scrollbar-thin ${
                wallTheme === 'dark'
                  ? 'bg-[#0f172a] border border-slate-800 text-white'
                  : wallTheme === 'minimalist'
                    ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border border-purple-100/80 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              {/* Responsive Width Constraint Container */}
              <div
                className={`mx-auto transition-all duration-300 w-full ${
                  previewDevice === 'tablet'
                    ? 'max-w-md'
                    : previewDevice === 'mobile'
                    ? 'max-w-xs'
                    : 'w-full'
                }`}
              >
                {/* Sample Testimonials Alert Banner */}
                {isUsingSampleReviews && (
                  <div className="mb-4 p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="font-medium text-[11px] sm:text-xs">
                        Pre-loaded with sample reviews so you can customize immediately.
                      </span>
                    </div>
                    {onOpenProof && (
                      <button
                        type="button"
                        onClick={onOpenProof}
                        className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white underline whitespace-nowrap cursor-pointer shrink-0"
                      >
                        Go to Proof →
                      </button>
                    )}
                  </div>
                )}

                {displayReviews.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6701e6] flex items-center justify-center mb-3">
                      <Filter className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Testimonials Match Filters</h4>
                    <p className="text-xs text-slate-500 max-w-sm mb-4">
                      Try lowering the minimum star rating or selecting more review sources.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMinRating(0);
                        setSelectedSources(['google', 'linkedin', 'instagram', 'facebook', 'direct']);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : settings.type === 'wall' ? (
                  /* Masonry Wall of Love */
                  <div className="space-y-6">
                    <div className={`gap-4 [column-fill:_balance] ${
                      previewDevice === 'mobile' ? 'columns-1' : 'columns-1 md:columns-2'
                    }`}>
                      {displayReviews.map((r: any) => {
                        const source = (r.source || 'direct').toLowerCase();
                        return (
                          <div
                            key={r.id}
                            className={`break-inside-avoid mb-4 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                              wallTheme === 'dark'
                                ? 'bg-[#1e293b] border border-white/10 text-slate-100 shadow-md hover:border-purple-500/50'
                                : wallTheme === 'minimalist'
                                  ? 'bg-white border border-slate-200 text-slate-900 hover:border-slate-950 shadow-2xs'
                                  : 'bg-white border border-purple-100/90 text-slate-900 shadow-2xs hover:shadow-xs hover:border-purple-300'
                            }`}
                          >
                            {/* Top row: Stars + Source */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Source badge */}
                              {source === 'google' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <GoogleIcon /> Google
                                </span>
                              )}
                              {source === 'linkedin' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0A66C2] border border-sky-200">
                                  <LinkedInIcon /> LinkedIn
                                </span>
                              )}
                              {source === 'instagram' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#E4405F] border border-pink-200">
                                  <InstagramIcon /> Instagram
                                </span>
                              )}
                              {source === 'facebook' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1877F2] border border-blue-200">
                                  <FacebookIcon /> Facebook
                                </span>
                              )}
                              {(source === 'sample' || r.isSample) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800 shadow-2xs">
                                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Verified
                                </span>
                              )}
                            </div>

                            {/* Review text */}
                            <p className={`text-xs leading-relaxed mb-4 ${
                              wallTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                              "{r.content || r.text}"
                            </p>

                            {/* Author info */}
                            <div className={`flex items-center gap-3 pt-3 border-t ${
                              wallTheme === 'dark' ? 'border-white/10' : 'border-slate-100'
                            }`}>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 shrink-0 border border-slate-200">
                                {r.avatarUrl ? (
                                  <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-purple-700 flex items-center justify-center h-full">
                                    {r.name?.charAt(0) || 'U'}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <p className={`text-xs font-bold leading-tight truncate ${
                                    wallTheme === 'dark' ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    {r.name}
                                  </p>
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </div>
                                <p className="text-[10.5px] text-slate-400 truncate leading-tight">
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
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1 rounded-full border ${
                        wallTheme === 'dark'
                          ? 'bg-white/5 text-slate-400 border-white/10'
                          : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
                      }`}>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        Verified with Panda Praise
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Other widget formats fallback preview */
                  <div className={`gap-4 ${
                    previewDevice === 'mobile' ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2'
                  }`}>
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
        </div>
      </div>

      {/* Dedicated Embed Code & Installation Guide Modal */}
      <EmbedCodeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={projectWidgetId}
        widgetType={settings.type}
        theme={wallTheme}
        minRating={minRating}
        sources={selectedSources}
        maxCount={settings.maxCount}
        publicWallUrl={publicWallUrl}
      />
    </div>
  );
};
