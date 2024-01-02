import { TestBed } from '@angular/core/testing';

import { MathJackService } from './math-jack.service';

describe('MathJackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MathJackService = TestBed.get(MathJackService);
    expect(service).toBeTruthy();
  });
});
