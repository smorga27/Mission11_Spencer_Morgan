import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Book, CartItem } from './types';

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookID: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  returnPath: string;
  setReturnPath: (path: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [returnPath, setReturnPath] = useState('/');

  const addToCart = (book: Book) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.book.bookID === book.bookID);
      if (existing) {
        return prev.map((item) =>
          item.book.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookID: number) => {
    setItems((prev) => prev.filter((item) => item.book.bookID !== bookID));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems,
        returnPath,
        setReturnPath,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
