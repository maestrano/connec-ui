import { TestBed, inject } from '@angular/core/testing';

import { ConnecApiService } from './connec-api.service';

describe('ConnecApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnecApiService]
    });
  });

  it('should be created', inject([ConnecApiService], (service: ConnecApiService) => {
    expect(service).toBeTruthy();
  }));
});
