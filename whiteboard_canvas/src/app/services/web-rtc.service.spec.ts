import { TestBed } from '@angular/core/testing';

import { WebRTCService } from './web-rtc.service';

describe('WebRTCService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebRTCService = TestBed.get(WebRTCService);
    expect(service).toBeTruthy();
  });
});
