import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import {
  getWishlist,
  toggleWishlist as toggleWishlistApi,
} from "../services/wishlistService";

const StoreContext = createContext(null);

const CART_STORAGE_KEY = "fitforge-cart";
const WISHLIST_STORAGE_KEY = "fitforge-wishlist";

/*
|--------------------------------------------------------------------------
| LOCAL STORAGE HELPERS
|--------------------------------------------------------------------------
*/

const getLocalStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch (error) {
    console.error(
      `Failed to read ${key} from localStorage:`,
      error
    );

    return fallback;
  }
};

const saveLocalStorage = (key, value) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(
      `Failed to save ${key} to localStorage:`,
      error
    );
  }
};

/*
|--------------------------------------------------------------------------
| PRODUCT PRICE
|--------------------------------------------------------------------------
|
| This price is only for displaying cart information.
|
| Final checkout price MUST always be calculated
| and verified by the backend.
|
|--------------------------------------------------------------------------
*/

const getProductPrice = (product) => {
  if (
    product?.salePrice !== null &&
    product?.salePrice !== undefined &&
    Number(product.salePrice) >= 0
  ) {
    return Number(product.salePrice);
  }

  return Number(product?.price || 0);
};

/*
|--------------------------------------------------------------------------
| AUTHENTICATION CHECK
|--------------------------------------------------------------------------
*/

const hasAuthenticationToken = () => {
  return Boolean(
    localStorage.getItem("fitforge-token")
  );
};

/*
|--------------------------------------------------------------------------
| STORE PROVIDER
|--------------------------------------------------------------------------
*/

