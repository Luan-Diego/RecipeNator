import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './pages/Home';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Próximas rotas (ver documento, seção 10): /login, /register, /discover, /recipes, ... */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}
