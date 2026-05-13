import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import { useStore } from "../store/useStore";
import styles from "./Profile.module.css";
import type { ProfileData, FormData } from "../types";

const Profile = () => {
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    vat_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "billing_saved") {
      toast.success("✅ Billing address saved successfully!", {
        autoClose: 5000,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    API.get("/profile")
      .then((res) => {
        const userData = res.data.data || res.data; // Handle both structures
        console.log("🔍 FULL PROFILE DATA:", userData); // ← Check this in console

        setProfile(userData);

        setFormData({
          email: userData.email || "",
          password: "",
          password_confirmation: "",
          company_name: userData.company_name || "",
          vat_number: userData.vat_number || "",
          address_line_1: userData.address_line_1 || "",
          address_line_2: userData.address_line_2 || "",
          city: userData.city || "",
          state: userData.state || "",
          postal_code: userData.postal_code || "",
          country: userData.country || "",
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load profile");
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    API.put("/profile", formData)
      .then(() => toast.success("Profile updated successfully"))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Update failed"),
      );
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    setDeleting(true);
    try {
      await API.delete("/profile");
      toast.success("Account deleted");
      useStore.getState().logout();
      window.location.replace("/login");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading your profile...</div>;
  if (error)
    return (
      <div className={styles.container} style={{ color: "red" }}>
        {error}
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span style={{ fontSize: "2rem" }}>👤</span>
        <h2 className={styles.title}>Account Settings</h2>
      </header>

      <section className={styles.infoSection}>
        <div>
          <span className={styles.infoLabel}>Email Address</span>
          <div className={styles.infoValue}>{profile?.email || "N/A"}</div>
        </div>
        <div>
          <span className={styles.infoLabel}>Member Since</span>
          <div className={styles.infoValue}>
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "Unknown"}
          </div>
        </div>
      </section>

      {/* ==================== SAVED BILLING ADDRESS ==================== */}
      {profile?.address_line_1 && (
        <section className={styles.infoSection}>
          <div>
            <span className={styles.infoLabel}>Billing Address</span>
            <div className={styles.infoValue} style={{ lineHeight: "1.6" }}>
              {profile.company_name && (
                <>
                  <strong>{profile.company_name}</strong>
                  <br />
                </>
              )}
              {profile.address_line_1}
              <br />
              {profile.address_line_2 && (
                <>
                  {profile.address_line_2}
                  <br />
                </>
              )}
              {profile.city}, {profile.state} {profile.postal_code}
              <br />
              {profile.country}
              {profile.vat_number && (
                <>
                  <br />
                  <strong>VAT: </strong>
                  {profile.vat_number}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <form onSubmit={handleUpdate} autoComplete="off">
        <h3 className={styles.sectionTitle}>Update Information</h3>

        {/* Email & Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <input
            type="password"
            className={styles.input}
            name="password"
            placeholder="Leave blank to keep current"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm New Password</label>
          <input
            type="password"
            className={styles.input}
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </div>

        <h3 className={styles.sectionTitle}>Billing Information</h3>

        <div className={styles.formGroup}>
          <label>Company Name (optional)</label>
          <input
            className={styles.input}
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>VAT Number (optional)</label>
          <input
            className={styles.input}
            name="vat_number"
            value={formData.vat_number}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Address Line 1 *</label>
          <input
            className={styles.input}
            name="address_line_1"
            value={formData.address_line_1}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Address Line 2</label>
          <input
            className={styles.input}
            name="address_line_2"
            value={formData.address_line_2}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>City *</label>
            <input
              className={styles.input}
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>State / Province</label>
            <input
              className={styles.input}
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Postal Code *</label>
            <input
              className={styles.input}
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Country *</label>
            <input
              className={styles.input}
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.btnPrimary}>
          Save Changes
        </button>
      </form>

      {/* Danger Zone */}
      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Danger Zone</h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#64748b",
            marginBottom: "1rem",
          }}
        >
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          className={styles.btnDanger}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
