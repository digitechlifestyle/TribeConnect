<?php
/**
 * TribeConnect – Left Sidebar
 */
$user = ossn_loggedin_user();
if (!$user) return;

$avatar    = ossn_user_avatar($user);
$profile   = ossn_site_url('u/' . $user->username);
$verified  = !empty($user->verified);
?>
<nav class="tc-sidebar" id="tc-sidebar" aria-label="Main navigation">

    <!-- Profile mini-card -->
    <div class="tc-sidebar-profile">
        <a href="<?php echo $profile; ?>" class="tc-sidebar-avatar-link">
            <?php if ($avatar): ?>
                <img src="<?php echo $avatar; ?>" alt="<?php echo $user->fullname; ?>" class="tc-avatar-md"/>
            <?php else: ?>
                <span class="tc-avatar-initials-md"><?php echo strtoupper(substr($user->fullname, 0, 1)); ?></span>
            <?php endif; ?>
        </a>
        <div class="tc-sidebar-profile-info">
            <a href="<?php echo $profile; ?>" class="tc-sidebar-name">
                <?php echo htmlspecialchars($user->fullname); ?>
                <?php if ($verified): ?>
                    <span class="tc-verified-badge" title="Verified Account"><i class="fa fa-circle-check"></i></span>
                <?php endif; ?>
            </a>
            <span class="tc-sidebar-username">@<?php echo $user->username; ?></span>
        </div>
    </div>

    <!-- Main navigation links -->
    <ul class="tc-nav-list">
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url(); ?>" class="tc-nav-link">
                <i class="fa fa-house tc-nav-icon"></i>
                <span><?php echo ossn_print('newsfeed'); ?></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo $profile; ?>" class="tc-nav-link">
                <i class="fa fa-user tc-nav-icon"></i>
                <span><?php echo ossn_print('profile'); ?></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('friends'); ?>" class="tc-nav-link">
                <i class="fa fa-user-group tc-nav-icon"></i>
                <span><?php echo ossn_print('friends'); ?></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('messages'); ?>" class="tc-nav-link">
                <i class="fa fa-envelope tc-nav-icon"></i>
                <span><?php echo ossn_print('messages'); ?></span>
                <span class="tc-badge tc-nav-badge" id="tc-sidebar-msg-count" style="display:none"></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('groups'); ?>" class="tc-nav-link">
                <i class="fa fa-people-roof tc-nav-icon"></i>
                <span><?php echo ossn_print('groups'); ?></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('photos'); ?>" class="tc-nav-link">
                <i class="fa fa-images tc-nav-icon"></i>
                <span><?php echo ossn_print('photos'); ?></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('search'); ?>" class="tc-nav-link">
                <i class="fa fa-magnifying-glass tc-nav-icon"></i>
                <span><?php echo ossn_print('search'); ?></span>
            </a>
        </li>
    </ul>

    <!-- Premium upsell / subscriber section -->
    <?php if (empty($user->premium)): ?>
    <div class="tc-sidebar-premium-card">
        <div class="tc-premium-icon"><i class="fa fa-crown"></i></div>
        <p><?php echo ossn_print('premium:sidebar:teaser'); ?></p>
        <a href="<?php echo ossn_site_url('premium'); ?>" class="tc-btn tc-btn-gold tc-btn-sm">
            <?php echo ossn_print('premium:upgrade'); ?>
        </a>
    </div>
    <?php else: ?>
    <div class="tc-sidebar-premium-badge">
        <i class="fa fa-crown"></i> <?php echo ossn_print('premium:member'); ?>
    </div>
    <?php endif; ?>

    <!-- Divider -->
    <hr class="tc-sidebar-divider"/>

    <!-- Settings & logout -->
    <ul class="tc-nav-list tc-nav-list-bottom">
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('settings'); ?>" class="tc-nav-link">
                <i class="fa fa-gear tc-nav-icon"></i>
                <span><?php echo ossn_print('settings'); ?></span>
            </a>
        </li>
        <li class="tc-nav-item">
            <a href="<?php echo ossn_site_url('action/user/logout'); ?>" class="tc-nav-link tc-nav-logout">
                <i class="fa fa-right-from-bracket tc-nav-icon"></i>
                <span><?php echo ossn_print('logout'); ?></span>
            </a>
        </li>
    </ul>

    <!-- Sidebar footer -->
    <div class="tc-sidebar-footer">
        <a href="<?php echo ossn_site_url('pages/privacy'); ?>"><?php echo ossn_print('privacy'); ?></a> ·
        <a href="<?php echo ossn_site_url('pages/terms'); ?>"><?php echo ossn_print('terms'); ?></a>
        <p class="tc-sidebar-copy">&copy; <?php echo date('Y'); ?> <?php echo ossn_site_settings('site_name'); ?></p>
    </div>

</nav>
