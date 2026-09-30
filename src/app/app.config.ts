import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// Import Firebase Web SDK functions
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { Cliente } from './models/cliente.model';
import { Intermediario } from './models/intermediario.model';
import { Meio } from './models/meio.model';
import { Operativo } from './models/operativo.model';
import { Pedido } from './models/pedido.model';
import { Propriedade } from './models/propriedade.model';
import { Reclamacao } from './models/reclamacao.model';
import { Receita } from './models/receita.model';

const firebaseConfig = {
  apiKey: 'AIzaSyDi9uGYT6ehVEAVDsE17X9sqnok_RVsRLY',
  authDomain: 'operativuz-6c599.firebaseapp.com',
  projectId: 'operativuz-6c599',
  storageBucket: 'operativuz-6c599.firebasestorage.app',
  messagingSenderId: '61380268982',
  appId: '1:61380268982:web:eedf288b61be41acbaa717',
  measurementId: 'G-3Q1ZWVLYWP',
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Auth
export const auth = getAuth(app);

// Initialize and export Firestore database
export const db = getFirestore(app);

const clientesSeed: Omit<Cliente, 'id'>[] = [
  {
    nome: 'Ana Silva',
    email: 'ana.silva@gmail.com',
    telefone: '+244 923 111 222',
    cidade: 'Luanda',
    bairro: 'Maianga',
    rua: 'Rua 12',
    tipo: 'Recorrente',
    observacoes: 'Cliente preferencial.',
    criadoEm: Date.now(),
  },
  {
    nome: 'João Martins',
    email: 'joao.martins@hotmail.com',
    telefone: '+244 912 333 444',
    cidade: 'Benguela',
    bairro: 'Baía',
    rua: 'Avenida Central',
    tipo: 'Pontual',
    observacoes: 'Solicitou visita técnica.',
    criadoEm: Date.now() - 86400000,
  },
  {
    nome: 'Maria Costa',
    email: 'maria.costa@outlook.com',
    telefone: '+244 941 555 666',
    cidade: 'Huambo',
    bairro: 'Centro',
    rua: 'Rua das Flores',
    tipo: 'Recorrente',
    observacoes: 'Requisitou limpeza recorrente.',
    criadoEm: Date.now() - 172800000,
  },
];

const intermediariosSeed: Omit<Intermediario, 'id'>[] = [
  {
    nome: 'Marta Lopes',
    email: 'marta.lopes@imobiliaria.ao',
    telefone: '+244 921 001 002',
    cidade: 'Luanda',
    bairro: 'Talatona',
    rua: 'Avenida 4',
    documento: 'PT-0001',
    observacoes: 'Atua em imóveis de luxo.',
    criadoEm: Date.now(),
    atualizadoEm: Date.now(),
  },
  {
    nome: 'José Nunes',
    email: 'jose.nunes@negocio.ao',
    telefone: '+244 929 333 444',
    cidade: 'Lubango',
    bairro: 'Mundo',
    rua: 'Rua 9',
    documento: 'PT-0002',
    observacoes: 'Foco em imóveis comerciais.',
    criadoEm: Date.now() - 86400000,
    atualizadoEm: Date.now() - 86400000,
  },
];

const operativosSeed: Omit<Operativo, 'id'>[] = [
  {
    nome: 'Ricardo Costa',
    email: 'ricardo.costa@op.ao',
    telefone: '+244 923 101 202',
    cidade: 'Luanda',
    bairro: 'Kilamba',
    rua: 'Rua do Trabalho',
    meioId: 'MEIO-2609-001',
    meioNome: 'Toyota Corolla',
    licenca: 'L-1001',
    cartadeconducao: 'CD-1001',
    validadeLicensa: '2027-12-31',
    fotografia: '',
    numeroBilhetes: 12,
    validadeBilhete: '2026-12-31',
    observacoes: 'Operativo de limpeza e montagem.',
    pedidosRespondidos: 4,
    criadoEm: Date.now(),
  },
  {
    nome: 'Celso Mendes',
    email: 'celso.mendes@op.ao',
    telefone: '+244 924 202 303',
    cidade: 'Luanda',
    bairro: 'Viana',
    rua: 'Rua da Cruz',
    meioId: 'MEIO-2609-002',
    meioNome: 'Honda XR',
    licenca: 'L-2002',
    cartadeconducao: 'CD-2002',
    validadeLicensa: '2028-01-15',
    fotografia: '',
    numeroBilhetes: 8,
    validadeBilhete: '2026-10-12',
    observacoes: 'Operativo de visitas e mudanças.',
    pedidosRespondidos: 3,
    criadoEm: Date.now() - 172800000,
  },
];

const meiosSeed: Omit<Meio, 'id'>[] = [
  {
    tipo: 'Carro',
    marca: 'Toyota',
    modelo: 'Corolla',
    matricula: 'AA-10-BB',
    operativoId: 'OP-2609-001',
    operativoNome: 'Ricardo Costa',
    ativo: true,
  },
  {
    tipo: 'Moto',
    marca: 'Honda',
    modelo: 'XR 250',
    matricula: 'AB-22-CC',
    operativoId: 'OP-2609-002',
    operativoNome: 'Celso Mendes',
    ativo: true,
  },
  {
    tipo: 'Carrinha',
    marca: 'Ford',
    modelo: 'Transit',
    matricula: 'AC-88-DD',
    operativoId: undefined,
    operativoNome: '',
    ativo: true,
  },
];

const propriedadesSeed: Omit<Propriedade, 'id'>[] = [
  {
    item: 'Casa da Praia',
    tipologia: 'V2',
    descricao: 'Casa ampla com vista para o mar, ideal para férias e estadia prolongada.',
    preco: 350000,
    imagens: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Talatona',
      rua: 'Rua da Praia',
      referencia: 'Perto do centro comercial.',
    },
  },
  {
    item: 'Apartamento Central',
    tipologia: 'T2',
    descricao: 'Apartamento moderno no centro, com ótimas ligações e segurança 24h.',
    preco: 220000,
    imagens: ['https://images.unsplash.com/photo-1494526585095-c41746248156'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Centro',
      rua: 'Avenida 1',
      referencia: 'Próximo ao mercado central.',
    },
  },
  {
    item: 'Casa Familiar',
    tipologia: 'T3',
    descricao: 'Imóvel com quintal, bom para famílias e locação longa.',
    preco: 280000,
    imagens: ['https://images.unsplash.com/photo-1484154218962-a197022b5858'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Kilamba',
      rua: 'Rua do Sol',
      referencia: 'A 3 minutos da escola.',
    },
  },
  {
    item: 'Flat em Maianga',
    tipologia: 'T1',
    descricao: 'Flat compacto e bem localizado para quem procura praticidade no dia a dia.',
    preco: 180000,
    imagens: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Maianga',
      rua: 'Rua das Flores',
      referencia: 'Perto da praça central.',
    },
  },
  {
    item: 'Residência em Miramar',
    tipologia: 'T2',
    descricao: 'Residência moderna com área de lazer e excelente vista urbana.',
    preco: 410000,
    imagens: ['https://images.unsplash.com/photo-1448630360428-65456885c650'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Miramar',
      rua: 'Avenida Marginal',
      referencia: 'Perto do mar e do shopping.',
    },
  },
  {
    item: 'Apartamento em Viana',
    tipologia: 'T3',
    descricao: 'Apartamento com boa distribuição e fácil acesso às principais vias.',
    preco: 245000,
    imagens: ['https://images.unsplash.com/photo-1460317442991-0ec209397118'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Viana',
      rua: 'Rua da Liberdade',
      referencia: 'Próximo ao terminal de transporte.',
    },
  },
  {
    item: 'Casa em Benfica',
    tipologia: 'T4',
    descricao: 'Casa espaçosa para família com área de garagem e pátio privado.',
    preco: 390000,
    imagens: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Benfica',
      rua: 'Rua 10',
      referencia: 'A poucos minutos da escola.',
    },
  },
  {
    item: 'Loft em Ingombota',
    tipologia: 'T2',
    descricao: 'Loft moderno com luz natural, grande potencial para locação urbana.',
    preco: 265000,
    imagens: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Ingombota',
      rua: 'Rua dos Combatentes',
      referencia: 'Próximo ao centro histórico.',
    },
  },
  {
    item: 'Casa em Sambizanga',
    tipologia: 'V1',
    descricao: 'Imóvel econômico com bom potencial de renda e acesso a serviços básicos.',
    preco: 195000,
    imagens: ['https://images.unsplash.com/photo-1494526585095-c41746248156'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Sambizanga',
      rua: 'Rua da Esperança',
      referencia: 'Bairro muito procurado por famílias.',
    },
  },
  {
    item: 'Apartamento em Futungo',
    tipologia: 'T2',
    descricao: 'Apartamento em zona residencial com boa acessibilidade e boa infraestrutura.',
    preco: 260000,
    imagens: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Futungo',
      rua: 'Rua Kwanza Sul',
      referencia: 'Perto dos serviços de apoio à comunidade.',
    },
  },
  {
    item: 'Casa em Morro Bento',
    tipologia: 'T3',
    descricao: 'Casa familiar com área exterior e bom potencial para locação residencial.',
    preco: 310000,
    imagens: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Morro Bento',
      rua: 'Rua do Comércio',
      referencia: 'Zona bem localizada e procurada.',
    },
  },
  {
    item: 'Residência em Prenda',
    tipologia: 'V2',
    descricao: 'Residência ampla com excelente vista e espaço para família.',
    preco: 430000,
    imagens: ['https://images.unsplash.com/photo-1572120360610-d971b9d7767c'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Prenda',
      rua: 'Avenida 5',
      referencia: 'Perto de equipamentos e áreas de lazer.',
    },
  },
  {
    item: 'Casa em Mártires',
    tipologia: 'T2',
    descricao: 'Imóvel funcional em zona central, com boa procura por locação urbana.',
    preco: 240000,
    imagens: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Mártires',
      rua: 'Rua dos Mártires',
      referencia: 'Zona muito bem servida por comércio local.',
    },
  },
  {
    item: 'Flat em Cassenda',
    tipologia: 'T1',
    descricao: 'Flat moderno para uso residencial ou curto prazo em zona ativa.',
    preco: 205000,
    imagens: ['https://images.unsplash.com/photo-1484154218962-a197022b5858'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Cassenda',
      rua: 'Rua 15',
      referencia: 'Próximo a escolas e serviços básicos.',
    },
  },
  {
    item: 'Residência em Rangel',
    tipologia: 'T3',
    descricao: 'Casa completa em bairro residencial, ideal para famílias e locação estável.',
    preco: 345000,
    imagens: ['https://images.unsplash.com/photo-1448630360428-65456885c650'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Rangel',
      rua: 'Rua da Estrela',
      referencia: 'Perto de transportes e serviços urbanos.',
    },
  },
  {
    item: 'Apartamento em Samba',
    tipologia: 'T2',
    descricao: 'Apartamento bem distribuído em zona tranquila e bem servida.',
    preco: 230000,
    imagens: ['https://images.unsplash.com/photo-1460317442991-0ec209397118'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Samba',
      rua: 'Rua 7',
      referencia: 'A poucos minutos do comércio local.',
    },
  },
  {
    item: 'Casa em Camama',
    tipologia: 'T4',
    descricao: 'Casa ampla para famílias que procuram conforto, espaço e paz.',
    preco: 375000,
    imagens: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Camama',
      rua: 'Rua do Carmo',
      referencia: 'Zona residencial com bom acesso rodoviário.',
    },
  },
  {
    item: 'Apartamento em Ilha',
    tipologia: 'T2',
    descricao: 'Apartamento com boa ventilação, conforto e acesso rápido ao centro.',
    preco: 255000,
    imagens: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Ilha',
      rua: 'Rua da Ilha',
      referencia: 'Zona tranquila perto de serviços essenciais.',
    },
  },
  {
    item: 'Casa em Calumbo',
    tipologia: 'T3',
    descricao: 'Casa em área residencial com quintal e boas condições para habitação contínua.',
    preco: 320000,
    imagens: ['https://images.unsplash.com/photo-1494526585095-c41746248156'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Calumbo',
      rua: 'Rua do Comércio',
      referencia: 'Perto de zonas comerciais e de lazer.',
    },
  },
  {
    item: 'Loft em Patato',
    tipologia: 'T1',
    descricao: 'Loft compactado e funcional para quem prefere morar bem localizado.',
    preco: 190000,
    imagens: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Patato',
      rua: 'Rua 20',
      referencia: 'Próximo a mercados e transporte público.',
    },
  },
  {
    item: 'Villa em Ngola Kiluange',
    tipologia: 'V3',
    descricao: 'Villa moderna em zona exclusiva, ideal para pessoas que buscam conforto e exclusividade.',
    preco: 520000,
    imagens: ['https://images.unsplash.com/photo-1448630360428-65456885c650'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Ngola Kiluange',
      rua: 'Avenida do Sol',
      referencia: 'Zona de alto valor patrimonial e residencial.',
    },
  },
  {
    item: 'Apartamento em Cacuaco',
    tipologia: 'T2',
    descricao: 'Apartamento funcional com layout confortável para uso residencial ou investimento.',
    preco: 235000,
    imagens: ['https://images.unsplash.com/photo-1460317442991-0ec209397118'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Cacuaco',
      rua: 'Rua da Paz',
      referencia: 'Acesso bom às principais vias da cidade.',
    },
  },
  {
    item: 'Casa em Palanca',
    tipologia: 'T4',
    descricao: 'Casa familiar com área ampla, ótima iluminação e boa distribuição.',
    preco: 360000,
    imagens: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Palanca',
      rua: 'Rua da Primavera',
      referencia: 'Zona residencial tranquila e bem servida.',
    },
  },
  {
    item: 'Apartamento em Zango',
    tipologia: 'T1',
    descricao: 'Imóvel prático e moderno, pensado para locação e uso imediato.',
    preco: 210000,
    imagens: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Zango',
      rua: 'Rua da União',
      referencia: 'Bairro com boa rede de comércio local.',
    },
  },
  {
    item: 'Casa em Cabo Ledo',
    tipologia: 'V2',
    descricao: 'Casa com zona de convivência e vista agradável, muito procurada por famílias.',
    preco: 470000,
    imagens: ['https://images.unsplash.com/photo-1572120360610-d971b9d7767c'],
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Cabo Ledo',
      rua: 'Avenida de Angola',
      referencia: 'Próximo a áreas de prestígio e conforto.',
    },
  },
  {
    item: 'Flat em Alto das Cruzes',
    tipologia: 'T2',
    descricao: 'Flat confortável e bem localizado, ideal para quem procura praticidade e qualidade.',
    preco: 275000,
    imagens: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    localizacao: {
      provincia: 'Luanda',
      bairro: 'Alto das Cruzes',
      rua: 'Rua da Cruz',
      referencia: 'Zona bastante central e bem servida.',
    },
  },
];

