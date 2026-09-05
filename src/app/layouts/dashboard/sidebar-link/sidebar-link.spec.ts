import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarLink } from './sidebar-link';

describe('SidebarLink', () => {
  let component: SidebarLink;
  let fixture: ComponentFixture<SidebarLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarLink],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarLink);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
