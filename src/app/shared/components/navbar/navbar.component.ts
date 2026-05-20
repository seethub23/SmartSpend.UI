import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [DatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly toggleSidebar = output<void>();

  protected readonly currentDate = signal(new Date());

  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