const pedidosSeed: Omit<Pedido, 'id'>[] = [
  {
    tipo: 'Limpeza',
    status: 'Concluído',
    preco: 180000,
    idPropriedade: 'PROP-2609-001',
    propriedadeItem: 'Casa da Praia',
    idCliente: 'CLI-2609-001',
    clienteNome: 'Ana Silva',
    idOperativo: 'OP-2609-001',
    operativoNome: 'Ricardo Costa',
    observacoes: 'Limpeza completa do imóvel.',
    criadoEm: Date.now() - 3600000,
    atualizadoEm: Date.now() - 1800000,
  },
  {
    tipo: 'Visita',
    status: 'Aberto',
    preco: 45000,
    idPropriedade: 'PROP-2609-002',
    propriedadeItem: 'Apartamento Central',
    idCliente: 'CLI-2609-002',
    clienteNome: 'João Martins',
    idOperativo: 'OP-2609-002',
    operativoNome: 'Celso Mendes',
    observacoes: 'Agendada visita de avaliação.',
    criadoEm: Date.now() - 86400000,
    atualizadoEm: Date.now() - 43200000,
  },
  {
    tipo: 'Mudança',
    status: 'Em curso',
    preco: 320000,
    idPropriedade: 'PROP-2609-003',
    propriedadeItem: 'Casa Familiar',
    idCliente: 'CLI-2609-003',
    clienteNome: 'Maria Costa',
    idOperativo: undefined,
    operativoNome: '',
    observacoes: 'Mudança prevista para esta semana.',
    criadoEm: Date.now() - 345600000,
    atualizadoEm: Date.now() - 86400000,
  },
];

