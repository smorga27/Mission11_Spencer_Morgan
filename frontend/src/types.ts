export interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

export type BookInput = Omit<Book, 'bookID'> & { bookID?: number };

export function createEmptyBook(): Book {
  return {
    bookID: 0,
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    classification: '',
    category: '',
    pageCount: 0,
    price: 0,
  };
}

export interface CartItem {
  book: Book;
  quantity: number;
}
