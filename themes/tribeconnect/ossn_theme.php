<?php
/**
 * TribeConnect Theme
 * Modern mobile-first social platform theme for OSSN
 *
 * @package   TribeConnect
 * @author    TribeConnect Team
 * @license   MIT
 */

// Register theme CSS
ossn_extend_view('ossn/site/head', 'tribeconnect/css');
ossn_extend_view('ossn/site/head', 'tribeconnect/meta');

// Register JS
ossn_extend_view('ossn/page/footer', 'tribeconnect/js');

// Register pages
ossn_register_page('home', 'tribeconnect_home_page');
ossn_register_page('login', 'tribeconnect_login_page');

/**
 * Home page handler
 */
function tribeconnect_home_page($pages) {
    if (ossn_isLoggedin()) {
        ossn_set_page_owner_guid(ossn_loggedin_user()->guid);
        $contents = ossn_plugin_view('theme/page/layout/newsfeed', array());
        $params = array(
            'title'    => ossn_print('newsfeed'),
            'contents' => $contents,
        );
        echo ossn_plugin_view('theme/page/page', $params);
    } else {
        $contents = ossn_plugin_view('theme/page/layout/startup', array());
        $params = array(
            'title'    => ossn_print('welcome'),
            'contents' => $contents,
        );
        echo ossn_plugin_view('theme/page/page', $params);
    }
}

/**
 * Login page handler
 */
function tribeconnect_login_page($pages) {
    $contents = ossn_plugin_view('theme/page/layout/startup', array());
    $params = array(
        'title'    => ossn_print('site:login'),
        'contents' => $contents,
    );
    echo ossn_plugin_view('theme/page/page', $params);
}
