import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import API from "../api";
import styles from "../styles/Checkout.module.css";
import { useStore } from "../store/useStore";
import { toast } from "react-toastify";
import BillingAddressForm, {
  BillingData,
} from "../components/BillingAddressForm";
import {
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Edit3,
  Loader2,
  Tag,
} from "lucide-react";

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

  // 🏷️ CALCULATE ADVANCED PRICING AND DISCOUNTS
  const { totalOriginalSubtotal, totalFinalSubtotal, totalDiscountSaved } =
    useMemo(() => {
      return items.reduce(
        (acc, item) => {
          const qty = item.quantity || 1;
          const originalPrice = Number(item.price || 0);
          const finalPrice =
            item.has_discount && item.final_price !== undefined
              ? Number(item.final_price)
              : originalPrice;

          acc.totalOriginalSubtotal += qty * originalPrice;
          acc.totalFinalSubtotal += qty * finalPrice;
          acc.totalDiscountSaved += qty * (originalPrice - finalPrice);
          return acc;
        },
        {
          totalOriginalSubtotal: 0,
          totalFinalSubtotal: 0,
          totalDiscountSaved: 0,
        },
      );
    }, [items]);

  const vat = totalFinalSubtotal * VAT_RATE;
  const totalPrice = totalFinalSubtotal + vat;

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
          <div className={styles.emptyIconWrapper}>
            <ShoppingBag size={36} />
          </div>
          <h3 className="fw-bold mt-4">Your cart is empty</h3>
          <p className="text-secondary mb-4">
            Looks like you haven't added any digital assets yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className={styles.returnShopBtn}
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
        {/* LEFT COLUMN: BILLING WORKSPACE */}
        <section className={styles.mainContent}>
          <h1 className={styles.sectionTitle}>Secure Checkout</h1>

          {hasProfileAddress && !editMode ? (
            <div className={styles.savedAddressCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h4 className="fw-bold m-0">Billing Address</h4>
                  <small className="text-muted">
                    Linked address profile workspace
                  </small>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className={styles.editBtn}
                >
                  <Edit3 size={14} /> Edit details
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
                  <div className="mt-3">
                    <span className="badge bg-light text-secondary border px-2.5 py-1.5 fw-semibold">
                      VAT Account: {billing.vat_number}
                    </span>
                  </div>
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
                title="Billing Specifications"
              />
            </div>
          )}

          <button
            onClick={handleCheckout}
            className={styles.payBtn}
            disabled={loading}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <Loader2 size={18} className={styles.spinner} /> Allocating Core
                Line Order...
              </span>
            ) : (
              <span className="d-flex align-items-center justify-content-center gap-2">
                Complete Purchase — ${totalPrice.toFixed(2)}{" "}
                <ArrowRight size={16} />
              </span>
            )}
          </button>
        </section>

        {/* RIGHT COLUMN: DISCOUNTS-AWARE LEDGER SUMMARY */}
        <aside className={styles.orderPreview}>
          <h4 className={styles.summaryTitle}>Order Manifest</h4>
          <div className={styles.miniItemList}>
            {items.map((item) => {
              const isDiscounted = !!item.has_discount;
              const unitPrice =
                isDiscounted && item.final_price !== undefined
                  ? Number(item.final_price)
                  : Number(item.price || 0);
              const originalUnitPrice = Number(item.price || 0);

              return (
                <div key={item.id} className={styles.miniItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.qtyBadge}>{item.quantity}</div>
                    <div className={styles.itemTexts}>
                      <p className={styles.itemTitle}>{item.title}</p>
                      <small className={styles.itemCategory}>
                        {item.category?.name || "Digital Asset"}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className={styles.itemPrice}>
                      ${(item.quantity * unitPrice).toFixed(2)}
                    </span>
                    {isDiscounted && originalUnitPrice > unitPrice && (
                      <span className={styles.itemOldPrice}>
                        ${(item.quantity * originalUnitPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.totalLine}>
              <span>Subtotal</span>
              <span className="fw-medium text-dark">
                ${totalOriginalSubtotal.toFixed(2)}
              </span>
            </div>

            {totalDiscountSaved > 0 && (
              <div className={`${styles.totalLine} ${styles.discountLine}`}>
                <span className="d-flex align-items-center gap-1">
                  <Tag size={13} /> Asset Markdowns
                </span>
                <span>-${totalDiscountSaved.toFixed(2)}</span>
              </div>
            )}

            <div className={styles.totalLine}>
              <span>VAT (21%)</span>
              <span className="fw-medium text-dark">${vat.toFixed(2)}</span>
            </div>

            <div className={`${styles.totalLine} ${styles.grandTotal}`}>
              <span>Total Amount</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.secureNote}>
            <ShieldCheck size={16} className="text-success" />
            <span>Secure Enterprise SSL Encrypted System</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
