import type { Mock } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { settle } from '@core/testing/test-utils';
import { ScrollIntoViewOn } from './scroll-into-view-on';

@Component({
  imports: [ScrollIntoViewOn],
  template: `<div [appScrollIntoViewOn]="requests()"></div>`,
})
class HostComponent {
  requests = signal(0);
}

describe('ScrollIntoViewOn', () => {
  let scrollIntoView: Mock<Element['scrollIntoView']>;
  let host: HostComponent;

  beforeEach(async () => {
    scrollIntoView = vi.fn<Element['scrollIntoView']>();
    Element.prototype.scrollIntoView = scrollIntoView;

    const fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  it('does not scroll on the initial value', () => {
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls the host element smoothly when the value changes', async () => {
    host.requests.set(1);
    await settle();

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(scrollIntoView.mock.contexts[0]).toBeInstanceOf(HTMLDivElement);
  });

  it('scrolls again on every new request', async () => {
    host.requests.set(1);
    await settle();
    host.requests.set(2);
    await settle();

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('does not scroll again when the value stays the same', async () => {
    host.requests.set(1);
    await settle();
    host.requests.set(1);
    await settle();

    expect(scrollIntoView).toHaveBeenCalledOnce();
  });
});
