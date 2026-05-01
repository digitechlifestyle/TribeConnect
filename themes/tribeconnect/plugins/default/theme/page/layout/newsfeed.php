<?php
/**
 * TribeConnect – Newsfeed Layout
 */
?>
<div class="tc-newsfeed-layout">

    <!-- Left: Main feed column -->
    <main class="tc-feed-col" role="main">

        <!-- Story / Quick post bar -->
        <div class="tc-post-composer tc-card">
            <?php
            $user   = ossn_loggedin_user();
            $avatar = ossn_user_avatar($user);
            ?>
            <div class="tc-composer-top">
                <?php if ($avatar): ?>
                    <img src="<?php echo $avatar; ?>" class="tc-avatar-sm" alt=""/>
                <?php else: ?>
                    <span class="tc-avatar-initials-sm"><?php echo strtoupper(substr($user->fullname, 0, 1)); ?></span>
                <?php endif; ?>
                <button class="tc-composer-trigger" id="tc-composer-trigger">
                    <?php echo ossn_print('wall:whats:on:mind'); ?>
                </button>
            </div>
            <div class="tc-composer-actions">
                <button class="tc-composer-action" data-type="photo">
                    <i class="fa fa-image"></i> <?php echo ossn_print('photo'); ?>
                </button>
                <button class="tc-composer-action" data-type="feeling">
                    <i class="fa fa-face-smile"></i> <?php echo ossn_print('feeling'); ?>
                </button>
                <button class="tc-composer-action" data-type="location">
                    <i class="fa fa-location-dot"></i> <?php echo ossn_print('location'); ?>
                </button>
            </div>
        </div>

        <!-- Wall / post feed -->
        <?php echo ossn_plugin_view('wall/user/newsfeed'); ?>

    </main>

    <!-- Right: Widgets column -->
    <aside class="tc-widgets-col" aria-label="Widgets">

        <!-- Who to follow -->
        <div class="tc-card tc-widget">
            <h3 class="tc-widget-title"><?php echo ossn_print('people:you:may:know'); ?></h3>
            <?php echo ossn_plugin_view('output/users_list', array('limit' => 5)); ?>
        </div>

        <!-- Trending / suggested groups -->
        <div class="tc-card tc-widget">
            <h3 class="tc-widget-title"><?php echo ossn_print('suggested:groups'); ?></h3>
            <?php echo ossn_plugin_view('groups/suggested', array('limit' => 4)); ?>
        </div>

        <!-- Ads placement (sidebar) -->
        <?php echo ossn_plugin_view('tribeconnect_ads/sidebar'); ?>

    </aside>

</div><!-- /.tc-newsfeed-layout -->
