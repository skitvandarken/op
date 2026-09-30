import { TestBed } from '@angular/core/testing';
import { Propriedade } from './propriedade';

describe('Propriedade', () => {
  let service: Propriedade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Propriedade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
