import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de autenticação rápida
    if (email && senha) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#0F172A', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
            <Car size={32} color="#38BDF8" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E293B' }}>Via 1 Gestão</h1>
          <p style={{ color: '#64748B', marginTop: '5px' }}>Acesso Restrito - Administrativo</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' }}>E-mail Corporativo</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 15px' }}>
              <User size={18} color="#94A3B8" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teste@via1seminovos.com.br"
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px', outline: 'none', color: '#1E293B' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' }}>Senha</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 15px' }}>
              <Lock size={18} color="#94A3B8" />
              <input 
                type="password" 
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px', outline: 'none', color: '#1E293B' }}
              />
            </div>
          </div>

          <button type="submit" style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' }}>
            ACESSAR SISTEMA
          </button>
        </form>

      </div>
    </div>
  );
}