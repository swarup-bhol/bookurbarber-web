import { Component, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  styles: [`.fpb{background:none;border:1px solid var(--border2);border-radius:20px;padding:5px 12px;cursor:pointer;font-size:11px;color:var(--text2);font-family:'DM Sans',sans-serif;transition:all .15s}.fpb:hover{border-color:var(--amber);color:var(--amber)}`],
  template: `
    <footer style="border-top:1px solid var(--border);padding:24px 20px;background:var(--card);margin-top:auto">
      <div style="max-width:900px;margin:0 auto">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <div style="font-family:'Unbounded',sans-serif;font-size:14px;font-weight:900;letter-spacing:0px">
            <span style="color:var(--amber)">BOOK</span>UR<span style="color:var(--amber)">BARBER</span>
            <span style="font-size:10px;color:var(--text3);font-family:inherit;font-weight:400;margin-left:8px">by BookurBarber Technologies Pvt. Ltd.</span>
          </div>
          <div style="font-size:11px;color:var(--text3)">✂️ India's smartest barbershop platform</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
          @for (p of policies; track p.key) {
            <button class="fpb" (click)="openPolicy(p.key)">{{ p.label }}</button>
          }
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center">
          <div style="display:flex;gap:16px;flex-wrap:wrap">
            <a href="mailto:support@bookurbarber.app" style="font-size:11px;color:var(--text3);text-decoration:none">📧 support&#64;bookurbarber.app</a>
            <a href="mailto:legal@bookurbarber.app"   style="font-size:11px;color:var(--text3);text-decoration:none">⚖️ legal&#64;bookurbarber.app</a>
            <span style="font-size:11px;color:var(--text3)">📍 Bangalore, Karnataka, India</span>
          </div>
          <div style="font-size:10px;color:var(--border2)">© {{ year }} BookurBarber Technologies Pvt. Ltd. · All rights reserved</div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  @Output() policyClick = new EventEmitter<string>();
  private router = inject(Router);
  year = new Date().getFullYear();
  policies = [
    { key: 'terms',   label: '📋 Terms & Conditions' },
    { key: 'privacy', label: '🔒 Privacy Policy' },
    { key: 'refund',  label: '💰 Refund Policy' },
  ];

  openPolicy(key: string) {
    // If a parent is listening (inline mode inside dashboard), emit to them
    // Otherwise navigate to the dedicated route
    if (this.policyClick.observed) {
      this.policyClick.emit(key);
    } else {
      this.router.navigate(['/' + key]);
    }
  }
}
