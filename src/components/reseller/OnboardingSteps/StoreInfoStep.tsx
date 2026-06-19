"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/GlowButton";
import { Store } from "lucide-react";

interface StoreInfo {
  slug: string;
  displayName: string;
  bio: string;
  whatsapp: string;
}

interface StoreInfoStepProps {
  data: StoreInfo;
  onChange: (data: Partial<StoreInfo>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StoreInfoStep({ data, onChange, onNext, onBack }: StoreInfoStepProps) {
  const [errors, setErrors] = useState<Partial<StoreInfo>>({});

  // Generate default slug from display name
  useEffect(() => {
    if (data.displayName && !data.slug) {
      const slug = data.displayName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 40);
      
      if (slug) {
        onChange({ slug });
      }
    }
  }, [data.displayName, data.slug, onChange]);

  const validate = () => {
    const newErrors: Partial<StoreInfo> = {};

    if (!data.displayName || data.displayName.length < 2) {
      newErrors.displayName = "Store name must be at least 2 characters";
    }

    if (!data.slug || data.slug.length < 3) {
      newErrors.slug = "URL slug must be at least 3 characters";
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (data.bio && data.bio.length > 200) {
      newErrors.bio = "Bio must be 200 characters or less";
    }

    if (data.whatsapp && !/^[0-9]{10}$/.test(data.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = "Please enter a valid Ghana phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleChange = (field: keyof StoreInfo, value: string) => {
    onChange({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = !errors.displayName && !errors.slug && (data.displayName?.length >= 2) && (data.slug?.length >= 3);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-4 liquid-glass rounded-full px-4 py-2">
          <Store className="h-4 w-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Store Setup</span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-text-primary mb-2">
          Set Up Your Storefront
        </h2>
        <p className="text-text-secondary font-barlow">
          Create your public store page. Customers will see this when they visit your store link.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-5"
      >
        {/* Display Name */}
        <div>
          <label className="block text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-2">
            Store Display Name
          </label>
          <input
            type="text"
            value={data.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            placeholder="e.g., Kwame's Data Shop"
            className={`w-full rounded-xl bg-bg-elevated border px-4 py-3 text-sm font-barlow text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
              errors.displayName ? "border-color-error ring-color-error/20" : "border-color-border ring-accent-primary/40"
            }`}
          />
          {errors.displayName && (
            <p className="mt-1 text-xs text-color-error font-barlow">{errors.displayName}</p>
          )}
        </div>

        {/* Store URL Slug */}
        <div>
          <label className="block text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-2">
            Store URL Slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm font-mono">tamaldata.com/shop/</span>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="your-store-name"
              className={`flex-1 rounded-xl bg-bg-elevated border px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
                errors.slug ? "border-color-error ring-color-error/20" : "border-color-border ring-accent-primary/40"
              }`}
            />
          </div>
          {errors.slug && (
            <p className="mt-1 text-xs text-color-error font-barlow">{errors.slug}</p>
          )}
          <p className="text-xs text-text-muted font-barlow mt-1">
            Only lowercase letters, numbers, and hyphens. 3-40 characters.
          </p>
        </div>

        {/* WhatsApp Number */}
        <div>
          <label className="block text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-2">
            WhatsApp Number (Optional)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm">📱</span>
            <input
              type="tel"
              value={data.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0244123456"
              className={`flex-1 rounded-xl bg-bg-elevated border px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
                errors.whatsapp ? "border-color-error ring-color-error/20" : "border-color-border ring-accent-primary/40"
              }`}
            />
          </div>
          {errors.whatsapp && (
            <p className="mt-1 text-xs text-color-error font-barlow">{errors.whatsapp}</p>
          )}
          <p className="text-xs text-text-muted font-barlow mt-1">
            Customers will see this on your storefront for support
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-barlow font-semibold text-text-muted uppercase tracking-wider mb-2">
            Store Description (Optional)
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell customers about your store and services..."
            rows={3}
            maxLength={200}
            className={`w-full rounded-xl bg-bg-elevated border px-4 py-3 text-sm font-barlow text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all resize-none ${
              errors.bio ? "border-color-error ring-color-error/20" : "border-color-border ring-accent-primary/40"
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.bio && (
              <p className="text-xs text-color-error font-barlow">{errors.bio}</p>
            )}
            <p className="text-xs text-text-muted font-barlow">
              {data.bio?.length || 0}/200 characters
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex justify-between pt-4"
      >
        <GlowButton variant="secondary" onClick={onBack} type="button">
          ← Back
        </GlowButton>
        <GlowButton type="submit" disabled={!isFormValid}>
          Continue →
        </GlowButton>
      </motion.div>
    </form>
  );
}
