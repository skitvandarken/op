import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropriedadeDetalhe } from './propriedade-detalhe';

describe('PropriedadeDetalhe', () => {
  let component: PropriedadeDetalhe;
  let fixture: ComponentFixture<PropriedadeDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropriedadeDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(PropriedadeDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
