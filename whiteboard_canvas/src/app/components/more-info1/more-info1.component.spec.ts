import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInfo1Component } from './more-info1.component';

describe('MoreInfo1Component', () => {
  let component: MoreInfo1Component;
  let fixture: ComponentFixture<MoreInfo1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreInfo1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreInfo1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
