import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

function CartPage() {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const { returnPath } = useCart();

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="alert alert-info">
          Your cart is empty.{' '}
          <button
            className="btn btn-link p-0 align-baseline"
            onClick={() => navigate(returnPath)}
          >
            Browse books
          </button>
        </div>
      ) : (
        <>
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th className="text-center">Quantity</th>
                <th className="text-end">Price</th>
                <th className="text-end">Subtotal</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.book.bookID}>
                  <td>{item.book.title}</td>
                  <td>{item.book.author}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">${item.book.price.toFixed(2)}</td>
                  <td className="text-end">
                    ${(item.book.price * item.quantity).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFromCart(item.book.bookID)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-end fw-bold">
                  Total:
                </td>
                <td className="text-end fw-bold">
                  ${totalPrice.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate(returnPath)}
            >
              Continue Shopping
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
