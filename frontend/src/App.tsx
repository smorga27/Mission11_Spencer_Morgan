import { Routes, Route } from 'react-router-dom';
import BookList from './BookList';
import CartPage from './CartPage';
import { CartProvider } from './CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
