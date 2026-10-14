import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { jwtDecode } from 'jwt-decode';

import Login from './pages/Login';
import Home from './pages/Home';
import NovaOcorrencia from './pages/NovaOcorrencia';
import Lavagem from './pages/Lavagem';
import Vistoria from './pages/Vistoria';
import Oficina from './pages/Oficina';
import Administrativo from './pages/Administrativo';
import ServicoExterno from './pages/ServicoExterno';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

// 🚀 O NOSSO LEÃO DE CHÁCARA
const RotaPrivada = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('@SistemaGestao:token');
  return token ? children : <Navigate to="/login" replace />;
};

// 🚦 O ROTEADOR INTELIGENTE
const RotaRedirecionamentoInicial = () => {
  const token = localStorage.getItem('@SistemaGestao:token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded: any = jwtDecode(token);
    const grupos = decoded.grupos || [];
    
    // 🕵️ O NOSSO ESPIÃO:
    console.log("🕵️ GRUPOS RECONHECIDOS:", grupos);
    
    if (grupos.includes('Lavagem')) return <Navigate to="/lavagem" replace />;
    if (grupos.includes('Qualidade')) return <Navigate to="/vistoria" replace />;
    if (grupos.includes('Oficina')) return <Navigate to="/oficina" replace />;
    if (grupos.includes('Administrativo')) return <Navigate to="/administrativo" replace />;
    if (grupos.includes('ServicoExterno')) return <Navigate to="/externo" replace />;
    
    // Default (Avaliador / Receção)
    return <Navigate to="/home" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* 🚦 Intercetador Inicial */}
        <Route path="/" element={<RotaRedirecionamentoInicial />} />

        {/* 🛡️ Rotas Privadas (Envolvidas pelo Guarda-Costas) */}
        <Route path="/home" element={<RotaPrivada><Home /></RotaPrivada>} />
        <Route path="/nova-ocorrencia" element={<RotaPrivada><NovaOcorrencia /></RotaPrivada>} />
        <Route path="/lavagem" element={<RotaPrivada><Lavagem /></RotaPrivada>} />
        <Route path="/vistoria" element={<RotaPrivada><Vistoria /></RotaPrivada>} />
        <Route path="/oficina" element={<RotaPrivada><Oficina /></RotaPrivada>} />
        <Route path="/administrativo" element={<RotaPrivada><Administrativo /></RotaPrivada>} />
        <Route path="/externo" element={<RotaPrivada><ServicoExterno /></RotaPrivada>} />

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;