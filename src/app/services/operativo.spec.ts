import { TestBed } from '@angular/core/testing';
import { Operativo } from './operativo';

describe('Operativo', () => {
  let service: Operativo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Operativo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
