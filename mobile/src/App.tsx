import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Home from './pages/Home';
import NovaOcorrencia from './pages/NovaOcorrencia';

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

// 🚀 O NOSSO LEÃO DE CHÁCARA (Route Guard)
// Esta função verifica o crachá antes de deixar renderizar o ecrã.
const RotaPrivada = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('@SistemaGestao:token');
  // Se tiver token, mostra a página. Se não tiver, chuta de volta para o login.
  return token ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Privadas (Envolvidas pelo Guarda-Costas) */}
        <Route path="/home" element={
          <RotaPrivada>
            <Home />
          </RotaPrivada>
        } />
        <Route path="/nova-ocorrencia" element={
          <RotaPrivada>
            <NovaOcorrencia />
          </RotaPrivada>
        } />
        
        {/* Se alguém digitar apenas "/" na barra, tenta atirar para a Home. 
            A Home, por sua vez, vai acionar o RotaPrivada. */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;