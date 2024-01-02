import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosServicesComponent } from './infos-services.component';

describe('InfosServicesComponent', () => {
  let component: InfosServicesComponent;
  let fixture: ComponentFixture<InfosServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfosServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
