import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import {
  getStores,
  getStoreLocations,
  type PublicStore,
  type PaginationMeta,
} from "../api/stores.api";

const StoreLocator: React.FC = () => {
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<PublicStore | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [radius, setRadius] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Dropdown options
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  // Load cities & states on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getStoreLocations();
        setCities(data.cities || []);
        setStates(data.states || []);
      } catch (err) {
        console.error("Failed to fetch store locations", err);
      }
    };
    void fetchLocations();
  }, []);

  // Fetch stores
  const fetchStoresList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStores({
        search: search.trim() || undefined,
        city: city || undefined,
        state: state || undefined,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
        radius: radius,
        page,
        limit: 12,
        sortBy: userLocation ? "distance" : "name",
        sortOrder: "asc",
      });
      setStores(data.items || []);
      setPagination(data.pagination);
      if (data.items?.length > 0 && !selectedStore) {
        setSelectedStore(data.items[0] || null);
      } else if (data.items?.length === 0) {
        setSelectedStore(null);
      }
    } catch (err) {
      console.error("Failed to fetch stores", err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [search, city, state, radius, page, userLocation, selectedStore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStoresList();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStoresList]);

  // Geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setRadius(50); // Default radius 50km
        setPage(1);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            "Location access was denied. Please search by city or PIN code.",
          );
        } else {
          setGeoError(
            "Unable to retrieve your location. Please try searching.",
          );
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setRadius(undefined);
    setGeoError(null);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setCity("");
    setState("");
    setRadius(undefined);
    setUserLocation(null);
    setGeoError(null);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || city || state || radius || userLocation,
  );

  const getDirectionsUrl = (store: PublicStore) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background-light text-text-main-light">
        {/* Hero Header */}
        <div className="relative bg-surface-dark border-b border-primary/10 py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <span className="material-icons-outlined text-sm">
                location_on
              </span>
              Store Locator
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-main-light mb-4">
              Experience <span className="text-gold-gradient">Pinak</span> In
              Person
            </h1>
            <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explore our boutique stores and flagship beauty counters across
              India. Immerse yourself in pure luxury skincare and makeup.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="sticky top-[73px] z-30 bg-surface-dark/95 backdrop-blur-md border-b border-primary/10 py-4 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search text input */}
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search store name, street, city or PIN..."
                  className="w-full bg-background-light border border-primary/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-main-light placeholder-text-muted/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main-light cursor-pointer"
                  >
                    <span className="material-icons-outlined text-sm">
                      close
                    </span>
                  </button>
                )}
              </div>

              {/* Filter controls row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* City select */}
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background-light border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* State select */}
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background-light border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-text-main-light outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">All States</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Radius filter (if GPS active) */}
                {userLocation && (
                  <select
                    value={radius || ""}
                    onChange={(e) => {
                      setRadius(
                        e.target.value ? Number(e.target.value) : undefined,
                      );
                      setPage(1);
                    }}
                    className="bg-background-light border border-primary/30 text-primary font-medium rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">Any distance</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                    <option value="100">Within 100 km</option>
                  </select>
                )}

                {/* Use My Location GPS button */}
                {userLocation ? (
                  <button
                    onClick={handleClearLocation}
                    className="flex items-center gap-1.5 bg-primary/10 border border-primary/40 text-primary px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all cursor-pointer active:scale-95"
                    title="Clear location filter"
                  >
                    <span className="material-icons-outlined text-base animate-pulse">
                      my_location
                    </span>
                    <span>Near Me</span>
                    <span className="material-icons-outlined text-xs ml-0.5">
                      close
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleUseMyLocation}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 bg-background-light border border-primary/20 hover:border-primary hover:text-primary text-text-main-light px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <span
                      className={`material-icons-outlined text-base ${geoLoading ? "animate-spin" : ""}`}
                    >
                      {geoLoading ? "refresh" : "near_me"}
                    </span>
                    <span>
                      {geoLoading ? "Locating..." : "Use My Location"}
                    </span>
                  </button>
                )}

                {/* Clear all filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-text-muted hover:text-red-400 font-medium px-2 py-2 cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Error or Location feedback note */}
            {geoError && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">info</span>
                {geoError}
              </p>
            )}
            {userLocation && (
              <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">explore</span>
                Showing stores closest to your current location (sorted by
                distance)
              </p>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-main-light">
              {loading ? (
                "Searching stores..."
              ) : stores.length > 0 ? (
                <>
                  Available Stores{" "}
                  <span className="text-text-muted font-normal text-sm">
                    ({pagination.total} found)
                  </span>
                </>
              ) : (
                "No stores found"
              )}
            </h2>
            {stores.length > 0 && selectedStore && (
              <span className="text-xs text-text-muted hidden sm:inline-block">
                Click a store to view on map
              </span>
            )}
          </div>

          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-surface-dark border border-primary/10 rounded-2xl p-6 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-start">
                    <div className="h-5 bg-primary/10 rounded w-2/3" />
                    <div className="h-5 bg-primary/10 rounded-full w-16" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-primary/5 rounded w-full" />
                    <div className="h-3 bg-primary/5 rounded w-3/4" />
                  </div>
                  <div className="h-8 bg-primary/10 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-surface-dark border border-primary/10 rounded-2xl max-w-xl mx-auto my-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <span className="material-icons-outlined text-3xl">
                  storefront
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-text-main-light">
                No stores found
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                We couldn&apos;t find any stores matching your search criteria.
                Try expanding your radius or checking a different city or state.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="bg-primary hover:bg-primary-hover text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer shadow-lg shadow-primary/20"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            /* Split View: Stores list on left, Interactive Map on right */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Stores List column */}
              <div className="lg:col-span-7 space-y-4">
                {stores.map((store) => {
                  const isSelected = selectedStore?.id === store.id;
                  return (
                    <div
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`group p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-surface-elevated border-primary shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-primary"
                          : "bg-surface-dark border-primary/10 hover:border-primary/30 hover:bg-surface-elevated"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-icons-outlined text-xl ${isSelected ? "text-primary" : "text-text-muted group-hover:text-primary transition-colors"}`}
                          >
                            store
                          </span>
                          <h3 className="font-display font-bold text-base sm:text-lg text-text-main-light group-hover:text-primary transition-colors">
                            {store.name}
                          </h3>
                        </div>

                        {/* Distance Badge */}
                        {store.distance != null && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/20">
                            <span className="material-icons-outlined text-xs">
                              navigation
                            </span>
                            {store.distance} km away
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-sm text-text-muted leading-relaxed mb-3 pl-7">
                        {store.address}, {store.city}, {store.state} —{" "}
                        <span className="font-mono">{store.zipCode}</span>
                      </p>

                      {/* Phone & Directions Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-primary/10 pl-7">
                        {store.phone ? (
                          <a
                            href={`tel:${store.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors"
                          >
                            <span className="material-icons-outlined text-sm">
                              phone
                            </span>
                            {store.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted/60">
                            Phone unavailable
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <a
                            href={getDirectionsUrl(store)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-black hover:bg-primary-hover shadow-sm transition-all"
                          >
                            <span className="material-icons-outlined text-sm">
                              directions
                            </span>
                            Get Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-xl border border-primary/20 text-xs font-bold text-text-muted hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-text-muted font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 rounded-xl border border-primary/20 text-xs font-bold text-text-muted hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Map Preview column */}
              <div className="lg:col-span-5 lg:sticky lg:top-[160px]">
                <div className="bg-surface-dark border border-primary/20 rounded-2xl overflow-hidden shadow-2xl">
                  {selectedStore ? (
                    <div>
                      {/* Map Header */}
                      <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-surface-elevated">
                        <div className="min-w-0">
                          <h4 className="font-display text-sm font-bold text-text-main-light truncate">
                            {selectedStore.name}
                          </h4>
                          <p className="text-xs text-text-muted truncate">
                            {selectedStore.city}, {selectedStore.state}
                          </p>
                        </div>
                        <a
                          href={getDirectionsUrl(selectedStore)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all shrink-0 flex items-center gap-1"
                        >
                          <span className="material-icons-outlined text-xs">
                            open_in_new
                          </span>
                          Google Maps
                        </a>
                      </div>

                      {/* Live OpenStreetMap iframe for the selected store coordinates */}
                      <div className="w-full h-[320px] sm:h-[400px] bg-background-main relative">
                        <iframe
                          title={selectedStore.name}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedStore.longitude - 0.01}%2C${selectedStore.latitude - 0.01}%2C${selectedStore.longitude + 0.01}%2C${selectedStore.latitude + 0.01}&layer=mapnik&marker=${selectedStore.latitude}%2C${selectedStore.longitude}`}
                          className="w-full h-full filter invert hue-rotate-180 contrast-75 brightness-125"
                        />
                      </div>

                      {/* Map Footer card */}
                      <div className="p-4 bg-surface-dark border-t border-primary/10 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="material-icons-outlined text-primary text-sm mt-0.5">
                            place
                          </span>
                          <p className="text-xs text-text-muted leading-relaxed">
                            {selectedStore.address}, {selectedStore.city},{" "}
                            {selectedStore.state} {selectedStore.zipCode}
                          </p>
                        </div>
                        {selectedStore.phone && (
                          <div className="flex items-center gap-2">
                            <span className="material-icons-outlined text-primary text-sm">
                              phone
                            </span>
                            <a
                              href={`tel:${selectedStore.phone}`}
                              className="text-xs text-text-muted hover:text-primary transition-colors"
                            >
                              {selectedStore.phone}
                            </a>
                          </div>
                        )}
                        <a
                          href={getDirectionsUrl(selectedStore)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          <span className="material-icons-outlined text-sm">
                            directions
                          </span>
                          Navigate to this Store
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 text-text-muted space-y-3">
                      <span className="material-icons-outlined text-4xl text-primary/40">
                        map
                      </span>
                      <p className="text-sm">
                        Select a store from the list to preview on map
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StoreLocator;
