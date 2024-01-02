import { TestBed } from '@angular/core/testing';

import { HandwrittingPreprocessingService } from './handwritting-preprocessing.service';

describe('HandwrittingPreprocessingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HandwrittingPreprocessingService = TestBed.get(HandwrittingPreprocessingService);
    expect(service).toBeTruthy();
  });
});
