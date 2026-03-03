import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthModalComponent } from './features/auth/auth-modal.component';

export const authModalState = {
  role: signal<'customer' | 'barber' | 'admin' | null>(null),
  open(role: 'customer' | 'barber' | 'admin') { this.role.set(role); },
  close() { this.role.set(null); }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastComponent, AuthModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    @if (authRole()) {
      <app-auth-modal [role]="authRole()!" (close)="authRole.set(null)"></app-auth-modal>
    }
  `
})
export class AppComponent {
  authRole = authModalState.role;
}
