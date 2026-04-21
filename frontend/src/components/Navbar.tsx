import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { logoutRequest } from "../api";
import styles from "../styles/Navbar.module.css";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export default function Navbar() {
  const { isAuth, initialized, logout, theme, toggleTheme, role } = useStore();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);
  const [open, setOpen] = useState(false);

  // 🛒 CART BADGE (FIXED - derived state)
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0),
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || data || []);
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

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

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
    } finally {
      logout();
      navigate("/login");
    }
  };

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
          {/* DROPDOWN */}
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

              {/* 🛒 CART ICON (ONLY FOR LOGGED USERS OR MOVE IT OUTSIDE IF YOU WANT PUBLIC CART) */}
              <Link to="/cart" className={styles.cartIcon}>
                <ShoppingCart size={20} />

                {totalItems > 0 && (
                  <span className={styles.cartBadge}>{totalItems}</span>
                )}
              </Link>
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

              {/* 🛒 CART ALSO FOR GUESTS (RECOMMENDED FOR ECOMMERCE) */}
              <Link to="/cart" className={styles.cartIcon}>
                <ShoppingCart size={20} />

                {totalItems > 0 && (
                  <span className={styles.cartBadge}>{totalItems}</span>
                )}
              </Link>
            </>
          )}
        </div>

        <div className={styles.controls}>
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
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
