import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Propriedades } from './propriedades';

describe('Propriedades', () => {
  let component: Propriedades;
  let fixture: ComponentFixture<Propriedades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Propriedades],
    }).compileComponents();

    fixture = TestBed.createComponent(Propriedades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
