import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminActionBar } from './admin-action-bar';

describe('AdminActionBar', () => {
  let component: AdminActionBar;
  let fixture: ComponentFixture<AdminActionBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActionBar],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminActionBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
