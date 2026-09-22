import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const StoreContext = createContext(null);

const getSavedCart = () => {
  try {
    const saved = localStorage.getItem("fitforge-cart");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Cart load error:", error);
    return [];
  }
};

const getSavedWishlist = () => {
  try {
    const saved =
      localStorage.getItem("fitforge-wishlist");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Wishlist load error:", error);
    return [];
  }
};

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(getSavedCart);

  const [wishlist, setWishlist] = useState(
    getSavedWishlist
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================
  // FETCH PRODUCTS
  // ============================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/products");

      if (response.data?.success) {
        setProducts(
          response.data.products || []
        );
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );

      setError("Unable to load products.");

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================
  // CART STORAGE
  // ============================

  useEffect(() => {
    localStorage.setItem(
      "fitforge-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // ============================
  // WISHLIST STORAGE
  // ============================

  useEffect(() => {
    localStorage.setItem(
      "fitforge-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // ============================
  // ADD TO CART
  // ============================

  const addToCart = (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    if (!product?._id) {
      console.error(
        "Invalid product:",
        product
      );

      return;
    }

    setCart((previousCart) => {
      const currentCart = Array.isArray(
        previousCart
      )
        ? previousCart
        : [];

      const existingItem =
        currentCart.find(
          (item) =>
            item?.product?._id ===
              product._id &&
            item.size === size &&
            item.color === color
        );

      if (existingItem) {
        return currentCart.map(
          (item) =>
            item?.product?._id ===
              product._id &&
            item.size === size &&
            item.color === color
              ? {
                  ...item,
                  quantity:
                    Number(
                      item.quantity
                    ) +
                    Number(quantity),
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity:
            Number(quantity) || 1,
          size,
          color,
        },
      ];
    });
  };

  // ============================
  // REMOVE FROM CART
  // ============================

  const removeFromCart = (
    productId,
    size = "",
    color = ""
  ) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          !(
            item?.product?._id ===
              productId &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  // ============================
  // UPDATE CART
  // ============================

  const updateCartQuantity = (
    productId,
    quantity,
    size = "",
    color = ""
  ) => {
    const newQuantity =
      Number(quantity);

    if (newQuantity < 1) {
      return;
    }

    setCart((previousCart) =>
      previousCart.map(
        (item) =>
          item?.product?._id ===
            productId &&
          item.size === size &&
          item.color === color
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
      )
    );
  };

  // ============================
  // CLEAR CART
  // ============================

  const clearCart = () => {
    setCart([]);
  };

  // ============================
  // WISHLIST
  // ============================

  const toggleWishlist = (product) => {
    if (!product?._id) {
      return;
    }

    setWishlist((previousWishlist) => {
      const exists =
        previousWishlist.some(
          (item) =>
            item?._id === product._id
        );

      if (exists) {
        return previousWishlist.filter(
          (item) =>
            item?._id !== product._id
        );
      }

      return [
        ...previousWishlist,
        product,
      ];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(
      (product) =>
        product?._id === productId
    );
  };

  // ============================
  // CART COUNT
  // ============================

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(item?.quantity || 0),
    0
  );

  // ============================
  // CART TOTAL
  // ============================

  const cartTotal = cart.reduce(
    (total, item) => {
      const product = item?.product;

      if (!product) {
        return total;
      }

      const price =
        product.salePrice != null
          ? Number(product.salePrice)
          : Number(product.price || 0);

      return (
        total +
        price *
          Number(
            item.quantity || 0
          )
      );
    },
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

// ============================
// USE STORE
// ============================

export const useStore = () => {
  const context =
    useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used inside StoreProvider"
    );
  }

  return context;
};

export default StoreContext;