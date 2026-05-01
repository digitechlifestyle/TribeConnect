<?php header('Content-Type: application/javascript'); ?>
/**
 * TribeConnect — Core JavaScript
 * Version 1.0.0
 */
(function (TC) {
  'use strict';

  /* ── Theme toggle ───────────────────────────────────────── */
  TC.theme = {
    current: localStorage.getItem('tc-theme') || 'light',
    toggle() {
      this.current = this.current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.current);
      localStorage.setItem('tc-theme', this.current);
      const icon = document.getElementById('tc-theme-icon');
      if (icon) {
        icon.className = this.current === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
      }
    },
    init() {
      document.documentElement.setAttribute('data-theme', this.current);
      const btn = document.getElementById('tc-theme-toggle');
      if (btn) btn.addEventListener('click', () => this.toggle());
      const icon = document.getElementById('tc-theme-icon');
      if (icon) icon.className = this.current === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
    }
  };

  /* ── Sidebar toggle (mobile) ────────────────────────────── */
  TC.sidebar = {
    el: null, overlay: null, toggleBtn: null,
    init() {
      this.el        = document.getElementById('tc-sidebar');
      this.overlay   = document.getElementById('tc-overlay');
      this.toggleBtn = document.getElementById('tc-sidebar-toggle');
      if (!this.el) return;

      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => this.toggle());
      }
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }
      // Close on desktop resize
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) this.close(false);
      });
    },
    toggle() {
      this.el.classList.contains('is-open') ? this.close() : this.open();
    },
    open() {
      this.el.classList.add('is-open');
      this.overlay && this.overlay.classList.add('is-visible');
      this.toggleBtn && this.toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    },
    close(restoreScroll = true) {
      this.el.classList.remove('is-open');
      this.overlay && this.overlay.classList.remove('is-visible');
      this.toggleBtn && this.toggleBtn.setAttribute('aria-expanded', 'false');
      if (restoreScroll) document.body.style.overflow = '';
    }
  };

  /* ── Mobile search ──────────────────────────────────────── */
  TC.mobileSearch = {
    init() {
      const btn    = document.querySelector('.tc-mobile-search-btn');
      const drawer = document.getElementById('tc-mobile-search');
      if (!btn || !drawer) return;
      btn.addEventListener('click', () => {
        const isHidden = drawer.hasAttribute('hidden');
        if (isHidden) {
          drawer.removeAttribute('hidden');
          drawer.querySelector('input') && drawer.querySelector('input').focus();
        } else {
          drawer.setAttribute('hidden', '');
        }
      });
    }
  };

  /* ── Toast notifications ────────────────────────────────── */
  TC.toast = {
    container: null,
    init() {
      this.container = document.getElementById('tc-toast-container');
    },
    show(message, type = 'info', duration = 4000) {
      if (!this.container) return;
      const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
      const toast = document.createElement('div');
      toast.className = `tc-toast tc-toast-${type}`;
      toast.innerHTML = `
        <span class="tc-toast-icon"><i class="fa ${icons[type] || icons.info}"></i></span>
        <span class="tc-toast-msg">${TC.utils.escapeHtml(message)}</span>
        <button class="tc-toast-close" aria-label="Close">&times;</button>
      `;
      toast.querySelector('.tc-toast-close').addEventListener('click', () => this._remove(toast));
      this.container.appendChild(toast);
      if (duration > 0) setTimeout(() => this._remove(toast), duration);
    },
    _remove(toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      toast.style.transition = 'opacity .2s, transform .2s';
      setTimeout(() => toast.remove(), 220);
    }
  };

  /* ── System messages (auto-dismiss) ─────────────────────── */
  TC.systemMessages = {
    init() {
      const container = document.getElementById('tc-system-messages');
      if (!container) return;
      // Auto-dismiss after 5s
      setTimeout(() => {
        container.style.opacity = '0';
        container.style.transition = 'opacity .5s';
        setTimeout(() => container.remove(), 500);
      }, 5000);
      // Manual close
      container.querySelectorAll('.tc-toast-close').forEach(btn => {
        btn.addEventListener('click', () => {
          const toast = btn.closest('.tc-toast');
          if (toast) toast.remove();
        });
      });
    }
  };

  /* ── Loading bar ────────────────────────────────────────── */
  TC.loadingBar = {
    init() {
      document.body.classList.add('tc-loading');
      window.addEventListener('load', () => {
        document.body.classList.remove('tc-loading');
        document.body.classList.add('tc-loaded');
        setTimeout(() => document.body.classList.remove('tc-loaded'), 800);
      });
    }
  };

  /* ── Active nav highlighting ────────────────────────────── */
  TC.activeNav = {
    init() {
      const path = window.location.pathname;
      document.querySelectorAll('.tc-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && path === href) link.classList.add('active');
      });
      document.querySelectorAll('.tc-mobile-nav-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href && path === href) link.classList.add('active');
      });
    }
  };

  /* ── Post composer expand ────────────────────────────────── */
  TC.composer = {
    init() {
      const trigger = document.getElementById('tc-composer-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        // Open OSSN wall post modal / expand inline
        if (typeof ossn_wall !== 'undefined') ossn_wall.openComposer();
      });
    }
  };

  /* ── Utilities ──────────────────────────────────────────── */
  TC.utils = {
    escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },
    formatNumber(n) {
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return String(n);
    },
    timeAgo(dateStr) {
      const secs = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (secs < 60)   return secs + 's';
      if (secs < 3600) return Math.floor(secs / 60) + 'm';
      if (secs < 86400)return Math.floor(secs / 3600) + 'h';
      return Math.floor(secs / 86400) + 'd';
    }
  };

  /* ── Bootstrap ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    TC.loadingBar.init();
    TC.theme.init();
    TC.sidebar.init();
    TC.mobileSearch.init();
    TC.toast.init();
    TC.systemMessages.init();
    TC.activeNav.init();
    TC.composer.init();
  });

}(window.TC = window.TC || {}));
