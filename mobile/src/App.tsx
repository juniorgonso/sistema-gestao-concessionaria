import type { ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonButton,
  IonContent,
  IonPage,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
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
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const TOKEN_KEY = '@SistemaGestao:token';

type Grupo =
  | 'Lavagem'
  | 'Qualidade'
  | 'Oficina'
  | 'Administrativo'
  | 'ServicoExterno'
  | 'Avaliador';

type JwtPayload = {
  exp?: number;
  grupos?: unknown;
};

// Retorna null se o token estiver ausente, inválido ou expirado.
// Um array vazio significa que o usuário está autenticado, mas sem grupos.
function obterGruposAutenticados(): string[] | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = jwtDecode<JwtPayload>(token);

    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    if (!Array.isArray(payload.grupos)) return [];

    return payload.grupos.filter(
      (grupo): grupo is string => typeof grupo === 'string'
    );
  } catch {
    return null;
  }
}

type RotaPrivadaProps = {
  children: ReactNode;
  gruposPermitidos?: Grupo[];
};

const RotaPrivada = ({ children, gruposPermitidos }: RotaPrivadaProps) => {
  const grupos = obterGruposAutenticados();

  if (grupos === null) {
    return <Navigate to="/login" replace />;
  }

  if (
    gruposPermitidos &&
    !gruposPermitidos.some((grupo) => grupos.includes(grupo))
  ) {
    // Redireciona para a página inicial, que encontra a tela adequada
    // ou exibe a mensagem de falta de grupo.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RotaRedirecionamentoInicial = () => {
  const grupos = obterGruposAutenticados();

  if (grupos === null) {
    return <Navigate to="/login" replace />;
  }

  if (grupos.includes('Lavagem')) return <Navigate to="/lavagem" replace />;
  if (grupos.includes('Qualidade')) return <Navigate to="/vistoria" replace />;
  if (grupos.includes('Oficina')) return <Navigate to="/oficina" replace />;
  if (grupos.includes('Administrativo'))
    return <Navigate to="/administrativo" replace />;
  if (grupos.includes('ServicoExterno'))
    return <Navigate to="/externo" replace />;
  if (grupos.includes('Avaliador')) return <Navigate to="/home" replace />;

  return <Navigate to="/sem-permissao" replace />;
};

const SemPermissao = () => (
  <IonPage>
    <IonContent className="ion-padding">
      <h2>Acesso não autorizado</h2>
      <p>
        Seu usuário está autenticado, mas não possui um grupo operacional
        reconhecido pelo aplicativo.
      </p>
      <p>Solicite ao administrador a configuração do seu perfil.</p>
      <IonButton
        expand="block"
        onClick={() => {
          localStorage.removeItem(TOKEN_KEY);
          window.location.replace('/login');
        }}
      >
        Sair e entrar com outra conta
      </IonButton>
    </IonContent>
  </IonPage>
);

const App = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />

        {/* Redirecionamento inicial conforme o grupo */}
        <Route path="/" element={<RotaRedirecionamentoInicial />} />

        {/* Usuário autenticado, porém sem grupo reconhecido */}
        <Route
          path="/sem-permissao"
          element={
            <RotaPrivada>
              <SemPermissao />
            </RotaPrivada>
          }
        />

        {/* Rotas por setor */}
        <Route
          path="/home"
          element={
            <RotaPrivada gruposPermitidos={['Avaliador']}>
              <Home />
            </RotaPrivada>
          }
        />
        <Route
          path="/nova-ocorrencia"
          element={
            <RotaPrivada gruposPermitidos={['Avaliador', 'Administrativo']}>
              <NovaOcorrencia />
            </RotaPrivada>
          }
        />
        <Route
          path="/lavagem"
          element={
            <RotaPrivada gruposPermitidos={['Lavagem']}>
              <Lavagem />
            </RotaPrivada>
          }
        />
        <Route
          path="/vistoria"
          element={
            <RotaPrivada gruposPermitidos={['Qualidade']}>
              <Vistoria />
            </RotaPrivada>
          }
        />
        <Route
          path="/oficina"
          element={
            <RotaPrivada gruposPermitidos={['Oficina']}>
              <Oficina />
            </RotaPrivada>
          }
        />
        <Route
          path="/administrativo"
          element={
            <RotaPrivada gruposPermitidos={['Administrativo']}>
              <Administrativo />
            </RotaPrivada>
          }
        />
        <Route
          path="/externo"
          element={
            <RotaPrivada gruposPermitidos={['ServicoExterno']}>
              <ServicoExterno />
            </RotaPrivada>
          }
        />

        {/* Endereços desconhecidos voltam para o redirecionamento inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
