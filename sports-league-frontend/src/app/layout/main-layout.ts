import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import {
  MatToolbarModule, MatSidenavModule, MatListModule,
  MatIconModule, MatButtonModule, MatMenuModule,
  MatBadgeModule
} from '../shared/material.imports';
import { AuthService } from '../core/services/auth.service';
 
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'"
                   [opened]="!isMobile" class="app-sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">sports_soccer</mat-icon>
          <span class="logo-text">Liga Deportiva</span>
        </div>
 
        <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span>Dashboard</span>
        </a>

          <a mat-list-item routerLink="/" routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/teams" routerLinkActive="active">
            <mat-icon matListItemIcon>groups</mat-icon>
            <span>Equipos</span>
          </a>
          <a mat-list-item routerLink="/players" routerLinkActive="active">
            <mat-icon matListItemIcon>person</mat-icon>
            <span>Jugadores</span>
          </a>
          <a mat-list-item routerLink="/referees" routerLinkActive="active">
            <mat-icon matListItemIcon>sports</mat-icon>
            <span>Árbitros</span>
          </a>
          <a mat-list-item routerLink="/tournaments" routerLinkActive="active">
            <mat-icon matListItemIcon>emoji_events</mat-icon>
            <span>Torneos</span>
          </a>
          <a mat-list-item routerLink="/matches" routerLinkActive="active">
            <mat-icon matListItemIcon>stadium</mat-icon>
            <span>Partidos</span>
          </a>
          <a mat-list-item routerLink="/standings" routerLinkActive="active">
            <mat-icon matListItemIcon>leaderboard</mat-icon>
            <span>Tabla de Posiciones</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
 
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          @if (isMobile) {
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ authService.userName() }}
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <strong>{{ authService.userEmail() }}</strong>
              <small>{{ authService.userRoles().join(', ') }}</small>
            </div>
            <button mat-menu-item (click)="authService.logout()">
              <mat-icon>logout</mat-icon> Cerrar sesión
            </button>
          </mat-menu>
        </mat-toolbar>
 
        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height: 100vh; }
    .app-sidenav { width: 260px; }
    .sidenav-header {
      display: flex; align-items: center; gap: 12px;
      padding: 24px 16px; border-bottom: 1px solid #e0e0e0;
    }
    .logo-icon { font-size: 32px; width: 32px; height: 32px; color: #1565C0; }
    .logo-text { font-size: 18px; font-weight: 600; color: #1565C0; }
    .toolbar-spacer { flex: 1; }
    .main-content { padding: 24px; }
    .active { background: rgba(21, 101, 192, 0.08) !important; }
    .active mat-icon { color: #1565C0; }
    .user-info {
      padding: 12px 16px; border-bottom: 1px solid #eee;
      display: flex; flex-direction: column;
    }
    .user-info small { color: #757575; margin-top: 4px; }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = false;
 
  @ViewChild('sidenav') sidenav!: MatSidenav;
 
  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }
}

