import { ChangeEvent } from "react";
import styles from "../styles/Checkout.module.css";

export interface BillingData {
  company_name?: string;
  vat_number?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

interface BillingAddressFormProps {
  data: BillingData;
  setData: (data: BillingData | ((prev: BillingData) => BillingData)) => void;
  showSaveToProfile?: boolean;
  onSaveToProfileChange?: (save: boolean) => void;
  saveToProfile?: boolean;
  title?: string;
}

const BillingAddressForm = ({
  data,
  setData,
  showSaveToProfile = false,
  onSaveToProfileChange,
  saveToProfile = false,
  title = "Billing Details",
}: BillingAddressFormProps) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.billingSection}>
      <h3 className={styles.billingTitle}>{title}</h3>

      {/* Business Info Section */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>
            Company Name <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            name="company_name"
            value={data.company_name || ""}
            onChange={handleChange}
            placeholder="e.g. Acme SRL"
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            VAT Number <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            name="vat_number"
            value={data.vat_number || ""}
            onChange={handleChange}
            placeholder="e.g. RO12345678"
          />
        </div>
      </div>

      {/* Primary Address */}
      <div className={styles.formGroup}>
        <label>Street Address</label>
        <input
          name="address_line_1"
          value={data.address_line_1}
          onChange={handleChange}
          placeholder="House number and street name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>
          Apartment, suite, etc.{" "}
          <span className={styles.optional}>(Optional)</span>
        </label>
        <input
          name="address_line_2"
          value={data.address_line_2 || ""}
          onChange={handleChange}
          placeholder="Appartement 4B"
        />
      </div>

      {/* City & State Grid */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>City</label>
          <input
            name="city"
            value={data.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>State / County</label>
          <input
            name="state"
            value={data.state || ""}
            onChange={handleChange}
            placeholder="State"
          />
        </div>
      </div>

      {/* Postal & Country Grid */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Postal Code</label>
          <input
            name="postal_code"
            value={data.postal_code}
            onChange={handleChange}
            placeholder="Zip code"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Country</label>
          <input
            name="country"
            value={data.country}
            onChange={handleChange}
            placeholder="e.g. Romania"
            required
          />
        </div>
      </div>

      {/* Save Toggle */}
      {showSaveToProfile && onSaveToProfileChange && (
        <div className={styles.checkboxWrapper}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={saveToProfile}
              onChange={(e) => onSaveToProfileChange(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              Save this address to my profile for future orders
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default BillingAddressForm;
