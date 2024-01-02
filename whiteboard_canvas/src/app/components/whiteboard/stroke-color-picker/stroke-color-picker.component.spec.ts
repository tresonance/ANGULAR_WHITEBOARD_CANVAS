import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrokeColorPickerComponent } from './stroke-color-picker.component';

describe('StrokeColorPickerComponent', () => {
  let component: StrokeColorPickerComponent;
  let fixture: ComponentFixture<StrokeColorPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrokeColorPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrokeColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
