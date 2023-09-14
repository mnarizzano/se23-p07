import { TestBed } from '@angular/core/testing';

import { FasceOrarieService } from './fasce-orarie.service';

describe('FasceOrarieService', () => {
  let service: FasceOrarieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FasceOrarieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
