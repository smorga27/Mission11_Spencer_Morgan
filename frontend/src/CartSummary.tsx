import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

function CartSummary() {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div
      className="card mb-3"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate('/cart')}
    >
      <div className="card-body d-flex justify-content-between align-items-center py-2">
        <span>
          🛒 Cart{' '}
          <span className="badge bg-primary rounded-pill">{totalItems}</span>
        </span>
        <span className="fw-bold">${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default CartSummary;
