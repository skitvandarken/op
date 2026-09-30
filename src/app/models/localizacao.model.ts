export interface Localizacao {
    provincia: string;
    bairro: string;
    rua: string;
    referencia: string;
}

export interface LocalizacaoFiltro {
    provincia?: string;
    bairro?: string;
    rua?: string;
    termo?: string;
}