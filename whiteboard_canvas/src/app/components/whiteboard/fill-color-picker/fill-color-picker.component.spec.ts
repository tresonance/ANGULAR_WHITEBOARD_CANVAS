import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FillColorPickerComponent } from './fill-color-picker.component';

describe('FillColorPickerComponent', () => {
  let component: FillColorPickerComponent;
  let fixture: ComponentFixture<FillColorPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FillColorPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
