import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectCard } from './subject-card';

describe('SubjectCard', () => {
  let component: SubjectCard;
  let fixture: ComponentFixture<SubjectCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subject', {
      id: 1,
      subjectName: 'Matematika',
      subjectDescription: 'Opis predmeta',
      classesCount: 10,
      studentsCount: 20,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: null,
      deletedAt: null,
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dim the card when addOpacity is true', () => {
    fixture.componentRef.setInput('addOpacity', true);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('div');
    expect(host.style.opacity).toBe('0.5');
  });
});
