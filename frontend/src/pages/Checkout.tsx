import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import API from "../api";
import styles from "../styles/Checkout.module.css";
import { useStore } from "../store/useStore";
import { toast } from "react-toastify";
import BillingAddressForm, {
  BillingData,
} from "../components/BillingAddressForm";

const VAT_RATE = 0.21;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<BillingData>({
    address_line_1: "",
    city: "",
    postal_code: "",
    country: "",
    company_name: "",
    vat_number: "",
    address_line_2: "",
    state: "",
  });

  const [saveToProfile, setSaveToProfile] = useState(false);
  const [hasProfileAddress, setHasProfileAddress] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const subtotal = items.reduce(
    (acc, i) => acc + i.quantity * Number(i.price || 0),
    0,
  );
  const vat = subtotal * VAT_RATE;
  const totalPrice = subtotal + vat;

  useEffect(() => {
    API.get("/profile")
      .then((res) => {
        const p = res.data.data;
        if (p.address_line_1 && p.city && p.country) {
          setBilling({
            company_name: p.company_name || "",
            vat_number: p.vat_number || "",
            address_line_1: p.address_line_1,
            address_line_2: p.address_line_2 || "",
            city: p.city,
            state: p.state || "",
            postal_code: p.postal_code,
            country: p.country,
          });
          setHasProfileAddress(true);
          setEditMode(false);
        } else {
          setEditMode(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleCheckout = async () => {
    const token = useStore.getState().token;
    if (!token) {
      toast.error("🔐 You must login to checkout");
      navigate("/login");
      return;
    }

    if (items.length === 0) return;

    if (
      !billing.address_line_1 ||
      !billing.city ||
      !billing.postal_code ||
      !billing.country
    ) {
      toast.warning("Please complete all required billing fields");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/checkout", {
        items,
        billing,
        save_to_profile: saveToProfile,
      });

      if (saveToProfile) toast.success("✅ Address saved to profile");

      clearCart();
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyContent}>
          <span style={{ fontSize: "4rem" }}>🛒</span>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate("/shop")}
            className={styles.primaryBtn}
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.layout}>
        {/* LEFT COLUMN: BILLING */}
        <section className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>Checkout</h2>

          {hasProfileAddress && !editMode ? (
            <div className={styles.savedAddressCard}>
              <div className={styles.cardHeader}>
                <h4>Billing Address</h4>
                <button
                  onClick={() => setEditMode(true)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
              </div>
              <div className={styles.addressDetails}>
                {billing.company_name && (
                  <p className={styles.companyName}>{billing.company_name}</p>
                )}
                <p>{billing.address_line_1}</p>
                {billing.address_line_2 && <p>{billing.address_line_2}</p>}
                <p>
                  {billing.city}, {billing.state} {billing.postal_code}
                </p>
                <p className={styles.countryName}>{billing.country}</p>
                {billing.vat_number && (
                  <p className={styles.vatInfo}>
                    <strong>VAT:</strong> {billing.vat_number}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.formWrapper}>
              <BillingAddressForm
                data={billing}
                setData={setBilling}
                showSaveToProfile={true}
                saveToProfile={saveToProfile}
                onSaveToProfileChange={setSaveToProfile}
                title="Billing Details"
              />
            </div>
          )}

          <button
            onClick={handleCheckout}
            className={styles.payBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loader}></span>
            ) : (
              `Complete Purchase — $${totalPrice.toFixed(2)}`
            )}
          </button>
        </section>

        {/* RIGHT COLUMN: SUMMARY */}
        <aside className={styles.orderPreview}>
          <h4 className={styles.summaryTitle}>Order Summary</h4>
          <div className={styles.miniItemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.miniItem}>
                <div className={styles.itemInfo}>
                  <div className={styles.qtyBadge}>{item.quantity}</div>
                  <div className={styles.itemTexts}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <small className={styles.itemCategory}>
                      {item.category?.name || "General"}
                    </small>
                  </div>
                </div>
                <span className={styles.itemPrice}>
                  ${(item.quantity * Number(item.price || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.totalLine}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalLine}>
              <span>VAT (21%)</span>
              <span>${vat.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalLine} ${styles.grandTotal}`}>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.secureNote}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            Secure SSL Encrypted Payment
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
