"use client";

import { useState } from "react";
import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import { addAddress } from "@/app/account/actions";
import { MOROCCAN_CITIES, OTHER_CITY } from "@/lib/morocco";

export const accountInput =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black";

export default function AddressForm({ defaultName, defaultPhone }: { defaultName: string; defaultPhone: string }) {
  const [city, setCity] = useState("");
  return (
    <ActionForm action={addAddress} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="full_name" defaultValue={defaultName} placeholder="Full name*" required className={accountInput} aria-label="Full name" />
        <input name="phone" type="tel" defaultValue={defaultPhone} placeholder="Phone* (06 12 34 56 78)" required className={accountInput} aria-label="Phone" />
      </div>
      <select
        name="city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
        className={`${accountInput} bg-white ${city ? "" : "text-gray-400"}`}
        aria-label="City"
      >
        <option value="" disabled>
          City*
        </option>
        {MOROCCAN_CITIES.map((c) => (
          <option key={c} value={c} className="text-black">
            {c}
          </option>
        ))}
        <option value={OTHER_CITY} className="text-black">
          Other town…
        </option>
      </select>
      {city === OTHER_CITY && <input name="otherCity" placeholder="Your town*" required className={accountInput} aria-label="Town" />}
      <input
        name="address_line"
        placeholder="Address* (street, building, apartment, district)"
        required
        className={accountInput}
        aria-label="Address"
      />
      <SubmitButton pendingText="SAVING..." className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
        SAVE ADDRESS
      </SubmitButton>
    </ActionForm>
  );
}
