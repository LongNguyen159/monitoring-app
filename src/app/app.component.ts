import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MonitorService } from './services/monitor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatSlideToggleModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'monitoring-app';

  monitoringService = inject(MonitorService)
  metrics: any;

  constructor() {
    document.body.classList.add('dark-theme');
  }

  ngOnInit() {
    this.monitoringService.monitorWebsite('/api').subscribe({
      next: (response) => {
        console.log('Response received:', response);
        this.metrics = response
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error occurred:', err);
      }
    })
  }

  ngOnDestroy() {
    console.log('AppComponent destroyed');
  }
}
