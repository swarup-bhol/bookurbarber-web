import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PolicyPageComponent } from '../policy/policy-page.component';
import { authModalState } from '../../app.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FooterComponent, PolicyPageComponent],
  template: `
    @if (policyType()) {
      <app-policy-page [type]="policyType()!" (back)="policyType.set(null)"></app-policy-page>
    } @else {

    <div class="landing" style="display:flex;flex-direction:column;min-height:100vh;min-height:100dvh">
      <div class="landing-noise"></div>
      <div class="landing-glow-1"></div>
      <div class="landing-glow-2"></div>
      <div class="landing-glow-3"></div>

      <!-- NAV -->
      <nav class="landing-nav">
        <div class="brand"><span class="b-amber">BOOK</span>UR<span class="b-amber">BARBER</span></div>
        <div class="nav-btns">
          <button class="btn btn-ghost btn-sm" (click)="openAuth('barber')">For Barbers</button>
          <button class="btn btn-amber btn-sm" (click)="openAuth('customer')">Book Now</button>
        </div>
      </nav>

      <!-- HERO -->
      <section class="landing-hero" style="flex:1">
        <div class="hero-eyebrow anim-fade-up">
          <span>✂️</span> INDIA'S SMARTEST BARBERSHOP PLATFORM
        </div>
        <h1 class="hero-title anim-fade-up-1">
          <div class="hero-title-line1">SKIP THE</div>
          <div class="hero-title-line2">QUEUE.</div>
          <div class="hero-title-line1" style="font-size:0.55em;letter-spacing:-1px;margin-top:0.1em">BOOK YOUR CHAIR</div>
        </h1>
        <p class="hero-sub anim-fade-up-2">
          Choose your barber, pick your exact time slot, and walk in when it's your turn.
          Zero wait. Pure style.
        </p>
        <div class="hero-btns anim-fade-up-3">
          <button class="btn btn-amber btn-lg" (click)="openAuth('customer')">🎯 Book Appointment</button>
          <button class="btn btn-outline btn-lg" (click)="openAuth('barber')">✂️ Register Your Shop</button>
        </div>
        <div class="hero-stats anim-fade-up-4">
          <div class="stat-item">
            <div class="hero-stat-val">500+</div>
            <div class="hero-stat-label">Bookings/mo</div>
          </div>
          <div class="stat-item">
            <div class="hero-stat-val">50+</div>
            <div class="hero-stat-label">Partner Shops</div>
          </div>
          <div class="stat-item">
            <div class="hero-stat-val">4.8&#9733;</div>
            <div class="hero-stat-label">Avg Rating</div>
          </div>
          <div class="stat-item">
            <div class="hero-stat-val">Zero</div>
            <div class="hero-stat-label">Wait Time</div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="landing-features">
        <div class="features-title">WHY BOOKURBARBER?</div>
        <div class="features-sub">Everything you need for a frictionless barbershop experience</div>
        <div class="features-grid">
          @for (f of features; track f.title) {
            <div class="feature-card">
              <div class="feature-icon">{{ f.icon }}</div>
              <div class="feature-title">{{ f.title }}</div>
              <div class="feature-desc">{{ f.desc }}</div>
            </div>
          }
        </div>
      </section>

      <!-- ROLE CARDS -->
      <section class="role-section">
        <div class="features-title" style="margin-bottom:12px">GET STARTED</div>
        <div class="features-sub">Choose how you want to use BookurBarber</div>
        <div class="role-cards-row">
          @for (role of roles; track role.title) {
            <div class="role-entry-card" (click)="openAuth(role.key)">
              <div class="rec-banner" [style.background]="role.bg">{{ role.emoji }}</div>
              <div class="rec-body">
                <div class="rec-title">{{ role.title }}</div>
                <div class="rec-desc">{{ role.desc }}</div>
                <div class="rec-cta">{{ role.cta }} →</div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- APP DOWNLOAD SECTION -->
      <section class="app-dl-section">
        <div class="app-dl-inner">
          <div class="app-dl-left">
            <div class="app-dl-badge">📱 MOBILE APP</div>
            <h2 class="app-dl-title">Book on the go.<br>Your barber, <span class="app-dl-amber">anywhere.</span></h2>
            <p class="app-dl-sub">Get the full BookurBarber experience on your phone — instant bookings, live slot updates, WhatsApp confirmations, all in your pocket.</p>
            <div class="app-dl-btns">
              <a class="app-dl-btn" href="https://play.google.com/store/apps/details?id=app.bookurbarber" target="_blank" rel="noopener">
                <div class="app-dl-btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.18 23.76c.3.16.64.2.98.12l12.49-7.21-2.79-2.8-10.68 9.89zM.54 1.18C.2 1.55 0 2.1 0 2.82v18.36c0 .72.2 1.27.55 1.64l.09.08 10.28-10.28v-.24L.63 1.1l-.09.08zM20.3 10.7l-2.66-1.54-3.14 3.14 3.14 3.14 2.67-1.54c.76-.44.76-1.16-.01-1.6v-.6zM3.18.24L15.67 7.45l-2.79 2.8L2.2.36c.29-.2.68-.23.98-.12z"/>
                  </svg>
                </div>
                <div>
                  <div class="app-dl-btn-sub">GET IT ON</div>
                  <div class="app-dl-btn-name">Google Play</div>
                </div>
              </a>
              <a class="app-dl-btn" href="https://apps.apple.com/app/bookurbarber" target="_blank" rel="noopener">
                <div class="app-dl-btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div>
                  <div class="app-dl-btn-sub">DOWNLOAD ON THE</div>
                  <div class="app-dl-btn-name">App Store</div>
                </div>
              </a>
            </div>
            <div class="app-dl-note">✨ Free to download · No subscription required</div>
          </div>
          <div class="app-dl-right">
            <div class="app-dl-phone">
              <div class="app-dl-screen">
                <div class="app-dl-screen-brand"><span class="app-dl-amber">BOOK</span>UR<span class="app-dl-amber">BARBER</span></div>
                <div class="app-dl-screen-mock">
                  <div class="mock-row">
                    <div class="mock-av">✂️</div>
                    <div class="mock-info">
                      <div class="mock-name">Koramangala Cuts</div>
                      <div class="mock-detail">2 slots left · 09:30 AM</div>
                    </div>
                    <div class="mock-price">₹250</div>
                  </div>
                  <div class="mock-row">
                    <div class="mock-av">💈</div>
                    <div class="mock-info">
                      <div class="mock-name">Fade Masters</div>
                      <div class="mock-detail">Open now · 5 slots</div>
                    </div>
                    <div class="mock-price">₹350</div>
                  </div>
                  <div class="mock-row">
                    <div class="mock-av">👑</div>
                    <div class="mock-info">
                      <div class="mock-name">Royal Grooming</div>
                      <div class="mock-detail">⭐ 4.9 · Indiranagar</div>
                    </div>
                    <div class="mock-price">₹599</div>
                  </div>
                  <div class="mock-book-btn">🎯 Book Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <app-footer (policyClick)="policyType.set($event)"></app-footer>
    </div>
    }
  `,
  styles: [`
    .landing-nav { position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px;background:rgba(6,6,10,0.95);border-bottom:1px solid var(--border); }
    .brand { font-family:'Unbounded',sans-serif;font-size:18px;font-weight:900;letter-spacing:0px;color:var(--text) }
    .b-amber { color:var(--amber) }
    .nav-btns { display:flex;align-items:center;gap:8px }
    .landing-hero { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 60px;text-align:center; }
    .hero-eyebrow { display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:30px;border:1px solid rgba(245,166,35,0.25);background:var(--amber-dim);font-size:12px;font-weight:600;color:var(--amber);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:28px; }
    .hero-title { font-family:'Unbounded',sans-serif;font-size:clamp(40px,7vw,88px);font-weight:900;line-height:0.95;letter-spacing:-3px;margin-bottom:24px; }
    .hero-title-line1 { color:var(--text); }
    .hero-title-line2 { color:transparent;background:linear-gradient(135deg,var(--amber),var(--amber2),#ff9500);-webkit-background-clip:text;background-clip:text; }
    .hero-sub { font-size:clamp(15px,2vw,18px);color:var(--text2);max-width:520px;line-height:1.7;margin-bottom:48px; }
    .hero-btns { display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:64px; }
    /* ── Stats strip ── */
    .hero-stats {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: min(580px, calc(100vw - 48px));
      margin: 0 auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    .stat-item {
      flex: 1;
      text-align: center;
      padding: 20px 8px;
      border-right: 1px solid var(--border);
    }
    .stat-item:last-child { border-right: none; }
    .hero-stat-val { font-family:'Unbounded',sans-serif;font-size:clamp(16px,2.5vw,26px);font-weight:900;color:var(--amber); }
    .hero-stat-label { font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-top:4px; }
    .hero-stat-sep { display:none; }
    .landing-features { padding:80px 48px;position:relative;z-index:1;border-top:1px solid var(--border); }
    .features-title { font-family:'Unbounded',sans-serif;font-size:clamp(24px,4vw,40px);font-weight:900;text-align:center;margin-bottom:12px; }
    .features-sub { text-align:center;color:var(--text2);margin-bottom:56px; }
    .features-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto; }
    .feature-card { background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:28px;transition:all .3s;position:relative;overflow:hidden; }
    .feature-card::before { content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;background:linear-gradient(135deg,var(--amber-dim),transparent); }
    .feature-card:hover { border-color:rgba(245,166,35,0.25);transform:translateY(-4px);box-shadow:var(--shadow-md); }
    .feature-card:hover::before { opacity:1; }
    .feature-icon { width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:18px;background:var(--amber-dim);border:1px solid rgba(245,166,35,0.18);position:relative;z-index:1; }
    .feature-title { font-family:'Unbounded',sans-serif;font-size:14px;font-weight:700;margin-bottom:8px;position:relative;z-index:1; }
    .feature-desc { font-size:13px;color:var(--text2);line-height:1.65;position:relative;z-index:1; }
    .role-section { padding:80px 48px;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);position:relative;z-index:1; }
    .role-cards-row { display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:0 auto; }
    .role-entry-card { border-radius:var(--r);overflow:hidden;cursor:pointer;transition:all .3s;border:2px solid var(--border);background:var(--card); }
    .role-entry-card:hover { border-color:var(--amber);transform:translateY(-6px);box-shadow:0 20px 60px rgba(245,166,35,0.15); }
    .rec-banner { height:90px;display:flex;align-items:center;justify-content:center;font-size:42px;position:relative;overflow:hidden; }
    .rec-body { padding:20px; }
    .rec-title { font-family:'Unbounded',sans-serif;font-size:15px;font-weight:700;margin-bottom:6px; }
    .rec-desc { font-size:12px;color:var(--text2);line-height:1.6; }
    .rec-cta { margin-top:14px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--amber); }
    /* ── App Download Section ─────────────────────────────── */
    .app-dl-section { padding:80px 48px;background:var(--bg);border-top:1px solid var(--border);position:relative;z-index:1;overflow:hidden; }
    .app-dl-section::before { content:'';position:absolute;top:-120px;right:-120px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(245,166,35,0.07) 0%,transparent 70%);pointer-events:none; }
    .app-dl-inner { max-width:1000px;margin:0 auto;display:flex;align-items:center;gap:60px; }
    .app-dl-left { flex:1;min-width:0; }
    .app-dl-right { flex-shrink:0;display:flex;justify-content:center; }
    .app-dl-badge { display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:30px;border:1px solid rgba(245,166,35,0.3);background:var(--amber-dim);font-size:11px;font-weight:700;color:var(--amber);letter-spacing:1.5px;margin-bottom:20px; }
    .app-dl-title { font-family:'Unbounded',sans-serif;font-size:clamp(24px,3.5vw,40px);font-weight:900;line-height:1.15;margin-bottom:16px; }
    .app-dl-amber { color:var(--amber); }
    .app-dl-sub { font-size:15px;color:var(--text2);line-height:1.7;margin-bottom:32px;max-width:440px; }
    .app-dl-btns { display:flex;gap:14px;flex-wrap:wrap;margin-bottom:20px; }
    .app-dl-btn { display:flex;align-items:center;gap:12px;padding:12px 22px;background:var(--card);border:1.5px solid var(--border2);border-radius:14px;text-decoration:none;color:var(--text);transition:all .2s;min-width:160px; }
    .app-dl-btn:hover { border-color:var(--amber);background:var(--amber-dim);transform:translateY(-2px);box-shadow:0 8px 30px rgba(245,166,35,0.15); }
    .app-dl-btn-icon { width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .app-dl-btn-sub { font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase; }
    .app-dl-btn-name { font-family:'Unbounded',sans-serif;font-size:14px;font-weight:700;margin-top:1px; }
    .app-dl-note { font-size:12px;color:var(--text3); }
    /* Phone mockup */
    .app-dl-phone { width:220px;height:420px;background:var(--card);border:2px solid var(--border2);border-radius:36px;padding:16px;box-shadow:0 40px 80px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.04);position:relative; }
    .app-dl-phone::before { content:'';position:absolute;top:10px;left:50%;transform:translateX(-50%);width:60px;height:4px;background:var(--border2);border-radius:2px; }
    .app-dl-screen { height:100%;display:flex;flex-direction:column;padding-top:16px; }
    .app-dl-screen-brand { font-family:'Unbounded',sans-serif;font-size:10px;font-weight:900;text-align:center;margin-bottom:14px;letter-spacing:.5px; }
    .app-dl-screen-mock { display:flex;flex-direction:column;gap:10px; }
    .mock-row { display:flex;align-items:center;gap:8px;background:var(--surface);border-radius:10px;padding:8px 10px; }
    .mock-av { font-size:18px;flex-shrink:0; }
    .mock-info { flex:1;min-width:0; }
    .mock-name { font-size:10px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .mock-detail { font-size:9px;color:var(--text3);margin-top:1px; }
    .mock-price { font-size:11px;font-weight:800;color:var(--amber);flex-shrink:0; }
    .mock-book-btn { margin-top:6px;background:var(--amber);color:#000;font-weight:800;font-size:11px;text-align:center;padding:10px;border-radius:10px; }

        @media(max-width:760px){
      .features-grid,.role-cards-row { grid-template-columns:1fr; }
      .landing-features,.role-section,.app-dl-section { padding:48px 18px; }
      .landing-nav { padding:0 16px; }
      .app-dl-inner { flex-direction:column;gap:40px; }
      .app-dl-right { width:100%; }
      .app-dl-phone { width:100%;max-width:300px;height:380px; }
      /* Download buttons — full width stacked on mobile */
      .app-dl-btns { flex-direction:column; }
      .app-dl-btn { width:100%;box-sizing:border-box; }
    }
    @media(max-width:560px){
      .hero-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: calc(100% - 32px);
        border-radius: 14px;
      }
      /* Restore borders for grid layout */
      .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
      .stat-item:nth-child(1),
      .stat-item:nth-child(2) { border-bottom: 1px solid var(--border); }
      .stat-item:nth-child(3),
      .stat-item:nth-child(4) { border-bottom: none; }
      .stat-item:nth-child(odd) { border-right: 1px solid var(--border); }
      .hero-stat-val { font-size: 22px; }
      .hero-stat-label { font-size: 9px; }
    }
  `]
})
export class LandingComponent {
  auth = inject(AuthService);
  router = inject(Router);
  authRole = authModalState.role;
  policyType = signal<string | null>(null);