const reclamacoesSeed: Omit<Reclamacao, 'id'>[] = [
  {
    titulo: 'Falta de água na casa',
    descricao: 'O cliente relatou falta de água durante a primeira semana após a visita.',
    status: 'Aberto',
    idPropriedade: 'PROP-2609-001',
    propriedadeItem: 'Casa da Praia',
    idCliente: 'CLI-2609-001',
    clienteNome: 'Ana Silva',
    idIntermediario: 'INT-2609-001',
    intermediarioNome: 'Marta Lopes',
    criadoEm: Date.now() - 129600000,
    atualizadoEm: Date.now() - 43200000,
  },
  {
    titulo: 'Atraso na entrega',
    descricao: 'A entrega do serviço foi adiada além do prazo combinado.',
    status: 'Resolvido',
    idPropriedade: 'PROP-2609-002',
    propriedadeItem: 'Apartamento Central',
    idCliente: 'CLI-2609-002',
    clienteNome: 'João Martins',
    idIntermediario: 'INT-2609-002',
    intermediarioNome: 'José Nunes',
    criadoEm: Date.now() - 604800000,
    atualizadoEm: Date.now() - 86400000,
  },
];

const receitasSeed: Omit<Receita, 'id'>[] = [
  {
    pedidoId: 'LIM-2609-001',
    valor: 180000,
    data: Date.now() - 86400000,
    descricao: 'Receita gerada por pedido concluído',
  },
  {
    pedidoId: 'VIS-2609-002',
    valor: 45000,
    data: Date.now() - 172800000,
    descricao: 'Receita gerada por pedido concluído',
  },
];

