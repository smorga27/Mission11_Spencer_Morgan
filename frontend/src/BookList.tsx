import { useEffect, useState } from 'react';
import axios from 'axios';

interface Book {
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

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortByTitle, setSortByTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get('/api/books', {
        params: { pageNumber, pageSize, sortByTitle },
      })
      .then((res) => {
        setBooks(res.data.books);
        setTotalCount(res.data.totalCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pageNumber, pageSize, sortByTitle]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Online Bookstore</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
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

        <button
          className={`btn btn-sm ${sortByTitle ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => {
            setSortByTitle(!sortByTitle);
            setPageNumber(1);
          }}
        >
          Sort by Title {sortByTitle ? '(On)' : '(Off)'}
        </button>
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
                  <td>{b.category}</td>
                  <td>{b.pageCount}</td>
                  <td>${b.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
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
                )
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
  );
}

export default BookList;
