import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesPage } from './classes-page';

describe('ClassesPage', () => {
  let component: ClassesPage;
  let fixture: ComponentFixture<ClassesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
