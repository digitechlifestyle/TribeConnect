<?php
/**
 * TribeConnect – Footer
 */
?>
<footer class="tc-footer" role="contentinfo">
    <div class="tc-footer-inner">
        <div class="tc-footer-links">
            <a href="<?php echo ossn_site_url('pages/about'); ?>"><?php echo ossn_print('about'); ?></a>
            <a href="<?php echo ossn_site_url('pages/privacy'); ?>"><?php echo ossn_print('privacy'); ?></a>
            <a href="<?php echo ossn_site_url('pages/terms'); ?>"><?php echo ossn_print('terms'); ?></a>
            <a href="<?php echo ossn_site_url('pages/help'); ?>"><?php echo ossn_print('help'); ?></a>
            <a href="<?php echo ossn_site_url('premium'); ?>"><?php echo ossn_print('premium'); ?></a>
            <a href="<?php echo ossn_site_url('advertise'); ?>"><?php echo ossn_print('advertise'); ?></a>
        </div>
        <p class="tc-footer-copy">
            &copy; <?php echo date('Y'); ?> <?php echo ossn_site_settings('site_name'); ?> &mdash;
            <?php echo ossn_print('footer:tagline'); ?>
        </p>
    </div>
</footer>

<!-- Mobile bottom nav bar -->
<?php if (ossn_isLoggedin()):
$user = ossn_loggedin_user();
$profile = ossn_site_url('u/' . $user->username);
?>
<nav class="tc-mobile-nav" role="navigation" aria-label="Mobile navigation">
    <a href="<?php echo ossn_site_url(); ?>" class="tc-mobile-nav-item" aria-label="Feed">
        <i class="fa fa-house"></i>
    </a>
    <a href="<?php echo ossn_site_url('search'); ?>" class="tc-mobile-nav-item" aria-label="Search">
        <i class="fa fa-magnifying-glass"></i>
    </a>
    <a href="<?php echo ossn_site_url('groups'); ?>" class="tc-mobile-nav-item" aria-label="Groups">
        <i class="fa fa-people-roof"></i>
    </a>
    <a href="<?php echo ossn_site_url('messages'); ?>" class="tc-mobile-nav-item" aria-label="Messages">
        <i class="fa fa-envelope"></i>
        <span class="tc-badge tc-mobile-badge" id="tc-mobile-msg-count" style="display:none"></span>
    </a>
    <a href="<?php echo $profile; ?>" class="tc-mobile-nav-item" aria-label="Profile">
        <i class="fa fa-user"></i>
    </a>
</nav>
<?php endif; ?>
