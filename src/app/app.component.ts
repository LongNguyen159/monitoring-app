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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatSlideToggleModule, MatButtonModule, LineChartComponent, NgxEchartsDirective,
    FormsModule
  ],
  providers: [provideEcharts()],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'monitoring-app';

  // Inject monitoring service
  private monitoringService = inject(MonitorService);

  ramPieOptions: EChartsOption = {};
  mergedRamPieOptions: EChartsOption = {};

  cpuLineChartOptions: EChartsOption = {}
  cpuMergedLineChartOption: EChartsOption = {}

  ramLineChartOptions: EChartsOption = {}
  ramMergedLineChartOption: EChartsOption = {}



  private cpuThreshold = 60; // CPU usage threshold (in percentage)
  private ramThreshold = 50; // RAM usage threshold (in percentage)
  warningBuffer: string[] = [];

  // Metrics buffer and timestamp buffer
  latestMetrics: SystemMetrics = { cpu_usage: 0, memory: { total: 0, available: 0, used_percent: 0 } };
  metricsBuffer: SystemMetrics[] = [];
  timestampValue: string = '';
  timestampBuffer: string[] = [];

  // User credentials for login
  private userData = { userName: 'admin', password: 'admin123' };

  loginData = {
    userName: '',
    password: ''
  };

  isLoggedIn = false;
  loginFailed = false;

  constructor() {
    // Adding a dark theme to the body
    document.body.classList.add('dark-theme');
  }

  ngOnInit(): void {
    this.loadBufferFromLocalStorage(); 
    this.initChart();
    this.subscribeToSystemMetrics();
  }


  private saveBufferToLocalStorage(): void {
    // Convert buffers to JSON strings and store them in localStorage
    localStorage.setItem('metricsBuffer', JSON.stringify(this.metricsBuffer));
    localStorage.setItem('timestampBuffer', JSON.stringify(this.timestampBuffer));
  }

  private loadBufferFromLocalStorage(): void {
    // Check if there's data in localStorage and load it into the buffers
    const savedMetricsBuffer = localStorage.getItem('metricsBuffer');
    const savedTimestampBuffer = localStorage.getItem('timestampBuffer');
  
    if (savedMetricsBuffer) {
      this.metricsBuffer = JSON.parse(savedMetricsBuffer);
    }
  
    if (savedTimestampBuffer) {
      this.timestampBuffer = JSON.parse(savedTimestampBuffer);
    }
  }

  private initChart(): void {
    // Initialize the pie chart for memory usage with default values
    this.ramPieOptions = {
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
          },
          label: {
            show: true,  // Show labels on the slices
            formatter: '{b}: {c} GB ({d}%)', // Display name, value, and percentage
            fontSize: 14,  // Font size for the label text
          }
        }
      ]
    };


    this.cpuLineChartOptions = {
      tooltip: {
        trigger: 'axis',
        // formatter: '{b0}: {c0}%', // Format tooltip to show time and CPU usage percentage
      },
      xAxis: {
        type: 'category',
        data: [], // This will be populated dynamically
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%' // Format the Y-axis values as percentages
        }
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'line',
          smooth: true,
          data: [], // This will be populated dynamically
          itemStyle: {
            color: '#ff7f50' // Set the line color
          }
        }
      ]
    };

    this.ramLineChartOptions = {
      tooltip: {
        trigger: 'axis',
        // formatter: '{b0}: {c0}%', // Format tooltip to show time and CPU usage percentage
      },
      xAxis: {
        type: 'category',
        data: [], // This will be populated dynamically
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%' // Format the Y-axis values as percentages
        }
      },
      series: [
        {
          name: 'RAM Usage',
          type: 'line',
          smooth: true,
          data: [], // This will be populated dynamically
          // itemStyle: {
          //   color: '#ff7f50' // Set the line color
          // }
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
        this.timestampValue = timestamp;
        this.timestampBuffer.push(timestamp);

        // Keep the buffer size under control (limit it to 50)
        this._shiftBuffer();


        this.saveBufferToLocalStorage();

        this.checkUsageAgainstThresholds();


        // Update the pie chart with the new data
        this.updateChart();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error occurred:', err);
      }
    });
  }


  private checkUsageAgainstThresholds(): void {
    // Check if CPU usage exceeds the threshold
    if (this.latestMetrics.cpu_usage > this.cpuThreshold) {
      const cpuWarning = `Warning [${this.timestampValue}]: CPU usage is high at ${this.latestMetrics.cpu_usage}%`;
      this.warningBuffer.unshift(cpuWarning);
    }
  
    // Check if RAM usage exceeds the threshold
    if (this.latestMetrics.memory.used_percent > this.ramThreshold) {
      const ramWarning = `Warning [${this.timestampValue}]: RAM usage is high at ${this.latestMetrics.memory.used_percent}%`;
      this.warningBuffer.unshift(ramWarning);
    }
  }

  private _shiftBuffer(): void {
    // Ensure that the buffer does not exceed 50 elements
    if (this.metricsBuffer.length > 50) {
      this.metricsBuffer.shift();
      this.timestampBuffer.shift();
    }
  }

  private updateChart(): void {
    this.mergedRamPieOptions = {
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

    this.cpuMergedLineChartOption = {
      xAxis: {
        type: 'category',
        data: this.timestampBuffer
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'line',
          smooth: true,
          data: this.metricsBuffer.map(metric => metric.cpu_usage), // Map the CPU usage over time
          itemStyle: {
            color: '#ff7f50' // Set the line color for CPU usage
          }
        }
      ]
    };

    this.ramMergedLineChartOption = {
      xAxis: {
        type: 'category',
        data: this.timestampBuffer
      },
      series: [
        {
          name: 'RAM Usage',
          type: 'line',
          smooth: true,
          data: this.metricsBuffer.map(metric => metric.memory.used_percent), // Map the RAM usage over time
          // itemStyle: {
          //   color: '#ff7f50' // Set the line color for RAM usage
          // }
        }
      ]
    }
  }


  login(loginData: any): void {
    // Check user credentials (username & password)
    if (loginData.userName === this.userData.userName && loginData.password === this.userData.password) {
      this.isLoggedIn = true;
      this.loginFailed = false;
      console.log('Login successful');
    } else {
      this.loginFailed = true;
      console.log('Username or Password is incorrect');
    }
  }

  saveResponseTimeBufferToFile(): void {
    // User login information
    const userInfo = `Logged in user: ${this.loginData.userName}\n`;
  
    // Metrics buffer data
    const metricsData = this.metricsBuffer.map(metric => JSON.stringify(metric)).join('\n');
  
    // Combine user info with the metrics data
    const data = userInfo + metricsData;
  
    // Create a blob for download
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
