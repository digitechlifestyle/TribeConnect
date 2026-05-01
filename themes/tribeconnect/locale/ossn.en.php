<?php
/**
 * TribeConnect — English Locale
 */
$strings = [
    // Navigation
    'newsfeed'              => 'Home',
    'profile'               => 'Profile',
    'friends'               => 'Friends',
    'messages'              => 'Messages',
    'groups'                => 'Groups',
    'photos'                => 'Photos',
    'search'                => 'Search',
    'settings'              => 'Settings',
    'logout'                => 'Log Out',
    'advertise'             => 'Advertise',
    'privacy'               => 'Privacy',
    'terms'                 => 'Terms',
    'about'                 => 'About',
    'help'                  => 'Help',

    // Auth
    'site:login'            => 'Log In',
    'register'              => 'Sign Up',
    'welcome'               => 'Welcome',
    'no:account'            => "Don't have an account?",
    'footer:tagline'        => 'Connect. Share. Thrive.',

    // Wall / posts
    'wall:whats:on:mind'    => "What's on your mind?",
    'photo'                 => 'Photo',
    'feeling'               => 'Feeling',
    'location'              => 'Location',

    // Premium
    'premium'               => 'Premium',
    'premium:upgrade'       => 'Upgrade to Premium',
    'premium:checkout'      => 'Checkout',
    'premium:member'        => '✦ Premium Member',
    'premium:sidebar:teaser'=> 'Get ad-free browsing and exclusive features',

    // Verification
    'verification:apply'         => 'Apply for Verification',
    'verification:applied'       => 'Your verification application has been submitted.',
    'verification:already:pending'=> 'You already have a pending verification application.',
    'verification:approved'      => 'Verification approved.',
    'verification:denied'        => 'Verification denied.',
    'verification:queue'         => 'Verification Queue',

    // Ads
    'ads:create:campaign'   => 'Create Campaign',
    'ads:my:campaigns'      => 'My Campaigns',

    // People
    'people:you:may:know'   => 'People You May Know',
    'suggested:groups'      => 'Suggested Groups',

    // Admin
    'admin:panel'           => 'Admin Panel',
    'back:to:site'          => '← Back to Site',
    'admin:analytics'       => 'Analytics',
    'admin:moderation'      => 'Moderation',
    'admin:reports'         => 'Reported Content',
    'admin:revenue'         => 'Revenue',
    'admin:premium'         => 'Premium Members',
    'admin:ads:manager'     => 'Ads Manager',
    'admin:verification:queue' => 'Verification Queue',

    // Reports
    'report:resolved'       => 'Report resolved.',

    // Users
    'user:banned'           => 'User has been banned.',
    'user:unbanned'         => 'User has been unbanned.',
    'analytics'             => 'Analytics',
    'moderation'            => 'Moderation',
    'reports'               => 'Reports',
    'revenue'               => 'Revenue',
];

foreach ($strings as $key => $val) {
    ossn_register_language('en', $key, $val);
}
