import { TestBed } from '@angular/core/testing';
import { createEmptyClass } from '../factories/class-factories';
import { ClassFormService } from './class-form-service';

describe('ClassFormService', () => {
  let service: ClassFormService;

  function classes() {
    return service.reservationModel().classes;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassFormService);
    service.reservationModel.update((model) => ({
      ...model,
      classes: [
        { ...createEmptyClass(), id: 1, startsAt: '2026-11-03T10:00', endsAt: '2026-11-03T10:45' },
        { ...createEmptyClass(), id: 2, startsAt: '2026-11-03T10:50', endsAt: '2026-11-03T11:35' },
      ],
    }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addClass', () => {
    it('should add a new class starting when the last one ends', () => {
      service.addClass();

      expect(classes()).toHaveLength(3);
      expect(classes()[2]).toMatchObject({
        id: 0,
        startsAt: '2026-11-03T11:35',
        endsAt: '2026-11-03T12:20',
      });
    });
  });

  describe('removeClass', () => {
    it('should mark an existing class for deletion', () => {
      service.removeClass(0);

      expect(classes().map((c) => c.id)).toEqual([2]);
      expect(service.reservationModel().classesToDelete).toEqual([1]);
    });

    it('should not mark a new class for deletion', () => {
      service.addClass();

      service.removeClass(2);

      expect(classes()).toHaveLength(2);
      expect(service.reservationModel().classesToDelete).toEqual([]);
    });

    it('should not remove the only class', () => {
      service.removeClass(0);
      service.removeClass(0);

      expect(classes().map((c) => c.id)).toEqual([2]);
      expect(service.reservationModel().classesToDelete).toEqual([1]);
    });

    it('should ignore an unknown class index', () => {
      const before = service.reservationModel();

      service.removeClass(5);

      expect(service.reservationModel()).toBe(before);
    });
  });

  describe('updateClass', () => {
    it('should update only the selected class', () => {
      service.updateClass(1, { price: 2000 });

      expect(classes().map((c) => c.price)).toEqual([1300, 2000]);
    });
  });

  describe('reset', () => {
    it('should restore an empty reservation', () => {
      service.removeClass(0);

      service.reset();

      expect(classes()).toHaveLength(1);
      expect(classes()[0].id).toBe(0);
      expect(service.reservationModel().classesToDelete).toEqual([]);
    });
  });
});
