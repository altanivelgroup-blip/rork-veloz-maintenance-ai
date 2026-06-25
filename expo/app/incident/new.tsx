import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import {
  AlertTriangle,
  Camera,
  CarFront,
  Check,
  ChevronRight,
  Container,
  HardHat,
  MessageSquareWarning,
  PackageX,
  ShieldAlert,
  Truck,
  type LucideIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Card from "@/components/Card";
import Screen from "@/components/Screen";
import SectionHeader from "@/components/SectionHeader";
import { Colors, Gradients, statusMeta } from "@/constants/colors";
import {
  CATEGORY_FIELDS,
  DRIVERS,
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_META,
  INCIDENT_SEVERITY_META,
  PERSON_TYPES,
  SAFETY_LOCATION_TYPES,
  type IncidentCategory,
  type IncidentSeverity,
} from "@/constants/incidentData";
import { useFleet } from "@/providers/FleetProvider";

const CATEGORY_ICON: Record<IncidentCategory, LucideIcon> = {
  driver_employee: HardHat,
  safety: ShieldAlert,
  accident: CarFront,
  cargo_damage: PackageX,
  complaint: MessageSquareWarning,
};

const SEVERITIES: IncidentSeverity[] = ["critical", "major", "minor"];
type Step = "category" | "context" | "specific" | "narrative" | "review";

function hap() {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
}

export default function NewIncidentScreen() {
  const { trucks, trailers, addIncident } = useFleet();

  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<IncidentCategory | null>(null);
  const [subtype, setSubtype] = useState<string>("");
  const [severity, setSeverity] = useState<IncidentSeverity>("major");

  // Step 2 — context
  const [driver, setDriver] = useState<string>("");
  const [truckId, setTruckId] = useState<string | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [loadNumber, setLoadNumber] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Step 2 — Driver / Employee Incident (person-focused, no equipment required)
  const [personType, setPersonType] = useState<string>("");
  const [personName, setPersonName] = useState<string>("");
  const [personRole, setPersonRole] = useState<string>("");
  const [vehicleConnected, setVehicleConnected] = useState<boolean | null>(null);

  // Step 3 — category-specific
  const [details, setDetails] = useState<Record<string, string>>({});

  // Step 4 — narrative
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [correctiveAction, setCorrectiveAction] = useState<string>("");
  const [witnesses, setWitnesses] = useState<string>("");
  const [photos, setPhotos] = useState<number>(0);

  const truck = useMemo(() => trucks.find((t) => t.id === truckId), [trucks, truckId]);
  const trailer = useMemo(() => trailers.find((t) => t.id === trailerId), [trailers, trailerId]);
  const meta = category ? INCIDENT_CATEGORY_META[category] : null;
  const fields = category ? CATEGORY_FIELDS[category] : [];
  const isEmployee = category === "driver_employee";
  const isCustomerCat = category === "cargo_damage" || category === "complaint";
  /** Accident reports always involve equipment; other categories link it only on demand. */
  const linkEquipment = category === "accident" ? true : vehicleConnected === true;

  const setDetail = (key: string, v: string) => setDetails((prev) => ({ ...prev, [key]: v }));

  const canContext = ((): boolean => {
    switch (category) {
      case "driver_employee":
        return personName.trim().length > 0 && date.trim().length > 1 && vehicleConnected !== null;
      case "safety":
        return (details.safetyLocationType?.trim().length ?? 0) > 0 && date.trim().length > 1 && vehicleConnected !== null;
      case "accident":
        return driver.trim().length > 0 && location.trim().length > 1 && date.trim().length > 1;
      case "cargo_damage":
        return loadNumber.trim().length > 0 && date.trim().length > 1 && vehicleConnected !== null;
      case "complaint":
        return (details.customer?.trim().length ?? 0) > 0 && date.trim().length > 1 && vehicleConnected !== null;
      default:
        return false;
    }
  })();
  const canNarrative = title.trim().length > 1 && summary.trim().length > 1;

  const renderYesNo = (label: string) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dualBtn}>
        {[
          { v: true, label: "Yes" },
          { v: false, label: "No" },
        ].map((opt) => {
          const on = vehicleConnected === opt.v;
          return (
            <Pressable key={opt.label} style={{ flex: 1 }} onPress={() => { setVehicleConnected(opt.v); hap(); }}>
              <View style={[styles.sevBtn, on && { borderColor: Colors.cyan, backgroundColor: "rgba(94,231,255,0.1)" }]}>
                <Text style={[styles.sevBtnText, on && { color: Colors.cyan }]}>{opt.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const renderEquipmentPickers = (showLoad: boolean) => (
    <>
      <Text style={styles.label}>TRUCK (OPTIONAL)</Text>
      <View style={{ gap: 8 }}>
        {trucks.map((eq) => (
          <EquipmentRow key={eq.id} kind="truck" name={eq.nickname} sub={`${eq.year} ${eq.make} ${eq.model}`} selected={truckId === eq.id} onPress={() => { setTruckId(truckId === eq.id ? null : eq.id); hap(); }} />
        ))}
      </View>
      <Text style={styles.label}>TRAILER (OPTIONAL)</Text>
      <View style={{ gap: 8 }}>
        {trailers.map((eq) => (
          <EquipmentRow key={eq.id} kind="trailer" name={eq.nickname} sub={`${eq.year} ${eq.make} ${eq.model}`} selected={trailerId === eq.id} onPress={() => { setTrailerId(trailerId === eq.id ? null : eq.id); hap(); }} />
        ))}
      </View>
      {showLoad && (
        <>
          <Text style={styles.label}>LOAD NUMBER (OPTIONAL)</Text>
          <TextInput placeholder="e.g. SHP-90241" placeholderTextColor={Colors.textDim} value={loadNumber} onChangeText={setLoadNumber} style={styles.input} />
        </>
      )}
    </>
  );

  const dateTimeRow = (
    <View style={styles.dualBtn}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>DATE</Text>
        <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textDim} value={date} onChangeText={setDate} style={styles.input} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>TIME (OPTIONAL)</Text>
        <TextInput placeholder="e.g. 14:20" placeholderTextColor={Colors.textDim} value={time} onChangeText={setTime} style={styles.input} />
      </View>
    </View>
  );

  const stepFooter = (disabled: boolean) => (
    <>
      <Pressable disabled={disabled} onPress={() => { setStep("specific"); hap(); }}>
        <View style={[styles.primary, disabled && { opacity: 0.4 }]}>
          <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={styles.primaryText}>Continue</Text>
          <ChevronRight color="#fff" size={20} />
        </View>
      </Pressable>
      <Pressable onPress={() => setStep("category")}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </>
  );

  function pickCategory(c: IncidentCategory) {
    setCategory(c);
    setSubtype(INCIDENT_CATEGORY_META[c].subtypes[0]);
    setDetails({});
    hap();
  }

  function submit() {
    if (!category) return;
    const personLabel = isEmployee ? personName.trim() : driver.trim();
    const linkedTruck = linkEquipment ? truck : undefined;
    const linkedTrailer = linkEquipment ? trailer : undefined;
    const mergedDetails = isEmployee
      ? {
          ...details,
          personType: personType || "Employee",
          personRole: personRole.trim() || personType || "Employee",
        }
      : details;
    const created = addIncident({
      category,
      subtype,
      title: title.trim(),
      summary: summary.trim(),
      severity,
      driver: personLabel,
      truckId: linkedTruck?.id,
      truckName: linkedTruck?.nickname,
      trailerId: linkedTrailer?.id,
      trailerName: linkedTrailer?.nickname,
      loadNumber: linkEquipment ? loadNumber.trim() || undefined : undefined,
      date: date.trim(),
      time: time.trim() || undefined,
      location: location.trim(),
      mileage: linkedTruck ? (linkedTruck as { mileage?: number }).mileage : undefined,
      correctiveAction: correctiveAction.trim() || undefined,
      witnesses: witnesses.trim() || undefined,
      details: mergedDetails,
      photos,
      reportedBy: personLabel || "You",
    });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace(`/incident/${created.id}`);
  }

  // STEP 1 — category
  if (step === "category") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 1 of 5" title="What type of report are you creating?" />
          <View style={{ gap: 10 }}>
            {INCIDENT_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c];
              const cm = INCIDENT_CATEGORY_META[c];
              const on = category === c;
              return (
                <Pressable key={c} onPress={() => pickCategory(c)}>
                  <View style={[styles.catCard, on && styles.catCardOn]}>
                    <View style={[styles.catIcon, on && styles.catIconOn]}>
                      <Icon color={on ? Colors.cyan : Colors.electric} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catTitle}>{cm.label}</Text>
                      <Text style={styles.catDesc} numberOfLines={2}>{cm.description}</Text>
                    </View>
                    {on ? <Check color={Colors.cyan} size={20} /> : <ChevronRight color={Colors.textDim} size={18} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable disabled={!category} onPress={() => { setStep("context"); hap(); }}>
            <View style={[styles.primary, !category && { opacity: 0.4 }]}>
              <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.primaryText}>Continue</Text>
              <ChevronRight color="#fff" size={20} />
            </View>
          </Pressable>
        </Screen>
      </>
    );
  }

  // STEP 2 — context (Driver / Employee Incident — person-focused, equipment optional)
  if (step === "context" && isEmployee) {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 2 of 5" title="Who was involved?" />

          <Text style={styles.label}>PERSON INVOLVED</Text>
          <View style={styles.chipWrap}>
            {PERSON_TYPES.map((p) => {
              const on = personType === p;
              return (
                <Pressable key={p} onPress={() => { setPersonType(p); hap(); }}>
                  <View style={[styles.selChip, on && styles.selChipOn]}>
                    <Text style={[styles.selChipText, on && { color: Colors.cyan }]}>{p}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>EMPLOYEE / PERSON NAME</Text>
          <TextInput placeholder="e.g. J. Carter" placeholderTextColor={Colors.textDim} value={personName} onChangeText={setPersonName} style={styles.input} />

          <Text style={styles.label}>ROLE / TITLE</Text>
          <TextInput placeholder="e.g. Lead mechanic, Night dispatcher" placeholderTextColor={Colors.textDim} value={personRole} onChangeText={setPersonRole} style={styles.input} />

          <View style={styles.dualBtn}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DATE</Text>
              <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textDim} value={date} onChangeText={setDate} style={styles.input} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>TIME (OPTIONAL)</Text>
              <TextInput placeholder="e.g. 14:20" placeholderTextColor={Colors.textDim} value={time} onChangeText={setTime} style={styles.input} />
            </View>
          </View>

          <Text style={styles.label}>LOCATION (OPTIONAL)</Text>
          <TextInput placeholder="e.g. Main office · Fort Worth, TX" placeholderTextColor={Colors.textDim} value={location} onChangeText={setLocation} style={styles.input} />

          {renderYesNo("WAS THIS CONNECTED TO A VEHICLE, TRAILER, OR LOAD?")}

          {vehicleConnected === true && renderEquipmentPickers(true)}

          {stepFooter(!canContext)}
        </Screen>
      </>
    );
  }

  // STEP 2 — Safety Incident (location-focused, equipment optional)
  if (step === "context" && category === "safety") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 2 of 5" title="Where did the safety issue occur?" />

          <Text style={styles.label}>SAFETY LOCATION TYPE</Text>
          <View style={styles.chipWrap}>
            {SAFETY_LOCATION_TYPES.map((p) => {
              const on = (details.safetyLocationType ?? "") === p;
              return (
                <Pressable key={p} onPress={() => { setDetail("safetyLocationType", p); hap(); }}>
                  <View style={[styles.selChip, on && styles.selChipOn]}>
                    <Text style={[styles.selChipText, on && { color: Colors.cyan }]}>{p}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>LOCATION DESCRIPTION (OPTIONAL)</Text>
          <TextInput placeholder="e.g. Bay 3 · Fort Worth yard" placeholderTextColor={Colors.textDim} value={location} onChangeText={setLocation} style={styles.input} />

          {dateTimeRow}

          {renderYesNo("WAS EQUIPMENT INVOLVED?")}

          {vehicleConnected === true && renderEquipmentPickers(false)}

          {stepFooter(!canContext)}
        </Screen>
      </>
    );
  }

  // STEP 2 — Accident Report (vehicle/equipment-centric)
  if (step === "context" && category === "accident") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 2 of 5" title="Which vehicle/equipment was involved?" />

          <Text style={styles.label}>DRIVER</Text>
          <View style={styles.chipWrap}>
            {DRIVERS.map((d) => {
              const on = driver === d;
              return (
                <Pressable key={d} onPress={() => { setDriver(d); hap(); }}>
                  <View style={[styles.selChip, on && styles.selChipOn]}>
                    <Text style={[styles.selChipText, on && { color: Colors.cyan }]}>{d}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {renderEquipmentPickers(true)}

          {dateTimeRow}

          <Text style={styles.label}>ACCIDENT LOCATION</Text>
          <TextInput placeholder="e.g. I-20 W · Abilene, TX" placeholderTextColor={Colors.textDim} value={location} onChangeText={setLocation} style={styles.input} />

          {stepFooter(!canContext)}
        </Screen>
      </>
    );
  }

  // STEP 2 — Cargo Damage (shipment-focused, equipment optional)
  if (step === "context" && category === "cargo_damage") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 2 of 5" title="Which shipment or cargo was affected?" />

          <Text style={styles.label}>SHIPMENT / LOAD NUMBER</Text>
          <TextInput placeholder="e.g. SHP-90214" placeholderTextColor={Colors.textDim} value={loadNumber} onChangeText={setLoadNumber} style={styles.input} />

          <Text style={styles.label}>CUSTOMER NAME</Text>
          <TextInput placeholder="e.g. Lone Star Auto Group" placeholderTextColor={Colors.textDim} value={details.customer ?? ""} onChangeText={(v) => setDetail("customer", v)} style={styles.input} />

          <Text style={styles.label}>CARGO DESCRIPTION</Text>
          <TextInput placeholder="e.g. 2024 SUV, white" placeholderTextColor={Colors.textDim} value={details.cargoDescription ?? ""} onChangeText={(v) => setDetail("cargoDescription", v)} style={[styles.input, { minHeight: 70 }]} multiline />

          <Text style={styles.label}>PICKUP OR DELIVERY LOCATION (OPTIONAL)</Text>
          <TextInput placeholder="e.g. Delivery · Dallas, TX" placeholderTextColor={Colors.textDim} value={location} onChangeText={setLocation} style={styles.input} />

          <View style={styles.dualBtn}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DATE DISCOVERED</Text>
              <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textDim} value={date} onChangeText={setDate} style={styles.input} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>TIME (OPTIONAL)</Text>
              <TextInput placeholder="e.g. 11:30" placeholderTextColor={Colors.textDim} value={time} onChangeText={setTime} style={styles.input} />
            </View>
          </View>

          {renderYesNo("WAS TRUCK / TRAILER INVOLVED?")}

          {vehicleConnected === true && renderEquipmentPickers(false)}

          {stepFooter(!canContext)}
        </Screen>
      </>
    );
  }

  // STEP 2 — Customer Complaint (customer-focused, equipment optional)
  if (step === "context") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 2 of 5" title="Who made the complaint?" />

          <Text style={styles.label}>CUSTOMER NAME</Text>
          <TextInput placeholder="e.g. Premier Motors" placeholderTextColor={Colors.textDim} value={details.customer ?? ""} onChangeText={(v) => setDetail("customer", v)} style={styles.input} />

          <Text style={styles.label}>CONTACT PERSON</Text>
          <TextInput placeholder="e.g. Operations manager" placeholderTextColor={Colors.textDim} value={details.contactPerson ?? ""} onChangeText={(v) => setDetail("contactPerson", v)} style={styles.input} />

          <Text style={styles.label}>CONTACT PHONE / EMAIL (OPTIONAL)</Text>
          <TextInput placeholder="e.g. dispatch@premier.com" placeholderTextColor={Colors.textDim} value={details.contactInfo ?? ""} onChangeText={(v) => setDetail("contactInfo", v)} style={styles.input} />

          <Text style={styles.label}>SHIPMENT / LOAD NUMBER (OPTIONAL)</Text>
          <TextInput placeholder="e.g. SHP-90188" placeholderTextColor={Colors.textDim} value={loadNumber} onChangeText={setLoadNumber} style={styles.input} />

          <Text style={styles.label}>COMPLAINT LOCATION (OPTIONAL)</Text>
          <TextInput placeholder="e.g. Downtown · Dallas, TX" placeholderTextColor={Colors.textDim} value={location} onChangeText={setLocation} style={styles.input} />

          <Text style={styles.label}>DATE RECEIVED</Text>
          <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textDim} value={date} onChangeText={setDate} style={styles.input} />

          {renderYesNo("WAS A VEHICLE / EQUIPMENT INVOLVED?")}

          {vehicleConnected === true && renderEquipmentPickers(false)}

          {stepFooter(!canContext)}
        </Screen>
      </>
    );
  }

  // STEP 3 — category-specific fields
  if (step === "specific") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 3 of 5" title={`${meta?.short} details`} />

          <Text style={styles.label}>CLASSIFICATION</Text>
          <View style={styles.chipWrap}>
            {(meta?.subtypes ?? []).map((s) => {
              const on = subtype === s;
              return (
                <Pressable key={s} onPress={() => { setSubtype(s); hap(); }}>
                  <View style={[styles.selChip, on && styles.selChipOn]}>
                    <Text style={[styles.selChipText, on && { color: Colors.cyan }]}>{s}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>SEVERITY</Text>
          <View style={styles.dualBtn}>
            {SEVERITIES.map((s) => {
              const sm = INCIDENT_SEVERITY_META[s];
              const color = statusMeta[sm.status].color;
              const on = severity === s;
              return (
                <Pressable key={s} style={{ flex: 1 }} onPress={() => { setSeverity(s); hap(); }}>
                  <View style={[styles.sevBtn, on && { borderColor: color, backgroundColor: color + "1A" }]}>
                    <View style={[styles.sevDot, { backgroundColor: color }]} />
                    <Text style={[styles.sevBtnText, on && { color }]}>{sm.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {fields.map((f) => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label.toUpperCase()}</Text>
              <TextInput
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textDim}
                value={details[f.key] ?? ""}
                onChangeText={(v) => setDetails((prev) => ({ ...prev, [f.key]: v }))}
                style={[styles.input, f.multiline ? { minHeight: 84 } : null]}
                multiline={f.multiline}
              />
            </View>
          ))}

          <Pressable onPress={() => { setStep("narrative"); hap(); }}>
            <View style={styles.primary}>
              <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.primaryText}>Continue</Text>
              <ChevronRight color="#fff" size={20} />
            </View>
          </Pressable>
          <Pressable onPress={() => setStep("context")}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </Screen>
      </>
    );
  }

  // STEP 4 — narrative
  if (step === "narrative") {
    return (
      <>
        <Stack.Screen options={{ title: "New Report" }} />
        <Screen>
          <SectionHeader kicker="Step 4 of 5" title="Narrative & evidence" />

          <Text style={styles.label}>REPORT TITLE</Text>
          <TextInput placeholder="e.g. Merge collision on I-20 W" placeholderTextColor={Colors.textDim} value={title} onChangeText={setTitle} style={styles.input} />

          <Text style={styles.label}>WHAT HAPPENED</Text>
          <TextInput
            placeholder="Describe the sequence of events, who was involved, and immediate actions taken..."
            placeholderTextColor={Colors.textDim}
            value={summary}
            onChangeText={setSummary}
            style={[styles.input, { minHeight: 110 }]}
            multiline
          />

          <Text style={styles.label}>CORRECTIVE ACTION</Text>
          <TextInput
            placeholder="What was or will be done to prevent recurrence..."
            placeholderTextColor={Colors.textDim}
            value={correctiveAction}
            onChangeText={setCorrectiveAction}
            style={[styles.input, { minHeight: 84 }]}
            multiline
          />

          <Text style={styles.label}>WITNESSES (OPTIONAL)</Text>
          <TextInput placeholder="Names or roles of any witnesses" placeholderTextColor={Colors.textDim} value={witnesses} onChangeText={setWitnesses} style={styles.input} />

          <Pressable onPress={() => { setPhotos((n) => n + 1); hap(); }}>
            <View style={styles.photoBtn}>
              <Camera color={Colors.cyan} size={18} />
              <Text style={styles.photoText}>Attach photo evidence</Text>
              {photos > 0 && (
                <View style={styles.photoBadge}>
                  <Text style={styles.photoBadgeText}>{photos}</Text>
                </View>
              )}
            </View>
          </Pressable>

          <Pressable disabled={!canNarrative} onPress={() => { setStep("review"); hap(); }}>
            <View style={[styles.primary, !canNarrative && { opacity: 0.4 }]}>
              <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Text style={styles.primaryText}>Review Report</Text>
              <ChevronRight color="#fff" size={20} />
            </View>
          </Pressable>
          <Pressable onPress={() => setStep("specific")}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </Screen>
      </>
    );
  }

  // STEP 5 — review
  const sevMeta = INCIDENT_SEVERITY_META[severity];
  const accent = statusMeta[sevMeta.status].color;
  const CatIcon = category ? CATEGORY_ICON[category] : AlertTriangle;
  const reviewTruck = linkEquipment ? truck : undefined;
  const reviewTrailer = linkEquipment ? trailer : undefined;
  const equipmentLabel = reviewTruck?.nickname ?? reviewTrailer?.nickname ?? (isEmployee ? "Not equipment-related" : "—");
  const personLine = isEmployee
    ? `${personName}${personRole.trim() ? ` · ${personRole.trim()}` : personType ? ` · ${personType}` : ""}`
    : driver;

  return (
    <>
      <Stack.Screen options={{ title: "New Report" }} />
      <Screen>
        <SectionHeader kicker="Step 5 of 5" title="Confirm & Submit" />

        <Card glow gradient={Gradients.cardHi}>
          <View style={styles.reviewHead}>
            <View style={[styles.iconWrap, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <CatIcon color={accent} size={22} />
            </View>
            <View style={[styles.sevPill, { backgroundColor: accent + "1F", borderColor: accent + "55" }]}>
              <View style={[styles.sevDot, { backgroundColor: accent }]} />
              <Text style={[styles.sevText, { color: accent }]}>{sevMeta.label.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.catTag}>{meta?.label} · {subtype}</Text>
          <Text style={styles.reviewTitle}>{title}</Text>
          <Text style={styles.reviewSummary}>{summary}</Text>
        </Card>

        <Card>
          <SummaryRow label={isEmployee ? "PERSON INVOLVED" : "DRIVER / EMPLOYEE"} value={personLine} />
          <View style={styles.divider} />
          <SummaryRow label="EQUIPMENT" value={equipmentLabel} />
          <View style={styles.divider} />
          <SummaryRow label="WHEN" value={`${date}${time ? ` · ${time}` : ""}`} />
          <View style={styles.divider} />
          <SummaryRow label="LOCATION" value={location.trim() || "—"} />
          {linkEquipment && loadNumber.trim().length > 0 && (
            <>
              <View style={styles.divider} />
              <SummaryRow label="LOAD NUMBER" value={loadNumber} />
            </>
          )}
          <View style={styles.divider} />
          <SummaryRow label="EVIDENCE" value={`${photos} photo${photos !== 1 ? "s" : ""}`} />
        </Card>

        <Pressable onPress={submit}>
          <View style={styles.primary}>
            <LinearGradient colors={Gradients.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.primaryText}>Submit Report</Text>
            <Check color="#fff" size={20} />
          </View>
        </Pressable>
        <Pressable onPress={() => setStep("narrative")}>
          <Text style={styles.backText}>Back to narrative</Text>
        </Pressable>
      </Screen>
    </>
  );
}

function EquipmentRow({
  kind,
  name,
  sub,
  selected,
  onPress,
}: {
  kind: "truck" | "trailer";
  name: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.eqPick, selected && styles.eqPickOn]}>
        <View style={styles.iconBubble}>
          {kind === "truck" ? <Truck color={Colors.cyan} size={18} /> : <Container color={Colors.cyan} size={18} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eqName}>{name}</Text>
          <Text style={styles.eqSub}>{sub}</Text>
        </View>
        {selected && <Check color={Colors.cyan} size={20} />}
      </View>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800", marginTop: 14 },
  dualBtn: { flexDirection: "row", gap: 8 },

  catCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  catCardOn: { borderColor: "rgba(94,231,255,0.5)", backgroundColor: "rgba(94,231,255,0.07)" },
  catIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(124,196,255,0.1)", borderWidth: 1, borderColor: Colors.border },
  catIconOn: { backgroundColor: "rgba(94,231,255,0.14)", borderColor: "rgba(94,231,255,0.4)" },
  catTitle: { color: Colors.text, fontSize: 14.5, fontWeight: "800" },
  catDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  selChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  selChipOn: { backgroundColor: "rgba(94,231,255,0.1)", borderColor: "rgba(94,231,255,0.5)" },
  selChipText: { color: Colors.textMuted, fontSize: 12.5, fontWeight: "800" },

  eqPick: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border },
  eqPickOn: { borderColor: "rgba(94,231,255,0.55)", backgroundColor: "rgba(94,231,255,0.08)" },
  eqName: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  eqSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  iconBubble: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(94,231,255,0.12)" },

  primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 16, overflow: "hidden", marginTop: 18 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  backText: { color: Colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 10, fontWeight: "700" },

  sevBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: Colors.border, marginTop: 8 },
  sevBtnText: { color: Colors.textMuted, fontSize: 12.5, fontWeight: "800" },
  sevDot: { width: 8, height: 8, borderRadius: 99 },

  input: { color: Colors.text, fontSize: 14, padding: 13, marginTop: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  photoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(94,231,255,0.4)", backgroundColor: "rgba(94,231,255,0.08)", marginTop: 18 },
  photoText: { color: Colors.cyan, fontSize: 13, fontWeight: "800" },
  photoBadge: { backgroundColor: Colors.cyan, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 },
  photoBadgeText: { color: Colors.navy, fontSize: 11, fontWeight: "800" },

  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  sevPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  sevText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  catTag: { color: Colors.cyan, fontSize: 11.5, fontWeight: "800", letterSpacing: 0.3, marginTop: 14 },
  reviewTitle: { color: Colors.text, fontSize: 18, fontWeight: "800", marginTop: 6 },
  reviewSummary: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 12 },
  summaryLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  summaryValue: { color: Colors.text, fontSize: 15, fontWeight: "800", marginTop: 4 },
});
