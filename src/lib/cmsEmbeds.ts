export type WidgetLayout = 'marquee' | 'wall' | 'carousel' | 'badge' | 'toast';
export type WidgetTheme = 'light' | 'dark' | 'system';

export interface CmsPlatformGuide {
  id: string;
  name: string;
  category: 'ecommerce' | 'cms' | 'nocode';
  logo: string;
  badge: string;
  setupTime: string;
  description: string;
  instructions: string[];
  snippet: (spaceSlug: string, layout: WidgetLayout, theme?: WidgetTheme) => string;
  fileName?: string;
}

export function getShopifySnippet(spaceSlug: string, layout: WidgetLayout = 'marquee'): string {
  return `<!-- PandaPraise Testimonials Widget for Shopify -->
<!-- Paste this code into Sections > Add Custom Liquid or in snippets/pandapraise.liquid -->
<div 
  id="pandapraise-widget" 
  data-space="${spaceSlug}" 
  data-layout="${layout}"
  style="min-height: 120px; width: 100%;">
</div>
<script async src="https://pandapraise.com/embed.js" data-space="${spaceSlug}"></script>`;
}

export function getWordPressShortcode(spaceSlug: string, layout: WidgetLayout = 'marquee', theme: WidgetTheme = 'system'): string {
  return `[pandapraise space="${spaceSlug}" layout="${layout}" theme="${theme}"]`;
}

export function getWordPressPluginPhpCode(): string {
  return `<?php
/**
 * Plugin Name: PandaPraise Testimonials & Social Proof
 * Plugin URI: https://pandapraise.com
 * Description: The ultra-fast, viral testimonial widget for WordPress and WooCommerce. Embed Wall of Love, Marquee Tickers, and Review Carousels with zero layout shifts.
 * Version: 1.0.0
 * Author: PandaPraise
 * Author URI: https://pandapraise.com
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit;
}

function pandapraise_register_shortcode($atts) {
    $a = shortcode_atts(array(
        'space' => 'default',
        'layout' => 'marquee',
        'theme' => 'system',
    ), $atts);

    $space = esc_attr($a['space']);
    $layout = esc_attr($a['layout']);
    $theme = esc_attr($a['theme']);

    // Enqueue embed runtime script asynchronously
    wp_enqueue_script(
        'pandapraise-embed',
        'https://pandapraise.com/embed.js',
        array(),
        '1.0.0',
        true
    );

    return sprintf(
        '<div id="pandapraise-widget" data-space="%s" data-layout="%s" data-theme="%s" style="min-height:120px;width:100%%;"></div>',
        $space,
        $layout,
        $theme
    );
}
add_shortcode('pandapraise', 'pandapraise_register_shortcode');
`;
}

export function getWebflowSnippet(spaceSlug: string, layout: WidgetLayout = 'marquee'): string {
  return `<!-- Webflow Embed Component: PandaPraise Widget -->
<div 
  id="pandapraise-widget" 
  data-space="${spaceSlug}" 
  data-layout="${layout}">
</div>
<script async src="https://pandapraise.com/embed.js" data-space="${spaceSlug}"></script>`;
}

export function getFramerSnippet(spaceSlug: string, layout: WidgetLayout = 'marquee'): string {
  return `<!-- Framer Custom Code Embed -->
<div 
  id="pandapraise-widget" 
  data-space="${spaceSlug}" 
  data-layout="${layout}" 
  style="width: 100%; height: 100%;">
</div>
<script async src="https://pandapraise.com/embed.js" data-space="${spaceSlug}"></script>`;
}

export function getNotionEmbedUrl(spaceSlug: string, layout: WidgetLayout = 'marquee'): string {
  return `https://pandapraise.com/love/${spaceSlug}?layout=${layout}`;
}

export const CMS_PLATFORMS: CmsPlatformGuide[] = [
  {
    id: 'shopify',
    name: 'Shopify Store',
    category: 'ecommerce',
    logo: 'Shopify',
    badge: '1-Click Liquid',
    setupTime: '< 2 mins',
    description: 'Display real customer reviews directly on product pages, cart drawers, or the home page to increase checkout conversions.',
    instructions: [
      'Open your Shopify Admin and go to Online Store > Themes.',
      'Click Customize on your active theme.',
      'Add a new section and select Custom Liquid (or edit theme.liquid).',
      'Paste the snippet below and click Save.',
    ],
    snippet: (slug, layout) => getShopifySnippet(slug, layout),
  },
  {
    id: 'wordpress',
    name: 'WordPress / WooCommerce',
    category: 'cms',
    logo: 'WordPress',
    badge: 'Shortcode & Plugin',
    setupTime: '< 1 min',
    description: 'Use the official [pandapraise] shortcode anywhere in Gutenberg blocks, Elementor, or classic widget areas.',
    instructions: [
      'Download or copy the PandaPraise WordPress plugin PHP file below.',
      'Upload to your /wp-content/plugins/ directory, or activate via Plugins > Add New.',
      'Insert the shortcode [pandapraise space="..." layout="..."] inside any page, post, or Elementor widget.',
    ],
    snippet: (slug, layout, theme) => getWordPressShortcode(slug, layout, theme),
    fileName: 'pandapraise-wp-plugin.php',
  },
  {
    id: 'webflow',
    name: 'Webflow',
    category: 'nocode',
    logo: 'Webflow',
    badge: 'Embed Block',
    setupTime: '< 2 mins',
    description: 'Drop customer proof anywhere in your Webflow design system without breaking responsive styles.',
    instructions: [
      'In the Webflow Designer, press "A" to open Add Elements.',
      'Drag an Embed element onto your canvas where you want testimonials to appear.',
      'Paste the HTML snippet below and click "Save & Close".',
      'Publish your Webflow project to see live testimonials.',
    ],
    snippet: (slug, layout) => getWebflowSnippet(slug, layout),
  },
  {
    id: 'framer',
    name: 'Framer',
    category: 'nocode',
    logo: 'Framer',
    badge: 'HTML Component',
    setupTime: '< 1 min',
    description: 'Framer-native zero-CLS testimonial embeds with full dark mode support.',
    instructions: [
      'In your Framer canvas, open Insert > Utility > Embed.',
      'In the right sidebar properties, select HTML mode.',
      'Paste the code snippet below and preview your page.',
    ],
    snippet: (slug, layout) => getFramerSnippet(slug, layout),
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'nocode',
    logo: 'Notion',
    badge: '/embed URL',
    setupTime: '30 seconds',
    description: 'Embed a live Wall of Love or review reel in your client portals, proposals, and team wikis.',
    instructions: [
      'In any Notion page, type /embed and press Enter.',
      'Paste your PandaPraise live showcase URL.',
      'Resize the Notion block to fit your layout.',
    ],
    snippet: (slug, layout) => getNotionEmbedUrl(slug, layout),
  },
];
