import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortMenu } from './sort-menu';

describe('SortMenu', () => {
  let component: SortMenu;
  let fixture: ComponentFixture<SortMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(SortMenu);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', { CreatedAtDescending: 'Najnovije' });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
