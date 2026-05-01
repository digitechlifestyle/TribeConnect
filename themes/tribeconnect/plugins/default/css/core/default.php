<?php header('Content-Type: text/css'); ?>
/* =============================================================
   TribeConnect — Design System & Core Styles
   Version 1.0.0
   ============================================================= */

/* ── CSS Custom Properties (Light theme defaults) ─────────── */
:root {
  /* Brand */
  --tc-purple:       #6C63FF;
  --tc-purple-dark:  #5A52D5;
  --tc-purple-light: #EDE9FF;
  --tc-gold:         #F5A623;
  --tc-gold-dark:    #D4891A;

  /* Background scale */
  --tc-bg:           #F4F6FB;
  --tc-bg-card:      #FFFFFF;
  --tc-bg-sidebar:   #FFFFFF;
  --tc-bg-topbar:    #FFFFFF;
  --tc-bg-input:     #F0F2F8;
  --tc-bg-hover:     #F4F6FB;

  /* Text scale */
  --tc-text-primary:   #1A1D2E;
  --tc-text-secondary: #64748B;
  --tc-text-muted:     #94A3B8;
  --tc-text-inverse:   #FFFFFF;

  /* Borders */
  --tc-border:       #E2E8F0;
  --tc-border-focus: #6C63FF;

  /* Status */
  --tc-success:  #10B981;
  --tc-error:    #EF4444;
  --tc-warning:  #F59E0B;
  --tc-info:     #3B82F6;

  /* Shadows */
  --tc-shadow-sm:  0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --tc-shadow-md:  0 4px 12px rgba(0,0,0,.08);
  --tc-shadow-lg:  0 10px 30px rgba(0,0,0,.12);
  --tc-shadow-card:0 2px 8px rgba(108,99,255,.08);

  /* Spacing */
  --tc-sidebar-w:    260px;
  --tc-topbar-h:     60px;
  --tc-radius-sm:    8px;
  --tc-radius-md:    12px;
  --tc-radius-lg:    20px;
  --tc-radius-full:  9999px;

  /* Typography */
  --tc-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --tc-font-size-base: 15px;
  --tc-line-height:    1.6;

  /* Transitions */
  --tc-transition: 200ms cubic-bezier(.4, 0, .2, 1);
}

/* ── Dark Theme ───────────────────────────────────────────── */
[data-theme="dark"] {
  --tc-bg:           #0F1117;
  --tc-bg-card:      #1A1D2E;
  --tc-bg-sidebar:   #141622;
  --tc-bg-topbar:    #141622;
  --tc-bg-input:     #252840;
  --tc-bg-hover:     #252840;

  --tc-text-primary:   #E8ECF4;
  --tc-text-secondary: #94A3B8;
  --tc-text-muted:     #64748B;

  --tc-border:       #2A2E45;
  --tc-shadow-sm:    0 1px 3px rgba(0,0,0,.3);
  --tc-shadow-md:    0 4px 12px rgba(0,0,0,.4);
  --tc-shadow-card:  0 2px 8px rgba(0,0,0,.3);
  --tc-purple-light: #2A2460;
}

/* ── Reset & Base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body.tc-body {
  font-family: var(--tc-font);
  font-size: var(--tc-font-size-base);
  line-height: var(--tc-line-height);
  background: var(--tc-bg);
  color: var(--tc-text-primary);
  margin: 0;
  padding: 0;
  min-height: 100vh;
  transition: background var(--tc-transition), color var(--tc-transition);
  padding-bottom: 70px; /* mobile nav clearance */
}

@media (min-width: 768px) { body.tc-body { padding-bottom: 0; } }

a { color: var(--tc-purple); text-decoration: none; transition: color var(--tc-transition); }
a:hover { color: var(--tc-purple-dark); }
img { max-width: 100%; height: auto; }
ul, ol { list-style: none; margin: 0; padding: 0; }

/* ── Loading bar ──────────────────────────────────────────── */
#tc-loading-bar {
  position: fixed; top: 0; left: 0; height: 3px; width: 0;
  background: linear-gradient(90deg, var(--tc-purple), var(--tc-gold));
  z-index: 10000; transition: width .5s ease;
}
body.tc-loading #tc-loading-bar { width: 70%; }
body.tc-loaded  #tc-loading-bar { width: 100%; opacity: 0; transition: width .3s ease, opacity .4s .3s ease; }

