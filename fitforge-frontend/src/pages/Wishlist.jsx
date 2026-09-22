import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

const Wishlist = () => {
  const { wishlist } = useStore();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-[0.25em] text-gray-500 mb-3">
          FITFORGE
        </p>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          MY WISHLIST
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
          <Heart
            size={48}
            strokeWidth={1}
            className="mb-5 text-gray-400"
          />

          <h2 className="text-2xl font-bold mb-2">
            Your wishlist is empty
          </h2>

          <p className="text-gray-500 mb-7">
            Save your favorite FITFORGE pieces here.
          </p>

          <Link
            to="/shop"
            className="bg-black text-white px-8 py-3 text-sm font-semibold tracking-wider hover:bg-gray-800 transition"
          >
            EXPLORE SHOP
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm text-gray-500">
            {wishlist.length}{" "}
            {wishlist.length === 1
              ? "item"
              : "items"}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
            {wishlist.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default Wishlist;