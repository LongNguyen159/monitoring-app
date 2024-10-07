import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MonitorService } from './services/monitor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatSlideToggleModule, MatButtonModule,
    LineChartComponent, NgxEchartsDirective
  ],
  providers: [
    provideEcharts(),
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'monitoring-app';

  monitoringService = inject(MonitorService)
  metrics: any;

  chartOptions: EChartsOption = {}
  mergeOptions: EChartsOption = {}

  userData = {
    userName: 'admin',
    password: 'admin123'
  }

  responseTimeBuffer: number[] = []
  timestampBuffer: string[] = []


  constructor() {
    document.body.classList.add('dark-theme');
  }

  ngOnInit() {
    this.initChart()
    this.monitoringService.monitorWebsite('/api').subscribe({
      next: (response) => {
        console.log('Response received:', response);
        this.metrics = response
        this.responseTimeBuffer.push(response.responseTime)
        const timestamp = new Date().toLocaleTimeString()
        
        this.timestampBuffer.push(timestamp)

        console.log('Response time buffer:', this.timestampBuffer);
        if (this.responseTimeBuffer.length > 50) {
          this.responseTimeBuffer.shift()
          this.timestampBuffer.shift()
        }
        this.updateChart()
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error occurred:', err);
      }
    })
  }



  initChart() {
    this.chartOptions = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: this.timestampBuffer
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }]
    }
  }

  updateChart() {
    this.mergeOptions = {
      xAxis: {
        type: 'category',
        data: this.timestampBuffer
      },
      series: {
        data: this.responseTimeBuffer
      }
    }
  }


  login(loginData: any) {
    if (loginData.userName === this.userData.userName && loginData.password === this.userData) {
      console.log('Login successful');
    } else {
      console.log('Username or Password is incorrect');
    }
  }

  ngOnDestroy() {
    console.log('AppComponent destroyed');
  }
}
