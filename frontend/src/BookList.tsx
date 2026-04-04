import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';
import CartSummary from './CartSummary';
import type { Book } from './types';
import { createEmptyBook } from './types';

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortByTitle, setSortByTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [listVersion, setListVersion] = useState(0);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formBook, setFormBook] = useState<Book>(() => createEmptyBook());
  const [savingBook, setSavingBook] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { addToCart, removeFromCart, setReturnPath } = useCart();
  const [searchParams] = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);

  const bumpList = useCallback(() => {
    setListVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    axios
      .get<string[]>('/api/books/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, [listVersion]);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get('/api/books', {
        params: {
          pageNumber,
          pageSize,
          sortByTitle,
          selectedCategory: selectedCategory || undefined,
        },
      })
      .then((res) => {
        setBooks(res.data.books);
        setTotalCount(res.data.totalCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pageNumber, pageSize, sortByTitle, selectedCategory, listVersion]);

  const openAddModal = () => {
    setEditingBook(null);
    setFormBook(createEmptyBook());
    setFormError(null);
    setShowBookModal(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormBook({ ...book });
    setFormError(null);
    setShowBookModal(true);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setFormError(null);
  };

  const updateFormField = <K extends keyof Book>(key: K, value: Book[K]) => {
    setFormBook((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBook(true);
    setFormError(null);
    try {
      if (editingBook) {
        await axios.put(`/api/books/${editingBook.bookID}`, formBook);
      } else {
        await axios.post('/api/books', { ...formBook, bookID: 0 });
      }
      closeBookModal();
      bumpList();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.message) {
        setFormError(err.message);
      } else {
        setFormError('Something went wrong while saving.');
      }
    } finally {
      setSavingBook(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (
      !window.confirm(
        `Delete "${book.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(`/api/books/${book.bookID}`);
      removeFromCart(book.bookID);
      bumpList();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.message
          ? err.message
          : 'Delete failed.';
      setError(msg);
    }
  };

  const handleAddToCart = (book: Book) => {
    addToCart(book);
    const params = new URLSearchParams();
    params.set('page', String(pageNumber));
    if (selectedCategory) params.set('category', selectedCategory);
    setReturnPath(`/?${params.toString()}`);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPageNumber(1);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Online Bookstore</h1>

      <CartSummary />

      <div className="row">
        {/* Sidebar: Category Filter */}
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-header fw-bold">Categories</div>
            <ul className="list-group list-group-flush">
              <li
                className={`list-group-item list-group-item-action ${selectedCategory === '' ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleCategorySelect('')}
              >
                All
              </li>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={`list-group-item list-group-item-action ${selectedCategory === cat ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content: Book List */}
        <div className="col-md-9">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="pageSize" className="form-label mb-0">
                Results per page:
              </label>
              <select
                id="pageSize"
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={openAddModal}
              >
                Add book
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sortByTitle ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => {
                  setSortByTitle(!sortByTitle);
                  setPageNumber(1);
                }}
              >
                Sort by Title {sortByTitle ? '(On)' : '(Off)'}
              </button>
            </div>
          </div>

          {loading && <p>Loading...</p>}
          {error && <div className="alert alert-danger">Error: {error}</div>}

          {!loading && !error && (
            <>
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>ISBN</th>
                    <th>Classification</th>
                    <th>Category</th>
                    <th>Page Count</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.bookID}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.publisher}</td>
                      <td>{b.isbn}</td>
                      <td>{b.classification}</td>
                      <td>
                        <span className="badge bg-secondary">{b.category}</span>
                      </td>
                      <td>{b.pageCount}</td>
                      <td>${b.price.toFixed(2)}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleAddToCart(b)}
                          >
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(b)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteBook(b)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <nav>
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPageNumber(pageNumber - 1)}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <li
                        key={num}
                        className={`page-item ${num === pageNumber ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPageNumber(num)}
                        >
                          {num}
                        </button>
                      </li>
                    ),
                  )}

                  <li
                    className={`page-item ${pageNumber === totalPages ? 'disabled' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPageNumber(pageNumber + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>

      {showBookModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookModalTitle"
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={handleSaveBook}>
                <div className="modal-header">
                  <h2 className="modal-title fs-5" id="bookModalTitle">
                    {editingBook ? 'Edit book' : 'Add book'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeBookModal}
                  />
                </div>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger">{formError}</div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label" htmlFor="book-title">
                        Title
                      </label>
                      <input
                        id="book-title"
                        className="form-control"
                        value={formBook.title}
                        onChange={(e) =>
                          updateFormField('title', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="book-author">
                        Author
                      </label>
                      <input
                        id="book-author"
                        className="form-control"
                        value={formBook.author}
                        onChange={(e) =>
                          updateFormField('author', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="book-publisher">
                        Publisher
                      </label>
                      <input
                        id="book-publisher"
                        className="form-control"
                        value={formBook.publisher}
                        onChange={(e) =>
                          updateFormField('publisher', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="book-isbn">
                        ISBN
                      </label>
                      <input
                        id="book-isbn"
                        className="form-control"
                        value={formBook.isbn}
                        onChange={(e) =>
                          updateFormField('isbn', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label
                        className="form-label"
                        htmlFor="book-classification"
                      >
                        Classification
                      </label>
                      <input
                        id="book-classification"
                        className="form-control"
                        value={formBook.classification}
                        onChange={(e) =>
                          updateFormField('classification', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="book-category">
                        Category
                      </label>
                      <input
                        id="book-category"
                        className="form-control"
                        value={formBook.category}
                        onChange={(e) =>
                          updateFormField('category', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="book-pages">
                        Page count
                      </label>
                      <input
                        id="book-pages"
                        type="number"
                        min={0}
                        className="form-control"
                        value={formBook.pageCount}
                        onChange={(e) =>
                          updateFormField(
                            'pageCount',
                            Number.parseInt(e.target.value, 10) || 0,
                          )
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="book-price">
                        Price
                      </label>
                      <input
                        id="book-price"
                        type="number"
                        min={0}
                        step="0.01"
                        className="form-control"
                        value={formBook.price}
                        onChange={(e) =>
                          updateFormField(
                            'price',
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeBookModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingBook}
                  >
                    {savingBook ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBookModal && (
        <div className="modal-backdrop show" aria-hidden="true" />
      )}
    </div>
  );
}

export default BookList;
