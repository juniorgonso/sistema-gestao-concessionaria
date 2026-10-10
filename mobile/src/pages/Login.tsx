import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IonPage, IonContent, IonInput, IonButton, 
  IonItem, IonLabel, IonText, useIonToast 
} from '@ionic/react';
import { login } from '../services/auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [present] = useIonToast();
  const navigate = useNavigate();

  const handleLogin = async (): Promise<void> => {
    if (!username || !password) {
      present({ message: 'Preencha o usuário e a senha', duration: 2000, color: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const token = await login(username, password);
      console.log("Token JWT recebido:", token);
      
      present({ message: 'Acesso liberado! Autenticado na V2.1', duration: 2000, color: 'success' });
      
      // Navegação nativa e blindada do React Router v6
      navigate('/home', { replace: true });
      
    } catch (error) {
      present({ message: 'Credenciais inválidas.', duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <IonText color="primary" className="ion-text-center">
            <h2>Acesso ao Sistema V2.1</h2>
          </IonText>
          
          <IonItem>
            <IonLabel position="floating">Usuário</IonLabel>
            <IonInput 
              value={username} 
              onIonChange={e => setUsername(e.detail.value as string)} 
              type="text" 
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">Senha</IonLabel>
            <IonInput 
              value={password} 
              onIonChange={e => setPassword(e.detail.value as string)} 
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