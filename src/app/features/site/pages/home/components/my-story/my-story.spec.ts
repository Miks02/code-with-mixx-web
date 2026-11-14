import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyStory } from './my-story';

describe('MyStory', () => {
  let component: MyStory;
  let fixture: ComponentFixture<MyStory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyStory],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MyStory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
