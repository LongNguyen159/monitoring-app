import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, map, startWith, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  constructor(private http: HttpClient) { }

  monitorWebsite(url: string) {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        const startTime = performance.now(); // Start timer for each request
        return this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(
          map(response => {
            const endTime = performance.now(); // End timer
            const responseTime = endTime - startTime; // Calculate response time
            const statusCode = response.status; // Get HTTP status code
            const contentSize = response.body?.length; // Size of the response body  
            return {
              responseTime,
              statusCode,
              contentSize,
              // Add more metrics as needed
            };
          })
        );
      })
    );
  }
}
