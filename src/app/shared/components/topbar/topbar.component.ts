import { Component, inject, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="topbar">
      <div class="topbar-brand">BOOKUR<span>BARBER</span></div>

      <div class="topbar-right">
        @if (notifCount > 0) {
          <button class="notif-btn" (click)="notifClick.emit()">
            🔔<span class="notif-dot"></span>
          </button>
        }

        <div class="profile-wrap" (click)="menuOpen = !menuOpen">
          <div class="profile-pill">
            <div class="p-avatar">{{ initials }}</div>
            <div class="p-info">
              <div class="p-name">{{ auth.user()?.fullName || 'User' }}</div>
              <div class="p-role">{{ auth.user()?.role }}</div>
            </div>
            <div class="p-caret" [class.flipped]="menuOpen">▾</div>
          </div>

          @if (menuOpen) {
            <div class="profile-menu">
              <div class="pm-head">
                <div class="p-avatar p-avatar-lg">{{ initials }}</div>
                <div>
                  <div style="font-weight:700;font-size:13px;line-height:1.3">{{ auth.user()?.fullName || 'User' }}</div>
                  <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-top:2px">{{ auth.user()?.role }}</div>
                </div>
              </div>
              <div class="pm-sep"></div>
              @if (showSettings) {
                <button class="pm-item" (click)="settingsClick.emit(); menuOpen=false">
                  ⚙️ &nbsp;Settings
                </button>
              }
              <button class="pm-item pm-danger" (click)="auth.logout(); menuOpen=false">
                🚪 &nbsp;Logout
              </button>
              <button class="pm-item pm-muted" (click)="auth.logout(true); menuOpen=false">
                📵 &nbsp;Logout all devices
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 58px;
      padding: 0 20px;
      background: rgba(9,9,14,.97);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
    }
    .topbar-brand {
      font-family: 'Unbounded', sans-serif;
      font-size: 15px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .topbar-brand span { color: var(--amber); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    .notif-btn {
      position: relative;
      background: var(--amber-dim);
      border: 1px solid rgba(245,166,35,0.2);
      border-radius: 10px;
      padding: 7px 11px;
      cursor: pointer;
      font-size: 15px;
      line-height: 1;
    }
    .notif-dot {
      position: absolute;
      top: 5px; right: 5px;
      width: 8px; height: 8px;
      background: var(--crimson);
      border-radius: 50%;
      border: 2px solid var(--bg);
    }

    /* Profile wrapper — anchors the dropdown */
    .profile-wrap {
      position: relative;
    }
    .profile-pill {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 5px 10px 5px 5px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--card);
      cursor: pointer;
      transition: border-color .15s;
      user-select: none;
    }
    .profile-pill:hover { border-color: rgba(245,166,35,0.4); }

    .p-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: var(--amber-dim);
      border: 1.5px solid rgba(245,166,35,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; color: var(--amber);
      flex-shrink: 0;
    }
    .p-avatar-lg { width: 38px; height: 38px; font-size: 14px; }

    .p-info { display: flex; flex-direction: column; min-width: 0; }
    .p-name {
      font-size: 13px; font-weight: 700;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 130px;
    }
    .p-role {
      font-size: 9px; color: var(--text3);
      text-transform: uppercase; letter-spacing: .6px;
    }
    .p-caret {
      font-size: 11px; color: var(--text3);
      transition: transform .2s;
      flex-shrink: 0;
    }
    .p-caret.flipped { transform: rotate(180deg); }

    /* Dropdown — anchored right edge to profile pill */
    .profile-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 210px;
      background: var(--card);
      border: 1px solid var(--border2);
      border-radius: 14px;
      padding: 6px;
      box-shadow: 0 20px 60px rgba(0,0,0,.55);
      z-index: 9999;
      animation: fadeUp .18s ease;
    }
    .pm-head {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 8px 12px;
    }
    .pm-sep {
      height: 1px; background: var(--border);
      margin: 0 2px 6px;
    }
    .pm-item {
      display: flex; align-items: center;
      width: 100%; padding: 9px 12px;
      background: none; border: none; border-radius: 8px;
      color: var(--text); font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 600;
      cursor: pointer; text-align: left;
      transition: background .12s;
    }
    .pm-item:hover { background: rgba(255,255,255,.055); }
    .pm-danger { color: var(--crimson) !important; }
    .pm-danger:hover { background: var(--crimson-dim) !important; }
    .pm-muted { color: var(--text3) !important; font-size: 12px !important; }

    @media (max-width: 500px) {
      .p-info, .p-caret { display: none; }
    }
  `]
})
export class TopbarComponent {
  @Input() notifCount = 0;
  @Input() showSettings = false;
  @Output() notifClick    = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  auth     = inject(AuthService);
  menuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('.profile-wrap')) {
      this.menuOpen = false;
    }
  }

  get initials(): string {
    const name = this.auth.user()?.fullName || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
