import * as React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Dashboard } from './components/dashboard/Dashboard';


export default function App() {
  const [showRegister, setShowRegister] = React.useState(false);

  return (
    <AuthProvider>
      <AppContent showRegister={showRegister} setShowRegister={setShowRegister} />
    </AuthProvider>
  );
}

const AppContent: React.FC<{ showRegister: boolean; setShowRegister: (show: boolean) => void }> = ({
  showRegister,
  setShowRegister
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return <Dashboard />;
}