/* ── Layout ───────────────────────────────────────────────── */
.tc-layout {
  display: flex;
  min-height: 100vh;
}

.tc-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .is-loggedin .tc-main {
    margin-left: var(--tc-sidebar-w);
  }
}

/* ── Sidebar ──────────────────────────────────────────────── */
.tc-sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: var(--tc-sidebar-w);
  background: var(--tc-bg-sidebar);
  border-right: 1px solid var(--tc-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 200;
  padding: 20px 0 12px;
  transform: translateX(calc(-1 * var(--tc-sidebar-w)));
  transition: transform var(--tc-transition), box-shadow var(--tc-transition);
}

.tc-sidebar.is-open,
@media (min-width: 768px) { .tc-sidebar { transform: translateX(0); } }

/* Sidebar open on desktop always */
@media (min-width: 768px) {
  .tc-sidebar { transform: translateX(0) !important; }
}

/* Mobile sidebar open state */
.tc-sidebar.is-open {
  transform: translateX(0);
  box-shadow: var(--tc-shadow-lg);
}

/* Overlay */
.tc-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 199;
}
.tc-overlay.is-visible { display: block; }

/* Sidebar profile mini-card */
.tc-sidebar-profile {
  display: flex; align-items: center; gap: 12px;
  padding: 0 16px 20px;
  border-bottom: 1px solid var(--tc-border);
  margin-bottom: 8px;
}
.tc-sidebar-profile-info { display: flex; flex-direction: column; min-width: 0; }
.tc-sidebar-name {
  font-size: 14px; font-weight: 600; color: var(--tc-text-primary);
  display: flex; align-items: center; gap: 4px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.tc-sidebar-username { font-size: 12px; color: var(--tc-text-muted); }

/* Nav list */
.tc-nav-list { padding: 4px 8px; }
.tc-nav-item { margin-bottom: 2px; }
.tc-nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: var(--tc-radius-sm);
  color: var(--tc-text-secondary); font-size: 14px; font-weight: 500;
  transition: background var(--tc-transition), color var(--tc-transition);
  position: relative;
}
.tc-nav-link:hover,
.tc-nav-link.active {
  background: var(--tc-purple-light);
  color: var(--tc-purple);
}
.tc-nav-icon { width: 20px; text-align: center; font-size: 16px; flex-shrink: 0; }
.tc-nav-badge {
  position: absolute; top: 8px; right: 10px;
  background: var(--tc-error); color: #fff;
  font-size: 10px; font-weight: 700;
  min-width: 18px; height: 18px; border-radius: var(--tc-radius-full);
  display: flex; align-items: center; justify-content: center; padding: 0 4px;
}
.tc-nav-logout { color: var(--tc-error); }
.tc-nav-logout:hover { background: #fee2e2; color: var(--tc-error); }
.tc-nav-list-bottom { margin-top: auto; }

/* Premium sidebar card */
.tc-sidebar-premium-card {
  margin: 12px; padding: 16px;
  background: linear-gradient(135deg, var(--tc-purple), #9C6FFF);
  border-radius: var(--tc-radius-md); color: #fff; text-align: center;
}
.tc-premium-icon { font-size: 24px; margin-bottom: 8px; color: var(--tc-gold); }
.tc-sidebar-premium-card p { font-size: 13px; margin: 0 0 12px; opacity: .9; }
.tc-sidebar-premium-badge {
  margin: 12px; padding: 8px 16px;
  background: linear-gradient(135deg, var(--tc-gold), #FFD700);
  border-radius: var(--tc-radius-full); color: #1A1D2E; font-size: 13px;
  font-weight: 700; text-align: center;
}

.tc-sidebar-divider { border: none; border-top: 1px solid var(--tc-border); margin: 8px 16px; }

.tc-sidebar-footer {
  padding: 8px 16px; font-size: 11px; color: var(--tc-text-muted);
  margin-top: auto;
}
.tc-sidebar-footer a { color: var(--tc-text-muted); }
.tc-sidebar-footer a:hover { color: var(--tc-purple); }
.tc-sidebar-copy { margin: 4px 0 0; }

/* ── Top Bar ──────────────────────────────────────────────── */
.tc-topbar {
  position: sticky; top: 0;
  background: var(--tc-bg-topbar);
  border-bottom: 1px solid var(--tc-border);
  z-index: 100;
  box-shadow: var(--tc-shadow-sm);
}
.tc-topbar-inner {
  display: flex; align-items: center; gap: 12px;
  height: var(--tc-topbar-h); padding: 0 16px;
}
.tc-topbar-left  { display: flex; align-items: center; gap: 10px; }
.tc-topbar-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.tc-topbar-center { flex: 1; max-width: 480px; margin: 0 auto; }

/* Brand */
.tc-brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; color: var(--tc-text-primary); }
.tc-brand:hover { color: var(--tc-purple); }
.tc-brand-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, var(--tc-purple), #9C6FFF);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 900; flex-shrink: 0;
}

/* Sidebar toggle */
.tc-sidebar-toggle {
  background: none; border: none; cursor: pointer; padding: 8px;
  color: var(--tc-text-secondary); font-size: 18px; border-radius: var(--tc-radius-sm);
  transition: background var(--tc-transition), color var(--tc-transition);
}
.tc-sidebar-toggle:hover { background: var(--tc-bg-hover); color: var(--tc-purple); }

/* Search */
.tc-search-form { width: 100%; }
.tc-search-wrap {
  position: relative; display: flex; align-items: center;
  background: var(--tc-bg-input); border-radius: var(--tc-radius-full);
  border: 1px solid transparent; transition: border var(--tc-transition), box-shadow var(--tc-transition);
}
.tc-search-wrap:focus-within {
  border-color: var(--tc-border-focus);
  box-shadow: 0 0 0 3px rgba(108,99,255,.15);
}
.tc-search-icon { position: absolute; left: 14px; color: var(--tc-text-muted); font-size: 14px; }
.tc-search-input {
  width: 100%; padding: 9px 16px 9px 38px;
  background: transparent; border: none; outline: none;
  font-family: var(--tc-font); font-size: 14px; color: var(--tc-text-primary);
}
.tc-search-input::placeholder { color: var(--tc-text-muted); }

/* Icon button */
.tc-icon-btn {
  position: relative; background: none; border: none; cursor: pointer;
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--tc-text-secondary); font-size: 16px;
  transition: background var(--tc-transition), color var(--tc-transition);
  text-decoration: none;
}
.tc-icon-btn:hover { background: var(--tc-bg-hover); color: var(--tc-purple); }

