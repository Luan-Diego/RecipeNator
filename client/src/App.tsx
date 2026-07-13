import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import RecipeDetail from './pages/RecipeDetail';
import Recipes from './pages/Recipes';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/search" element={<Recipes />} />
          <Route path="/recipes/:slug" element={<RecipeDetail />} />
          {/* Próximas rotas (documento, seção 10): /login, /register, /discover, /create-recipe, /meal-planner... */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
