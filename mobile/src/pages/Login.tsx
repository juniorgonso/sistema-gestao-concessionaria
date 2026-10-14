
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  useIonToast
} from '@ionic/react';
import axios from 'axios';
import { login } from '../services/auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [present] = useIonToast();
  const navigate = useNavigate();

  const handleLogin = async (): Promise<void> => {
    if (!username.trim() || !password) {
      present({
        message: 'Preencha o usuário e a senha.',
        duration: 2000,
        color: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      // O serviço auth.ts deve salvar o token JWT.
      await login(username.trim(), password);

      present({
        message: 'Login realizado com sucesso!',
        duration: 2000,
        color: 'success'
      });

      // O App.tsx identifica o grupo e redireciona.
      navigate('/', { replace: true });

    } catch (error) {
      const mensagem =
        axios.isAxiosError(error) && error.response?.status === 401
          ? 'Usuário ou senha inválidos.'
          : 'Não foi possível realizar o login. Verifique a conexão.';

      present({
        message: mensagem,
        duration: 3000,
        color: 'danger'
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center'
          }}
        >
          <IonText color="primary" className="ion-text-center">
            <h2>Acesso ao Sistema V2.2</h2>
          </IonText>

          <IonItem>
            <IonLabel position="floating">
              Usuário
            </IonLabel>
            <IonInput
              value={username}
              onIonChange={(e) =>
                setUsername(e.detail.value ?? '')
              }
              type="text"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">
              Senha
            </IonLabel>
            <IonInput
              value={password}
              onIonChange={(e) =>
                setPassword(e.detail.value ?? '')
              }
              type="password"
            />
          </IonItem>

          <IonButton
            expand="block"
            className="ion-margin-top"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