/* Avatar buttons */
.tc-avatar-btn {
  background: none; border: none; cursor: pointer; padding: 0;
  position: relative; border-radius: 50%; display: block;
}
.tc-verified-dot {
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--tc-purple); border: 2px solid var(--tc-bg-topbar);
}

/* Profile dropdown */
.tc-profile-dropdown .dropdown-menu {
  min-width: 200px; border: 1px solid var(--tc-border);
  border-radius: var(--tc-radius-md); box-shadow: var(--tc-shadow-md);
  background: var(--tc-bg-card); padding: 8px;
}
.tc-profile-dropdown .dropdown-item {
  border-radius: var(--tc-radius-sm); font-size: 14px; padding: 8px 12px;
  color: var(--tc-text-primary); transition: background var(--tc-transition);
}
.tc-profile-dropdown .dropdown-item:hover { background: var(--tc-bg-hover); }

/* Mobile search drawer */
.tc-mobile-search {
  padding: 8px 16px; border-top: 1px solid var(--tc-border);
  background: var(--tc-bg-topbar);
}

/* ── Avatars ──────────────────────────────────────────────── */
.tc-avatar-sm, .tc-avatar-initials-sm {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}
.tc-avatar-initials-sm {
  display: flex; align-items: center; justify-content: center;
  background: var(--tc-purple); color: #fff; font-weight: 700; font-size: 14px;
}
.tc-avatar-md, .tc-avatar-initials-md {
  width: 44px; height: 44px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}
