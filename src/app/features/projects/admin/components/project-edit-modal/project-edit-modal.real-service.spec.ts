import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '../../../../../../environments/environment';
import { ProjectEditModal } from './project-edit-modal';

describe('ProjectEditModal with real ProjectService', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectEditModal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTanStackQuery(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should create before inputs are set and load details once projectId arrives', async () => {
    const fixture = TestBed.createComponent(ProjectEditModal);

    fixture.componentRef.setInput('projectId', 5);
    fixture.componentRef.setInput('reservationId', 9);
    fixture.detectChanges();
    await fixture.whenStable();

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/admin/reservations/projects/items/5`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(null);
  });
});
