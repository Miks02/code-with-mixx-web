import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentsPage } from './students-page';

describe('StudentsPage', () => {
  let component: StudentsPage;
  let fixture: ComponentFixture<StudentsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep multiple filters selected after clicking them in the filter menu', async () => {
    const host: HTMLElement = fixture.nativeElement;
    const openMenu = host.querySelector('app-filter-menu button') as HTMLButtonElement;
    openMenu.click();
    await fixture.whenStable();

    const options = () =>
      Array.from(host.querySelectorAll('app-filter-menu ul')[0].querySelectorAll('button'));
    options()[0].click();
    await fixture.whenStable();
    options()[2].click();
    await fixture.whenStable();

    expect(host.querySelector('app-filter-menu button span')?.textContent).toContain('Filteri (2)');
  });
});
