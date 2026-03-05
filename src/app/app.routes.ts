import { Routes } from '@angular/router';
import { customerGuard, barberGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'barber',   loadComponent: () => import('./features/barber/barber.component').then(m => m.BarberComponent),     canActivate: [barberGuard] },
  { path: 'customer', loadComponent: () => import('./features/customer/customer.component').then(m => m.CustomerComponent), canActivate: [customerGuard] },
  { path: 'admin',    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),         canActivate: [adminGuard] },
  { path: 'terms',   loadComponent: () => import('./features/policy/policy-page.component').then(m => m.PolicyPageComponent) },
  { path: 'privacy', loadComponent: () => import('./features/policy/policy-page.component').then(m => m.PolicyPageComponent) },
  { path: 'refund',  loadComponent: () => import('./features/policy/policy-page.component').then(m => m.PolicyPageComponent) },
  { path: '**', redirectTo: '' }
];
