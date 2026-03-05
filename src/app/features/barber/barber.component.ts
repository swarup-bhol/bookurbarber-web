import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ShopService } from '../../core/services/shop.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastService } from '../../core/services/toast.service';
import { InstallPromptComponent } from '../../shared/components/install-prompt/install-prompt.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PolicyPageComponent } from '../policy/policy-page.component';
import {
  ShopResponse, BookingResponse, DashboardStats,
  ServiceResponse, ServiceRequest, ShopUpdateRequest,
  EmployeeResponse, EmployeeRequest, EmployeeStatsResponse, SlotBlockResponse
} from '../../core/models/models';

type Tab = 'dashboard' | 'bookings' | 'services' | 'slots' | 'employees' | 'shop' | 'earnings' | 'share';

@Component({
  selector: 'app-barber',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent, BadgeComponent, FooterComponent, PolicyPageComponent, InstallPromptComponent],
  template: `
    @if (policyType()) {
      <app-policy-page [type]="policyType()!" (back)="policyType.set(null)"></app-policy-page>
    } @else {
    <div style="display:flex;flex-direction:column;min-height:100vh">
      <app-topbar [notifCount]="pending()" [showSettings]="true"
        (notifClick)="tab.set('bookings')" (settingsClick)="tab.set('shop')"></app-topbar>

      <div class="shell" style="flex:1">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sb-sec">Menu</div>
          @for (n of nav; track n.tab) {
            <button class="sb-item" [class.on]="tab() === n.tab" (click)="tab.set(n.tab)">
              <span class="sb-icon">{{ n.icon }}</span>{{ n.label }}
              @if (n.tab === 'bookings' && pending() > 0) { <span class="sb-badge">{{ pending() }}</span> }
            </button>
          }
          <div class="sb-footer">
            @if (shop()) {
              <div style="font-size:11px;color:var(--text3);padding:6px 12px;margin-bottom:6px">
                <div style="font-weight:700;color:var(--text2)">{{ shop()!.shopName }}</div>
                <div style="margin-top:2px">{{ shop()!.status === 'ACTIVE' ? '🟢 Active' : '⏳ ' + shop()!.status }}</div>
              </div>
            }
            <button class="sb-item" (click)="auth.logout()">🚪 Logout</button>
          </div>
        </aside>

        <main class="main">
          @if (tab() === 'dashboard')  { <ng-container *ngTemplateOutlet="dashboardTpl"></ng-container> }
          @if (tab() === 'bookings')   { <ng-container *ngTemplateOutlet="bookingsTpl"></ng-container> }
          @if (tab() === 'services')   { <ng-container *ngTemplateOutlet="servicesTpl"></ng-container> }
          @if (tab() === 'slots')      { <ng-container *ngTemplateOutlet="slotsTpl"></ng-container> }
          @if (tab() === 'employees')  { <ng-container *ngTemplateOutlet="employeesTpl"></ng-container> }
          @if (tab() === 'shop')       { <ng-container *ngTemplateOutlet="shopTpl"></ng-container> }
          @if (tab() === 'earnings')   { <ng-container *ngTemplateOutlet="earningsTpl"></ng-container> }
          @if (tab() === 'share')      { <ng-container *ngTemplateOutlet="shareTpl"></ng-container> }
        </main>
      </div>

      <nav class="mobile-nav">
        @for (n of nav.slice(0,5); track n.tab) {
          <button class="mni" [class.on]="tab() === n.tab" (click)="tab.set(n.tab)">
            @if (n.tab === 'bookings' && pending() > 0) { <span class="mni-badge">{{ pending() }}</span> }
            <span class="mni-icon">{{ n.icon }}</span>{{ n.label }}
          </button>
        }
      </nav>
    </div>
    }

    <!-- ═══════════ TEMPLATES ═══════════ -->

    <!-- Dashboard -->
    <ng-template #dashboardTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span><span>›</span><span class="ph-bc-cur">Dashboard</span></div>
          <div class="ph-row">
            <div>
              <div class="ph-title">Welcome, {{ (auth.user()?.fullName ?? '').split(' ')[0] || 'there' }}! 👋</div>
              <div class="ph-sub">{{ todayDate }}</div>
            </div>
            @if (shop()) {
              <label class="toggle" title="Open/Close shop">
                <input type="checkbox" [checked]="shop()!.open" (change)="toggleOpen()">
                <span class="ttrack"></span>
              </label>
            }
          </div>
        </div>

        @if (shop()?.status === 'PENDING') {
          <div style="margin-bottom:16px;padding:14px 18px;background:var(--amber-dim);border:1px solid rgba(245,166,35,0.25);border-radius:12px">
            ⏳ <b>Shop pending approval.</b> Admin will review within 24 hours. Set up services and staff in the meantime.
          </div>
        }

        <div class="sg">
          <div class="sc"><div class="sc-icon">📅</div><div class="sc-val">{{ stats()?.pendingBookings || 0 }}</div><div class="sc-label">Pending Today</div><div class="sc-chip chip-y">⏳ Action needed</div></div>
          <div class="sc"><div class="sc-icon">✓</div><div class="sc-val">{{ stats()?.confirmedBookings || 0 }}</div><div class="sc-label">Confirmed</div><div class="sc-chip chip-b">Today</div></div>
          <div class="sc"><div class="sc-icon">💰</div><div class="sc-val">₹{{ stats()?.barberEarnings | number:'1.0-0' }}</div><div class="sc-label">My Earnings</div><div class="sc-chip chip-g">This month</div></div>
          <div class="sc"><div class="sc-icon">⭐</div><div class="sc-val">{{ (shop()?.avgRating || 0) | number:'1.1-1' }}</div><div class="sc-label">Shop Rating</div><div class="sc-chip chip-y">{{ shop()?.totalReviews || 0 }} reviews</div></div>
        </div>

        @if (pendingBookings().length > 0) {
          <div class="card">
            <div class="ch"><div class="ct">⏳ Needs Action</div><button class="btn btn-ghost-amber btn-sm" (click)="tab.set('bookings')">View all →</button></div>
            @for (b of pendingBookings().slice(0,3); track b.id) {
              <div class="bk">
                <div class="bk-av">{{ b.customerName[0] }}</div>
                <div class="bk-body">
                  <div class="bk-name">{{ b.customerName }}</div>
                  <div class="bk-detail">{{ b.servicesSnapshot }} · {{ b.slotTime }} · ₹{{ b.totalAmount }}</div>
                  @if (b.employeeName) { <div class="bk-detail">👤 {{ b.employeeName }}</div> }
                  <div class="bk-actions">
                    <button class="btn btn-emerald btn-sm" (click)="accept(b.id)">✓ Accept</button>
                    <button class="btn btn-crimson btn-sm" (click)="reject(b.id)">✕ Reject</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </ng-template>

    <!-- Bookings -->
    <ng-template #bookingsTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">Bookings</span></div>
          <div class="ph-row"><div><div class="ph-title">Bookings</div><div class="ph-sub">Manage all appointments</div></div></div>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">
          @for (f of bkFilters; track f.val) {
            <button class="area-pill" [class.on]="bkFilter() === f.val" (click)="bkFilter.set(f.val)">{{ f.label }}</button>
          }
        </div>
        @for (b of pagedBookings; track b.id) {
          <div class="bk">
            <div class="bk-av">{{ b.customerName[0] }}</div>
            <div class="bk-body">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div class="bk-name">{{ b.customerName }}</div>
                <app-badge [status]="b.status"></app-badge>
              </div>
              <div class="bk-detail">{{ b.servicesSnapshot }}</div>
              <div class="bk-detail">📅 {{ b.bookingDate }} · ⏰ {{ b.slotTime }} · ⏱ {{ b.durationMinutes }}min</div>
              <div class="bk-detail">📞 {{ b.customerPhone }}</div>
              @if (b.employeeName) { <div class="bk-detail">👤 {{ b.employeeAvatar || '' }} {{ b.employeeName }} ({{ b.employeeRole || 'Staff' }})</div> }
              <div class="bk-amt">₹{{ b.totalAmount }}</div>
              <div class="bk-actions">
                @if (b.status === 'PENDING') {
                  <button class="btn btn-emerald btn-sm" (click)="accept(b.id)">✓ Accept</button>
                  <button class="btn btn-crimson btn-sm" (click)="reject(b.id)">✕ Reject</button>
                }
                @if (b.status === 'CONFIRMED') {
                  <button class="btn btn-ghost-amber btn-sm" (click)="complete(b.id)">🏁 Complete</button>
                  <button class="btn btn-violet btn-sm" (click)="openReschedule(b)">🔄 Reschedule</button>
                  <button class="btn btn-crimson btn-sm" (click)="cancelBk(b.id)">Cancel</button>
                }
              </div>
            </div>
          </div>
        }
        @if (hasMoreBookings) {
          <div class="load-more-row">
            <button class="btn btn-outline btn-sm" (click)="loadMoreBookings()">
              Load more · {{ filteredBookings().length - pagedBookings.length }} remaining
            </button>
          </div>
        }
        @if (filteredBookings().length === 0) {
          <div class="empty"><div class="ei">📅</div><div class="et">No bookings here</div></div>
        }
      </div>
      @if (rescheduleTarget()) {
        <div class="mo" (click)="rescheduleTarget.set(null)">
          <div class="mb" (click)="$event.stopPropagation()">
            <div class="mh"><div class="mt">🔄 Propose Reschedule</div><button class="mx" (click)="rescheduleTarget.set(null)">×</button></div>
            <div class="mbody">
              <div style="margin-bottom:12px;font-size:13px;color:var(--text2)">Booking: {{ rescheduleTarget()!.servicesSnapshot }}</div>
              <div class="fg"><label class="fl">New Date</label><input class="fi" type="date" [(ngModel)]="rsDate"></div>
              <div class="fg"><label class="fl">New Time</label><input class="fi" type="time" [(ngModel)]="rsTime"></div>
              <div class="fg"><label class="fl">Reason</label><textarea class="fi" [(ngModel)]="rsReason" rows="2" placeholder="e.g. Equipment maintenance..."></textarea></div>
            </div>
            <div class="mfoot">
              <button class="btn btn-outline btn-sm" (click)="rescheduleTarget.set(null)">Cancel</button>
              <button class="btn btn-amber btn-sm" [disabled]="!rsDate || !rsTime || !rsReason" (click)="submitReschedule()">Send Request</button>
            </div>
          </div>
        </div>
      }
    </ng-template>

    <!-- Services -->
    <ng-template #servicesTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">Services</span></div>
          <div class="ph-row">
            <div><div class="ph-title">Services</div><div class="ph-sub">{{ (shop()?.services || []).length }} services</div></div>
            <button class="btn btn-amber btn-sm" (click)="openServiceModal()">+ Add Service</button>
          </div>
        </div>
        @for (svc of pagedServices; track svc.id) {
          <div class="svc" [class.disabled]="!svc.enabled">
            <div class="svc-ico">{{ svc.icon || '✂️' }}</div>
            <div class="svc-info"><div class="svc-name">{{ svc.serviceName }}</div><div class="svc-meta">{{ svc.category }} · {{ svc.durationMinutes }}min</div></div>
            <div class="svc-price">₹{{ svc.price }}</div>
            <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
              <button class="btn btn-ghost btn-sm" (click)="openServiceModal(svc)">✏️</button>
              <button class="btn btn-sm" [class]="svc.enabled ? 'btn-crimson' : 'btn-emerald'" (click)="toggleSvc(svc)">{{ svc.enabled ? 'Disable' : 'Enable' }}</button>
            </div>
          </div>
        }
        @if ((shop()?.services || []).length === 0) {
          <div class="empty"><div class="ei">✂️</div><div class="et">No services yet. Add your first service.</div></div>
        }
      </div>
      @if (svcModal()) {
        <div class="mo" (click)="svcModal.set(false)">
          <div class="mb" (click)="$event.stopPropagation()">
            <div class="mh"><div class="mt">{{ editSvc() ? 'Edit Service' : 'Add Service' }}</div><button class="mx" (click)="svcModal.set(false)">×</button></div>
            <div class="mbody">
              <div class="g2">
                <div class="fg"><label class="fl">Service Name</label><input class="fi" [(ngModel)]="svcForm.serviceName" placeholder="Classic Haircut"></div>
                <div class="fg"><label class="fl">Icon (emoji)</label><input class="fi" [(ngModel)]="svcForm.icon" placeholder="✂️" maxlength="4"></div>
              </div>
              <div class="fg"><label class="fl">Description</label><input class="fi" [(ngModel)]="svcForm.description" placeholder="Brief description..."></div>
              <div class="g2">
                <div class="fg"><label class="fl">Price (₹)</label><input class="fi" type="number" [(ngModel)]="svcForm.price"></div>
                <div class="fg"><label class="fl">Duration (min)</label><input class="fi" type="number" [(ngModel)]="svcForm.durationMinutes"></div>
              </div>
              <div class="fg">
                <label class="fl">Category</label>
                <select class="fi" [(ngModel)]="svcForm.category">
                  @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
            </div>
            <div class="mfoot">
              <button class="btn btn-outline btn-sm" (click)="svcModal.set(false)">Cancel</button>
              <button class="btn btn-amber btn-sm" [disabled]="!svcForm.serviceName || !svcForm.price || savingService()" (click)="saveService()">{{ savingService() ? 'Saving…' : (editSvc() ? 'Update' : 'Add') + ' Service' }}</button>
            </div>
          </div>
        </div>
      }
    </ng-template>

    <!-- Employees -->
    <ng-template #employeesTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">Team</span></div>
          <div class="ph-row">
            <div><div class="ph-title">Team Members 👤</div><div class="ph-sub">{{ employees().length }} staff members</div></div>
            <button class="btn btn-amber btn-sm" (click)="openEmpModal()">+ Add Staff</button>
          </div>
        </div>

        <!-- Report date -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <div class="ct">Today's Performance</div>
            <input type="date" class="fi" style="width:auto;padding:5px 10px;font-size:12px" [(ngModel)]="reportDate" (change)="loadEmpReport()">
          </div>
          @if (empReport().length > 0) {
            <div style="overflow-x:auto">
              <table class="report-table">
                <thead>
                  <tr><th>Staff</th><th>Bookings</th><th>Completed</th><th>Earnings</th><th>Rating</th></tr>
                </thead>
                <tbody>
                  @for (r of empReport(); track r.employeeId) {
                    <tr>
                      <td><b>{{ r.employeeAvatar || '👤' }} {{ r.employeeName }}</b><div style="font-size:11px;color:var(--text3)">{{ r.employeeRole }}</div></td>
                      <td>{{ r.bookingsToday }}</td>
                      <td>{{ r.completedToday }}</td>
                      <td style="color:var(--amber);font-weight:700">₹{{ r.earningsToday }}</td>
                      <td>{{ r.avgRating > 0 ? ('★ ' + (r.avgRating | number:'1.1-1')) : '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div style="font-size:13px;color:var(--text3);text-align:center;padding:12px">No activity today</div>
          }
        </div>

        @for (emp of employees(); track emp.id) {
          <div class="emp-card" [class.off]="!emp.active">
            <div class="emp-av">
              {{ emp.avatar || '👤' }}
              @if (emp.currentlyBusy) { <div class="emp-busy-ring"></div> }
              @else if (emp.active) { <div class="emp-free-ring"></div> }
            </div>
            <div class="emp-info">
              <div class="emp-name">{{ emp.name }}</div>
              <div class="emp-role">{{ emp.role || 'Staff' }} @if (!emp.active) { · <span style="color:var(--crimson)">Inactive</span> }</div>
              @if (emp.specialties) { <div style="font-size:11px;color:var(--text3);margin-top:2px">{{ emp.specialties }}</div> }
              <div class="emp-stats">
                @if (emp.avgRating > 0) { <span>★ {{ emp.avgRating | number:'1.1-1' }} ({{ emp.totalReviews }})</span> }
                <span>📅 {{ emp.totalBookings }} bookings</span>
                <span>💰 ₹{{ emp.totalEarnings || 0 | number:'1.0-0' }}</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
              <button class="btn btn-ghost btn-sm" (click)="openEmpModal(emp)">✏️ Edit</button>
              <button class="btn btn-sm" [class]="emp.active ? 'btn-crimson' : 'btn-emerald'" (click)="toggleEmp(emp)">{{ emp.active ? 'Deactivate' : 'Activate' }}</button>
            </div>
          </div>
        }
        @if (employees().length === 0) {
          <div class="empty"><div class="ei">👤</div><div class="et">No team members yet. Add your first staff member.</div></div>
        }
      </div>
      @if (empModal()) {
        <div class="mo" (click)="empModal.set(false)">
          <div class="mb" (click)="$event.stopPropagation()">
            <div class="mh"><div class="mt">{{ editEmp() ? 'Edit Staff' : 'Add Staff Member' }}</div><button class="mx" (click)="empModal.set(false)">×</button></div>
            <div class="mbody">
              <div class="g2">
                <div class="fg"><label class="fl">Name</label><input class="fi" [(ngModel)]="empForm.name" placeholder="Raju Kumar"></div>
                <div class="fg"><label class="fl">Avatar (emoji)</label><input class="fi" [(ngModel)]="empForm.avatar" placeholder="💈" maxlength="4"></div>
              </div>
              <div class="g2">
                <div class="fg"><label class="fl">Role</label><input class="fi" [(ngModel)]="empForm.role" placeholder="Senior Barber"></div>
                <div class="fg"><label class="fl">Phone</label><input class="fi" [(ngModel)]="empForm.phone" type="tel" placeholder="9876543210"></div>
              </div>
              <div class="fg"><label class="fl">Specialties</label><input class="fi" [(ngModel)]="empForm.specialties" placeholder="Fades, Beards, Hair Color"></div>
              <div class="fg"><label class="fl">Bio</label><textarea class="fi" [(ngModel)]="empForm.bio" rows="2" placeholder="Brief intro..."></textarea></div>
            </div>
            <div class="mfoot">
              <button class="btn btn-outline btn-sm" (click)="empModal.set(false)">Cancel</button>
              <button class="btn btn-amber btn-sm" [disabled]="!empForm.name" (click)="saveEmployee()">{{ editEmp() ? 'Update' : 'Add' }} Staff</button>
            </div>
          </div>
        </div>
      }
    </ng-template>

    <!-- Slots / Schedule -->
    <ng-template #slotsTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">Schedule</span></div>
          <div class="ph-row"><div><div class="ph-title">Schedule & Hours</div></div></div>
        </div>
        <div class="card">
          <div class="ch"><div class="ct">Working Hours</div></div>
          <div class="g2">
            <div class="fg"><label class="fl">Open Time</label><input class="fi" type="time" [(ngModel)]="shopForm.openTime"></div>
            <div class="fg"><label class="fl">Close Time</label><input class="fi" type="time" [(ngModel)]="shopForm.closeTime"></div>
          </div>
          <div class="g2">
            <div class="fg"><label class="fl">Slot Duration (min)</label>
              <select class="fi" [(ngModel)]="shopForm.slotDurationMinutes">
                <option [value]="15">15 min</option><option [value]="20">20 min</option>
                <option [value]="30">30 min</option><option [value]="45">45 min</option><option [value]="60">60 min</option>
              </select>
            </div>
            <div class="fg"><label class="fl">Seats / Chairs</label><input class="fi" type="number" min="1" max="10" [(ngModel)]="shopForm.seats"></div>
          </div>
          <div class="fg">
            <label class="fl">Working Days</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
              @for (d of days; track d) {
                <button class="area-pill" [class.on]="isWorkDay(d)" (click)="toggleDay(d)">{{ d }}</button>
              }
            </div>
          </div>
          <button class="btn btn-amber" [disabled]="savingSchedule()" (click)="saveSchedule()" style="min-width:148px">{{ savingSchedule() ? 'Saving…' : 'Save Schedule' }}</button>
        </div>

        <!-- Slot preview + block -->
        @if (generatedSlots().length > 0) {
          <div class="card" style="margin-top:16px">
            <div class="ch">
              <div class="ct">Slot Blocking</div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <select class="fi" style="width:auto;padding:5px 10px;font-size:12px" [(ngModel)]="blockEmployeeId" (ngModelChange)="onBlockEmployeeChange()">
                  <option [value]="0">🏪 Shop-wide</option>
                  @for (emp of employees(); track emp.id) {
                    <option [value]="emp.id">{{ emp.avatar || '👤' }} {{ emp.name }}</option>
                  }
                </select>
                <input type="date" class="fi" style="width:auto;padding:4px 10px;font-size:12px"
                  [value]="selectedDate()"
                  (change)="selectedDate.set($any($event.target).value); loadBlockedSlots()">
              </div>
            </div>
            <div style="font-size:12px;color:var(--text3);margin-bottom:10px">
              {{ generatedSlots().length }} slots · tap to block/unblock
              @if (blockEmployeeId > 0) { · Blocking for employee only }
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              @for (sl of generatedSlots(); track sl) {
                <button
                  (click)="toggleSlotBlock(sl)"
                  [style.background]="isBlocked(sl) ? 'var(--crimson-dim)' : 'var(--card2)'"
                  [style.border]="'1px solid ' + (isBlocked(sl) ? 'var(--crimson)' : 'var(--border)')"
                  [style.color]="isBlocked(sl) ? 'var(--crimson)' : 'var(--text2)'"
                  style="padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s">
                  {{ isBlocked(sl) ? '🚫' : '✅' }} {{ sl }}
                </button>
              }
            </div>
            @if (blockedSlots().size > 0) {
              <div style="margin-top:12px;font-size:12px;color:var(--text3)">
                {{ blockedSlots().size }} slot(s) blocked for {{ selectedDate() }}
              </div>
            }
          </div>
        }
      </div>
    </ng-template>

    <!-- My Shop -->
    <ng-template #shopTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">My Shop</span></div>
          <div class="ph-row"><div><div class="ph-title">Shop Settings</div></div></div>
        </div>
        <div class="card">
          <div class="ch"><div class="ct">Shop Info</div></div>
          <div class="fg"><label class="fl">Shop Name</label><input class="fi" [(ngModel)]="shopForm.shopName"></div>
          <div class="fg"><label class="fl">Bio</label><textarea class="fi" [(ngModel)]="shopForm.bio" rows="3" placeholder="Tell customers about your shop..."></textarea></div>
          <div class="g2">
            <div class="fg"><label class="fl">Phone</label><input class="fi" [(ngModel)]="shopForm.phone" placeholder="+91 98765 43210"></div>
            <div class="fg"><label class="fl">Emoji</label><input class="fi" [(ngModel)]="shopForm.emoji" placeholder="✂️" maxlength="4"></div>
          </div>
          <div class="fg"><label class="fl">Location</label><input class="fi" [(ngModel)]="shopForm.location"></div>
          <div class="g2">
            <div class="fg"><label class="fl">City</label><input class="fi" [(ngModel)]="shopForm.city"></div>
            <div class="fg"><label class="fl">Area</label><input class="fi" [(ngModel)]="shopForm.area"></div>
          </div>
          <button class="btn btn-amber" [disabled]="savingShop()" (click)="saveShop()" style="min-width:148px">{{ savingShop() ? 'Saving…' : 'Save Changes' }}</button>
        </div>
        @if (shop()) {
          <div class="card" style="margin-top:14px">
            <div class="ch"><div class="ct">Shop Status</div></div>
            <div style="display:flex;align-items:center;gap:12px">
              <app-badge [status]="shop()!.status"></app-badge>
              <span style="font-size:13px;color:var(--text2)">{{ shop()!.status === 'PENDING' ? 'Awaiting admin approval' : shop()!.status === 'ACTIVE' ? 'Your shop is live 🟢' : 'Contact support' }}</span>
            </div>
          </div>
        }
      </div>
    </ng-template>

    <!-- Earnings -->
    <ng-template #earningsTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">Earnings</span></div>
          <div class="ph-row">
            <div><div class="ph-title">Revenue & Earnings 💰</div></div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:11px;color:var(--text3)">Month</span>
              <input type="month" class="fi" style="width:auto;padding:5px 12px;font-size:12px"
                [(ngModel)]="earningsMonth" (change)="loadEarningsReport()">
            </div>
          </div>
        </div>

        <!-- Summary stats -->
        <div class="sg">
          <div class="sc"><div class="sc-icon">💰</div><div class="sc-val">₹{{ stats()?.barberEarnings | number:'1.0-0' }}</div><div class="sc-label">My Earnings</div><div class="sc-chip chip-g">This month</div></div>
          <div class="sc"><div class="sc-icon">📊</div><div class="sc-val">₹{{ stats()?.totalRevenue | number:'1.0-0' }}</div><div class="sc-label">Gross Revenue</div></div>
          <div class="sc"><div class="sc-icon">🏢</div><div class="sc-val">₹{{ stats()?.totalCommission | number:'1.0-0' }}</div><div class="sc-label">Platform Fee</div></div>
          <div class="sc"><div class="sc-icon">🏁</div><div class="sc-val">{{ stats()?.completedBookings || 0 }}</div><div class="sc-label">Completed</div></div>
        </div>

        <!-- Staff monthly earnings breakdown -->
        @if (employees().length > 0) {
          <div class="card" style="margin-bottom:14px">
            <div class="ch">
              <div>
                <div class="ct">Staff Earnings</div>
                <div class="cs">{{ earningsMonth }}</div>
              </div>
              <div style="font-size:12px;color:var(--text3)">{{ earningsReport().length }} active staff</div>
            </div>

            @if (earningsReport().length === 0) {
              <div class="empty" style="padding:16px 0">
                <div class="et">No completed bookings for this month yet.</div>
              </div>
            }

            @for (r of earningsReport(); track r.employeeId) {
              <div style="padding:14px 0;border-bottom:1px solid var(--border)">
                <div style="display:flex;align-items:center;gap:12px">
                  <!-- Avatar -->
                  <div style="width:42px;height:42px;border-radius:50%;background:var(--amber-dim);border:1.5px solid rgba(245,166,35,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">
                    {{ r.employeeAvatar || '👤' }}
                  </div>
                  <!-- Info -->
                  <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">
                      <div style="font-weight:700;font-size:14px">{{ r.employeeName }}</div>
                      <div style="font-family:'Unbounded',sans-serif;font-size:16px;font-weight:700;color:var(--amber)">₹{{ r.earningsMonth | number:'1.0-0' }}</div>
                    </div>
                    <div style="font-size:11px;color:var(--text3);margin-bottom:6px">{{ r.employeeRole || 'Staff' }}</div>
                    <!-- Quick stats row -->
                    <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--text2);margin-bottom:7px">
                      <span>📅 {{ r.bookingsMonth }} bookings</span>
                      <span>✅ {{ r.completedMonth }} completed</span>
                      @if (r.avgRating > 0) { <span style="color:var(--amber)">★ {{ r.avgRating | number:'1.1-1' }}</span> }
                      <span style="color:var(--text3)">All-time: ₹{{ r.totalEarnings | number:'1.0-0' }}</span>
                    </div>
                    <!-- Earnings progress bar -->
                    <div>
                      <div style="height:5px;background:var(--card2);border-radius:4px;overflow:hidden">
                        <div
                          [style.width]="empEarningsWidth(r.earningsMonth)"
                          style="height:100%;background:linear-gradient(90deg,var(--amber),var(--amber2));border-radius:4px;transition:width .6s ease">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <div class="card card-amber">
          <div class="ch"><div class="ct">Commission Breakdown</div></div>
          <div style="font-size:13px;color:var(--text2);line-height:1.8">
            BookurBarber charges <b style="color:var(--amber)">10% commission</b> on completed bookings only.<br/>
            Cancelled or rejected bookings → <b>zero commission</b>.<br/>
            Earnings = 90% of completed booking total.
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Share -->
    <ng-template #shareTpl>
      <div class="page anim-fade-up">
        <div class="ph">
          <div class="ph-bc"><span>Barber</span>›<span class="ph-bc-cur">Share & QR</span></div>
          <div class="ph-row"><div><div class="ph-title">Share Your Shop</div></div></div>
        </div>
        @if (shop()) {
          <div class="card" style="text-align:center">
            <div style="font-size:48px;margin-bottom:12px">{{ shop()!.emoji || '✂️' }}</div>
            <div style="font-family:'Unbounded',sans-serif;font-size:20px;font-weight:700;margin-bottom:8px">{{ shop()!.shopName }}</div>
            <div style="color:var(--text2);font-size:13px;margin-bottom:20px">📍 {{ shop()!.location }}</div>
            <div style="background:var(--card2);border-radius:12px;padding:14px;margin-bottom:16px">
              <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Direct Booking Link</div>
              <div style="font-size:13px;color:var(--amber);font-weight:600;word-break:break-all">
                bookurbarber.in/{{ shop()!.slug }}
              </div>
            </div>
            <button class="btn btn-amber" (click)="copyLink()">📋 Copy Link</button>
          </div>
        }
      </div>
      <app-install-prompt></app-install-prompt>
    </ng-template>
  `
})
export class BarberComponent implements OnInit {
  auth    = inject(AuthService);
  shopSvc = inject(ShopService);
  bookSvc = inject(BookingService);
  toast   = inject(ToastService);

