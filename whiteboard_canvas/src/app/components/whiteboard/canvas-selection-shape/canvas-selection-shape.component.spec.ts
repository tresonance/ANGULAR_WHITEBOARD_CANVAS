import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasSelectionShapeComponent } from './canvas-selection-shape.component';

describe('CanvasSelectionShapeComponent', () => {
  let component: CanvasSelectionShapeComponent;
  let fixture: ComponentFixture<CanvasSelectionShapeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasSelectionShapeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasSelectionShapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
