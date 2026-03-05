import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ShopService } from '../../core/services/shop.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastService } from '../../core/services/toast.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ShopResponse, BookingResponse, DashboardStats } from '../../core/models/models';

type Tab = 'overview' | 'shops' | 'bookings' | 'revenue';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent, BadgeComponent],
  template: `
    <div style="display:flex;flex-direction:column;min-height:100vh">
      <app-topbar></app-topbar>

      <div class="shell" style="flex:1">

        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sb-sec">Admin Panel</div>
          @for (n of nav; track n.tab) {
            <button class="sb-item" [class.on]="tab() === n.tab" (click)="tab.set(n.tab)">
              <span class="sb-icon">{{ n.icon }}</span>{{ n.label }}
              @if (n.tab === 'shops' && pendingShops() > 0) {
                <span class="sb-badge">{{ pendingShops() }}</span>
              }
            </button>
          }
          <div class="sb-footer">
            <button class="sb-item" (click)="auth.logout()">🚪 Logout</button>
          </div>
        </aside>

        <main class="main">
          @if (tab() === 'overview')  { <ng-container *ngTemplateOutlet="overviewTpl"></ng-container> }
          @if (tab() === 'shops')     { <ng-container *ngTemplateOutlet="shopsTpl"></ng-container> }
          @if (tab() === 'bookings')  { <ng-container *ngTemplateOutlet="bookingsTpl"></ng-container> }
          @if (tab() === 'revenue')   { <ng-container *ngTemplateOutlet="revenueTpl"></ng-container> }
        </main>
      </div>

      <nav class="mobile-nav">
        @for (n of nav; track n.tab) {
          <button class="mni" [class.on]="tab() === n.tab" (click)="tab.set(n.tab)">
            @if (n.tab === 'shops' && pendingShops() > 0) { <span class="mni-badge">{{ pendingShops() }}</span> }
            <span class="mni-icon">{{ n.icon }}</span>{{ n.label }}
          </button>
        }
      </nav>
    </div>

    <!-- ══ Overview ══ -->
    <ng-template #overviewTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-title">Platform Overview 👑</div>
          <div class="ph-sub">{{ todayDate }}</div>
        </div>

        <div class="sg">
          <div class="sc"><div class="sc-icon">🏪</div><div class="sc-val">{{ stats()?.totalShops || 0 }}</div><div class="sc-label">Total Shops</div><div class="sc-chip chip-g">{{ stats()?.activeShops || 0 }} active</div></div>
          <div class="sc"><div class="sc-icon">⏳</div><div class="sc-val">{{ stats()?.pendingShops || 0 }}</div><div class="sc-label">Pending</div>@if ((stats()?.pendingShops||0)>0){<div class="sc-chip chip-y">Needs action</div>}</div>
          <div class="sc"><div class="sc-icon">👤</div><div class="sc-val">{{ stats()?.totalCustomers || 0 }}</div><div class="sc-label">Customers</div></div>
          <div class="sc"><div class="sc-icon">📅</div><div class="sc-val">{{ stats()?.totalBookings || 0 }}</div><div class="sc-label">Bookings</div></div>
        </div>

        <div class="g2" style="margin-bottom:14px">
          <div class="sc"><div class="sc-icon">💰</div><div class="sc-val">₹{{ stats()?.totalRevenue | number:'1.0-0' }}</div><div class="sc-label">Gross Revenue</div><div class="sc-chip chip-g">All time</div></div>
          <div class="sc"><div class="sc-icon">🏢</div><div class="sc-val">₹{{ stats()?.totalCommission | number:'1.0-0' }}</div><div class="sc-label">Commission</div><div class="sc-chip chip-b">10%</div></div>
        </div>

        @if (pendingShops() > 0) {
          <div class="card">
            <div class="ch">
              <div class="ct">⏳ Awaiting Approval</div>
              <button class="btn btn-ghost-amber btn-sm" (click)="tab.set('shops')">View all →</button>
            </div>
            @for (s of pendingShopsPreview(); track s.id) {
              <div class="admin-shop-row">
                <div style="font-size:26px">{{ s.emoji || '✂️' }}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;font-size:14px">{{ s.shopName }}</div>
                  <div style="font-size:11px;color:var(--text3)">{{ s.ownerName }} · {{ s.city }}</div>
                </div>
                <button class="btn btn-emerald btn-sm" (click)="approve(s.id)">✓ Approve</button>
              </div>
            }
          </div>
        }
      </div>
    </ng-template>

    <!-- ══ Shops ══ -->
    <ng-template #shopsTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-row">
            <div>
              <div class="ph-title">All Shops</div>
              <div class="ph-sub">{{ filteredShops().length }} shops</div>
            </div>
          </div>
        </div>

        <!-- Filter pills -->
        <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">
          @for (f of shopFilters; track f.val) {
            <button class="area-pill" [class.on]="shopFilter() === f.val" (click)="shopFilter.set(f.val)">{{ f.label }}</button>
          }
        </div>

        <!-- Shop cards grid -->
        <div style="display:flex;flex-direction:column;gap:10px">
          @for (s of pagedShops; track s.id) {
            <div class="admin-card">
              <div class="admin-card-left">
                <div class="admin-shop-emoji">{{ s.emoji || '✂️' }}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
                    <div style="font-family:'Unbounded',sans-serif;font-size:14px;font-weight:700">{{ s.shopName }}</div>
                    <span class="badge" [class]="s.plan === 'PRO' ? 'bv' : 'bm'" style="font-size:10px">{{ s.plan || 'FREE' }}</span>
                    <app-badge [status]="s.status"></app-badge>
                  </div>
                  <div style="font-size:12px;color:var(--text3);margin-bottom:4px">
                    📍 {{ s.area ? s.area + ', ' : '' }}{{ s.city }}
                  </div>
                  <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--text2)">
                    <span>👤 {{ s.ownerName }}</span>
                    <span style="color:var(--text3)">{{ s.ownerEmail }}</span>
                  </div>
                </div>
              </div>
              <div class="admin-card-right">
                <div style="text-align:right;margin-bottom:8px">
                  <div style="font-size:11px;color:var(--text3)">Bookings</div>
                  <div style="font-family:'Unbounded',sans-serif;font-size:18px;font-weight:700">{{ s.totalBookings || 0 }}</div>
                </div>
                <div style="text-align:right;margin-bottom:10px">
                  <div style="font-size:11px;color:var(--text3)">Revenue</div>
                  <div style="font-family:'Unbounded',sans-serif;font-size:16px;font-weight:700;color:var(--amber)">₹{{ (s.monthlyRevenue || 0) | number:'1.0-0' }}</div>
                </div>
                <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap">
                  @if (s.status === 'PENDING')  { <button class="btn btn-emerald btn-sm" (click)="approve(s.id)">✓ Approve</button> }
                  @if (s.status === 'ACTIVE')   { <button class="btn btn-crimson btn-sm" (click)="disable(s.id)">Disable</button> }
                  @if (s.status === 'DISABLED') { <button class="btn btn-emerald btn-sm" (click)="enable(s.id)">Enable</button> }
                  <button class="btn btn-ghost-amber btn-sm" (click)="openCommission(s)">% Fee</button>
                </div>
              </div>
            </div>
          }
        </div>

        @if (hasMoreShops) {
          <div style="text-align:center;padding:16px 0 4px">
            <button class="btn btn-outline btn-sm" (click)="loadMoreShops()">
              Load more · {{ filteredShops().length - pagedShops.length }} more shops
            </button>
          </div>
        }
        @if (filteredShops().length === 0) {
          <div class="empty"><div class="ei">🏪</div><div class="et">No shops found</div></div>
        }
      </div>

      <!-- Commission modal -->
      @if (commissionShop()) {
        <div class="mo" (click)="commissionShop.set(null)">
          <div class="mb" style="max-width:360px" (click)="$event.stopPropagation()">
            <div class="mh"><div class="mt">Set Commission — {{ commissionShop()!.shopName }}</div><button class="mx" (click)="commissionShop.set(null)">×</button></div>
            <div class="mbody">
              <div class="fg">
                <label class="fl">Commission % (current: {{ commissionShop()!.commissionPercent || 10 }}%)</label>
                <input class="fi" type="number" min="0" max="30" [(ngModel)]="newCommission">
              </div>
            </div>
            <div class="mfoot">
              <button class="btn btn-outline btn-sm" (click)="commissionShop.set(null)">Cancel</button>
              <button class="btn btn-amber btn-sm" (click)="saveCommission()">Save</button>
            </div>
          </div>
        </div>
      }
    </ng-template>

    <!-- ══ Bookings ══ -->
    <ng-template #bookingsTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-row">
            <div>
              <div class="ph-title">All Bookings</div>
              <div class="ph-sub">{{ filteredBookings().length }} total</div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">
          @for (f of bkFilters; track f.val) {
            <button class="area-pill" [class.on]="bkFilter() === f.val" (click)="bkFilter.set(f.val)">{{ f.label }}</button>
          }
        </div>

        <div style="display:flex;flex-direction:column;gap:8px">
          @for (b of pagedBookings; track b.id) {
            <div class="admin-bk-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
                <div style="font-weight:700;font-size:14px">{{ b.customerName }}</div>
                <div style="font-size:11px;color:var(--text3)">{{ b.customerPhone }}</div>
                <app-badge [status]="b.status"></app-badge>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px 16px;font-size:12px;color:var(--text2)">
                <div>🏪 <span style="color:var(--text)">{{ b.shopName }}</span></div>
                <div>✂️ <span style="color:var(--text)">{{ b.servicesSnapshot }}</span></div>
                <div>📅 <span style="color:var(--text)">{{ b.bookingDate }}</span></div>
                <div>⏰ <span style="color:var(--text)">{{ b.slotTime }}</span></div>
                @if (b.employeeName) { <div>👤 <span style="color:var(--text)">{{ b.employeeName }}</span></div> }
              </div>
              <div style="margin-top:10px;display:flex;justify-content:flex-end">
                <div style="font-family:'Unbounded',sans-serif;font-size:16px;font-weight:700;color:var(--amber)">₹{{ b.totalAmount }}</div>
              </div>
            </div>
          }
        </div>

        @if (filteredBookings().length === 0) {
          <div class="empty"><div class="ei">📅</div><div class="et">No bookings found</div></div>
        }
      </div>
    </ng-template>

    <!-- ══ Revenue ══ -->
    <ng-template #revenueTpl>
      <div class="page anim-fade-up">
        <div class="ph"><div class="ph-title">Revenue Analytics 📊</div></div>
        <div class="sg">
          <div class="sc"><div class="sc-icon">💰</div><div class="sc-val">₹{{ stats()?.totalRevenue | number:'1.0-0' }}</div><div class="sc-label">Gross Revenue</div><div class="sc-chip chip-g">All time</div></div>
          <div class="sc"><div class="sc-icon">🏢</div><div class="sc-val">₹{{ stats()?.totalCommission | number:'1.0-0' }}</div><div class="sc-label">Platform Earnings</div><div class="sc-chip chip-b">10% commission</div></div>
          <div class="sc"><div class="sc-icon">✂️</div><div class="sc-val">₹{{ stats()?.barberEarnings | number:'1.0-0' }}</div><div class="sc-label">Barber Payouts</div></div>
          <div class="sc"><div class="sc-icon">🏁</div><div class="sc-val">{{ stats()?.completedBookings || 0 }}</div><div class="sc-label">Completed</div></div>
        </div>

        <div class="card">
          <div class="ch"><div class="ct">Revenue by Shop</div></div>
          @for (s of shopsWithRevenue(); track s.id) {
            <div style="padding:12px 0;border-bottom:1px solid var(--border)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:18px">{{ s.emoji || '✂️' }}</span>
                  <div>
                    <div style="font-weight:700;font-size:13px">{{ s.shopName }}</div>
                    <div style="font-size:11px;color:var(--text3)">{{ s.city }}</div>
                  </div>
                </div>
                <div style="font-family:'Unbounded',sans-serif;font-size:16px;font-weight:700;color:var(--amber)">
                  ₹{{ (s.monthlyRevenue || 0) | number:'1.0-0' }}
                </div>
              </div>
              <div style="height:4px;background:var(--card2);border-radius:4px;overflow:hidden">
                <div [style.width]="revenueWidth(s.monthlyRevenue || 0)"
                  style="height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));border-radius:4px;transition:width .5s">
                </div>
              </div>
            </div>
          }
          @if (shopsWithRevenue().length === 0) {
            <div class="empty" style="padding:20px 0"><div class="et">No revenue data yet</div></div>
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    /* Admin-specific card styles */
    .admin-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
      transition: border-color .15s;
    }
    .admin-card:hover { border-color: rgba(245,166,35,.18); }
    .admin-card-left  { display:flex; align-items:flex-start; gap:14px; flex:1; min-width:0; }
    .admin-card-right { flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; min-width:140px; }

    .admin-shop-emoji {
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--card2); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
    }

    .admin-shop-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid var(--border);
    }
    .admin-shop-row:last-child { border-bottom: none; padding-bottom: 0; }

    .admin-bk-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px 18px;
      transition: border-color .15s;
    }
    .admin-bk-card:hover { border-color: rgba(245,166,35,.15); }

    @media (max-width: 640px) {
      .admin-card { flex-direction: column; }
      .admin-card-right { align-items: flex-start; min-width: unset; }
    }
  `]
})
export class AdminComponent implements OnInit {
  auth    = inject(AuthService);
  shopSvc = inject(ShopService);
  bookSvc = inject(BookingService);
  toast   = inject(ToastService);

