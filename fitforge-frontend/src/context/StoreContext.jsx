import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitforge-cart")) || [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitforge-wishlist")) || [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Unable to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "fitforge-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "fitforge-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  const addToCart = (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.product._id === product._id &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product._id === product._id &&
          item.size === size &&
          item.color === color
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity,
          size,
          color,
        },
      ];
    });
  };

  const removeFromCart = (
    productId,
    size = "",
    color = ""
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item.product._id === productId &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  const updateCartQuantity = (
    productId,
    quantity,
    size = "",
    color = ""
  ) => {
    if (quantity < 1) return;

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId &&
        item.size === size &&
        item.color === color
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item._id === product._id
      );

      if (exists) {
        return currentWishlist.filter(
          (item) => item._id !== product._id
        );
      }

      return [...currentWishlist, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(
      (product) => product._id === productId
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      (item.product.salePrice || item.product.price) *
        item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,

        cart,
        cartCount,
        cartTotal,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used inside StoreProvider"
    );
  }

  return context;
};

export default StoreContext;