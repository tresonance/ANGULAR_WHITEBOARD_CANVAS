import { TestBed } from '@angular/core/testing';

import { HandwrittingSegmentationService } from './handwritting-segmentation.service';

describe('HandwrittingSegmentationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HandwrittingSegmentationService = TestBed.get(HandwrittingSegmentationService);
    expect(service).toBeTruthy();
  });
});
