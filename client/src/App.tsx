import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Calendar from './pages/Calendar';
import CollectionDetail from './pages/CollectionDetail';
import Collections from './pages/Collections';
import CreateRecipe from './pages/CreateRecipe';
import Discover from './pages/Discover';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Login from './pages/Login';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
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
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <ProtectedRoute>
                <CollectionDetail />
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
          <Route path="/discover" element={<Discover />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingList />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Próximas rotas (documento, seção 10): /discover, /create-recipe /costs, painel de admin... */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