  tab            = signal<Tab>('overview');
  shops          = signal<ShopResponse[]>([]);
  bookings       = signal<BookingResponse[]>([]);
  stats          = signal<DashboardStats | null>(null);
  shopFilter     = signal('');
  bkFilter       = signal('');
  commissionShop = signal<ShopResponse | null>(null);

  // ── Pagination ───────────────────────────────────────
  bkPage       = signal(1);  bkPageSize   = 10;
  shopPage     = signal(1);  shopPageSize = 10;
  newCommission  = 10;

  nav = [
    { tab: 'overview'  as Tab, icon: '📊', label: 'Overview' },
    { tab: 'shops'     as Tab, icon: '🏪', label: 'Shops' },
    { tab: 'bookings'  as Tab, icon: '📅', label: 'Bookings' },
    { tab: 'revenue'   as Tab, icon: '💰', label: 'Revenue' },
  ];

  shopFilters = [
    { val: '', label: 'All' },
    { val: 'ACTIVE',   label: '🟢 Active' },
    { val: 'PENDING',  label: '⏳ Pending' },
    { val: 'DISABLED', label: '⛔ Disabled' },
  ];

  bkFilters = [
    { val: '', label: 'All' },
    { val: 'PENDING',   label: '⏳ Pending' },
    { val: 'CONFIRMED', label: '✓ Confirmed' },
    { val: 'COMPLETED', label: '🏁 Completed' },
    { val: 'CANCELLED', label: 'Cancelled' },
  ];

