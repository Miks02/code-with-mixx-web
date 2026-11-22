import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { FilterContainer } from './filter-container';

@Component({
  imports: [FilterContainer, FilterMenu],
  template: `
    <app-filter-container>
      <app-filter-menu
        placeholder="Status"
        [options]="{ Open: 'Otvoreni', Closed: 'Zatvoreni' }"
        [selected]="selected()"
      ></app-filter-menu>
    </app-filter-container>
  `,
})
class Host {
  selected = signal<string[]>([]);
}

describe('FilterContainer', () => {
  let fixture: ComponentFixture<Host>;
  let element: HTMLElement;

  const trigger = () => element.querySelector<HTMLButtonElement>('button[aria-label="Filteri"]')!;
  const dialog = () => element.querySelector<HTMLDialogElement>('dialog')!;

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };

    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('opens the dialog from the trigger and closes it on a backdrop click', async () => {
    expect(dialog().open).toBe(false);

    trigger().click();
    await fixture.whenStable();
    expect(dialog().open).toBe(true);
    expect(trigger().className).toContain('border-amber-500');

    element.querySelector<HTMLButtonElement>('button[aria-label="Zatvori"]')!.click();
    await fixture.whenStable();
    expect(dialog().open).toBe(false);
    expect(trigger().className).toContain('border-emerald-400');
  });

  it('stays open when clicking inside the dialog content', async () => {
    trigger().click();
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('app-filter-menu button')!.click();
    await fixture.whenStable();
    expect(dialog().open).toBe(true);
  });

  it('marks the trigger when any filter inside has a selection', async () => {
    expect(trigger().className).toContain('border-emerald-400');

    fixture.componentInstance.selected.set(['Open']);
    await fixture.whenStable();
    expect(trigger().className).toContain('border-amber-500');
  });

  it('renders the filters without their own mobile trigger', () => {
    expect(element.querySelectorAll('app-filter-menu button').length).toBe(1);
  });
});
