import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const tileColors = ["bg-sand", "bg-clay", "bg-[#ead9c3]", "bg-[#e3cfb6]"];

const trust = [
  { icon: "🚚", title: "Fast delivery", text: "Across Phnom Penh" },
  { icon: "💵", title: "Cash on delivery", text: "Pay when it arrives" },
  { icon: "🧵", title: "Quality fabrics", text: "Soft and long lasting" },
];

function Skeletons({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-2xl bg-sand" />
          <div className="h-3 bg-sand rounded mt-3 w-1/2" />
          <div className="h-4 bg-sand rounded mt-2 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function Section({ title, subtitle, link, children }) {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl font-semibold">{title}</h2>
          {subtitle && <p className="text-taupe text-sm mt-1">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link} className="text-sm underline hover:text-accent">
            View all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const browseRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") || "",
  );
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("newest");
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const filtersActive = Boolean(search || categoryId || gender || onSaleOnly);

  const scrollToBrowse = () => {
    setTimeout(
      () => browseRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api.get("/products").then((res) => setAllProducts(res.data));
  }, []);

  useEffect(() => {
    if (location.pathname === "/shop") scrollToBrowse();
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (gender) params.gender = gender;

      setLoading(true);
      api
        .get("/products", { params })
        .then((res) => setResults(res.data))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryId, gender]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setGender("");
    setOnSaleOnly(false);
    setSort("newest");
  };

  const price = (p) => Number(p.discount_price ?? p.price);

  let shown = results ? [...results] : [];
  if (onSaleOnly) shown = shown.filter((p) => p.discount_price !== null);
  if (sort === "low") shown.sort((a, b) => price(a) - price(b));
  if (sort === "high") shown.sort((a, b) => price(b) - price(a));

  const newArrivals = allProducts ? allProducts.slice(0, 4) : [];
  const onSale = allProducts
    ? allProducts.filter((p) => p.discount_price !== null).slice(0, 4)
    : [];
  const heroProduct = allProducts ? allProducts.find((p) => p.image) : null;

  const chip = (active) =>
    `px-4 py-1.5 rounded-full border text-sm transition ${
      active
        ? "bg-espresso text-cream border-espresso"
        : "border-clay bg-white hover:bg-sand"
    }`;

  const pickCategory = (id) => {
    setCategoryId(String(id));
    scrollToBrowse();
  };

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="bg-sand rounded-3xl overflow-hidden grid md:grid-cols-2 items-center">
          <div className="p-8 md:p-14">
            <span className="inline-block bg-accent text-white text-xs font-bold tracking-wider px-3 py-1 rounded-full">
              NEW COLLECTION
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mt-5">
              Wear the warmth of every day.
            </h1>
            <p className="mt-4 text-taupe max-w-md">
              Soft fabrics, relaxed fits, and earthy tones made to live in.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                scrollToBrowse();
              }}
              className="mt-7 flex bg-white rounded-full border border-clay overflow-hidden max-w-md focus-within:border-accent"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search t-shirts, jeans, hoodies..."
                className="flex-1 px-5 py-3 bg-transparent focus:outline-none text-sm"
              />
              <button className="bg-accent text-white px-6 font-semibold text-sm hover:bg-accent-dark transition">
                Search
              </button>
            </form>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  clearFilters();
                  scrollToBrowse();
                }}
                className="border border-espresso px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-espresso hover:text-cream transition"
              >
                Shop all
              </button>
              <a
                href="#sale"
                className="px-6 py-2.5 rounded-full font-semibold text-sm underline hover:text-accent"
              >
                See sale
              </a>
            </div>
          </div>

          <div className="relative h-72 md:h-[28rem] bg-clay">
            {heroProduct ? (
              <img
                src={heroProduct.image}
                alt={heroProduct.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-40 w-40 rounded-full bg-accent/90" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trust.map((t) => (
            <div
              key={t.title}
              className="flex items-center gap-3 bg-white border border-clay rounded-2xl px-5 py-4"
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-taupe">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <Section title="Shop by category" subtitle="Find your style in a click">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <button
                key={c.id}
                onClick={() => pickCategory(c.id)}
                className={`${tileColors[i % tileColors.length]} rounded-2xl p-6 h-32 flex items-end text-left font-display text-xl font-semibold hover:-translate-y-1 hover:shadow-md transition ${
                  categoryId === String(c.id) ? "ring-2 ring-accent" : ""
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Curated rows (hidden while filtering) */}
      {!filtersActive && (
        <>
          <Section title="New arrivals" subtitle="Fresh in this week">
            {!allProducts ? (
              <Skeletons />
            ) : newArrivals.length === 0 ? (
              <p className="text-taupe">No products yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </Section>

          {onSale.length > 0 && (
            <div id="sale" className="scroll-mt-20">
              <Section title="On sale" subtitle="Limited-time prices">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {onSale.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </Section>
            </div>
          )}
        </>
      )}

      {/* Browse with filters */}
      <section
        ref={browseRef}
        className="max-w-6xl mx-auto px-4 mt-16 scroll-mt-20"
      >
        <h2 className="font-display text-3xl font-semibold mb-6">
          {filtersActive ? "Results" : "All products"}
        </h2>

        <div className="bg-white border border-clay rounded-2xl p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search clothing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-cream border border-clay rounded-full px-5 py-2.5 focus:outline-none focus:border-accent"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="bg-cream border border-clay rounded-full px-5 py-2.5 focus:outline-none focus:border-accent"
            >
              <option value="">All genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
              <option value="kids">Kids</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-cream border border-clay rounded-full px-5 py-2.5 focus:outline-none focus:border-accent"
            >
              <option value="newest">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryId("")}
              className={chip(categoryId === "")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(String(c.id))}
                className={chip(categoryId === String(c.id))}
              >
                {c.name}
              </button>
            ))}
            <button
              onClick={() => setOnSaleOnly(!onSaleOnly)}
              className={`px-4 py-1.5 rounded-full border text-sm transition ${
                onSaleOnly
                  ? "bg-accent text-white border-accent"
                  : "border-accent text-accent hover:bg-accent hover:text-white"
              }`}
            >
              On sale only
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-taupe">
          <span>
            {loading
              ? "Loading..."
              : `${shown.length} product${shown.length === 1 ? "" : "s"}`}
          </span>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="underline hover:text-accent"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <Skeletons />
        ) : shown.length === 0 ? (
          <div className="text-center py-16 bg-sand rounded-2xl">
            <p className="font-display text-2xl">Nothing found</p>
            <p className="text-taupe text-sm mt-1">
              Try a different word or clear the filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 bg-espresso text-cream px-6 py-2 rounded-full text-sm hover:bg-accent transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
