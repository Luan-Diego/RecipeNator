import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Calendar from './pages/Calendar';
import CreateRecipe from './pages/CreateRecipe';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
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
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-recipe"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Próximas rotas (documento, seção 10): /discover, /create-recipe /meal-planner, /shopping-list... */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
