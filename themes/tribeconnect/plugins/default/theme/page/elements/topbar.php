<?php
/**
 * TribeConnect – Top Navigation Bar
 */
$user = ossn_loggedin_user();
?>
<header class="tc-topbar" role="banner">
    <div class="tc-topbar-inner">

        <!-- Left: Hamburger + Logo -->
        <div class="tc-topbar-left">
            <?php if (ossn_isLoggedin()): ?>
            <button class="tc-sidebar-toggle" id="tc-sidebar-toggle" aria-label="Toggle navigation" aria-expanded="false">
                <i class="fa fa-bars"></i>
            </button>
            <?php endif; ?>
            <a class="tc-brand" href="<?php echo ossn_site_url(); ?>">
                <span class="tc-brand-icon">T</span>
                <span class="tc-brand-name"><?php echo ossn_site_settings('site_name'); ?></span>
            </a>
        </div>

        <!-- Centre: Search (desktop) -->
        <?php if (ossn_isLoggedin()): ?>
        <div class="tc-topbar-center">
            <form class="tc-search-form" action="<?php echo ossn_site_url('search'); ?>" method="get" role="search">
                <div class="tc-search-wrap">
                    <i class="fa fa-search tc-search-icon"></i>
                    <input type="text" name="q" class="tc-search-input"
                           placeholder="<?php echo ossn_print('search'); ?>…"
                           autocomplete="off" aria-label="Search TribeConnect"/>
                </div>
            </form>
        </div>
        <?php endif; ?>

        <!-- Right: Actions -->
        <div class="tc-topbar-right">
            <?php if (ossn_isLoggedin()): ?>

                <!-- Mobile search trigger -->
                <button class="tc-icon-btn tc-mobile-search-btn d-md-none" aria-label="Search">
                    <i class="fa fa-search"></i>
                </button>

                <!-- Notifications -->
                <?php echo ossn_plugin_view('notifications/page/topbar'); ?>

                <!-- Messages -->
                <a class="tc-icon-btn" href="<?php echo ossn_site_url('messages'); ?>" aria-label="Messages">
                    <i class="fa fa-envelope"></i>
                    <span class="tc-badge" id="tc-msg-count" style="display:none"></span>
                </a>

                <!-- Profile dropdown -->
                <div class="tc-profile-dropdown dropdown">
                    <button class="tc-avatar-btn" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Account menu">
                        <?php
                        $avatar = ossn_user_avatar($user);
                        if ($avatar): ?>
                            <img src="<?php echo $avatar; ?>" alt="<?php echo $user->fullname; ?>" class="tc-avatar-sm"/>
                        <?php else: ?>
                            <span class="tc-avatar-initials-sm"><?php echo strtoupper(substr($user->fullname, 0, 1)); ?></span>
                        <?php endif; ?>
                        <?php
                        // Verification badge in topbar
                        if (!empty($user->verified)): ?>
                            <span class="tc-verified-dot" title="Verified"></span>
                        <?php endif; ?>
                    </button>
                    <?php echo ossn_view_menu('topbar_dropdown'); ?>
                </div>

                <!-- Theme toggle -->
                <button class="tc-icon-btn tc-theme-toggle" id="tc-theme-toggle" aria-label="Toggle dark mode">
                    <i class="fa fa-moon" id="tc-theme-icon"></i>
                </button>

            <?php else: ?>
                <a class="tc-btn tc-btn-outline" href="<?php echo ossn_site_url('login'); ?>">
                    <?php echo ossn_print('site:login'); ?>
                </a>
                <a class="tc-btn tc-btn-primary" href="<?php echo ossn_site_url('register'); ?>">
                    <?php echo ossn_print('register'); ?>
                </a>
            <?php endif; ?>
        </div>

    </div><!-- /.tc-topbar-inner -->

    <!-- Mobile search bar (hidden by default) -->
    <?php if (ossn_isLoggedin()): ?>
    <div class="tc-mobile-search" id="tc-mobile-search" hidden>
        <form action="<?php echo ossn_site_url('search'); ?>" method="get" role="search">
            <div class="tc-search-wrap">
                <i class="fa fa-search tc-search-icon"></i>
                <input type="text" name="q" class="tc-search-input"
                       placeholder="<?php echo ossn_print('search'); ?>…"
                       autocomplete="off"/>
            </div>
        </form>
    </div>
    <?php endif; ?>
</header>