  tab           = signal<Tab>('dashboard');
  shop          = signal<ShopResponse | null>(null);
  employees     = signal<EmployeeResponse[]>([]);
  empReport      = signal<EmployeeStatsResponse[]>([]);
  earningsReport = signal<EmployeeStatsResponse[]>([]);
  earningsMonth  = new Date().toISOString().slice(0,7); // YYYY-MM
  blockedSlots  = signal<Set<string>>(new Set());
  blockedFull   = signal<SlotBlockResponse[]>([]);
  selectedDate  = signal<string>(new Date().toISOString().split('T')[0]);
  reportDate    = new Date().toISOString().split('T')[0];
  blockEmployeeId = 0;

  bookings       = signal<BookingResponse[]>([]);
  stats          = signal<DashboardStats | null>(null);
  bkFilter       = signal('');
  rescheduleTarget = signal<BookingResponse | null>(null);
  svcModal       = signal(false);
  editSvc        = signal<ServiceResponse | null>(null);
  empModal       = signal(false);
  editEmp        = signal<EmployeeResponse | null>(null);
  policyType     = signal<string | null>(null);
  rsDate = ''; rsTime = ''; rsReason = '';

  // ── Save loading states ──────────────────────────────
  savingShop     = signal(false);
  savingSchedule = signal(false);
  savingService  = signal(false);
  savingEmployee = signal(false);

