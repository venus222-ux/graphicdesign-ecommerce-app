import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { logoutRequest } from "../api";
import styles from "../styles/Navbar.module.css";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";

export default function Navbar() {
  const { isAuth, initialized, logout, theme, toggleTheme, role } = useStore();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);

  const [open, setOpen] = useState(false);

  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0),
  );

  const wishlistCount = useWishlistStore((s) => s.items.length);

  // Cart shake animation
  const [justAdded, setJustAdded] = useState(false);
  const prevTotalRef = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevTotalRef.current) {
      setJustAdded(true);

      const timer = setTimeout(() => setJustAdded(false), 400);

      return () => clearTimeout(timer);
    }

    prevTotalRef.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || data || []))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
    } finally {
      logout();
      navigate("/login");
    }
  };

  // 🛒 Cart Button
  const CartButton = () => (
    <Link
      to="/cart"
      className={`${styles.cartContainer} ${justAdded ? styles.added : ""}`}
      title="View shopping cart"
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingCart size={22} className={styles.cartIcon} />

      {totalItems > 0 && (
        <span key={totalItems} className={styles.cartBadge}>
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );

  // ❤️ Wishlist Button
  const WishlistButton = () => (
    <Link
      to="/wishlist"
      className={styles.cartContainer}
      title="Wishlist"
      aria-label={`Wishlist with ${wishlistCount} items`}
    >
      <Heart size={22} className={styles.cartIcon} />

      {wishlistCount > 0 && (
        <span className={styles.cartBadge}>
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      )}
    </Link>
  );

  if (!initialized) {
    return (
      <div
        className={`${styles.navWrapper} ${theme === "dark" ? styles.dark : ""}`}
      >
        <nav className={styles.glassNav}>
          <span>Loading...</span>
        </nav>
      </div>
    );
  }

  return (
    <div
      className={`${styles.navWrapper} ${theme === "dark" ? styles.dark : ""}`}
    >
      <nav className={styles.glassNav}>
        <Link className={styles.brand} to="/">
          <span className={styles.brandIcon}>⚡</span>
          <span className={styles.brandText}>MESSENGER</span>
        </Link>

        <div className={styles.navGroup}>
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

        <div className={styles.controls}>
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
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
