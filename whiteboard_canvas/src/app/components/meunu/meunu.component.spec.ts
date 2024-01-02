import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeunuComponent } from './meunu.component';

describe('MeunuComponent', () => {
  let component: MeunuComponent;
  let fixture: ComponentFixture<MeunuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeunuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeunuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
