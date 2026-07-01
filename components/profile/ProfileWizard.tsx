"use client";

import { useMemo, useState } from "react";
import type {
  BuildingAgeBand,
  FloodRiskZone,
  OwnershipType,
} from "@prisma/client";
import { ChoiceGroup, Fieldset, ToggleField, Button } from "@/components/ui/form";
import {
  BUILDING_AGE_LABELS,
  EMPTY_PROFILE_FORM,
  FLOOD_RISK_LABELS,
  OWNERSHIP_LABELS,
  PROFILE_STEPS,
  type ProfileFormData,
} from "@/lib/profile-labels";
import { computeApplicableSections } from "@/lib/sections";
import { auditTemplate202509 } from "@/prisma/data/audit-template-normalized";

type ProfileWizardProps = {
  premisesId: string;
  initialProfile: ProfileFormData;
  initialApplicableSections: string[];
};

const sectionTitleById = Object.fromEntries(
  auditTemplate202509.map((section) => [section.id, section.title]),
);

function canProceed(stepIndex: number, form: ProfileFormData): boolean {
  if (stepIndex === 0) {
    return Boolean(form.ownershipType && form.buildingAgeBand);
  }
  return true;
}

function previewApplicableSections(form: ProfileFormData): string[] {
  if (!form.ownershipType || !form.buildingAgeBand) {
    return [];
  }

  return computeApplicableSections({
    buildingAgeBand: form.buildingAgeBand,
    hasGas: form.hasGas,
    hasSleeping: form.hasSleeping,
    hasCateringKitchen: form.hasCateringKitchen,
    hasGrounds: form.hasGrounds,
    hasVehicles: form.hasVehicles,
    hasPlantMachinery: form.hasPlantMachinery,
    hasThirdPartyUsers: form.hasThirdPartyUsers,
    floodRiskZone:
      form.floodRiskZone === "" ? null : form.floodRiskZone,
  });
}

