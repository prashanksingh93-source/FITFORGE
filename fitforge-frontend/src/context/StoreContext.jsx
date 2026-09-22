import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const StoreContext = createContext(null);

// ============================================
// LOCAL STORAGE
// ============================================

const readCart = () => {
  try {
    const value =
      localStorage.getItem("fitforge-cart");

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "FITFORGE: Cart read error:",
      error
    );

    return [];
  }
};

const readWishlist = () => {
  try {
    const value =
      localStorage.getItem(
        "fitforge-wishlist"
      );

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "FITFORGE: Wishlist read error:",
      error
    );

    return [];
  }
};

// ============================================
// CONTEXT
// ============================================

const StoreProvider = ({ children }) => {
  const [products, setProducts] =
    useState([]);

  const [cart, setCart] =
    useState(() => readCart());

  const [wishlist, setWishlist] =
    useState(() => readWishlist());

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = useCallback(
    async () => {
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
          "FITFORGE: Product fetch error:",
          error
        );

        setProducts([]);

        setError(
          error.response?.data?.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==========================================
  // CART → LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "fitforge-cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "FITFORGE: Cart save error:",
        error
      );
    }
  }, [cart]);

  // ==========================================
  // WISHLIST → LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "fitforge-wishlist",
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error(
        "FITFORGE: Wishlist save error:",
        error
      );
    }
  }, [wishlist]);

  // ==========================================
  // FORCE CART SYNC
  // ==========================================

  const refreshCartFromStorage =
    useCallback(() => {
      const savedCart = readCart();

      console.log(
        "FITFORGE: Refreshing cart:",
        savedCart
      );

      setCart(savedCart);
    }, []);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    if (!product?._id) {
      console.error(
        "FITFORGE: Invalid product:",
        product
      );

      return;
    }

    const amount =
      Math.max(
        1,
        Number(quantity) || 1
      );

    setCart((currentCart) => {
      const safeCart =
        Array.isArray(currentCart)
          ? currentCart
          : [];

      const existingIndex =
        safeCart.findIndex(
          (item) =>
            item?.product?._id ===
              product._id &&
            item.size === size &&
            item.color === color
        );

      let newCart;

      if (existingIndex !== -1) {
        newCart = safeCart.map(
          (item, index) => {
            if (
              index !== existingIndex
            ) {
              return item;
            }

            const currentQuantity =
              Number(
                item.quantity || 0
              );

            const stock =
              Number(
                product.stock || 0
              );

            const requestedQuantity =
              currentQuantity + amount;

            const finalQuantity =
              stock > 0
                ? Math.min(
                    requestedQuantity,
                    stock
                  )
                : requestedQuantity;

            return {
              ...item,
              product,
              quantity:
                finalQuantity,
              size,
              color,
            };
          }
        );
      } else {
        const stock =
          Number(
            product.stock || 0
          );

        const finalQuantity =
          stock > 0
            ? Math.min(amount, stock)
            : amount;

        newCart = [
          ...safeCart,
          {
            product,
            quantity:
              finalQuantity,
            size,
            color,
          },
        ];
      }

      // Save immediately.
      localStorage.setItem(
        "fitforge-cart",
        JSON.stringify(newCart)
      );

      console.log(
        "FITFORGE: Cart updated:",
        newCart
      );

      return newCart;
    });
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  const removeFromCart = (
    productId,
    size = "",
    color = ""
  ) => {
    setCart((currentCart) => {
      const newCart =
        currentCart.filter(
          (item) =>
            !(
              item?.product?._id ===
                productId &&
              item.size === size &&
              item.color === color
            )
        );

      localStorage.setItem(
        "fitforge-cart",
        JSON.stringify(newCart)
      );

      return newCart;
    });
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateCartQuantity = (
    productId,
    quantity,
    size = "",
    color = ""
  ) => {
    const newQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        newQuantity
      ) ||
      newQuantity < 1
    ) {
      return;
    }

    setCart((currentCart) => {
      const newCart =
        currentCart.map(
          (item) => {
            if (
              item?.product?._id !==
                productId ||
              item.size !== size ||
              item.color !== color
            ) {
              return item;
            }

            const stock =
              Number(
                item.product?.stock ||
                  0
              );

            const finalQuantity =
              stock > 0
                ? Math.min(
                    newQuantity,
                    stock
                  )
                : newQuantity;

            return {
              ...item,
              quantity:
                finalQuantity,
            };
          }
        );

      localStorage.setItem(
        "fitforge-cart",
        JSON.stringify(newCart)
      );

      return newCart;
    });
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    localStorage.removeItem(
      "fitforge-cart"
    );

    setCart([]);
  };

  // ==========================================
  // WISHLIST
  // ==========================================

  const toggleWishlist = (product) => {
    if (!product?._id) {
      return;
    }

    setWishlist((currentWishlist) => {
      const exists =
        currentWishlist.some(
          (item) =>
            item?._id === product._id
        );

      if (exists) {
        return currentWishlist.filter(
          (item) =>
            item?._id !== product._id
        );
      }

      return [
        ...currentWishlist,
        product,
      ];
    });
  };

  // ==========================================
  // WISHLIST CHECK
  // ==========================================

  const isInWishlist = (
    productId
  ) => {
    return wishlist.some(
      (product) =>
        product?._id === productId
    );
  };

  // ==========================================
  // MOVE WISHLIST → CART
  // ==========================================

  const moveToCart = (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    if (!product?._id) {
      return;
    }

    addToCart(
      product,
      quantity,
      size ||
        product.sizes?.[0] ||
        "",
      color ||
        product.colors?.[0]?.name ||
        ""
    );

    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (item) =>
          item?._id !== product._id
      )
    );
  };

  // ==========================================
  // CART COUNT
  // ==========================================

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(
        item?.quantity || 0
      ),
    0
  );

  // ==========================================
  // CART TOTAL
  // ==========================================

  const cartTotal = cart.reduce(
    (total, item) => {
      const product =
        item?.product;

      if (!product) {
        return total;
      }

      const price =
        product.salePrice != null
          ? Number(
              product.salePrice
            )
          : Number(
              product.price || 0
            );

      const quantity =
        Number(
          item.quantity || 0
        );

      return (
        total +
        price * quantity
      );
    },
    0
  );

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <StoreContext.Provider
      value={{
        // PRODUCTS
        products,
        loading,
        error,
        fetchProducts,

        // CART
        cart,
        cartItems: cart,
        cartCount,
        cartTotal,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        refreshCartFromStorage,

        // WISHLIST
        wishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

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