export const StoreProvider = ({ children }) => {
  /*
  |--------------------------------------------------------------------------
  | PRODUCTS
  |--------------------------------------------------------------------------
  */

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | CART
  |--------------------------------------------------------------------------
  */

  const [cart, setCart] = useState(() =>
    getLocalStorage(
      CART_STORAGE_KEY,
      []
    )
  );

  const [cartLoading, setCartLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | WISHLIST
  |--------------------------------------------------------------------------
  */

  const [wishlist, setWishlist] =
    useState([]);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH PRODUCTS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | LOAD PRODUCTS ON APP START
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /*
  |--------------------------------------------------------------------------
  | GET DATABASE CART
  |--------------------------------------------------------------------------
  */

  const fetchCart = useCallback(
    async () => {
      /*
       * Guest users don't have a database cart.
       */
      if (!hasAuthenticationToken()) {
        const savedCart =
          getLocalStorage(
            CART_STORAGE_KEY,
            []
          );

        setCart(
          Array.isArray(savedCart)
            ? savedCart
            : []
        );

        return;
      }

      try {
        setCartLoading(true);

        const response =
          await api.get("/cart");

        if (response.data?.success) {
          const serverItems =
            response.data.cart?.items ||
            [];

          setCart(serverItems);

          saveLocalStorage(
            CART_STORAGE_KEY,
            serverItems
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch cart:",
          error
        );

        /*
         * Don't destroy the user's local cart
         * if the backend is temporarily unavailable.
         */
      } finally {
        setCartLoading(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD DATABASE CART WHEN USER LOGS IN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /*
  |--------------------------------------------------------------------------
  | KEEP LOCAL CART IN SYNC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    saveLocalStorage(
      CART_STORAGE_KEY,
      cart
    );
  }, [cart]);

  /*
  |--------------------------------------------------------------------------
  | FETCH WISHLIST
  |--------------------------------------------------------------------------
  */

  const fetchWishlist = useCallback(
    async () => {
      /*
       * Guest wishlist
       */

      if (!hasAuthenticationToken()) {
        const savedWishlist =
          getLocalStorage(
            WISHLIST_STORAGE_KEY,
            []
          );

        setWishlist(
          Array.isArray(savedWishlist)
            ? savedWishlist
            : []
        );

        return;
      }

      /*
       * Authenticated wishlist
       */

      try {
        setWishlistLoading(true);

        const response =
          await getWishlist();

        if (response?.success) {
          setWishlist(
            response.wishlist?.products ||
              []
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch wishlist:",
          error
        );

        /*
         * Keep an empty wishlist rather than
         * crashing the application.
         */
        setWishlist([]);
      } finally {
        setWishlistLoading(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD WISHLIST
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /*
  |--------------------------------------------------------------------------
  | KEEP GUEST WISHLIST IN LOCAL STORAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!hasAuthenticationToken()) {
      saveLocalStorage(
        WISHLIST_STORAGE_KEY,
        wishlist
      );
    }
  }, [wishlist]);

  /*
  |--------------------------------------------------------------------------
  | ADD PRODUCT TO CART
  |--------------------------------------------------------------------------
  */

  const addToCart = async (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    if (!product?._id) {
      throw new Error(
        "Invalid product"
      );
    }

    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    /*
     * ---------------------------------------------------------
     * AUTHENTICATED USER
     * ---------------------------------------------------------
     *
     * Database is the source of truth.
     */

    if (hasAuthenticationToken()) {
      try {
        setCartLoading(true);

        const response =
          await api.post(
            "/cart",
            {
              productId:
                product._id,
              quantity:
                safeQuantity,
              size,
              color,
            }
          );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to add product to cart"
          );
        }

        const serverCart =
          response.data.cart?.items ||
          [];

        setCart(serverCart);

        saveLocalStorage(
          CART_STORAGE_KEY,
          serverCart
        );

        return response.data;
      } catch (error) {
        console.error(
          "Add to cart failed:",
          error
        );

        throw error;
      } finally {
        setCartLoading(false);
      }
    }

    /*
     * ---------------------------------------------------------
     * GUEST USER
     * ---------------------------------------------------------
     *
     * Guest cart is stored locally.
     */

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

      if (existingItem) {
        return safeCart.map((item) => {
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

            const requestedQuantity =
              currentQuantity +
              safeQuantity;

            const stock = Number(
              product.stock || 0
            );

            return {
              ...item,
              product,
              size,
              color,
              quantity:
                stock > 0
                  ? Math.min(
                      requestedQuantity,
                      stock
                    )
                  : requestedQuantity,
            };
          }

          return item;
        });
      }

      const stock = Number(
        product.stock || 0
      );

      const finalQuantity =
        stock > 0
          ? Math.min(
              safeQuantity,
              stock
            )
          : safeQuantity;

      return [
        ...safeCart,
        {
          /*
           * Temporary local ID for guest cart.
           */
          _id:
            `guest-${product._id}-${Date.now()}`,

          product,

          quantity:
            finalQuantity,

          size,

          color,
        },
      ];
    });

    return {
      success: true,
      message: "Product added to cart",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE FROM CART
  |--------------------------------------------------------------------------
  */

  const removeFromCart = async (
    productId,
    size = "",
    color = "",
    cartItemId = null
  ) => {
    /*
     * Authenticated user
     */

    if (
      hasAuthenticationToken() &&
      cartItemId
    ) {
      try {
        setCartLoading(true);

        const response =
          await api.delete(
            `/cart/${cartItemId}`
          );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to remove cart item"
          );
        }

        const serverCart =
          response.data.cart?.items ||
          [];

        setCart(serverCart);

        saveLocalStorage(
          CART_STORAGE_KEY,
          serverCart
        );

        return response.data;
      } catch (error) {
        console.error(
          "Remove cart item failed:",
          error
        );

        throw error;
      } finally {
        setCartLoading(false);
      }
    }

    /*
     * Guest user
     */

    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item?.product?._id ===
              productId &&
            item.size === size &&
            item.color === color
          )
      )
    );

    return {
      success: true,
      message: "Item removed from cart",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE CART QUANTITY
  |--------------------------------------------------------------------------
  */

  const updateCartQuantity = async (
    productId,
    quantity,
    size = "",
    color = "",
    cartItemId = null
  ) => {
    const newQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        newQuantity
      ) ||
      newQuantity < 1
    ) {
      return;
    }

    /*
     * Authenticated user
     */

    if (
      hasAuthenticationToken() &&
      cartItemId
    ) {
      try {
        setCartLoading(true);

        const response =
          await api.patch(
            `/cart/${cartItemId}`,
            {
              quantity:
                newQuantity,
            }
          );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to update cart"
          );
        }

        const serverCart =
          response.data.cart?.items ||
          [];

        setCart(serverCart);

        saveLocalStorage(
          CART_STORAGE_KEY,
          serverCart
        );

        return response.data;
      } catch (error) {
        console.error(
          "Update cart failed:",
          error
        );

        throw error;
      } finally {
        setCartLoading(false);
      }
    }

    /*
     * Guest user
     */

    setCart((currentCart) =>
      currentCart.map((item) => {
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
            item.product?.stock || 0
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
      })
    );

    return {
      success: true,
      message: "Cart updated",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR CART
  |--------------------------------------------------------------------------
  */

  const clearCart = async () => {
    /*
     * Authenticated user
     */

    if (hasAuthenticationToken()) {
      try {
        setCartLoading(true);

        const response =
          await api.delete("/cart");

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to clear cart"
          );
        }
      } catch (error) {
        console.error(
          "Clear cart failed:",
          error
        );

        throw error;
      } finally {
        setCartLoading(false);
      }
    }

    /*
     * Clear local state regardless.
     */

    setCart([]);

    localStorage.removeItem(
      CART_STORAGE_KEY
    );

    return {
      success: true,
      message: "Cart cleared",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | REFRESH CART
  |--------------------------------------------------------------------------
  */

  const refreshCartFromStorage =
    useCallback(async () => {
      if (hasAuthenticationToken()) {
        await fetchCart();

        return;
      }

      const savedCart =
        getLocalStorage(
          CART_STORAGE_KEY,
          []
        );

      setCart(
        Array.isArray(savedCart)
          ? savedCart
          : []
      );
    }, [fetchCart]);

  /*
  |--------------------------------------------------------------------------
  | TOGGLE WISHLIST
  |--------------------------------------------------------------------------
  */

  const toggleWishlist = async (
    product
  ) => {
    if (!product?._id) {
      return;
    }

    /*
     * Authenticated user
     *
     * MongoDB is the source of truth.
     */

    if (hasAuthenticationToken()) {
      try {
        setWishlistLoading(true);

        const response =
          await toggleWishlistApi(
            product._id
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to update wishlist"
          );
        }

        setWishlist(
          response.wishlist?.products ||
            []
        );

        return response;
      } catch (error) {
        console.error(
          "Wishlist update failed:",
          error
        );

        throw error;
      } finally {
        setWishlistLoading(false);
      }
    }

    /*
     * Guest user
     */

    let added = false;

    setWishlist(
      (currentWishlist) => {
        const safeWishlist =
          Array.isArray(
            currentWishlist
          )
            ? currentWishlist
            : [];

        const exists =
          safeWishlist.some(
            (item) =>
              item?._id ===
              product._id
          );

        if (exists) {
          return safeWishlist.filter(
            (item) =>
              item?._id !==
              product._id
          );
        }

        added = true;

        return [
          ...safeWishlist,
          product,
        ];
      }
    );

    return {
      success: true,
      added,
      message: added
        ? "Added to wishlist"
        : "Removed from wishlist",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK WISHLIST
  |--------------------------------------------------------------------------
  */

  const isInWishlist = (
    productId
  ) => {
    return wishlist.some(
      (product) =>
        product?._id ===
        productId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | MOVE WISHLIST PRODUCT TO CART
  |--------------------------------------------------------------------------
  */

  const moveToCart = async (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    if (!product?._id) {
      return;
    }

    const selectedSize =
      size ||
      product.sizes?.[0] ||
      "";

    const selectedColor =
      color ||
      product.colors?.[0]
        ?.name ||
      "";

    await addToCart(
      product,
      quantity,
      selectedSize,
      selectedColor
    );

    /*
     * Remove from wishlist
     */

    await toggleWishlist(
      product
    );

    return {
      success: true,
      message:
        "Product moved to cart",
    };
  };

  /*
  |--------------------------------------------------------------------------
  | CART COUNT
  |--------------------------------------------------------------------------
  */

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(
        item?.quantity || 0
      ),
    0
  );

  /*
  |--------------------------------------------------------------------------
  | CART TOTAL
  |--------------------------------------------------------------------------
  |
  | Display value only.
  |
  | Backend MUST recalculate final
  | checkout amount.
  |
  |--------------------------------------------------------------------------
  */

  const cartTotal = cart.reduce(
    (total, item) => {
      const product =
        item?.product;

      if (!product) {
        return total;
      }

      const price =
        getProductPrice(
          product
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

  /*
  |--------------------------------------------------------------------------
  | WISHLIST COUNT
  |--------------------------------------------------------------------------
  */

  const wishlistCount =
    wishlist.length;

  /*
  |--------------------------------------------------------------------------
  | PROVIDER
  |--------------------------------------------------------------------------
  */

  return (
    <StoreContext.Provider
      value={{
        /*
         * Products
         */
        products,
        loading,
        error,
        fetchProducts,

        /*
         * Cart
         */
        cart,
        cartItems: cart,
        cartCount,
        cartTotal,
        cartLoading,
        fetchCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        refreshCartFromStorage,

        /*
         * Wishlist
         */
        wishlist,
        wishlistCount,
        wishlistLoading,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| USE STORE HOOK
|--------------------------------------------------------------------------
*/

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