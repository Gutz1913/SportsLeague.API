import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout';
 
export const routes: Routes = [
  // --- Rutas públicas (sin layout) ---
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register')
        .then(m => m.RegisterComponent)
  },
 
  // --- Rutas protegidas (con layout) ---
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./features/teams/team-list')
            .then(m => m.TeamListComponent)
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
      {
        path: 'tournaments',
        loadComponent: () =>
          import('./features/tournaments/tournament-list')
            .then(m => m.TournamentListComponent)
      },
      {
        path: 'tournaments/:id',
        loadComponent: () =>
          import('./features/tournaments/tournament-detail')
            .then(m => m.TournamentDetailComponent)
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./features/matches/match-list')
            .then(m => m.MatchListComponent)
      },
      {
        path: 'matches/:id',
        loadComponent: () =>
          import('./features/matches/match-detail')
            .then(m => m.MatchDetailComponent)
      },
      {
        path: 'standings',
        loadComponent: () =>
          import('./features/standings/standings-page')
            .then(m => m.StandingsPageComponent)
      }
    ]
  },
 
  { path: '**', redirectTo: '' }
];