export function ProfileWizard({
  premisesId,
  initialProfile,
  initialApplicableSections,
}: ProfileWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<ProfileFormData>(initialProfile);
  const [savedSections, setSavedSections] = useState(initialApplicableSections);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const previewSections = useMemo(() => previewApplicableSections(form), [form]);
  const currentStep = PROFILE_STEPS[stepIndex];

  function updateForm(patch: Partial<ProfileFormData>) {
    setForm((current) => ({ ...current, ...patch }));
    setSaved(false);
    setError(null);
  }

  async function saveProfile() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/premises/${premisesId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to save profile");
      }

      setSavedSections(result.data.applicableSections);
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save profile",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNext() {
    if (!canProceed(stepIndex, form)) {
      setError("Please answer the required questions before continuing.");
      return;
    }

    setError(null);

    if (stepIndex < PROFILE_STEPS.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }

    await saveProfile();
  }

  function handleContinuePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      isSaving
    ) {
      return;
    }

    // Run on pointer down so the first click still works after choosing a radio
    // (otherwise blur/focus can swallow the first click on some browsers).
    event.preventDefault();
    void handleNext();
  }

  function handleBack() {
    setStepIndex((index) => Math.max(0, index - 1));
    setError(null);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Step {stepIndex + 1} of {PROFILE_STEPS.length}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {currentStep.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{currentStep.description}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {PROFILE_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`h-1.5 flex-1 rounded-full ${
                index <= stepIndex ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        {stepIndex === 0 ? (
          <>
            <Fieldset
              legend="Who is responsible for the building?"
              description="This helps us understand your legal obligations as trustees."
            >
              <ChoiceGroup<OwnershipType>
                name="ownershipType"
                value={form.ownershipType}
                options={(
                  Object.entries(OWNERSHIP_LABELS) as [OwnershipType, string][]
                ).map(([value, label]) => ({ value, label }))}
                onChange={(ownershipType) => updateForm({ ownershipType })}
              />
            </Fieldset>
            <Fieldset
              legend="When was the building constructed?"
              description="Buildings built before 2000 may contain asbestos and need extra checks."
            >
              <ChoiceGroup<BuildingAgeBand>
                name="buildingAgeBand"
                value={form.buildingAgeBand}
                options={(
                  Object.entries(BUILDING_AGE_LABELS) as [BuildingAgeBand, string][]
                ).map(([value, label]) => ({ value, label }))}
                onChange={(buildingAgeBand) => updateForm({ buildingAgeBand })}
              />
            </Fieldset>
          </>
        ) : null}

        {stepIndex === 1 ? (
          <>
            <Fieldset legend="Does the premises have a gas supply?">
              <ToggleField
                label="Yes, we have gas appliances on site"
                description="Boilers, heaters, or a gas cooker — we'll include the Gas section in your audit."
                checked={form.hasGas}
                onChange={(hasGas) => updateForm({ hasGas })}
              />
            </Fieldset>
            <Fieldset
              legend="What is the flood risk for this site?"
              description="Optional — choose the closest match if you know it."
            >
              <ChoiceGroup<FloodRiskZone | "">
                name="floodRiskZone"
                value={form.floodRiskZone ?? ""}
                options={[
                  { value: "", label: "Not sure / not assessed" },
                  ...(
                    Object.entries(FLOOD_RISK_LABELS) as [FloodRiskZone, string][]
                  ).map(([value, label]) => ({ value, label })),
                ]}
                onChange={(floodRiskZone) =>
                  updateForm({
                    floodRiskZone: floodRiskZone === "" ? null : floodRiskZone,
                  })
                }
              />
            </Fieldset>
          </>
        ) : null}

        {stepIndex === 2 ? (
          <Fieldset legend="Which facilities do you have on site?">
            <ToggleField
              label="Catering kitchen"
              description="A kitchen used for preparing food for camps or events."
              checked={form.hasCateringKitchen}
              onChange={(hasCateringKitchen) => updateForm({ hasCateringKitchen })}
            />
            <ToggleField
              label="Outdoor grounds"
              description="Trees, grass, paths, or play areas you maintain."
              checked={form.hasGrounds}
              onChange={(hasGrounds) => updateForm({ hasGrounds })}
            />
            <ToggleField
              label="Sleeping accommodation"
              description="Bunks, dorms, or rooms where people stay overnight."
              checked={form.hasSleeping}
              onChange={(hasSleeping) => updateForm({ hasSleeping })}
            />
          </Fieldset>
        ) : null}

        {stepIndex === 3 ? (
          <Fieldset legend="How is the premises used day to day?">
            <ToggleField
              label="Vehicles stored or maintained on site"
              description="Minibuses, trailers, or maintenance vehicles kept at the premises."
              checked={form.hasVehicles}
              onChange={(hasVehicles) => updateForm({ hasVehicles })}
            />
            <ToggleField
              label="Plant, machinery, or power tools"
              description="Workshop equipment, mowers, or other powered machinery."
              checked={form.hasPlantMachinery}
              onChange={(hasPlantMachinery) => updateForm({ hasPlantMachinery })}
            />
            <ToggleField
              label="Hired out to third parties"
              description="External groups or organisations use the building."
              checked={form.hasThirdPartyUsers}
              onChange={(hasThirdPartyUsers) => updateForm({ hasThirdPartyUsers })}
            />
          </Fieldset>
        ) : null}

        {stepIndex === 4 ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Your answers</p>
              <ul className="mt-3 space-y-1">
                <li>
                  Ownership:{" "}
                  {form.ownershipType
                    ? OWNERSHIP_LABELS[form.ownershipType]
                    : "—"}
                </li>
                <li>
                  Building age:{" "}
                  {form.buildingAgeBand
                    ? BUILDING_AGE_LABELS[form.buildingAgeBand]
                    : "—"}
                </li>
                <li>Gas on site: {form.hasGas ? "Yes" : "No"}</li>
                <li>
                  Flood risk:{" "}
                  {form.floodRiskZone ? FLOOD_RISK_LABELS[form.floodRiskZone] : "Not set"}
                </li>
                <li>Kitchen: {form.hasCateringKitchen ? "Yes" : "No"}</li>
                <li>Grounds: {form.hasGrounds ? "Yes" : "No"}</li>
                <li>Sleeping: {form.hasSleeping ? "Yes" : "No"}</li>
                <li>Vehicles: {form.hasVehicles ? "Yes" : "No"}</li>
                <li>Plant/machinery: {form.hasPlantMachinery ? "Yes" : "No"}</li>
                <li>Third-party hire: {form.hasThirdPartyUsers ? "Yes" : "No"}</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-900">
                {previewSections.length} audit sections will apply
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Based on your profile, we&apos;ll include the relevant sections
                from the Scout Association September 2025 audit template.
              </p>
              <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm text-slate-700">
                {previewSections.map((sectionId) => (
                  <li
                    key={sectionId}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2"
                  >
                    {sectionTitleById[sectionId] ?? sectionId}
                  </li>
                ))}
              </ul>
            </div>

            {saved ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Profile saved. {savedSections.length} audit sections will apply to
                your next audit.
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={stepIndex === 0 || isSaving}
        >
          Back
        </Button>
        <div className="flex gap-3">
          {stepIndex === PROFILE_STEPS.length - 1 && saved ? (
            <Button
              variant="secondary"
              onClick={() => {
                setForm(EMPTY_PROFILE_FORM);
                setStepIndex(0);
                setSaved(false);
                setSavedSections([]);
              }}
            >
              Start again
            </Button>
          ) : null}
          <Button
            onClick={() => void handleNext()}
            onPointerDown={handleContinuePointerDown}
            disabled={isSaving}
            aria-disabled={!canProceed(stepIndex, form) || isSaving}
            className={
              !canProceed(stepIndex, form) && !isSaving
                ? "opacity-50"
                : undefined
            }
          >
            {isSaving
              ? "Saving…"
              : stepIndex === PROFILE_STEPS.length - 1
                ? saved
                  ? "Saved"
                  : "Save profile"
                : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
