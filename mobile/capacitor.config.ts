import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eurovia.gestao',
  appName: 'Gestão Concessionária',
  webDir: 'dist', // 👈 Aqui está o nosso webDir apontando para a compilação do Vite!
};

export default config;