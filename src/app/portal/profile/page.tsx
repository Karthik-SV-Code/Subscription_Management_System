"use client";

import * as React from "react";
import {
  User,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Save,
  Edit2,
  KeyRound,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { PORTAL_CUSTOMER } from "@/features/portal/mock-data";
import { PortalCustomerProfile } from "@/features/portal/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PortalProfilePage() {
  const [customer, setCustomer] = React.useState<PortalCustomerProfile>(PORTAL_CUSTOMER);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
    companyName: customer.companyName || "",
    companyWebsite: customer.companyWebsite || "",
  });

  // Billing Address Edit State
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  const [addressForm, setAddressForm] = React.useState({
    line1: customer.billingAddress?.line1 || "",
    line2: customer.billingAddress?.line2 || "",
    city: customer.billingAddress?.city || "",
    state: customer.billingAddress?.state || "",
    postalCode: customer.billingAddress?.postalCode || "",
    country: customer.billingAddress?.country || "United States",
  });

  // Password State
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordNotice, setPasswordNotice] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [generalNotice, setGeneralNotice] = React.useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomer((prev) => ({
      ...prev,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      companyName: profileForm.companyName,
      companyWebsite: profileForm.companyWebsite,
    }));
    setIsEditingProfile(false);
    setGeneralNotice("Profile details updated successfully.");
    setTimeout(() => setGeneralNotice(null), 5000);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomer((prev) => ({
      ...prev,
      billingAddress: { ...addressForm },
    }));
    setIsEditingAddress(false);
    setGeneralNotice("Billing address updated successfully.");
    setTimeout(() => setGeneralNotice(null), 5000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordNotice({
        type: "error",
        message: "Please fill in all password fields.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordNotice({
        type: "error",
        message: "New password must be at least 8 characters long.",
      });
      return;
    }

    setPasswordNotice({
      type: "success",
      message: "Security credentials updated. Next login will require your new password.",
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordNotice(null), 6000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="My Profile"
        subtitle="Manage personal contact data, corporate billing address, and security credentials"
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Alert for General Notices */}
        {generalNotice && (
          <div className="p-4 rounded-[16px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{generalNotice}</span>
            </div>
            <button
              onClick={() => setGeneralNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card + Account Meta */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar & Summary Card */}
            <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#171717] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg ring-4 ring-indigo-50 mb-4">
                {customer.avatarInitials}
              </div>
              <h3 className="text-lg font-extrabold text-[#171717]">
                {customer.name}
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                {customer.companyName}
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Verified Account
                </span>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-[#EAECEF] space-y-3 text-left text-xs text-[#737373]">
                <div className="flex items-center justify-between">
                  <span>Customer ID:</span>
                  <span className="font-mono text-[#171717] font-bold">
                    {customer.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Joined Date:</span>
                  <span className="text-[#171717]">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authorized Role:</span>
                  <span className="text-[#171717] font-semibold">
                    Billing Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Security Tips */}
            <div className="rounded-[20px] bg-indigo-50/60 border border-indigo-100 p-6 text-xs text-indigo-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-950">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Account Protection</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Changes to company billing information or primary contact emails will generate a confirmation alert sent to all designated organizational administrators.
              </p>
            </div>
          </div>

          {/* Right Column: Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Contact Information */}
            <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-bold text-[#171717]">
                    Contact Information
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Personal account identity and primary notification channels
                  </p>
                </div>
                {!isEditingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                    className="h-8 rounded-xl text-xs font-semibold border-[#EAECEF] hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, name: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Work Email
                      </label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Company Name
                      </label>
                      <Input
                        type="text"
                        value={profileForm.companyName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            companyName: e.target.value,
                          })
                        }
                        className="rounded-xl h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(false)}
                      className="rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold px-4"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F5F6F8]">
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                      Full Name
                    </span>
                    <span className="text-[#171717] font-semibold mt-0.5 block">
                      {customer.name}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F6F8]">
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                      Work Email
                    </span>
                    <span className="text-[#171717] font-semibold mt-0.5 block">
                      {customer.email}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F6F8]">
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                      Phone Number
                    </span>
                    <span className="text-[#171717] font-semibold mt-0.5 block">
                      {customer.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F6F8]">
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                      Company
                    </span>
                    <span className="text-[#171717] font-semibold mt-0.5 block">
                      {customer.companyName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Billing Address */}
            <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-base font-bold text-[#171717]">
                    Corporate Billing Address
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Displayed on generated tax invoices and ACH settlement receipts
                  </p>
                </div>
                {!isEditingAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingAddress(true)}
                    className="h-8 rounded-xl text-xs font-semibold border-[#EAECEF] hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Street Address
                      </label>
                      <Input
                        type="text"
                        value={addressForm.line1}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, line1: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Suite / Unit
                      </label>
                      <Input
                        type="text"
                        value={addressForm.line2}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, line2: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        City
                      </label>
                      <Input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, city: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        State / Province
                      </label>
                      <Input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, state: e.target.value })
                        }
                        className="rounded-xl h-9 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                        Postal Code
                      </label>
                      <Input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            postalCode: e.target.value,
                          })
                        }
                        className="rounded-xl h-9 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingAddress(false)}
                      className="rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold px-4"
                    >
                      Save Address
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-[#F5F6F8] text-xs space-y-1">
                  <div className="font-semibold text-[#171717]">
                    {customer.billingAddress?.line1}
                    {customer.billingAddress?.line2 && `, ${customer.billingAddress.line2}`}
                  </div>
                  <div className="text-[#737373]">
                    {customer.billingAddress?.city}, {customer.billingAddress?.state} {customer.billingAddress?.postalCode}
                  </div>
                  <div className="text-[#737373]">
                    {customer.billingAddress?.country}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Change Password */}
            <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="mb-6">
                <h4 className="text-base font-bold text-[#171717]">
                  Change Password
                </h4>
                <p className="text-xs text-[#737373]">
                  Ensure your account uses a strong and unique authentication password
                </p>
              </div>

              {passwordNotice && (
                <div
                  className={`p-3.5 mb-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    passwordNotice.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {passwordNotice.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordNotice.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="rounded-xl h-9 text-xs sm:w-80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold px-4 h-9"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
