import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';
 
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'teams', pathMatch: 'full' },
      {
        path: 'teams',
        loadComponent: () =>
          import('./features/teams/team-list').then(m => m.TeamListComponent)
      },
      {
        path: 'players',
        loadComponent: () =>
          import('./features/players/player-list')
            .then(m => m.PlayerListComponent)
      },
      {
        path: 'referees',
        loadComponent: () =>
          import('./features/referees/referee-list')
            .then(m => m.RefereeListComponent)
      },
      // Fases posteriores:
      // { path: 'tournaments', loadComponent: ... },
      // { path: 'matches', loadComponent: ... },
      // { path: 'standings', loadComponent: ... },
    ]
  },
  { path: '**', redirectTo: '' }
];
