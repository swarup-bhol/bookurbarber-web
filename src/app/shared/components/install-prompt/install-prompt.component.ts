import { Component, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Android install prompt -->
    @if (showAndroid()) {
      <div style="position:fixed;bottom:90px;left:12px;right:12px;z-index:999;
        background:var(--card);border:1px solid var(--amber);border-radius:16px;
        padding:16px;display:flex;align-items:center;gap:12px;
        box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:slideUp .3s ease">
        <div style="font-size:36px">✂️</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px;margin-bottom:2px">Install BookurBarber App</div>
          <div style="font-size:11px;color:var(--text2)">Add to home screen for the best experience</div>
        </div>
        <button class="btn btn-amber btn-sm" (click)="installAndroid()">Install</button>
        <button (click)="showAndroid.set(false)"
          style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;padding:4px">✕</button>
      </div>
    }

    <!-- iOS install guide -->
    @if (showIos()) {
      <div style="position:fixed;bottom:90px;left:12px;right:12px;z-index:999;
        background:var(--card);border:1px solid var(--border2);border-radius:16px;
        padding:16px;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:slideUp .3s ease">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-weight:700;font-size:13px">📲 Install BookurBarber on iPhone</div>
          <button (click)="showIos.set(false)"
            style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text2)">
            <span style="background:var(--card2);padding:6px 10px;border-radius:8px;font-size:16px">⬆️</span>
            <span>Tap the <b style="color:var(--text1)">Share</b> button in Safari</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text2)">
            <span style="background:var(--card2);padding:6px 10px;border-radius:8px;font-size:16px">➕</span>
            <span>Tap <b style="color:var(--text1)">Add to Home Screen</b></span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text2)">
            <span style="background:var(--card2);padding:6px 10px;border-radius:8px;font-size:16px">✅</span>
            <span>Tap <b style="color:var(--text1)">Add</b> — done!</span>
          </div>
        </div>
        <!-- Arrow pointing to share button -->
        <div style="text-align:center;margin-top:10px;font-size:11px;color:var(--amber)">
          ↓ Share button is at the bottom of Safari
        </div>
      </div>
    }
  `
})
export class InstallPromptComponent implements OnInit {
  showAndroid = signal(false);
  showIos     = signal(false);

  private deferredPrompt: any = null;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt = e;
    // Show after 3 seconds
    setTimeout(() => {
      if (!this.isInstalled()) this.showAndroid.set(true);
    }, 3000);
  }

  ngOnInit() {
    // iOS detection
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    const dismissed = localStorage.getItem('ios_prompt_dismissed');

    if (isIos && !isInStandaloneMode && !dismissed) {
      setTimeout(() => this.showIos.set(true), 4000);
    }
  }

  async installAndroid() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.showAndroid.set(false);
    }
    this.deferredPrompt = null;
  }

  private isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}
