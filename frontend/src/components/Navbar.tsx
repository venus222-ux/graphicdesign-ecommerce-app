import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { logoutRequest } from "../api";
import styles from "../styles/Navbar.module.css";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Heart, Bell, Trash2 } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useNotificationStore } from "../store/useNotificationStore";
import echo, { updateEchoToken } from "../lib/echo";

export default function Navbar() {
  const { isAuth, initialized, logout, theme, toggleTheme, role } = useStore();

  const navigate = useNavigate();

  // ================================
  // Notification Store
  // ================================
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const notifications = useNotificationStore((s) => s.notifications);

  const clearNotifications = useNotificationStore((s) => s.clear);

  // ================================
  // State
  // ================================
  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);

  const [open, setOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  // ================================
  // Cart
  // ================================
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0),
  );

  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [justAdded, setJustAdded] = useState(false);

  const prevTotalRef = useRef(totalItems);

  const subscribedRef = useRef(false);
  const channelsRef = useRef<Map<number, any>>(new Map());

  // ================================
  // REALTIME NOTIFICATIONS - Only Purchased Products
  // ================================
  useEffect(() => {
    if (!isAuth || !initialized) return;

    // 🚨 Prevent StrictMode double execution
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const token = localStorage.getItem("token");

    if (!token) return;

    updateEchoToken(token);

    const loadAndSubscribe = async () => {
      try {
        const res = await fetch("/api/user/interested-products", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        const productIds: number[] = data.product_ids || [];

        console.log("📡 Products:", productIds.length);

        productIds.forEach((productId) => {
          // 🚨 PREVENT DUPLICATE SUBSCRIBE
          if (channelsRef.current.has(productId)) return;

          const channelName = `product.${productId}`;
          const channel = echo.private(channelName);

          channelsRef.current.set(productId, channel);

          channel
            .subscribed(() => {
              console.log("✅ Subscribed:", channelName);
            })
            .error((err: any) => {
              console.error("❌ Error:", err);
            })
            .listen(".product.updated", (e: any) => {
              console.log("🔥 EVENT RECEIVED:", e);

              useNotificationStore.getState().addNotification({
                id: crypto.randomUUID(),
                title: e.title,
                message: e.message,
                product_id: e.product_id,
                updated_at: e.updated_at,
              });
            });
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadAndSubscribe();

    // ==========================
    // CLEANUP FIXED
    // ==========================
    return () => {
      channelsRef.current.forEach((_, productId) => {
        echo.leave(`product.${productId}`);
      });

      channelsRef.current.clear();
      subscribedRef.current = false;
    };
  }, [isAuth, initialized]);

  // ================================
  // Cart animation
  // ================================
  useEffect(() => {
    if (totalItems > prevTotalRef.current) {
      setJustAdded(true);

      const timer = setTimeout(() => setJustAdded(false), 400);

      return () => clearTimeout(timer);
    }

    prevTotalRef.current = totalItems;
  }, [totalItems]);

  // ================================
  // Categories
  // ================================
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || data || []))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // ================================
  // Logout
  // ================================
  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      logout();

      navigate("/login");
    }
  };

  // ================================
  // Cart Button
  // ================================
  const CartButton = () => (
    <Link
      to="/cart"
      className={`${styles.cartContainer} ${justAdded ? styles.added : ""}`}
      title="View shopping cart"
    >
      <ShoppingCart size={22} className={styles.cartIcon} />

      {totalItems > 0 && (
        <span className={styles.cartBadge}>
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );

  // ================================
  // Wishlist Button
  // ================================
  const WishlistButton = () => (
    <Link to="/wishlist" className={styles.cartContainer} title="Wishlist">
      <Heart size={22} className={styles.cartIcon} />

      {wishlistCount > 0 && (
        <span className={styles.cartBadge}>
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      )}
    </Link>
  );

  // ================================
  // Notification Bell
  // ================================
  const NotificationBell = ({ count }: { count: number }) => (
    <div className={styles.notificationWrapper}>
      <button
        className={styles.cartContainer}
        title="Notifications"
        onClick={() => setNotificationOpen(!notificationOpen)}
      >
        <Bell size={22} className={styles.cartIcon} />

        {count > 0 && (
          <span className={styles.cartBadge}>{count > 99 ? "99+" : count}</span>
        )}
      </button>

      {notificationOpen && (
        <div className={styles.notificationDropdown}>
          <div className={styles.notificationHeader}>
            <span>Notifications</span>

            {notifications.length > 0 && (
              <button className={styles.clearBtn} onClick={clearNotifications}>
                <Trash2 size={16} />
                Clear
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyNotification}>No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={styles.notificationItem}>
                  <div className={styles.notificationTitle}>{n.title}</div>

                  <div className={styles.notificationMessage}>{n.message}</div>

                  <div className={styles.notificationDate}>
                    {new Date(n.updated_at).toLocaleString()}
                  </div>

                  <Link
                    to={`/product/${n.product_id}`}
                    className={styles.notificationLink}
                    onClick={() => setNotificationOpen(false)}
                  >
                    View Product
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ================================
  // Loading
  // ================================
  if (!initialized) {
    return (
      <div
        className={`${styles.navWrapper} ${
          theme === "dark" ? styles.dark : ""
        }`}
      >
        <nav className={styles.glassNav}>
          <span>Loading...</span>
        </nav>
      </div>
    );
  }

  // ================================
  // JSX
  // ================================
  return (
    <div
      className={`${styles.navWrapper} ${theme === "dark" ? styles.dark : ""}`}
    >
      <nav className={styles.glassNav}>
        {/* BRAND */}
        <Link className={styles.brand} to="/">
          <span className={styles.brandIcon}>⚡</span>

          <span className={styles.brandText}>MESSENGER</span>
        </Link>

        {/* NAV */}
        <div className={styles.navGroup}>
          {/* SHOP */}
          <div
            className={styles.dropdown}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <span className={styles.link}>Shop ▾</span>

            {open && (
              <div className={styles.dropdownMenu}>
                <Link
                  to="/shop"
                  className={styles.dropdownItem}
                  onClick={() => setOpen(false)}
                >
                  All Products
                </Link>

                <hr />

                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className={styles.dropdownItem}
                    onClick={() => setOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isAuth ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.activeLink : ""}`
                }
              >
                Dashboard
              </NavLink>

              {role === "admin" && (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.activeLink : ""}`
                  }
                >
                  Admin
                </NavLink>
              )}

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.activeLink : ""}`
                }
              >
                Profile
              </NavLink>

              <WishlistButton />

              <CartButton />

              <NotificationBell count={unreadCount} />
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.activeLink : ""}`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.activeLink : ""}`
                }
              >
                Register
              </NavLink>

              <WishlistButton />

              <CartButton />
            </>
          )}
        </div>

        {/* CONTROLS */}
        <div className={styles.controls}>
          <button className={styles.iconBtn} onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {isAuth && (
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
