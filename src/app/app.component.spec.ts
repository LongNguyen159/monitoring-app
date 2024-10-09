import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component'; // Import your component
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MonitorService } from './services/monitor.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  // let monitorService: MonitorService;
  let httpMock: HttpTestingController; // This will allow you to mock HTTP requests

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Make sure it's imported before the component
        AppComponent // Since it's a standalone component, it goes here
      ],
      providers: [MonitorService, provideHttpClient(), provideHttpClientTesting()] // Ensure the MonitorService is provided
    });

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    // monitorService = TestBed.inject(MonitorService); // Inject MonitorService
    httpMock = TestBed.inject(HttpTestingController); // Inject HttpTestingController
  });

  afterEach(() => {
    httpMock.verify(); // Ensure there are no outstanding HTTP requests after each test
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should mock the HTTP call made by the monitor service', () => {
    fixture.detectChanges();
    const mockResponse = {
      cpu_usage: 75,
      memory: { total: 100, available: 50, used_percent: 50 }
    };

    // Capture the HTTP request made by the service
    const req = httpMock.expectOne('http://localhost:8000/system');
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockResponse);

    // Verify no outstanding requests
    httpMock.verify();
  });
});