  stats = [
    { val: '500+', label: 'Bookings/month' },
    { val: '50+',  label: 'Partner Shops' },
    { val: '4.8★', label: 'Avg Rating' },
    { val: '0',    label: 'Queue Time' },
  ];

  features = [
    { icon: '📅', title: 'INSTANT BOOKING',   desc: 'Book your exact slot in seconds. No calls, no waiting, no uncertainty.' },
    { icon: '💬', title: 'WHATSAPP UPDATES',  desc: 'Get real-time booking confirmations and reminders on WhatsApp.' },
    { icon: '💺', title: 'SEAT-AWARE SLOTS',  desc: 'Multi-seat shops show real availability. Never get double-booked.' },
    { icon: '👤', title: 'PICK YOUR BARBER',  desc: 'Choose your favourite staff member and see their live availability.' },
    { icon: '📊', title: 'LIVE ANALYTICS',    desc: 'Track revenue, bookings, ratings and commissions in real-time.' },
    { icon: '📍', title: 'NEARBY SHOPS',      desc: 'Find barbershops near you on a live map with distance badges.' },
  ];

  roles = [
    { key: 'customer' as const, emoji: '💈', title: 'BOOK A CUT',     bg: 'linear-gradient(135deg,#1a1200,#0d0d1a)', desc: 'Browse nearby barbershops, pick a time and walk in without waiting.', cta: 'Book Now' },
    { key: 'barber'   as const, emoji: '✂️', title: 'LIST YOUR SHOP', bg: 'linear-gradient(135deg,#0f0a1a,#0d0d1a)', desc: 'Accept bookings, manage your schedule and grow your barbershop business.', cta: 'Get Started' },
    { key: 'admin'    as const, emoji: '👑', title: 'ADMIN PANEL',    bg: 'linear-gradient(135deg,#1a0f00,#0d0a00)', desc: 'Manage all shops, approve registrations and monitor platform health.', cta: 'Admin Login' },
  ];

  openAuth(role: 'customer' | 'barber' | 'admin'): void {
    if (this.auth.isLoggedIn()) { this.redirectByRole(); return; }
    this.authRole.set(role);
  }

  private redirectByRole(): void {
    if (this.auth.isAdmin())    this.router.navigate(['/admin']);
    else if (this.auth.isBarber()) this.router.navigate(['/barber']);
    else this.router.navigate(['/customer']);
  }
}
