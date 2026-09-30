import { ReceitaService } from './receita';

describe('ReceitaService', () => {
  let service: ReceitaService;

  beforeEach(() => {
    service = new ReceitaService({ next: async () => 'RCP-0001' } as any);
  });

  it('should sum daily, weekly, monthly and yearly revenue correctly', () => {
    const referencia = new Date('2026-09-27T12:00:00');
    const receitas = [
      { id: '1', pedidoId: 'PED-1', valor: 100, data: new Date('2026-09-27T09:00:00').getTime() },
      { id: '2', pedidoId: 'PED-2', valor: 200, data: new Date('2026-09-20T09:00:00').getTime() },
      { id: '3', pedidoId: 'PED-3', valor: 300, data: new Date('2026-09-05T09:00:00').getTime() },
      { id: '4', pedidoId: 'PED-4', valor: 400, data: new Date('2026-01-10T09:00:00').getTime() },
    ];

    expect(service.totalPorPeriodo(receitas, 'Diária', referencia)).toBe(100);
    expect(service.totalPorPeriodo(receitas, 'Semanal', referencia)).toBe(300);
    expect(service.totalPorPeriodo(receitas, 'Mensal', referencia)).toBe(300);
    expect(service.totalPorPeriodo(receitas, 'Anual', referencia)).toBe(1000);
  });
});
