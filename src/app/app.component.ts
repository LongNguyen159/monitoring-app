import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MonitorService, SystemMetrics } from './services/monitor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatSlideToggleModule, MatButtonModule, LineChartComponent, NgxEchartsDirective],
  providers: [provideEcharts()],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'monitoring-app';

  // Inject monitoring service
  private monitoringService = inject(MonitorService);

  // Pie chart options for memory usage
  pieChartOptions: EChartsOption = {};
  mergedPieOptions: EChartsOption = {};

  // Metrics buffer and timestamp buffer
  latestMetrics: SystemMetrics = { cpu_usage: 0, memory: { total: 0, available: 0, used_percent: 0 } };
  metricsBuffer: SystemMetrics[] = [];
  timestampBuffer: string[] = [];

  // User credentials for login
  private userData = { userName: 'admin', password: 'admin123' };

  constructor() {
    // Adding a dark theme to the body
    document.body.classList.add('dark-theme');
  }

  ngOnInit(): void {
    this.initChart();
    this.subscribeToSystemMetrics();
  }

  private initChart(): void {
    // Initialize the pie chart for memory usage with default values
    this.pieChartOptions = {
      // title: { text: 'Memory Usage (RAM)', left: 'center' },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: <strong>{c} GB ({d}%)</strong>', // Customize to show two decimals
      },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: 'Memory Usage',
          type: 'pie',
          radius: '50%',
          data: [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  private subscribeToSystemMetrics(): void {
    // Subscribing to system metrics from the monitoring service
    this.monitoringService.getSystemMetrics().subscribe({
      next: (response: SystemMetrics) => {
        console.log('Response received:', response);
        this.latestMetrics = response;
        // Add the response data to the buffers
        this.metricsBuffer.push(response);
        const timestamp = new Date().toLocaleTimeString();
        this.timestampBuffer.push(timestamp);

        // Keep the buffer size under control (limit it to 50)
        this._shiftBuffer();
        
        // Update the pie chart with the new data
        this.updateChart();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error occurred:', err);
      }
    });
  }

  private _shiftBuffer(): void {
    // Ensure that the buffer does not exceed 50 elements
    if (this.metricsBuffer.length > 50) {
      this.metricsBuffer.shift();
      this.timestampBuffer.shift();
    }
  }

  private updateChart(): void {
  this.mergedPieOptions = {
    series: [
      {
        name: 'Memory Usage',
        type: 'pie',
        radius: '50%',
        data: [
          {
            value: parseFloat((this.latestMetrics.memory.total * this.latestMetrics.memory.used_percent / 100).toFixed(2)),
            name: 'Used'
          },
          {
            value: parseFloat((this.latestMetrics.memory.available).toFixed(2)),
            name: 'Available'
          }
        ]
      }
    ]
  };
}


  login(loginData: any): void {
    // Check user credentials (username & password)
    if (loginData.userName === this.userData.userName && loginData.password === this.userData.password) {
      console.log('Login successful');
    } else {
      console.log('Username or Password is incorrect');
    }
  }

  saveResponseTimeBufferToFile(): void {
    // Save the metrics buffer to a file
    const data = this.metricsBuffer.map(metric => JSON.stringify(metric)).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });

    // Create a download link and trigger the download
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'metricsBuffer.txt';
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  ngOnDestroy(): void {
    console.log('AppComponent destroyed');
  }
}
