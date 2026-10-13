<?php
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
