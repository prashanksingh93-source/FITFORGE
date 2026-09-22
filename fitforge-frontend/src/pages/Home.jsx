import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Crown,
  Truck,
  ShieldCheck,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

export default function Home() {
  const {
    products,
    loading,
    error,
  } = useStore();

  const iconicProducts = products
    .filter((product) =>
      product.badges?.includes("Iconic")
    )
    .slice(0, 4);

  const performanceProducts = products
    .filter(
      (product) => product.collection === "Performance"
    )
    .slice(0, 4);

  const luxuryProducts = products
    .filter(
      (product) => product.collection === "Luxury"
    )
    .slice(0, 4);

  const bestSellers = products
    .filter((product) =>
      product.badges?.includes("Best Seller")
    )
    .slice(0, 4);

  const newArrivals = products
    .filter((product) =>
      product.badges?.includes("New Arrival")
    )
    .slice(0, 4);

  return (
    <main className="bg-white text-black">
      {/* HERO */}
      <section className="relative min-h-[85vh] bg-black text-white flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />

          <img
            src={
              luxuryProducts[0]?.images?.[0] ||
              performanceProducts[0]?.images?.[0] ||
              "https://via.placeholder.com/1600x1000?text=FITFORGE"
            }
            alt="FITFORGE"
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="tracking-[0.4em] uppercase text-sm mb-6 text-gray-300">
              FITFORGE
            </p>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
              THE MOST
              <br />
              ICONIC
              <br />
              GYM WEAR
            </h1>

            <p className="mt-8 text-gray-300 max-w-xl text-lg">
              Engineered for performance.
              Designed for presence.
              Built for those who refuse ordinary.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-white text-black px-8 py-4 font-bold tracking-widest text-sm hover:bg-gray-200 transition"
              >
                SHOP COLLECTION
                <ArrowRight className="inline-block ml-3 w-4 h-4" />
              </Link>

              <Link
                to="/shop?collection=Luxury"
                className="border border-white px-8 py-4 font-bold tracking-widest text-sm hover:bg-white hover:text-black transition"
              >
                LUXURY
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <div className="p-8 border-r border-b md:border-b-0 flex gap-4 items-center">
            <Dumbbell />
            <div>
              <h3 className="font-bold">
                Performance
              </h3>
              <p className="text-sm text-gray-500">
                Engineered materials
              </p>
            </div>
          </div>

          <div className="p-8 border-r border-b md:border-b-0 flex gap-4 items-center">
            <Crown />
            <div>
              <h3 className="font-bold">Luxury</h3>
              <p className="text-sm text-gray-500">
                Premium collection
              </p>
            </div>
          </div>

          <div className="p-8 border-r flex gap-4 items-center">
            <Truck />
            <div>
              <h3 className="font-bold">
                Fast Shipping
              </h3>
              <p className="text-sm text-gray-500">
                Across India
              </p>
            </div>
          </div>

          <div className="p-8 flex gap-4 items-center">
            <ShieldCheck />
            <div>
              <h3 className="font-bold">
                Secure Shopping
              </h3>
              <p className="text-sm text-gray-500">
                Safe checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-red-600">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-gray-500">
            Loading FITFORGE products...
          </p>
        </section>
      ) : (
        <>
          {/* ICONIC */}
          {iconicProducts.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 py-24">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
                    The Essentials
                  </p>

                  <h2 className="text-4xl md:text-5xl font-black mt-3">
                    ICONIC COLLECTION
                  </h2>
                </div>

                <Link
                  to="/shop"
                  className="hidden md:flex items-center gap-2 font-bold"
                >
                  SHOP ALL
                  <ArrowRight className="w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {iconicProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          )}

          {/* PERFORMANCE */}
          <section className="bg-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <p className="tracking-[0.3em] text-sm uppercase text-gray-500">
                    Built To Move
                  </p>

                  <h2 className="text-5xl md:text-6xl font-black mt-4">
                    PERFORMANCE
                  </h2>

                  <p className="text-gray-600 mt-6 max-w-lg leading-relaxed">
                    Technical gym wear designed for
                    training, movement and everyday
                    performance.
                  </p>

                  <Link
                    to="/shop?collection=Performance"
                    className="inline-flex items-center gap-3 mt-8 bg-black text-white px-7 py-4 font-bold"
                  >
                    SHOP PERFORMANCE
                    <ArrowRight className="w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {performanceProducts
                    .slice(0, 2)
                    .map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* LUXURY */}
          <section className="bg-charcoal text-white py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <p className="tracking-[0.3em] text-sm uppercase text-gray-400">
                    The Signature
                  </p>

                  <h2 className="text-5xl md:text-6xl font-black mt-4">
                    LUXURY
                  </h2>
                </div>

                <Link
                  to="/shop?collection=Luxury"
                  className="hidden md:flex items-center gap-2 font-bold"
                >
                  EXPLORE
                  <ArrowRight className="w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {luxuryProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* BEST SELLERS */}
          {bestSellers.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 py-24">
              <div className="mb-12">
                <p className="tracking-[0.3em] text-sm uppercase text-gray-500">
                  Most Wanted
                </p>

                <h2 className="text-4xl md:text-5xl font-black mt-3">
                  BEST SELLERS
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          )}

          {/* NEW ARRIVALS */}
          {newArrivals.length > 0 && (
            <section className="bg-gray-50 py-24">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12">
                  <p className="tracking-[0.3em] text-sm uppercase text-gray-500">
                    Just Dropped
                  </p>

                  <h2 className="text-4xl md:text-5xl font-black mt-3">
                    NEW ARRIVALS
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newArrivals.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-black text-white py-28 text-center">
            <div className="max-w-3xl mx-auto px-6">
              <p className="tracking-[0.4em] text-sm text-gray-400">
                FITFORGE
              </p>

              <h2 className="text-5xl md:text-7xl font-black mt-5">
                FORGE YOUR
                <br />
                STANDARD.
              </h2>

              <p className="text-gray-400 mt-6">
                Performance meets luxury.
              </p>

              <Link
                to="/shop"
                className="inline-block mt-10 bg-white text-black px-10 py-4 font-bold tracking-widest hover:bg-gray-200"
              >
                SHOP NOW
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}