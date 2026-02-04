import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import axios from "axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from "react-bootstrap";
import unplugged from "../assets/unplugged.png"; // fallback image

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);

  /* ---------------- Sync cart from context ---------------- */
  useEffect(() => {
    setCartItems(cart);
  }, [cart]);

  /* ---------------- Calculate total ---------------- */
  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    setTotalPrice(total);
  }, [cartItems]);

  /* ---------------- Quantity handlers ---------------- */
  const handleIncreaseQuantity = (itemId) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.quantity < item.stock) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          alert("Cannot add more than available stock");
        }
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const handleDecreaseQuantity = (itemId) => {
    const updatedCart = cartItems.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item,
    );
    setCartItems(updatedCart);
  };

  /* ---------------- Remove item ---------------- */
  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  /* ---------------- Checkout ---------------- */
  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const updatedProduct = {
          ...item,
          stock: item.stock - item.quantity,
        };

        await axios.put(
          `http://localhost:8080/product/${item.id}`,
          updatedProduct,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      clearCart();
      setCartItems([]);
      setShowModal(false);
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="cart-container">
      <div className="shopping-cart">
        <div className="title">Shopping Bag</div>

        {cartItems.length === 0 ? (
          <div className="empty" style={{ padding: "2rem" }}>
            <h4>Your cart is empty</h4>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="item" style={{ display: "flex" }}>
                  <img
                    src={
                      item.imageBase64
                        ? `data:${item.imageType};base64,${item.imageBase64}`
                        : unplugged
                    }
                    alt={item.imageName || item.name}
                    className="cart-item-image"
                  />

                  <div className="description">
                    <span>{item.brand}</span>
                    <span>{item.name}</span>
                  </div>

                  <div className="quantity">
                    <button
                      className="plus-btn"
                      onClick={() => handleIncreaseQuantity(item.id)}
                    >
                      <i className="bi bi-plus-square-fill"></i>
                    </button>

                    <input type="button" value={item.quantity} readOnly />

                    <button
                      className="minus-btn"
                      onClick={() => handleDecreaseQuantity(item.id)}
                    >
                      <i className="bi bi-dash-square-fill"></i>
                    </button>
                  </div>

                  <div className="total-price">
                    ${item.price * item.quantity}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </li>
            ))}

            <div className="total">Total: ${totalPrice}</div>

            <Button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => setShowModal(true)}
            >
              Checkout
            </Button>
          </>
        )}
      </div>

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;
