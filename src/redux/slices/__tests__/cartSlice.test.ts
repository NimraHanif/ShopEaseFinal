import cartReducer, {
  addItem,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
  selectCartItemCount,
  selectCartSubtotal,
} from '../cartSlice';
import { CartItem } from '../../../types';

const sampleItem: CartItem = {
  productId: '1',
  name: 'Test Product',
  price: 10,
  photoUrl: null,
  quantity: 1,
  stock: 5,
};

describe('cartSlice', () => {
  it('adds a new item to an empty cart', () => {
    const state = cartReducer({ items: [] }, addItem(sampleItem));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
  });

  it('increases quantity if the item already exists', () => {
    const initial = { items: [sampleItem] };
    const state = cartReducer(initial, addItem({ ...sampleItem, quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('does not exceed stock when adding an existing item', () => {
    const initial = { items: [{ ...sampleItem, quantity: 4, stock: 5 }] };
    const state = cartReducer(initial, addItem({ ...sampleItem, quantity: 3 }));
    expect(state.items[0].quantity).toBe(5); // capped at stock
  });

  it('increases quantity via increaseQuantity, respecting stock', () => {
    const initial = { items: [{ ...sampleItem, quantity: 5, stock: 5 }] };
    const state = cartReducer(initial, increaseQuantity('1'));
    expect(state.items[0].quantity).toBe(5); // unchanged, already at max
  });

  it('decreases quantity via decreaseQuantity', () => {
    const initial = { items: [{ ...sampleItem, quantity: 2 }] };
    const state = cartReducer(initial, decreaseQuantity('1'));
    expect(state.items[0].quantity).toBe(1);
  });

  it('removes the item entirely when quantity drops to 0', () => {
    const initial = { items: [{ ...sampleItem, quantity: 1 }] };
    const state = cartReducer(initial, decreaseQuantity('1'));
    expect(state.items).toHaveLength(0);
  });

  it('removes an item directly via removeItem', () => {
    const initial = { items: [sampleItem] };
    const state = cartReducer(initial, removeItem('1'));
    expect(state.items).toHaveLength(0);
  });

  it('clears the entire cart via clearCart', () => {
    const initial = { items: [sampleItem, { ...sampleItem, productId: '2' }] };
    const state = cartReducer(initial, clearCart());
    expect(state.items).toHaveLength(0);
  });

  it('calculates item count correctly across multiple items', () => {
    const state = { cart: { items: [{ ...sampleItem, quantity: 2 }, { ...sampleItem, productId: '2', quantity: 3 }] } };
    expect(selectCartItemCount(state)).toBe(5);
  });

  it('calculates subtotal correctly', () => {
    const state = {
      cart: {
        items: [
          { ...sampleItem, price: 10, quantity: 2 }, // 20
          { ...sampleItem, productId: '2', price: 5, quantity: 3 }, // 15
        ],
      },
    };
    expect(selectCartSubtotal(state)).toBe(35);
  });
});