function sanitizeForFirestore<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined)
    ) as T;
  }

  return value;
}

async function seedCollection<T extends { id: string }>(path: string, docs: T[]): Promise<void> {
  const ref = collection(db, path);
  const snapshot = await getDocs(ref);
  const existingIds = new Set(snapshot.docs.map((doc) => doc.id));

  const missingDocs = docs.filter(({ id }) => !existingIds.has(id));

  if (missingDocs.length === 0) {
    return;
  }

  await Promise.all(
    missingDocs.map(({ id, ...data }) => setDoc(doc(db, path, id), sanitizeForFirestore(data)))
  );
}

async function seedMockData(): Promise<void> {
  await seedCollection('clientes', [
    { id: 'CLI-2609-001', ...clientesSeed[0] },
    { id: 'CLI-2609-002', ...clientesSeed[1] },
    { id: 'CLI-2609-003', ...clientesSeed[2] },
  ]);

  await seedCollection('intermediarios', [
    { id: 'INT-2609-001', ...intermediariosSeed[0] },
    { id: 'INT-2609-002', ...intermediariosSeed[1] },
  ]);

  await seedCollection('operativos', [
    { id: 'OP-2609-001', ...operativosSeed[0] },
    { id: 'OP-2609-002', ...operativosSeed[1] },
  ]);

  await seedCollection('meios', [
    { id: 'MEIO-2609-001', ...meiosSeed[0] },
    { id: 'MEIO-2609-002', ...meiosSeed[1] },
    { id: 'MEIO-2609-003', ...meiosSeed[2] },
  ]);

  await seedCollection(
    'propriedades',
    propriedadesSeed.map((propriedade, index) => ({
      id: `PROP-2609-${String(index + 1).padStart(3, '0')}`,
      ...propriedade,
    }))
  );

  await seedCollection('pedidos', [
    { id: 'LIM-2609-001', ...pedidosSeed[0] },
    { id: 'VIS-2609-002', ...pedidosSeed[1] },
    { id: 'MUD-2609-003', ...pedidosSeed[2] },
  ]);

  await seedCollection('reclamacoes', [
    { id: 'REC-2609-001', ...reclamacoesSeed[0] },
    { id: 'REC-2609-002', ...reclamacoesSeed[1] },
  ]);

  await seedCollection('receitas', [
    { id: 'RCP-2609-001', ...receitasSeed[0] },
    { id: 'RCP-2609-002', ...receitasSeed[1] },
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideAppInitializer(() => {
      void seedMockData();
    }),
  ],
};