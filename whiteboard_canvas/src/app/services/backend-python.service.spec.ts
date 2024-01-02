import { TestBed } from '@angular/core/testing';

import { BackendPythonService } from './backend-python.service';

describe('BackendPythonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackendPythonService = TestBed.get(BackendPythonService);
    expect(service).toBeTruthy();
  });
});
