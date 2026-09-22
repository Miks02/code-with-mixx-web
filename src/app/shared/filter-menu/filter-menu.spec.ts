import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterMenu } from './filter-menu';

describe('FilterMenu', () => {
  let component: FilterMenu;
  let fixture: ComponentFixture<FilterMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterMenu);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', { WithClasses: 'Sa časovima', WithProjects: 'Sa projektima' });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the placeholder when nothing is selected', () => {
    expect(component.selectedLabel()).toBe('Filteri');
  });

  it('should show the count when multiple options are selected', () => {
    fixture.componentRef.setInput('selected', ['WithClasses', 'WithProjects']);
    expect(component.selectedLabel()).toBe('Filteri (2)');
  });

  it('should emit the option added to or removed from the selection', () => {
    const emitted: string[][] = [];
    component.selectedChanged.subscribe((value) => emitted.push(value));

    fixture.componentRef.setInput('selected', ['WithClasses']);
    component.toggleOption('WithProjects');
    component.toggleOption('WithClasses');

    expect(emitted).toEqual([['WithClasses', 'WithProjects'], []]);
  });

  it('should not emit when toggling an option disabled by a conflict', () => {
    fixture.componentRef.setInput('conflictingOptions', { WithClasses: ['WithProjects'] });
    fixture.componentRef.setInput('selected', ['WithClasses']);

    const emitted: string[][] = [];
    component.selectedChanged.subscribe((value) => emitted.push(value));

    component.toggleOption('WithProjects');

    expect(emitted).toEqual([]);
  });

  it('should only listen for outside clicks while open, and stop on close', () => {
    component.toggle();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));
    expect(component.isOpen()).toBe(false);

    // A second outside click after close must not throw — the listener was removed.
    expect(() => document.dispatchEvent(new MouseEvent('click'))).not.toThrow();
  });

  it('should close on Escape while open', () => {
    component.toggle();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.isOpen()).toBe(false);
  });

  it('should not close when clicking inside the menu', () => {
    component.toggle();
    fixture.detectChanges();

    const insideElement = fixture.nativeElement.querySelector('ul button') as HTMLElement;
    insideElement.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

    expect(component.isOpen()).toBe(true);
  });
});
