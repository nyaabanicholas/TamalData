"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WelcomeStep } from "./OnboardingSteps/WelcomeStep";
import { StoreInfoStep } from "./OnboardingSteps/StoreInfoStep";
import { BundleConfigStep } from "./OnboardingSteps/BundleConfigStep";
import { ReviewStep } from "./OnboardingSteps/ReviewStep";
import { CompleteStep } from "./OnboardingSteps/CompleteStep";

type Step = 1 | 2 | 3 | 4 | 5;

interface StoreInfo {
  slug: string;
  displayName: string;
  bio: string;
  whatsapp: string;
}

interface NetworkVisibility {
  showMTN: boolean;
  showTelecel: boolean;
  showAirtelTigo: boolean;
}

interface WizardState {
  step: Step;
  storeInfo: StoreInfo;
  networkVisibility: NetworkVisibility;
  bundles: {
    MTN: Record<string, number>;
    TELECEL: Record<string, number>;
    AIRTELTIGO: Record<string, number>;
  };
}

export function OnboardingWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    step: 1,
    storeInfo: {
      slug: '',
      displayName: '',
      bio: '',
      whatsapp: '',
    },
    networkVisibility: {
      showMTN: true,
      showTelecel: true,
      showAirtelTigo: true,
    },
    bundles: {
      MTN: {},
      TELECEL: {},
      AIRTELTIGO: {},
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: (prev.step + 1) as Step }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: (prev.step - 1) as Step }));
  }, []);

  const updateStoreInfo = useCallback((info: Partial<StoreInfo>) => {
    setState(prev => ({ ...prev, storeInfo: { ...prev.storeInfo, ...info } }));
  }, []);


  const updateAllBundlePricing = useCallback((bundles: WizardState['bundles']) => {
    setState(prev => ({ ...prev, bundles }));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save storefront
      const storefrontRes = await fetch('/api/reseller/storefront', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          slug: state.storeInfo.slug,
          displayName: state.storeInfo.displayName,
          bio: state.storeInfo.bio,
          whatsapp: state.storeInfo.whatsapp,
          showMTN: state.networkVisibility.showMTN,
          showTelecel: state.networkVisibility.showTelecel,
          showAirtelTigo: state.networkVisibility.showAirtelTigo,
          active: true,
        }),
      });

      if (!storefrontRes.ok) {
        const data = await storefrontRes.json();
        throw new Error(data.error || 'Failed to save storefront');
      }

      // Save custom pricing
      const pricingRes = await fetch('/api/reseller/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.bundles),
      });

      if (!pricingRes.ok) {
        const data = await pricingRes.json();
        throw new Error(data.error || 'Failed to save pricing');
      }

      // Success! Move to completion step
      nextStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;
  const progress = ((state.step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="container-content py-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === state.step
                    ? 'bg-accent-primary w-6'
                    : s < state.step
                    ? 'bg-accent-primary/40 w-6'
                    : 'bg-color-border/30 w-1.5'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-text-muted font-barlow">
            Step {state.step} of {totalSteps}
          </div>
        </div>
        <div className="h-1 bg-color-border/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-glow rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <GlassPanel className="max-w-4xl mx-auto p-6 lg:p-8">
        {state.step === 1 && (
          <WelcomeStep onNext={nextStep} />
        )}
        {state.step === 2 && (
          <StoreInfoStep
            data={state.storeInfo}
            onChange={updateStoreInfo}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {state.step === 3 && (
          <BundleConfigStep
            data={state.bundles}
            onChange={updateAllBundlePricing}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {state.step === 4 && (
          <ReviewStep
            state={state}
            onBack={prevStep}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
        {state.step === 5 && (
          <CompleteStep
            slug={state.storeInfo.slug}
            onContinue={() => router.push('/reseller')}
          />
        )}
      </GlassPanel>

      {/* Error display */}
      {error && (
        <div className="max-w-4xl mx-auto mt-4">
          <GlassPanel className="p-4 border border-color-error/30 bg-color-error/5">
            <p className="text-color-error text-sm font-barlow">{error}</p>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