  // ── Pagination ───────────────────────────────────────
  bkPage      = signal(1);  bkPageSize  = 10;
  svcPage     = signal(1);  svcPageSize = 8;

  svcForm: ServiceRequest = { serviceName: '', category: 'HAIR', price: 0, durationMinutes: 30 };
  empForm: EmployeeRequest = { name: '', avatar: '💈', role: '' };
  shopForm: ShopUpdateRequest = {};
  categories = ['HAIR','BEARD','FACIAL','SPA','COLOR','KIDS','COMBO','OTHER'];
  days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  bkFilters = [
    { val: '', label: 'All' }, { val: 'PENDING', label: '⏳ Pending' },
    { val: 'CONFIRMED', label: '✓ Confirmed' }, { val: 'COMPLETED', label: '🏁 Done' },
    { val: 'CANCELLED', label: 'Cancelled' },
  ];

  get todayDate() { return new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' }); }

  pending()         { return this.bookings().filter(b => b.status === 'PENDING').length; }
  pendingBookings() { return this.bookings().filter(b => b.status === 'PENDING'); }
  filteredBookings() {
    return this.bkFilter()
      ? this.bookings().filter(b => b.status === this.bkFilter())
      : this.bookings();
  }

  nav = [
    { tab: 'dashboard' as Tab, icon: '📊', label: 'Dashboard' },
    { tab: 'bookings'  as Tab, icon: '📅', label: 'Bookings' },
    { tab: 'services'  as Tab, icon: '✂️', label: 'Services' },
    { tab: 'employees' as Tab, icon: '👤', label: 'Team' },
    { tab: 'slots'     as Tab, icon: '🕐', label: 'Schedule' },
    { tab: 'shop'      as Tab, icon: '🏪', label: 'My Shop' },
    { tab: 'earnings'  as Tab, icon: '💰', label: 'Earnings' },
    { tab: 'share'     as Tab, icon: '📤', label: 'Share' },
  ];

  ngOnInit() {
    this.loadShop(); this.loadBookings(); this.loadStats();
    this.loadEmployees(); this.loadBlockedSlots(); this.loadEarningsReport();
  }

  loadShop() {
    this.shopSvc.getMyShop().subscribe({ next: r => {
      const s = r.data; if (!s) return;
      this.shop.set(s);
      this.shopForm = {
        shopName: s.shopName, bio: s.bio || '', phone: s.phone || '',
        emoji: s.emoji || '✂️', location: s.location, city: s.city || '',
        area: s.area || '', openTime: s.openTime || '09:00',
        closeTime: s.closeTime || '20:00',
        slotDurationMinutes: s.slotDurationMinutes || 30,
        seats: s.seats, workDays: s.workDays || 'Mon,Tue,Wed,Thu,Fri,Sat'
      };
    }});
  }

  loadBookings() { this.bookSvc.getBarberBookings().subscribe({ next: r => this.bookings.set(r.data || []) }); }
  loadStats()    { this.bookSvc.getBarberStats().subscribe({ next: r => this.stats.set(r.data) }); }
  loadEmployees() { this.shopSvc.getMyEmployees().subscribe({ next: r => this.employees.set(r.data || []) }); }

  loadEmpReport() {
    this.shopSvc.getEmployeeReport(this.reportDate).subscribe({ next: r => this.empReport.set(r.data || []) });
  }

  accept(id: number)   { this.bookSvc.acceptBooking(id).subscribe({ next: () => { this.toast.ok('Accepted ✅'); this.loadBookings(); } }); }
  reject(id: number)   { this.bookSvc.rejectBooking(id).subscribe({ next: () => { this.toast.warn('Rejected'); this.loadBookings(); } }); }
  complete(id: number) { this.bookSvc.completeBooking(id).subscribe({ next: () => { this.toast.ok('Completed 🏁'); this.loadBookings(); this.loadStats(); } }); }
  cancelBk(id: number) { this.bookSvc.cancelBooking(id).subscribe({ next: () => { this.toast.warn('Cancelled'); this.loadBookings(); } }); }

  openReschedule(b: BookingResponse) { this.rescheduleTarget.set(b); this.rsDate = ''; this.rsTime = ''; this.rsReason = ''; }
  submitReschedule() {
    if (!this.rescheduleTarget() || !this.rsDate || !this.rsTime || !this.rsReason) return;
    this.bookSvc.requestReschedule(this.rescheduleTarget()!.id, { newDate: this.rsDate, newTime: this.rsTime, reason: this.rsReason })
      .subscribe({ next: () => { this.toast.ok('Reschedule sent 💬'); this.rescheduleTarget.set(null); this.loadBookings(); } });
  }

  toggleOpen() {
    const s = this.shop(); if (!s) return;
    this.shopSvc.updateMyShop({ isOpen: !s.open }).subscribe({ next: r => { if (!r.data) return; this.shop.set(r.data); this.toast.ok(r.data.open ? 'Shop Open 🟢' : 'Shop Closed 🔴'); } });
  }

  generatedSlots(): string[] {
    const open = this.shopForm.openTime; const close = this.shopForm.closeTime; const dur = this.shopForm.slotDurationMinutes;
    if (!open || !close || !dur) return [];
    const slots: string[] = [];
    const [oh, om] = open.split(':').map(Number); const [ch, cm] = close.split(':').map(Number);
    let cur = oh * 60 + om; const end = ch * 60 + cm;
    while (cur + dur <= end) {
      const h = Math.floor(cur / 60); const m = cur % 60;
      const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12;
      slots.push(`${h12}:${String(m).padStart(2,'0')} ${ampm}`); cur += dur;
    }
    return slots;
  }

  loadBlockedSlots() {
    this.shopSvc.getBlockedSlots(this.selectedDate()).subscribe({
      next: r => {
        const list = r.data || [];
        this.blockedFull.set(list);
        this.rebuildBlockedSet(list);
      }
    });
  }

  private rebuildBlockedSet(list: SlotBlockResponse[]) {
    // Filter to show blocks relevant to current selection:
    // shop-wide (no employeeId) always shown; employee-specific only shown when that employee is selected
    const empId = this.blockEmployeeId;
    const relevant = list.filter(b => empId === 0 ? !b.employeeId : b.employeeId === empId);
    this.blockedSlots.set(new Set(relevant.map(b => this.to12h(b.slotTime))));
  }

  isBlocked(slot: string): boolean { return this.blockedSlots().has(slot); }

  toggleSlotBlock(slot: string) {
    const date = this.selectedDate();
    const empId = this.blockEmployeeId > 0 ? this.blockEmployeeId : undefined;
    const time24 = this.to24h(slot);

    if (this.isBlocked(slot)) {
      // Optimistic update immediately
      const s = new Set(this.blockedSlots()); s.delete(slot); this.blockedSlots.set(s);
      this.shopSvc.unblockSlot(date, time24, empId).subscribe({
        next: () => this.loadBlockedSlots(),
        error: () => { // revert on error
          const s2 = new Set(this.blockedSlots()); s2.add(slot); this.blockedSlots.set(s2);
          this.toast.err('Failed to unblock slot');
        }
      });
    } else {
      // Optimistic update immediately
      const s = new Set(this.blockedSlots()); s.add(slot); this.blockedSlots.set(s);
      this.shopSvc.blockSlot({ blockDate: date, slotTime: time24, employeeId: empId }).subscribe({
        next: () => this.loadBlockedSlots(),
        error: () => { // revert on error
          const s2 = new Set(this.blockedSlots()); s2.delete(slot); this.blockedSlots.set(s2);
          this.toast.err('Failed to block slot');
        }
      });
    }
  }

  onBlockEmployeeChange() {
    // Rebuild the visible blocked set when switching employee filter
    this.rebuildBlockedSet(this.blockedFull());
  }

  // Employee CRUD
  openEmpModal(emp?: EmployeeResponse) {
    this.editEmp.set(emp || null);
    this.empForm = emp ? { name: emp.name, avatar: emp.avatar || '💈', role: emp.role || '', phone: emp.phone || '', specialties: emp.specialties || '', bio: emp.bio || '' }
                       : { name: '', avatar: '💈', role: '' };
    this.empModal.set(true);
  }
  saveEmployee() {
    const emp = this.editEmp();
    const obs = emp ? this.shopSvc.updateEmployee(emp.id, this.empForm) : this.shopSvc.addEmployee(this.empForm);
    obs.subscribe({ next: () => { this.empModal.set(false); this.toast.ok(emp ? 'Staff updated' : 'Staff added ✓'); this.loadEmployees(); } });
  }
  toggleEmp(emp: EmployeeResponse) {
    this.shopSvc.toggleEmployee(emp.id).subscribe({ next: () => { this.loadEmployees(); this.toast.ok(emp.active ? 'Deactivated' : 'Activated'); } });
  }

  // Service CRUD
  openServiceModal(svc?: ServiceResponse) {
    this.editSvc.set(svc || null);
    this.svcForm = svc ? { serviceName: svc.serviceName, description: svc.description, category: svc.category, price: svc.price, durationMinutes: svc.durationMinutes, icon: svc.icon }
                       : { serviceName: '', category: 'HAIR', price: 0, durationMinutes: 30 };
    this.svcModal.set(true);
  }
  saveService() {
    const svc = this.editSvc();
    const obs = svc ? this.shopSvc.updateService(svc.id, this.svcForm) : this.shopSvc.addService(this.svcForm);
    this.savingService.set(true);
    obs.subscribe({
      next: () => { this.svcModal.set(false); this.toast.ok(svc ? 'Service updated' : 'Service added ✓'); this.loadShop(); this.savingService.set(false); },
      error: e => { this.toast.err(e.error?.message || 'Failed'); this.savingService.set(false); }
    });
  }
  toggleSvc(svc: ServiceResponse) { this.shopSvc.toggleService(svc.id).subscribe({ next: () => { this.loadShop(); this.toast.ok(svc.enabled ? 'Service disabled' : 'Service enabled'); } }); }

  // ── Pagination getters ─────────────────────────────────────────────
  get pagedBookings() { return this.filteredBookings().slice(0, this.bkPage() * this.bkPageSize); }
  get hasMoreBookings() { return this.filteredBookings().length > this.bkPage() * this.bkPageSize; }
  loadMoreBookings() { this.bkPage.update(p => p + 1); }

  get pagedServices() { return (this.shop()?.services || []).slice(0, this.svcPage() * this.svcPageSize); }
  get hasMoreServices() { return (this.shop()?.services?.length || 0) > this.svcPage() * this.svcPageSize; }
  loadMoreServices() { this.svcPage.update(p => p + 1); }

  setTab(t: Tab) { this.tab.set(t); this.bkPage.set(1); this.svcPage.set(1); }

  // ── Save with loaders ────────────────────────────────────────────────
  saveShop() {
    this.savingShop.set(true);
    this.shopSvc.updateMyShop(this.shopForm).subscribe({
      next: r => { this.shop.set(r.data); this.toast.ok('Shop updated ✓'); this.savingShop.set(false); },
      error: e => { this.toast.err(e.error?.message || 'Failed to save'); this.savingShop.set(false); }
    });
  }
  saveSchedule() {
    this.savingSchedule.set(true);
    this.shopSvc.updateMyShop({ openTime: this.shopForm.openTime, closeTime: this.shopForm.closeTime, slotDurationMinutes: this.shopForm.slotDurationMinutes, seats: this.shopForm.seats, workDays: this.shopForm.workDays })
      .subscribe({
        next: r => { this.shop.set(r.data); this.toast.ok('Schedule saved ✓'); this.savingSchedule.set(false); },
        error: e => { this.toast.err(e.error?.message || 'Failed'); this.savingSchedule.set(false); }
      });
  }

  isWorkDay(d: string) { return (this.shopForm.workDays || '').includes(d); }
  toggleDay(d: string) { const days = (this.shopForm.workDays || '').split(',').filter(Boolean); const idx = days.indexOf(d); if (idx >= 0) days.splice(idx,1); else days.push(d); this.shopForm.workDays = days.join(','); }

  copyLink() { navigator.clipboard?.writeText(`https://bookurbarber.in/${this.shop()?.slug}`).then(() => this.toast.ok('Link copied!')); }

  loadEarningsReport() {
    // Reuse the employee report endpoint, filtering by month server-side (or use the same daily report for now)
    this.shopSvc.getEmployeeReport(this.earningsMonth + '-01').subscribe({
      next: r => this.earningsReport.set(r.data || [])
    });
  }

  empEarningsWidth(val: number): string {
    const max = Math.max(...this.earningsReport().map(r => r.earningsMonth), 1);
    return Math.round((val / max) * 100) + '%';
  }

  private to12h(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  private to24h(label: string): string {
    const [time, ampm] = label.split(' ');
    const [h, m] = time.split(':').map(Number);
    const hour = ampm === 'PM' && h !== 12 ? h + 12 : (ampm === 'AM' && h === 12 ? 0 : h);
    return `${String(hour).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
}
