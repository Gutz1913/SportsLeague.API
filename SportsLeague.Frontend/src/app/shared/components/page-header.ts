import { Component, input, output } from '@angular/core';
import { MatButtonModule, MatIconModule } from '../../shared/material.imports';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title() }}</h1>
        @if (subtitle()) { <p class="subtitle">{{ subtitle() }}</p> }
      </div>
      @if (showAddButton()) {
        <button mat-raised-button color="primary" (click)="add.emit()">
          <mat-icon>add</mat-icon> {{ addButtonText() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 24px;
    }
    h1 { margin: 0; color: #1565C0; }
    .subtitle { margin: 4px 0 0; color: #757575; }
  `]
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  showAddButton = input<boolean>(false);
  addButtonText = input<string>('Agregar');
  add = output<void>();
}