.tc-avatar-initials-md {
  display: flex; align-items: center; justify-content: center;
  background: var(--tc-purple); color: #fff; font-weight: 700; font-size: 18px;
}
.tc-avatar-lg, .tc-avatar-initials-lg {
  width: 80px; height: 80px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}

/* ── Verification Badge ───────────────────────────────────── */
.tc-verified-badge {
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--tc-purple); font-size: 14px;
}
.tc-verified-badge.gold { color: var(--tc-gold); }

/* ── Cards ────────────────────────────────────────────────── */
.tc-card {
  background: var(--tc-bg-card);
  border-radius: var(--tc-radius-md);
  border: 1px solid var(--tc-border);
  box-shadow: var(--tc-shadow-card);
  overflow: hidden;
  margin-bottom: 16px;
}
.tc-card-body { padding: 20px; }
.tc-card-header {
  padding: 16px 20px; border-bottom: 1px solid var(--tc-border);
  font-weight: 600; font-size: 15px; display: flex; align-items: center;
  justify-content: space-between;
}

/* ── Buttons ──────────────────────────────────────────────── */
.tc-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 9px 20px; border-radius: var(--tc-radius-full);
  font-family: var(--tc-font); font-size: 14px; font-weight: 600;
  cursor: pointer; border: 2px solid transparent;
  transition: background var(--tc-transition), color var(--tc-transition),
              border-color var(--tc-transition), box-shadow var(--tc-transition);
  text-decoration: none; line-height: 1;
}
.tc-btn:focus-visible { outline: 3px solid var(--tc-purple); outline-offset: 2px; }
.tc-btn-primary {
  background: var(--tc-purple); color: #fff; border-color: var(--tc-purple);
}
.tc-btn-primary:hover {
  background: var(--tc-purple-dark); border-color: var(--tc-purple-dark); color: #fff;
  box-shadow: 0 4px 12px rgba(108,99,255,.35);
}
.tc-btn-outline {
  background: transparent; color: var(--tc-purple); border-color: var(--tc-purple);
}
.tc-btn-outline:hover { background: var(--tc-purple-light); }
.tc-btn-gold {
  background: linear-gradient(135deg, var(--tc-gold), #FFD700);
  color: #1A1D2E; border-color: transparent;
}
.tc-btn-gold:hover { box-shadow: 0 4px 12px rgba(245,166,35,.4); color: #1A1D2E; }
.tc-btn-ghost { background: var(--tc-bg-hover); color: var(--tc-text-secondary); border-color: transparent; }
.tc-btn-ghost:hover { background: var(--tc-border); }
.tc-btn-danger { background: var(--tc-error); color: #fff; border-color: var(--tc-error); }
.tc-btn-sm { padding: 6px 14px; font-size: 13px; }
.tc-btn-lg { padding: 13px 28px; font-size: 16px; }
.tc-btn-full { width: 100%; }
.tc-btn:disabled { opacity: .5; cursor: not-allowed; }

/* ── Badge ────────────────────────────────────────────────── */
.tc-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--tc-error); color: #fff;
  font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
  border-radius: var(--tc-radius-full); padding: 0 4px;
}

/* ── Newsfeed Layout ──────────────────────────────────────── */
.tc-newsfeed-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 20px 16px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}
@media (min-width: 900px) {
  .tc-newsfeed-layout { grid-template-columns: minmax(0, 2fr) 300px; }
}
@media (min-width: 1100px) {
  .tc-newsfeed-layout { grid-template-columns: minmax(0, 2.5fr) 320px; }
}
.tc-widgets-col { display: none; }
@media (min-width: 900px) { .tc-widgets-col { display: block; } }

/* ── Post composer ────────────────────────────────────────── */
.tc-post-composer { padding: 16px 20px; }
.tc-composer-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.tc-composer-trigger {
  flex: 1; padding: 10px 16px; border-radius: var(--tc-radius-full);
  background: var(--tc-bg-input); border: 1px solid var(--tc-border);
  color: var(--tc-text-muted); text-align: left; cursor: pointer;
  font-family: var(--tc-font); font-size: 14px;
  transition: background var(--tc-transition), border-color var(--tc-transition);
}
.tc-composer-trigger:hover { background: var(--tc-bg-hover); border-color: var(--tc-border-focus); }
.tc-composer-actions { display: flex; gap: 4px; border-top: 1px solid var(--tc-border); padding-top: 12px; }
.tc-composer-action {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px; border: none; background: none; cursor: pointer; border-radius: var(--tc-radius-sm);
  color: var(--tc-text-secondary); font-size: 13px; font-weight: 500;
  transition: background var(--tc-transition), color var(--tc-transition);
}
.tc-composer-action:hover { background: var(--tc-bg-hover); color: var(--tc-purple); }

