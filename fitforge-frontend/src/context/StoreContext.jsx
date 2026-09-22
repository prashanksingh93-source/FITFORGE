import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
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
  });

  const [wishlist, setWishlist] = useState(() => {
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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // FETCH PRODUCTS
  // ================================

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

      setError(
        "Unable to load products."
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================================
  // SAVE CART
  // ================================

  useEffect(() => {
    localStorage.setItem(
      "fitforge-cart",
      JSON.stringify(cart)
    );

    console.log(
      "FITFORGE CART:",
      cart
    );
  }, [cart]);

  // ================================
  // SAVE WISHLIST
  // ================================

  useEffect(() => {
    localStorage.setItem(
      "fitforge-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // ================================
  // ADD TO CART
  // ================================

  const addToCart = (
    product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    if (!product?._id) {
      console.error(
        "Cannot add product without _id:",
        product
      );

      return;
    }

    console.log(
      "ADDING TO CART:",
      product.name
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

      if (existingItem) {
        return safeCart.map(
          (item) =>
            item?.product?._id ===
              product._id &&
            item.size === size &&
            item.color === color
              ? {
                  ...item,
                  quantity:
                    Number(
                      item.quantity || 0
                    ) +
                    Number(
                      quantity || 1
                    ),
                }
              : item
        );
      }

      const newItem = {
        product,
        quantity:
          Number(quantity) || 1,
        size,
        color,
      };

      return [
        ...safeCart,
        newItem,
      ];
    });
  };

  // ================================
  // REMOVE FROM CART
  // ================================

  const removeFromCart = (
    productId,
    size = "",
    color = ""
  ) => {
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
  };

  // ================================
  // UPDATE QUANTITY
  // ================================

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

    setCart((currentCart) =>
      currentCart.map(
        (item) =>
          item?.product?._id ===
            productId &&
          item.size === size &&
          item.color === color
            ? {
                ...item,
                quantity:
                  newQuantity,
              }
            : item
      )
    );
  };

  // ================================
  // CLEAR CART
  // ================================

  const clearCart = () => {
    setCart([]);
  };

  // ================================
  // WISHLIST
  // ================================

  const toggleWishlist = (product) => {
    if (!product?._id) {
      return;
    }

    setWishlist(
      (currentWishlist) => {
        const exists =
          currentWishlist.some(
            (item) =>
              item?._id ===
              product._id
          );

        if (exists) {
          return currentWishlist.filter(
            (item) =>
              item?._id !==
              product._id
          );
        }

        return [
          ...currentWishlist,
          product,
        ];
      }
    );
  };

  const isInWishlist = (
    productId
  ) => {
    return wishlist.some(
      (product) =>
        product?._id === productId
    );
  };

  // ================================
  // CART COUNT
  // ================================

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(
        item?.quantity || 0
      ),
    0
  );

  // ================================
  // CART TOTAL
  // ================================

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

// ================================
// useStore
// ================================

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