  get todayDate() {
    return new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }

  pendingShops()        { return this.shops().filter(s => s.status === 'PENDING').length; }
  pendingShopsPreview() { return this.shops().filter(s => s.status === 'PENDING').slice(0,3); }
  // ── Pagination getters ─────────────────────────────────────────────
  get pagedBookings()  { return this.filteredBookings().slice(0, this.bkPage() * this.bkPageSize); }
  get hasMoreBookings(){ return this.filteredBookings().length > this.bkPage() * this.bkPageSize; }
  loadMoreBookings()   { this.bkPage.update(p => p + 1); }

  get pagedShops()     { return this.filteredShops_().slice(0, this.shopPage() * this.shopPageSize); }
  get hasMoreShops()   { return this.filteredShops_().length > this.shopPage() * this.shopPageSize; }
  loadMoreShops()      { this.shopPage.update(p => p + 1); }

  filteredShops_()      { return this.shopFilter() ? this.shops().filter(s => s.status === this.shopFilter()) : this.shops(); }
  filteredShops()       { return this.shopFilter() ? this.shops().filter(s => s.status === this.shopFilter()) : this.shops(); }
  filteredBookings()    { return this.bkFilter()   ? this.bookings().filter(b => b.status === this.bkFilter()) : this.bookings(); }
  shopsWithRevenue()    { return [...this.shops()].filter(s => (s.monthlyRevenue||0) > 0).sort((a,b) => (b.monthlyRevenue||0)-(a.monthlyRevenue||0)); }
  maxRevenue()          { return Math.max(...this.shops().map(s => s.monthlyRevenue||0), 1); }
  revenueWidth(v: number) { return Math.round((v / this.maxRevenue()) * 100) + '%'; }

