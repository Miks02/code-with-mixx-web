import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import {
  createSubject,
  provideSubjectTesting,
  settle,
  SUBJECTS_URL,
} from '@features/subjects/testing/subject-test-utils';
import { SubjectService } from './subject-service';

describe('SubjectService', () => {
  let service: SubjectService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideSubjectTesting()] });
    service = TestBed.inject(SubjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('createSubjectMutation POSTs the request to /admin/subjects', async () => {
    const result = service.createSubjectMutation.mutateAsync({
      subjectName: 'Baze podataka',
      subjectDescription: 'Relacioni model, SQL upiti i normalizacija',
    });
    await settle();

    const request = http.expectOne(SUBJECTS_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      subjectName: 'Baze podataka',
      subjectDescription: 'Relacioni model, SQL upiti i normalizacija',
    });
    request.flush(createSubject({ id: 2, subjectName: 'Baze podataka' }));

    expect((await result).id).toBe(2);
  });

  it('updateSubjectMutation PUTs to /admin/subjects/:id without the id in the body', async () => {
    const result = service.updateSubjectMutation.mutateAsync({
      id: 3,
      subjectName: 'Web programiranje',
      subjectDescription: 'HTML, CSS i osnove Angular-a',
    });
    await settle();

    const request = http.expectOne(`${SUBJECTS_URL}/3`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      subjectName: 'Web programiranje',
      subjectDescription: 'HTML, CSS i osnove Angular-a',
    });
    request.flush(createSubject({ id: 3, subjectName: 'Web programiranje' }));

    expect((await result).subjectName).toBe('Web programiranje');
  });

  it('deleteSubjectMutation sends DELETE to /admin/subjects/:id', async () => {
    const result = service.deleteSubjectMutation.mutateAsync(4);
    await settle();

    const request = http.expectOne(`${SUBJECTS_URL}/4`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    await result;
  });

  it('archiveSubjectMutation POSTs to /admin/subjects/:id/archive', async () => {
    const result = service.archiveSubjectMutation.mutateAsync(5);
    await settle();

    const request = http.expectOne(`${SUBJECTS_URL}/5/archive`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
    await result;
  });

  it('restoreSubjectMutation POSTs to /admin/subjects/:id/restore', async () => {
    const result = service.restoreSubjectMutation.mutateAsync(6);
    await settle();

    const request = http.expectOne(`${SUBJECTS_URL}/6/restore`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
    await result;
  });

  it('getSubjectsLookupQuery loads /subjects/lookup', async () => {
    const query = TestBed.runInInjectionContext(() => service.getSubjectsLookupQuery());
    await settle();

    http
      .expectOne(`${environment.apiUrl}/subjects/lookup`)
      .flush([{ id: 1, subjectName: 'Osnove programiranja' }]);
    await settle();

    expect(query.data()).toEqual([{ id: 1, subjectName: 'Osnove programiranja' }]);
  });
});
