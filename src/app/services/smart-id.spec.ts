import { TestBed } from '@angular/core/testing';
import { SmartId } from './smart-id';

describe('SmartId', () => {
  let service: SmartId;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartId);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