  ngOnInit() {
    this.shopSvc.adminGetAllShops().subscribe({ next: r => this.shops.set(r.data || []) });
    this.bookSvc.adminGetAllBookings().subscribe({ next: r => this.bookings.set(r.data || []) });
    this.bookSvc.adminGetStats().subscribe({ next: r => this.stats.set(r.data) });
  }

  approve(id: number) {
    this.shopSvc.adminApprove(id).subscribe({ next: r => {
      this.shops.update(s => s.map(x => x.id === id ? r.data : x));
      this.toast.ok('Shop approved ✅');
    }});
  }

  disable(id: number) {
    this.shopSvc.adminDisable(id).subscribe({ next: r => {
      this.shops.update(s => s.map(x => x.id === id ? r.data : x));
      this.toast.warn('Shop disabled');
    }});
  }

  enable(id: number) {
    this.shopSvc.adminEnable(id).subscribe({ next: r => {
      this.shops.update(s => s.map(x => x.id === id ? r.data : x));
      this.toast.ok('Shop re-enabled ✅');
    }});
  }

  openCommission(s: ShopResponse) {
    this.commissionShop.set(s);
    this.newCommission = s.commissionPercent || 10;
  }

  saveCommission() {
    const s = this.commissionShop(); if (!s) return;
    this.shopSvc.adminSetCommission(s.id, this.newCommission).subscribe({ next: r => {
      this.shops.update(list => list.map(x => x.id === s.id ? r.data : x));
      this.commissionShop.set(null);
      this.toast.ok('Commission updated');
    }});
  }
}
