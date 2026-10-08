export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  origem: 'CLIENTE' | 'CONCESSIONARIA';
  status: string;
  setor_atual: 'QUALIDADE' | 'OFICINA' | 'PINTURA' | 'LAVAGEM' | 'ENTREGA';
  prioridade: 'ALTA' | 'NORMAL' | 'BAIXA';
}