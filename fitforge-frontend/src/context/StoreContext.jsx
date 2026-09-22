import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const StoreContext = createContext(null);

// ========================================
// LOCAL STORAGE HELPERS
// ========================================

const getSavedCart = () => {
  try {
    const savedCart =
      localStorage.getItem("fitforge-cart");

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];
  } catch (error) {
    console.error(
      "Failed to load cart:",
      error
    );

    return [];
  }
};

const getSavedWishlist = () => {
  try {
    const savedWishlist =
      localStorage.getItem(
        "fitforge-wishlist"
      );

    if (!savedWishlist) {
      return [];
    }

    const parsedWishlist =
      JSON.parse(savedWishlist);

    return Array.isArray(parsedWishlist)
      ? parsedWishlist
      : [];
  } catch (error) {
    console.error(
      "Failed to load wishlist:",
      error
    );

    return [];
  }
};

// ========================================
// STORE PROVIDER
// ========================================

export const StoreProvider = ({
  children,
}) => {
  // ======================================
  // PRODUCTS
  // ======================================

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================
  // CART
  // ======================================

  const [cart, setCart] =
    useState(getSavedCart);

  // ======================================
  // WISHLIST
  // ======================================

  const [wishlist, setWishlist] =
    useState(getSavedWishlist);

  // ======================================
  // FETCH PRODUCTS
  // ======================================

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
          "Failed to fetch products:",
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

  // ======================================
  // SAVE CART
  // ======================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "fitforge-cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cart]);

  // ======================================
  // SAVE WISHLIST
  // ======================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "fitforge-wishlist",
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error(
        "Failed to save wishlist:",
        error
      );
    }
  }, [wishlist]);

  // ======================================
  // REFRESH CART FROM STORAGE
  // ======================================

  const refreshCartFromStorage =
    useCallback(() => {
      try {
        const savedCart =
          localStorage.getItem(
            "fitforge-cart"
          );

        if (!savedCart) {
          setCart([]);
          return;
        }

        const parsedCart =
          JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error(
          "Failed to refresh cart:",
          error
        );

        setCart([]);
      }
    }, []);

  // ======================================
  // ADD TO CART
  // ======================================

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

    const safeQuantity =
      Math.max(
        1,
        Number(quantity) || 1
      );

    setCart((currentCart) => {
      const safeCart =
        Array.isArray(currentCart)
          ? currentCart
          : [];

      const existingItem =
        safeCart.find(
          (item) =>
            item?.product?._id ===
              product._id &&
            item.size === size &&
            item.color === color
        );

      let updatedCart;

      if (existingItem) {
        updatedCart =
          safeCart.map(
            (item) => {
              if (
                item?.product?._id ===
                  product._id &&
                item.size === size &&
                item.color === color
              ) {
                const currentQuantity =
                  Number(
                    item.quantity || 0
                  );

                const stock =
                  Number(
                    product.stock || 0
                  );

                const requestedQuantity =
                  currentQuantity +
                  safeQuantity;

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

              return item;
            }
          );
      } else {
        const stock =
          Number(
            product.stock || 0
          );

        const finalQuantity =
          stock > 0
            ? Math.min(
                safeQuantity,
                stock
              )
            : safeQuantity;

        updatedCart = [
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

      localStorage.setItem(
        "fitforge-cart",
        JSON.stringify(updatedCart)
      );

      console.log(
        "FITFORGE CART UPDATED:",
        updatedCart
      );

      return updatedCart;
    });
  };

  // ======================================
  // REMOVE FROM CART
  // ======================================

  const removeFromCart = (
    productId,
    size = "",
    color = ""
  ) => {
    setCart((currentCart) => {
      const updatedCart =
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
        JSON.stringify(updatedCart)
      );

      return updatedCart;
    });
  };

  // ======================================
  // UPDATE CART QUANTITY
  // ======================================

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
      const updatedCart =
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
        JSON.stringify(updatedCart)
      );

      return updatedCart;
    });
  };

  // ======================================
  // CLEAR CART
  // ======================================

  const clearCart = () => {
    localStorage.removeItem(
      "fitforge-cart"
    );

    setCart([]);
  };

  // ======================================
  // WISHLIST
  // ======================================

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

  // ======================================
  // WISHLIST CHECK
  // ======================================

  const isInWishlist = (
    productId
  ) => {
    return wishlist.some(
      (product) =>
        product?._id === productId
    );
  };

  // ======================================
  // MOVE TO CART
  // ======================================

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

  // ======================================
  // CART COUNT
  // ======================================

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(
        item?.quantity || 0
      ),
    0
  );

  // ======================================
  // CART TOTAL
  // ======================================

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

  // ======================================
  // PROVIDER
  // ======================================

  return (
    <StoreContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,

        cart,

        // Compatibility with Checkout
        cartItems: cart,

        cartCount,
        cartTotal,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        refreshCartFromStorage,

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

// ========================================
// USE STORE
// ========================================

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