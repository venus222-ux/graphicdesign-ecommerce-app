import styles from "../styles/Home.module.css";
import HorizontalScrollSection from "../components/Product/HorizontalScrollSection";

// ---------- Hero ----------
const Hero = () => (
  <div className={`${styles.heroContainer} text-center py-5 mb-5`}>
    <h1 className="display-3 fw-bold tracking-tight">
      The Future of <span className="text-gradient">Digital Assets</span>
    </h1>
    <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: "600px" }}>
      Premium UI kits, templates, and courses curated by the world's top
      creators.
    </p>
    <div className={`${styles.searchWrapper} mx-auto position-relative`}>
      <input
        type="text"
        placeholder="Search assets (e.g. 'Dashboard UI')"
        className="form-control form-control-lg shadow-sm rounded-pill ps-5"
      />
      <span className={styles.searchIcon}>🔍</span>
    </div>
  </div>
);

// ---------- Newsletter ----------
const NewsletterSignup = () => (
  <div className={styles.newsletterSection}>
    <div className="row align-items-center p-4 p-lg-5">
      <div className="col-lg-6 mb-3 mb-lg-0">
        <h2 className="fw-bold text-white mb-2">Get the weekly digest</h2>
        <p className="text-white-50 mb-lg-0">
          New assets and weekly discounts directly to your inbox.
        </p>
      </div>
      <div className="col-lg-6">
        <div className="input-group">
          <input
            type="email"
            className="form-control form-control-lg border-0"
            placeholder="Email address"
          />
          <button className="btn btn-primary px-4 fw-bold">Join Now</button>
        </div>
      </div>
    </div>
  </div>
);

// ---------- Main Home Component ----------
const Home = () => {
  return (
    <div className="container py-4">
      <Hero />

      <HorizontalScrollSection
        title="🔥 Best Sellers"
        fetchUrl="/api/products?sort=best_sellers"
      />
      <HorizontalScrollSection
        title="🆕 New Releases"
        fetchUrl="/api/products?sort=newest"
      />

      <NewsletterSignup />

      <footer className="mt-5 py-5 border-top text-center text-muted">
        <p>© 2026 Digital Assets Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
