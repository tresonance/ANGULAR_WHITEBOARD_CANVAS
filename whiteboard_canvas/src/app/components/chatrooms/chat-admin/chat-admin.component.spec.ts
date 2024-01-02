import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAdminComponent } from './chat-admin.component';

describe('ChatAdminComponent', () => {
  let component: ChatAdminComponent;
  let fixture: ComponentFixture<ChatAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
