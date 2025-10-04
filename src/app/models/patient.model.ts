export interface Patient {
  id: number;
  name: string;
  age: number;
  type?: 'patient'; // Adicionado para compatibilidade
  avatar?: string;
  status: 'active' | 'inactive';
  lastUpdate: Date;
  email?: string; // Adicionando campos que podem ser úteis
  phone?: string;
  goal?: string; // Ex: Perder peso, ganhar massa
  nutritionistId: number; // ID do nutricionista responsável
}
