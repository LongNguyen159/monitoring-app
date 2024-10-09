import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, map, startWith, switchMap } from 'rxjs';

export interface SystemMetrics {
  cpu_usage: number; /** In percentage */
  memory: Memory;
}

export interface Memory {
  total: number;
  available: number;
  used_percent: number;
}


@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private apiEndpoint = 'http://localhost:8000';


  constructor(private http: HttpClient) { }

  getSystemMetrics() {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        return this.http.get<SystemMetrics>(`${this.apiEndpoint}/system`);
      })
    )
  }
}