/* ── Widgets ──────────────────────────────────────────────── */
.tc-widget { padding: 0; }
.tc-widget-title {
  font-size: 15px; font-weight: 700; padding: 16px 20px 12px;
  margin: 0; color: var(--tc-text-primary); border-bottom: 1px solid var(--tc-border);
}

/* ── Profile page ─────────────────────────────────────────── */
.tc-profile-cover {
  position: relative; height: 220px; background: var(--tc-purple-light);
  overflow: hidden;
}
@media (min-width: 768px) { .tc-profile-cover { height: 300px; } }
.tc-profile-cover img { width: 100%; height: 100%; object-fit: cover; }
.tc-profile-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,.35));
}
.tc-profile-header {
  position: relative; padding: 0 20px 20px;
  background: var(--tc-bg-card); border-bottom: 1px solid var(--tc-border);
}
.tc-profile-avatar-wrap {
  position: absolute; top: -52px; left: 20px;
  border: 4px solid var(--tc-bg-card); border-radius: 50%;
}
.tc-profile-avatar {
  width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
  display: block;
}
.tc-profile-info { padding-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.tc-profile-name { font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.tc-profile-username { color: var(--tc-text-muted); font-size: 14px; margin-top: 2px; }
.tc-profile-bio { color: var(--tc-text-secondary); font-size: 14px; margin: 8px 0; max-width: 480px; }
.tc-profile-stats { display: flex; gap: 24px; margin-top: 12px; }
.tc-profile-stat { text-align: center; }
.tc-profile-stat-num { font-size: 18px; font-weight: 700; color: var(--tc-text-primary); }
.tc-profile-stat-label { font-size: 12px; color: var(--tc-text-muted); }

/* ── Forms ────────────────────────────────────────────────── */
.tc-form-group { margin-bottom: 18px; }
.tc-label { display: block; font-size: 13px; font-weight: 600; color: var(--tc-text-secondary); margin-bottom: 6px; }
.tc-input, .tc-select, .tc-textarea {
  width: 100%; padding: 10px 14px;
  border: 1px solid var(--tc-border); border-radius: var(--tc-radius-sm);
  background: var(--tc-bg-input); color: var(--tc-text-primary);
  font-family: var(--tc-font); font-size: 14px;
  transition: border var(--tc-transition), box-shadow var(--tc-transition);
  outline: none;
}
.tc-input:focus, .tc-select:focus, .tc-textarea:focus {
  border-color: var(--tc-border-focus);
  box-shadow: 0 0 0 3px rgba(108,99,255,.15);
}
.tc-textarea { resize: vertical; min-height: 100px; }

/* ── Toast notifications ──────────────────────────────────── */
#tc-toast-container {
  position: fixed; top: calc(var(--tc-topbar-h) + 12px); right: 16px;
  z-index: 9999; display: flex; flex-direction: column; gap: 10px;
  max-width: 360px; width: 100%;
}
.tc-toast {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--tc-radius-md);
  background: var(--tc-bg-card); border: 1px solid var(--tc-border);
  box-shadow: var(--tc-shadow-md); animation: tcSlideIn .25s ease;
}
.tc-toast-success { border-left: 4px solid var(--tc-success); }
.tc-toast-error   { border-left: 4px solid var(--tc-error); }
.tc-toast-info    { border-left: 4px solid var(--tc-info); }
.tc-toast-success .tc-toast-icon { color: var(--tc-success); }
.tc-toast-error   .tc-toast-icon { color: var(--tc-error); }
.tc-toast-info    .tc-toast-icon { color: var(--tc-info); }
.tc-toast-msg { flex: 1; font-size: 14px; }
.tc-toast-close {
  background: none; border: none; cursor: pointer; font-size: 18px;
  color: var(--tc-text-muted); line-height: 1; padding: 0 4px;
}
@keyframes tcSlideIn {
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* ── Mobile bottom nav ────────────────────────────────────── */
.tc-mobile-nav {
  display: flex; position: fixed; bottom: 0; left: 0; right: 0;
  height: 58px; background: var(--tc-bg-card); border-top: 1px solid var(--tc-border);
  z-index: 150; box-shadow: 0 -2px 12px rgba(0,0,0,.08);
}
@media (min-width: 768px) { .tc-mobile-nav { display: none; } }
.tc-mobile-nav-item {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: var(--tc-text-muted); position: relative;
  transition: color var(--tc-transition);
}
.tc-mobile-nav-item:hover,
.tc-mobile-nav-item.active { color: var(--tc-purple); }
.tc-mobile-badge {
  position: absolute; top: 8px; right: 20%;
}

/* ── Footer ───────────────────────────────────────────────── */
.tc-footer {
  border-top: 1px solid var(--tc-border); padding: 20px 16px;
  margin-top: auto;
}
.tc-footer-inner { max-width: 800px; margin: 0 auto; text-align: center; }
.tc-footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-bottom: 10px; }
.tc-footer-links a { font-size: 13px; color: var(--tc-text-muted); }
.tc-footer-links a:hover { color: var(--tc-purple); }
.tc-footer-copy { font-size: 12px; color: var(--tc-text-muted); margin: 0; }

