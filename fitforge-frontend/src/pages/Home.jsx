import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

const Home = () => {
  const { products, loading: productsLoading } = useStore();

  const [homepage, setHomepage] = useState(null);
  const [homepageLoading, setHomepageLoading] = useState(true);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const response = await api.get("/homepage");

        setHomepage(response.data.homepage);
      } catch (error) {
        console.error("Homepage settings error:", error);
      } finally {
        setHomepageLoading(false);
      }
    };

    fetchHomepage();
  }, []);

  const settings = homepage || {
    heroTitle: "THE MOST ICONIC GYM WEAR",
    heroSubtitle: "BUILT FOR PERFORMANCE. DESIGNED FOR THE ICONIC.",
    heroDescription:
      "Premium gym wear engineered for movement, performance and everyday confidence.",
    heroImage: "",
    heroButtonText: "SHOP THE SIGNATURE COLLECTION",
    heroButtonLink: "/shop",
    announcementEnabled: true,
    announcementText: "THE MOST ICONIC GYM WEAR",
    performanceTitle: "PERFORMANCE",
    performanceSubtitle: "ENGINEERED TO PERFORM",
    luxuryTitle: "LUXURY",
    luxurySubtitle: "ELEVATED TRAINING",
    featuredTitle: "ICONIC ESSENTIALS",
    featuredSubtitle: "THE PIECES THAT DEFINE FITFORGE",
  };

  const iconicProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.badges?.includes("Iconic")
      )
      .slice(0, 4);
  }, [products]);

  const performanceProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.collection === "Performance"
      )
      .slice(0, 4);
  }, [products]);

  const luxuryProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.collection === "Luxury"
      )
      .slice(0, 4);
  }, [products]);

  if (homepageLoading && productsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-[70vh] animate-pulse bg-neutral-100" />

        <div className="mx-auto max-w-7xl space-y-6 px-5 py-16">
          <div className="h-10 w-72 rounded bg-neutral-200" />
          <div className="grid gap-5 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-96 rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">

      {/* =====================================================
          ANNOUNCEMENT
      ====================================================== */}

      {settings.announcementEnabled && (
        <div className="flex min-h-10 items-center justify-center bg-black px-4 text-center text-[11px] font-bold tracking-[0.2em] text-white">
          {settings.announcementText}
        </div>
      )}


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[72vh] overflow-hidden bg-black text-white">
        {settings.heroImage && (
          <img
            src={settings.heroImage}
            alt="FITFORGE hero"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center px-5 py-20 md:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="max-w-3xl"
          >
            <div className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
              <Sparkles size={15} />
              FITFORGE
            </div>

            <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.04em] md:text-7xl lg:text-8xl">
              {settings.heroTitle}
            </h1>

            <p className="mt-7 max-w-xl text-sm font-semibold uppercase leading-6 tracking-[0.18em] text-neutral-300 md:text-base">
              {settings.heroSubtitle}
            </p>

            <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">
              {settings.heroDescription}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to={settings.heroButtonLink || "/shop"}
                className="group inline-flex items-center gap-3 bg-gray-300 px-7 py-4 text-sm font-black text-black transition hover:bg-neutral-200"
              >
                {settings.heroButtonText || "SHOP NOW"}

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/luxury"
                className="inline-flex items-center gap-3 border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:border-white"
              >
                EXPLORE LUXURY
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section className="border-b border-neutral-200">
        <div className="mx-auto grid max-w-7xl md:grid-cols-4">

          <Feature
            icon={<Dumbbell size={20} />}
            title="Performance"
            text="Engineered for movement"
          />

          <Feature
            icon={<Sparkles size={20} />}
            title="Premium"
            text="Elevated materials"
          />

          <Feature
            icon={<ShieldCheck size={20} />}
            title="Quality"
            text="Built to last"
          />

          <Feature
            icon={<Truck size={20} />}
            title="Delivery"
            text="Fast shipping across India"
          />

        </div>
      </section>


      {/* =====================================================
          ICONIC PRODUCTS
      ====================================================== */}

      {iconicProducts.length > 0 && (
        <ProductSection
          eyebrow="FITFORGE SIGNATURE"
          title={settings.featuredTitle}
          subtitle={settings.featuredSubtitle}
          products={iconicProducts}
        />
      )}


      {/* =====================================================
          PERFORMANCE
      ====================================================== */}

      {performanceProducts.length > 0 && (
        <CollectionSection
          collection="Performance"
          title={settings.performanceTitle}
          subtitle={settings.performanceSubtitle}
          products={performanceProducts}
        />
      )}


      {/* =====================================================
          LUXURY
      ====================================================== */}

      {luxuryProducts.length > 0 && (
        <CollectionSection
          collection="Luxury"
          title={settings.luxuryTitle}
          subtitle={settings.luxurySubtitle}
          products={luxuryProducts}
          dark
        />
      )}


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-black px-5 py-24 text-center text-white md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            TRAIN. MOVE. DEFINE.
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
            WEAR THE DIFFERENCE.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-400">
            Discover premium performance and luxury gym wear
            designed for people who take their training seriously.
          </p>

          <Link
            to="/shop"
            className="mt-9 inline-flex items-center gap-3 bg-gray-700 px-8 py-4 text-sm font-black text-black transition hover:bg-neutral-200"
          >
            SHOP ALL

            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
};


const Feature = ({
  icon,
  title,
  text,
}) => {
  return (
    <div className="flex items-center gap-4 border-neutral-200 px-6 py-7 md:border-r last:border-r-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {text}
        </p>
      </div>
    </div>
  );
};


const ProductSection = ({
  eyebrow,
  title,
  subtitle,
  products,
}) => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            {title}
          </h2>

          <p className="mt-3 text-sm text-neutral-500">
            {subtitle}
          </p>
        </div>

        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-sm font-bold"
        >
          VIEW ALL

          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>

      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
};


const CollectionSection = ({
  collection,
  title,
  subtitle,
  products,
  dark = false,
}) => {
  return (
    <section
      className={
        dark
          ? "bg-[oklch(56%_0.021_213.5)] text-gray-600"
          : "bg-neutral-100 text-black"
      }
    >
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">

        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p
              className={
                dark
                  ? "text-xs font-bold uppercase tracking-[0.25em] text-neutral-500"
                  : "text-xs font-bold uppercase tracking-[0.25em] text-neutral-500"
              }
            >
              {collection}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
              {title}
            </h2>

            <p
              className={
                dark
                  ? "mt-3 text-sm text-[oklch(59.6%_0.145_163.225)]"
                  : "mt-3 text-sm text-neutral-600"
              }
            >
              {subtitle}
            </p>
          </div>

          <Link
            to={
              collection === "Luxury"
                ? "/luxury"
                : "/performance"
            }
            className="inline-flex items-center gap-2 text-sm font-bold"
          >
            EXPLORE

            <ArrowRight size={16} />
          </Link>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Home;