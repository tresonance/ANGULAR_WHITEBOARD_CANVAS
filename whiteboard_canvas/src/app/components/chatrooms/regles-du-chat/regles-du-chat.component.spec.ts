import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglesDuChatComponent } from './regles-du-chat.component';

describe('ReglesDuChatComponent', () => {
  let component: ReglesDuChatComponent;
  let fixture: ComponentFixture<ReglesDuChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReglesDuChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReglesDuChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