/* ── Admin Panel ──────────────────────────────────────────── */
.tc-admin-layout {
  display: grid; grid-template-columns: 220px 1fr; min-height: 100vh;
}
.tc-admin-sidebar {
  background: var(--tc-bg-sidebar); border-right: 1px solid var(--tc-border);
  padding: 24px 0;
}
.tc-admin-header {
  padding: 16px 24px; border-bottom: 1px solid var(--tc-border);
  font-size: 18px; font-weight: 700;
}
.tc-admin-content { padding: 24px; background: var(--tc-bg); }

/* Stats cards */
.tc-stats-grid {
  display: grid; gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.tc-stat-card {
  background: var(--tc-bg-card); border-radius: var(--tc-radius-md);
  border: 1px solid var(--tc-border); padding: 20px;
  display: flex; align-items: center; gap: 16px;
}
.tc-stat-icon {
  width: 48px; height: 48px; border-radius: var(--tc-radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.tc-stat-icon.purple { background: var(--tc-purple-light); color: var(--tc-purple); }
.tc-stat-icon.gold   { background: #FFF7E6; color: var(--tc-gold); }
.tc-stat-icon.green  { background: #ECFDF5; color: var(--tc-success); }
.tc-stat-icon.red    { background: #FEF2F2; color: var(--tc-error); }
.tc-stat-num   { font-size: 26px; font-weight: 800; line-height: 1; }
.tc-stat-label { font-size: 13px; color: var(--tc-text-muted); margin-top: 4px; }

/* Tables */
.tc-table-wrap { overflow-x: auto; }
.tc-table {
  width: 100%; border-collapse: collapse; font-size: 14px;
}
.tc-table th {
  text-align: left; padding: 12px 16px; font-weight: 600; font-size: 12px;
  color: var(--tc-text-muted); text-transform: uppercase; letter-spacing: .5px;
  border-bottom: 2px solid var(--tc-border); background: var(--tc-bg);
}
.tc-table td { padding: 14px 16px; border-bottom: 1px solid var(--tc-border); vertical-align: middle; }
.tc-table tr:last-child td { border-bottom: none; }
.tc-table tr:hover td { background: var(--tc-bg-hover); }

/* Status pills */
.tc-pill {
  display: inline-flex; align-items: center; padding: 3px 10px;
  border-radius: var(--tc-radius-full); font-size: 12px; font-weight: 600;
}
.tc-pill-green  { background: #ECFDF5; color: #059669; }
.tc-pill-red    { background: #FEF2F2; color: #DC2626; }
.tc-pill-yellow { background: #FFFBEB; color: #D97706; }
.tc-pill-purple { background: var(--tc-purple-light); color: var(--tc-purple); }

/* ── Premium / Pricing ────────────────────────────────────── */
.tc-pricing-grid {
  display: grid; gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  padding: 32px 20px;
}
.tc-pricing-card {
  background: var(--tc-bg-card); border: 2px solid var(--tc-border);
  border-radius: var(--tc-radius-lg); padding: 32px 24px;
  display: flex; flex-direction: column; gap: 16px; position: relative;
  transition: border-color var(--tc-transition), box-shadow var(--tc-transition);
}
.tc-pricing-card.featured {
  border-color: var(--tc-purple);
  box-shadow: 0 0 0 4px rgba(108,99,255,.1), var(--tc-shadow-lg);
}
.tc-pricing-badge {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  background: var(--tc-purple); color: #fff; padding: 4px 16px;
  border-radius: var(--tc-radius-full); font-size: 12px; font-weight: 700;
  white-space: nowrap;
}
.tc-pricing-name  { font-size: 18px; font-weight: 700; }
.tc-pricing-price { font-size: 40px; font-weight: 800; line-height: 1; }
.tc-pricing-price span { font-size: 16px; font-weight: 400; color: var(--tc-text-muted); }
.tc-pricing-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tc-pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.tc-pricing-features li i { color: var(--tc-success); width: 16px; }
.tc-pricing-features li.disabled { color: var(--tc-text-muted); }
.tc-pricing-features li.disabled i { color: var(--tc-text-muted); }

/* ── Ads ──────────────────────────────────────────────────── */
.tc-ad-unit {
  background: var(--tc-bg-card); border: 1px solid var(--tc-border);
  border-radius: var(--tc-radius-md); overflow: hidden;
  margin-bottom: 16px; position: relative;
}
.tc-ad-label {
  position: absolute; top: 8px; right: 8px;
  font-size: 10px; color: var(--tc-text-muted);
  background: var(--tc-bg-hover); padding: 2px 6px;
  border-radius: var(--tc-radius-full); text-transform: uppercase; letter-spacing: .5px;
}
.tc-ad-img { width: 100%; display: block; }
.tc-ad-body { padding: 12px 16px 14px; }
.tc-ad-title { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
.tc-ad-desc  { font-size: 13px; color: var(--tc-text-secondary); margin: 0 0 10px; }

/* ── Utility ──────────────────────────────────────────────── */
.d-none { display: none !important; }
.d-md-none  { display: block; }
@media (min-width: 768px) { .d-md-none { display: none !important; } }
.d-md-block { display: none; }
@media (min-width: 768px) { .d-md-block { display: block !important; } }
.text-center { text-align: center; }
.text-muted  { color: var(--tc-text-muted); }
.mt-0 { margin-top: 0; }
.mb-0 { margin-bottom: 0; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-8  { gap: 8px; }
.gap-12 { gap: 12px; }

/* ── Startup / Landing page ───────────────────────────────── */
.tc-startup-page {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #6C63FF 0%, #9C6FFF 50%, #C4B5FD 100%);
  padding: 40px 20px;
}
.tc-startup-card {
  background: var(--tc-bg-card); border-radius: var(--tc-radius-lg);
  box-shadow: var(--tc-shadow-lg); padding: 40px; width: 100%; max-width: 440px;
}
.tc-startup-logo {
  text-align: center; margin-bottom: 28px;
}
.tc-startup-logo-icon {
  width: 64px; height: 64px; border-radius: 20px;
  background: linear-gradient(135deg, var(--tc-purple), #9C6FFF);
  color: #fff; display: inline-flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 900; margin-bottom: 12px;
}
.tc-startup-logo h1 { font-size: 26px; font-weight: 800; margin: 0; }
.tc-startup-logo p  { color: var(--tc-text-muted); font-size: 14px; margin: 4px 0 0; }

/* ── Page wrapper (non-newsfeed) ──────────────────────────── */
.tc-page-wrap {
  max-width: 860px; margin: 0 auto; padding: 24px 16px;
}
.tc-page-title { font-size: 24px; font-weight: 800; margin: 0 0 20px; }

/* ── Scrollbar ────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--tc-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--tc-text-muted); }

/* ── Animations ───────────────────────────────────────────── */
@keyframes tcFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.tc-animate-in { animation: tcFadeIn .3s ease forwards; }
