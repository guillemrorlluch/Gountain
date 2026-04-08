var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// main.jsx
import React6 from "https://esm.sh/react@19.2.0";
import { createRoot } from "https://esm.sh/react-dom@19.2.0/client";

// App.jsx
import React5, { useEffect as useEffect2, useMemo as useMemo4, useRef, useState as useState3 } from "https://esm.sh/react@19.2.0";

// components/BottomNavigation.jsx
import React2, { useMemo, useState } from "https://esm.sh/react@19.2.0";
var HomeIcon = ({ filled }) => /* @__PURE__ */ React2.createElement("svg", {
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  focusable: "false"
}, /* @__PURE__ */ React2.createElement("path", {
  d: "M4 10.5L12 4l8 6.5v8a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.5h-3V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z",
  fill: filled ? "currentColor" : "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinejoin: "round"
}));
var SearchIcon = ({ filled }) => /* @__PURE__ */ React2.createElement("svg", {
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  focusable: "false"
}, /* @__PURE__ */ React2.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "6",
  fill: filled ? "currentColor" : "none",
  stroke: "currentColor",
  strokeWidth: "1.6"
}), /* @__PURE__ */ React2.createElement("path", {
  d: "M16.5 16.5 20 20",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round"
}));
var BellIcon = ({ filled }) => /* @__PURE__ */ React2.createElement("svg", {
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  focusable: "false"
}, /* @__PURE__ */ React2.createElement("path", {
  d: "M6.5 9.5a5.5 5.5 0 1 1 11 0v4.2c0 .6.24 1.18.66 1.6l1.34 1.35H4.5l1.34-1.35c.42-.42.66-1 .66-1.6V9.5Z",
  fill: filled ? "currentColor" : "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinejoin: "round"
}), /* @__PURE__ */ React2.createElement("path", {
  d: "M9.5 19a2.5 2.5 0 0 0 5 0",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round"
}));
var UserIcon = ({ filled }) => /* @__PURE__ */ React2.createElement("svg", {
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  focusable: "false"
}, /* @__PURE__ */ React2.createElement("circle", {
  cx: "12",
  cy: "8",
  r: "3.5",
  fill: filled ? "currentColor" : "none",
  stroke: "currentColor",
  strokeWidth: "1.6"
}), /* @__PURE__ */ React2.createElement("path", {
  d: "M4.5 19.5c1.9-3.2 4.6-4.8 7.5-4.8s5.6 1.6 7.5 4.8",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round"
}));
var DEFAULT_ITEMS = [
  { id: "home", label: "Inicio", Icon: HomeIcon },
  { id: "search", label: "Explorar", Icon: SearchIcon },
  { id: "alerts", label: "Alertas", Icon: BellIcon },
  { id: "profile", label: "Perfil", Icon: UserIcon }
];
function BottomNavigation({ items = DEFAULT_ITEMS, initialActiveId, onChange }) {
  const initialId = useMemo(() => initialActiveId ?? items[0]?.id, [initialActiveId, items]);
  const [activeId, setActiveId] = useState(initialId);
  return /* @__PURE__ */ React2.createElement("nav", {
    className: "bottom-nav",
    "aria-label": "Bottom navigation"
  }, /* @__PURE__ */ React2.createElement("div", {
    className: "bottom-nav__list",
    role: "tablist"
  }, items.map(({ id, label, Icon }) => {
    const isActive = id === activeId;
    return /* @__PURE__ */ React2.createElement("button", {
      key: id,
      type: "button",
      className: `bottom-nav__item${isActive ? " is-active" : ""}`,
      "aria-pressed": isActive,
      onClick: () => {
        setActiveId(id);
        onChange?.(id);
      }
    }, /* @__PURE__ */ React2.createElement("span", {
      className: "bottom-nav__icon",
      "aria-hidden": "true"
    }, /* @__PURE__ */ React2.createElement(Icon, {
      filled: isActive
    })), /* @__PURE__ */ React2.createElement("span", {
      className: "bottom-nav__label"
    }, label));
  })));
}

// components/SearchBar.jsx
import React3, { useMemo as useMemo2, useState as useState2 } from "https://esm.sh/react@19.2.0";
var DEFAULT_PLACEHOLDER = "Discover your next expedition.";
var SearchIcon2 = () => /* @__PURE__ */ React3.createElement("svg", {
  "aria-hidden": "true",
  viewBox: "0 0 24 24",
  focusable: "false",
  className: "search-bar__icon"
}, /* @__PURE__ */ React3.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7",
  stroke: "currentColor",
  strokeWidth: "2",
  fill: "none"
}), /* @__PURE__ */ React3.createElement("path", {
  d: "M16.5 16.5L21 21",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
}));
var FilterIcon = () => /* @__PURE__ */ React3.createElement("svg", {
  "aria-hidden": "true",
  viewBox: "0 0 24 24",
  focusable: "false",
  className: "search-bar__action-icon"
}, /* @__PURE__ */ React3.createElement("path", {
  d: "M4 6h16M7 12h10M10 18h4",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
}));
function highlightMatch(label, query) {
  if (!query)
    return label;
  const normalized = label.toLowerCase();
  const idx = normalized.indexOf(query);
  if (idx === -1)
    return label;
  const before = label.slice(0, idx);
  const match = label.slice(idx, idx + query.length);
  const after = label.slice(idx + query.length);
  return /* @__PURE__ */ React3.createElement(React3.Fragment, null, before, /* @__PURE__ */ React3.createElement("span", {
    className: "search-bar__match"
  }, match), after);
}
function SearchBar({
  destinations = [],
  onSelect,
  placeholder = DEFAULT_PLACEHOLDER,
  showActionIcon = false,
  onAction
}) {
  const [query, setQuery] = useState2("");
  const [isFocused, setIsFocused] = useState2(false);
  const normalizedQuery = query.trim().toLowerCase();
  const isTyping = normalizedQuery.length > 0;
  const filteredResults = useMemo2(() => {
    if (!normalizedQuery)
      return destinations;
    return destinations.filter((destination) => destination?.name?.toLowerCase().includes(normalizedQuery));
  }, [destinations, normalizedQuery]);
  const handleSelect = (destination) => {
    if (onSelect) {
      onSelect(destination);
    }
    setQuery(destination?.name ?? "");
  };
  return /* @__PURE__ */ React3.createElement("div", {
    className: [
      "search-bar",
      isFocused ? "is-focused" : "",
      isTyping ? "is-typing" : ""
    ].filter(Boolean).join(" ")
  }, /* @__PURE__ */ React3.createElement("div", {
    className: "search-bar__field"
  }, /* @__PURE__ */ React3.createElement(SearchIcon2, null), /* @__PURE__ */ React3.createElement("input", {
    type: "search",
    value: query,
    onChange: (event) => setQuery(event.target.value),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    placeholder,
    className: "search-bar__input",
    "aria-label": "Search destinations"
  }), showActionIcon ? /* @__PURE__ */ React3.createElement("button", {
    type: "button",
    className: "search-bar__action",
    "aria-label": "Filter destinations",
    onClick: onAction
  }, /* @__PURE__ */ React3.createElement(FilterIcon, null)) : null), isTyping ? /* @__PURE__ */ React3.createElement("div", {
    className: "search-bar__results",
    role: "listbox"
  }, filteredResults.map((destination) => /* @__PURE__ */ React3.createElement("button", {
    type: "button",
    key: destination.id,
    className: "search-bar__result",
    role: "option",
    onClick: () => handleSelect(destination)
  }, highlightMatch(destination.name ?? "", normalizedQuery))), filteredResults.length === 0 ? /* @__PURE__ */ React3.createElement("div", {
    className: "search-bar__empty"
  }, "No matching destinations.") : null) : null);
}

// components/RouteReadinessPanel.jsx
import React4, { useEffect, useMemo as useMemo3 } from "https://esm.sh/react@19.2.0";

// engine/readiness/RouteReadinessModelProduction.js
function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}
function round(n) {
  return Math.round(n * 10) / 10;
}
function avg(values) {
  if (!values.length)
    return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
function weightedAverage(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0)
    return 0;
  const weightedSum = items.reduce((sum, item) => sum + item.value * item.weight, 0);
  return weightedSum / totalWeight;
}
function ratioMatch(capacity, demand) {
  if (demand <= 0)
    return 100;
  const ratio = capacity / demand;
  if (ratio >= 1.2)
    return 95;
  if (ratio >= 1)
    return 85 + (ratio - 1) * 50;
  if (ratio >= 0.8)
    return 55 + (ratio - 0.8) * 150;
  if (ratio >= 0.6)
    return 25 + (ratio - 0.6) * 150;
  return clamp(ratio * 40);
}
function makeFixedVariables(group, keys, usage, layer = "raw") {
  return keys.map((key) => ({
    key,
    label: key,
    group,
    layer,
    type: "number",
    usage,
    min: 0,
    max: 100
  }));
}
function makeCartesianVariables(group, namespace, dimensions, metrics, usage, layer = "raw") {
  const out = [];
  for (const dimension of dimensions) {
    for (const metric of metrics) {
      out.push({
        key: `${namespace}_${dimension}_${metric}`,
        label: `${namespace} ${dimension} ${metric}`,
        group,
        layer,
        type: "number",
        usage,
        min: 0,
        max: 100
      });
    }
  }
  return out;
}
var BASE_PROFILE = makeFixedVariables("base_profile", [
  "user_profile_age_score",
  "user_profile_weight_score",
  "user_profile_height_score",
  "user_profile_pack_weight_score",
  "user_profile_bmi_proxy_score",
  "user_profile_home_altitude_score",
  "user_profile_training_years_score",
  "user_profile_primary_sport_score",
  "user_profile_secondary_sport_score",
  "user_profile_general_mobility_score",
  "user_profile_general_resilience_score",
  "user_profile_schedule_flexibility_score",
  "user_profile_sleep_baseline_score",
  "user_profile_nutrition_baseline_score",
  "user_profile_hydration_baseline_score",
  "user_profile_time_budget_score",
  "user_profile_risk_tolerance_score",
  "user_profile_decision_discipline_score",
  "user_profile_stress_load_score",
  "user_profile_heat_tolerance_score",
  "user_profile_cold_tolerance_score",
  "user_profile_altitude_tolerance_score",
  "user_profile_exposure_tolerance_score",
  "user_profile_self_rescue_baseline_score",
  "user_profile_navigation_baseline_score",
  "user_profile_group_dependence_score",
  "user_profile_recent_illness_flag_score",
  "user_profile_medical_constraints_flag_score"
], "score");
var USER_FITNESS = makeCartesianVariables("user_fitness", "user_fitness", [
  "aerobic_capacity",
  "anaerobic_capacity",
  "muscular_endurance",
  "leg_strength",
  "uphill_efficiency",
  "downhill_tolerance",
  "cadence_control",
  "heart_rate_control",
  "power_hiking_capacity",
  "core_stability",
  "mobility",
  "durability"
], ["status", "baseline", "trend", "recent", "chronic", "confidence"], "score");
var USER_RECOVERY = makeCartesianVariables("user_recovery", "user_recovery", ["fatigue", "recovery", "sleep", "hrv", "resting_hr", "strain"], ["status", "baseline", "trend", "penalty", "confidence"], "penalty");
var USER_CONSTRAINTS = makeCartesianVariables("user_constraints", "user_constraints", ["knee", "ankle", "hip", "lower_back", "shoulder", "foot", "vertigo", "pain", "health"], ["risk", "status", "trend", "penalty"], "penalty");
var USER_EXPERIENCE = makeCartesianVariables("user_experience", "user_experience", [
  "hiking",
  "trekking",
  "scrambling",
  "snow",
  "ice",
  "navigation",
  "altitude",
  "multi_day",
  "night_movement",
  "winter_travel",
  "glacier_travel",
  "bivouac"
], ["experience", "recency", "volume", "success", "confidence"], "score");
var USER_GEAR = makeCartesianVariables("user_gear", "user_gear", [
  "footwear",
  "socks",
  "layering",
  "shell",
  "insulation",
  "pack",
  "poles",
  "hydration",
  "nutrition",
  "navigation_tools",
  "emergency_kit",
  "battery_system"
], ["match", "readiness", "redundancy", "confidence"], "score");
var USER_SKILLS = makeCartesianVariables("user_skills", "user_skills", [
  "weather_reading",
  "route_planning",
  "bailout_planning",
  "group_management",
  "self_rescue",
  "pace_control",
  "risk_assessment",
  "decision_making"
], ["skill", "readiness", "trend", "confidence"], "score");
var ROUTE_PHYSICAL = makeCartesianVariables("route_physical", "route_physical", [
  "distance",
  "elevation_gain",
  "elevation_loss",
  "moving_time",
  "total_time",
  "max_altitude",
  "avg_gradient",
  "steepest_section"
], ["load", "severity", "variability", "constraint", "confidence"], "score");
var ROUTE_SURFACE = makeCartesianVariables("route_surface", "route_surface", ["trail", "rock", "scree", "slab", "mud", "snow", "ice", "bushwhack", "river_crossing"], ["coverage", "severity", "instability", "consequence", "confidence"], "score");
var ROUTE_TECHNICAL = makeCartesianVariables("route_technical", "route_technical", [
  "terrain_technicality",
  "route_finding",
  "scrambling",
  "exposure",
  "rockfall",
  "objective_hazard",
  "hands_on_sections",
  "consequence_of_error",
  "trail_marking"
], ["demand", "severity", "penalty", "confidence"], "score");
var WEATHER_ENV = makeCartesianVariables("weather_environment", "weather_environment", [
  "heat",
  "cold",
  "storm",
  "wind",
  "precipitation",
  "lightning",
  "visibility",
  "freeze_thaw",
  "avalanche",
  "remoteness"
], ["risk", "severity", "variability", "penalty", "confidence"], "penalty");
var ROUTE_OPERATIONS = makeCartesianVariables("route_operations", "route_operations", [
  "bailout",
  "water_availability",
  "daylight",
  "seasonality",
  "mandatory_gear",
  "access",
  "exit",
  "signal",
  "rescue_delay",
  "commitment"
], ["difficulty", "constraint", "penalty", "confidence"], "score");
var HISTORY_CONTEXT = makeCartesianVariables("history_context", "history_context", [
  "similar_route",
  "similar_distance",
  "similar_elevation",
  "similar_altitude",
  "similar_exposure",
  "similar_terrain",
  "recent_mountain_days",
  "recent_failures"
], ["match", "recency", "success", "confidence"], "score");
var DATA_QUALITY = makeCartesianVariables("data_quality", "data_quality", ["user_data", "route_data", "weather_data", "map_data", "hazard_data", "history_data", "gear_data"], ["coverage", "freshness", "confidence"], "confidence");
var DERIVED_SUBSCORES = makeCartesianVariables("derived_subscores", "derived_subscores", ["physical_fit", "technical_fit", "environmental_fit", "logistics_fit", "resilience_fit", "skills_fit", "operational_fit"], ["score", "weight", "confidence", "priority", "explanation"], "score", "derived");
var DERIVED_MISMATCH = makeCartesianVariables("derived_mismatch", "derived_mismatch", ["distance", "elevation", "altitude", "exposure", "route_finding", "weather", "gear", "commitment"], ["mismatch", "gap", "penalty", "confidence"], "penalty", "derived");
var DERIVED_RISK = makeCartesianVariables("derived_risk", "derived_risk", ["fatigue", "injury", "technical", "environmental", "logistical", "weather_window", "objective_hazard", "decision_quality"], ["risk", "severity", "penalty", "confidence"], "penalty", "derived");
var DERIVED_CONFIDENCE = makeCartesianVariables("derived_confidence", "derived_confidence", ["model", "user", "route", "weather", "gear", "history", "overall_explainability", "data_reliability"], ["score", "status", "priority", "confidence"], "confidence", "derived");
var DERIVED_RECOMMENDATION = makeCartesianVariables("derived_recommendation", "derived_recommendation", ["training", "gear", "timing", "route_choice", "pacing", "hydration", "nutrition", "partner", "bailout_plan"], ["priority", "impact", "urgency", "confidence"], "explanation", "derived");
var DERIVED_PROGRESSION = makeCartesianVariables("derived_progression", "derived_progression", ["base_build", "uphill_build", "downhill_build", "technical_build", "navigation_build", "altitude_build", "multi_day_build", "winter_build", "recovery_build"], ["readiness", "gap", "priority", "confidence"], "explanation", "derived");
var DERIVED_CORE = makeCartesianVariables("derived_core", "derived_core", ["physical_demand", "technical_demand", "environmental_demand", "logistics_demand", "physical_capacity", "technical_capacity", "environmental_capacity", "logistics_capacity"], ["score", "weight", "confidence", "priority"], "score", "derived");
var DERIVED_EXPLANATION = makeCartesianVariables("derived_explanation", "derived_explanation", ["readiness", "gaps", "timing", "route_choice", "safety", "training", "gear"], ["score", "priority", "clarity", "confidence", "impact", "urgency"], "explanation", "derived");
var ROUTE_READINESS_VARIABLES = [
  ...BASE_PROFILE,
  ...USER_FITNESS,
  ...USER_RECOVERY,
  ...USER_CONSTRAINTS,
  ...USER_EXPERIENCE,
  ...USER_GEAR,
  ...USER_SKILLS,
  ...ROUTE_PHYSICAL,
  ...ROUTE_SURFACE,
  ...ROUTE_TECHNICAL,
  ...WEATHER_ENV,
  ...ROUTE_OPERATIONS,
  ...HISTORY_CONTEXT,
  ...DATA_QUALITY,
  ...DERIVED_SUBSCORES,
  ...DERIVED_MISMATCH,
  ...DERIVED_RISK,
  ...DERIVED_CONFIDENCE,
  ...DERIVED_RECOMMENDATION,
  ...DERIVED_PROGRESSION,
  ...DERIVED_CORE,
  ...DERIVED_EXPLANATION
];
if (ROUTE_READINESS_VARIABLES.length !== 847) {
  throw new Error(`Expected 847 variables, got ${ROUTE_READINESS_VARIABLES.length}`);
}
var VARIABLE_KEYS = ROUTE_READINESS_VARIABLES.map((v) => v.key);
var VARIABLE_INDEX = Object.fromEntries(ROUTE_READINESS_VARIABLES.map((v) => [v.key, v]));
function createEmpty847Input(defaultValue = 0) {
  return Object.fromEntries(VARIABLE_KEYS.map((key) => [key, defaultValue]));
}
function get(input, key, fallback = 0) {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? clamp(value) : fallback;
}
function averageKeys(input, keys) {
  if (!keys.length)
    return 0;
  return avg(keys.map((k) => get(input, k)));
}
function averageByPrefix(input, prefix) {
  const keys = VARIABLE_KEYS.filter((k) => k.startsWith(prefix));
  return averageKeys(input, keys);
}
var K = {
  userFitness: {
    aerobic: "user_fitness_aerobic_capacity_",
    muscularEndurance: "user_fitness_muscular_endurance_",
    legStrength: "user_fitness_leg_strength_",
    uphill: "user_fitness_uphill_efficiency_",
    downhill: "user_fitness_downhill_tolerance_",
    mobility: "user_fitness_mobility_",
    durability: "user_fitness_durability_"
  },
  userRecovery: {
    fatigue: "user_recovery_fatigue_",
    recovery: "user_recovery_recovery_",
    sleep: "user_recovery_sleep_",
    hrv: "user_recovery_hrv_",
    strain: "user_recovery_strain_"
  },
  userExperience: {
    hiking: "user_experience_hiking_",
    trekking: "user_experience_trekking_",
    scrambling: "user_experience_scrambling_",
    snow: "user_experience_snow_",
    ice: "user_experience_ice_",
    navigation: "user_experience_navigation_",
    altitude: "user_experience_altitude_",
    multiDay: "user_experience_multi_day_",
    winter: "user_experience_winter_travel_",
    bivouac: "user_experience_bivouac_"
  },
  userGear: {
    footwear: "user_gear_footwear_",
    layering: "user_gear_layering_",
    hydration: "user_gear_hydration_",
    nutrition: "user_gear_nutrition_",
    navigationTools: "user_gear_navigation_tools_",
    emergencyKit: "user_gear_emergency_kit_",
    battery: "user_gear_battery_system_",
    pack: "user_gear_pack_"
  },
  userSkills: {
    weather: "user_skills_weather_reading_",
    routePlanning: "user_skills_route_planning_",
    bailoutPlanning: "user_skills_bailout_planning_",
    selfRescue: "user_skills_self_rescue_",
    paceControl: "user_skills_pace_control_",
    riskAssessment: "user_skills_risk_assessment_",
    decisionMaking: "user_skills_decision_making_"
  },
  userConstraints: {
    knee: "user_constraints_knee_",
    ankle: "user_constraints_ankle_",
    vertigo: "user_constraints_vertigo_",
    pain: "user_constraints_pain_",
    health: "user_constraints_health_"
  },
  routePhysical: {
    distance: "route_physical_distance_",
    gain: "route_physical_elevation_gain_",
    loss: "route_physical_elevation_loss_",
    movingTime: "route_physical_moving_time_",
    totalTime: "route_physical_total_time_",
    altitude: "route_physical_max_altitude_",
    gradient: "route_physical_avg_gradient_",
    steep: "route_physical_steepest_section_"
  },
  routeTechnical: {
    technicality: "route_technical_terrain_technicality_",
    routeFinding: "route_technical_route_finding_",
    scrambling: "route_technical_scrambling_",
    exposure: "route_technical_exposure_",
    rockfall: "route_technical_rockfall_",
    objectiveHazard: "route_technical_objective_hazard_",
    consequence: "route_technical_consequence_of_error_",
    trailMarking: "route_technical_trail_marking_"
  },
  weather: {
    heat: "weather_environment_heat_",
    cold: "weather_environment_cold_",
    storm: "weather_environment_storm_",
    wind: "weather_environment_wind_",
    precipitation: "weather_environment_precipitation_",
    lightning: "weather_environment_lightning_",
    visibility: "weather_environment_visibility_",
    avalanche: "weather_environment_avalanche_",
    remoteness: "weather_environment_remoteness_"
  },
  ops: {
    bailout: "route_operations_bailout_",
    water: "route_operations_water_availability_",
    daylight: "route_operations_daylight_",
    seasonality: "route_operations_seasonality_",
    mandatoryGear: "route_operations_mandatory_gear_",
    access: "route_operations_access_",
    exit: "route_operations_exit_",
    signal: "route_operations_signal_",
    rescueDelay: "route_operations_rescue_delay_",
    commitment: "route_operations_commitment_"
  },
  history: {
    similarRoute: "history_context_similar_route_",
    similarElevation: "history_context_similar_elevation_",
    similarAltitude: "history_context_similar_altitude_",
    similarExposure: "history_context_similar_exposure_",
    terrain: "history_context_similar_terrain_",
    mountainDays: "history_context_recent_mountain_days_",
    failures: "history_context_recent_failures_"
  },
  dataq: {
    user: "data_quality_user_data_",
    route: "data_quality_route_data_",
    weather: "data_quality_weather_data_",
    map: "data_quality_map_data_",
    hazard: "data_quality_hazard_data_",
    history: "data_quality_history_data_",
    gear: "data_quality_gear_data_"
  }
};
function derive847(input) {
  const physicalCapacity = weightedAverage([
    { value: averageByPrefix(input, K.userFitness.aerobic), weight: 0.2 },
    { value: averageByPrefix(input, K.userFitness.muscularEndurance), weight: 0.18 },
    { value: averageByPrefix(input, K.userFitness.legStrength), weight: 0.14 },
    { value: averageByPrefix(input, K.userFitness.uphill), weight: 0.12 },
    { value: averageByPrefix(input, K.userFitness.downhill), weight: 0.1 },
    { value: averageByPrefix(input, K.userFitness.mobility), weight: 0.1 },
    { value: averageByPrefix(input, K.userFitness.durability), weight: 0.08 },
    { value: 100 - averageByPrefix(input, K.userRecovery.fatigue), weight: 0.08 }
  ]);
  const technicalCapacity = weightedAverage([
    { value: averageByPrefix(input, K.userExperience.hiking), weight: 0.1 },
    { value: averageByPrefix(input, K.userExperience.trekking), weight: 0.1 },
    { value: averageByPrefix(input, K.userExperience.scrambling), weight: 0.18 },
    { value: averageByPrefix(input, K.userExperience.navigation), weight: 0.18 },
    { value: averageByPrefix(input, K.userExperience.snow), weight: 0.1 },
    { value: averageByPrefix(input, K.userExperience.ice), weight: 0.08 },
    { value: averageByPrefix(input, K.userSkills.routePlanning), weight: 0.1 },
    { value: averageByPrefix(input, K.userSkills.riskAssessment), weight: 0.08 },
    { value: averageByPrefix(input, K.userSkills.decisionMaking), weight: 0.08 }
  ]);
  const environmentalCapacity = weightedAverage([
    { value: get(input, "user_profile_heat_tolerance_score"), weight: 0.18 },
    { value: get(input, "user_profile_cold_tolerance_score"), weight: 0.18 },
    { value: get(input, "user_profile_altitude_tolerance_score"), weight: 0.18 },
    { value: get(input, "user_profile_exposure_tolerance_score"), weight: 0.18 },
    { value: averageByPrefix(input, K.userExperience.altitude), weight: 0.1 },
    { value: averageByPrefix(input, K.userSkills.weather), weight: 0.1 },
    { value: 100 - averageByPrefix(input, K.userConstraints.vertigo), weight: 0.08 }
  ]);
  const logisticsCapacity = weightedAverage([
    { value: averageByPrefix(input, K.userGear.footwear), weight: 0.1 },
    { value: averageByPrefix(input, K.userGear.layering), weight: 0.08 },
    { value: averageByPrefix(input, K.userGear.pack), weight: 0.06 },
    { value: averageByPrefix(input, K.userGear.hydration), weight: 0.1 },
    { value: averageByPrefix(input, K.userGear.nutrition), weight: 0.1 },
    { value: averageByPrefix(input, K.userGear.navigationTools), weight: 0.14 },
    { value: averageByPrefix(input, K.userGear.emergencyKit), weight: 0.16 },
    { value: averageByPrefix(input, K.userGear.battery), weight: 0.06 },
    { value: averageByPrefix(input, K.userSkills.bailoutPlanning), weight: 0.1 },
    { value: averageByPrefix(input, K.userSkills.selfRescue), weight: 0.1 }
  ]);
  const resilienceCapacity = weightedAverage([
    { value: get(input, "user_profile_general_resilience_score"), weight: 0.16 },
    { value: get(input, "user_profile_decision_discipline_score"), weight: 0.14 },
    { value: 100 - averageByPrefix(input, K.userConstraints.pain), weight: 0.1 },
    { value: 100 - averageByPrefix(input, K.userConstraints.knee), weight: 0.08 },
    { value: 100 - averageByPrefix(input, K.userConstraints.ankle), weight: 0.08 },
    { value: averageByPrefix(input, K.userRecovery.recovery), weight: 0.12 },
    { value: averageByPrefix(input, K.userRecovery.sleep), weight: 0.1 },
    { value: averageByPrefix(input, K.history.similarRoute), weight: 0.12 },
    { value: averageByPrefix(input, K.history.mountainDays), weight: 0.1 }
  ]);
  const physicalDemand = weightedAverage([
    { value: averageByPrefix(input, K.routePhysical.distance), weight: 0.18 },
    { value: averageByPrefix(input, K.routePhysical.gain), weight: 0.22 },
    { value: averageByPrefix(input, K.routePhysical.loss), weight: 0.1 },
    { value: averageByPrefix(input, K.routePhysical.movingTime), weight: 0.18 },
    { value: averageByPrefix(input, K.routePhysical.totalTime), weight: 0.08 },
    { value: averageByPrefix(input, K.routePhysical.altitude), weight: 0.12 },
    { value: averageByPrefix(input, K.routePhysical.gradient), weight: 0.06 },
    { value: averageByPrefix(input, K.routePhysical.steep), weight: 0.06 }
  ]);
  const technicalDemand = weightedAverage([
    { value: averageByPrefix(input, K.routeTechnical.technicality), weight: 0.18 },
    { value: averageByPrefix(input, K.routeTechnical.routeFinding), weight: 0.16 },
    { value: averageByPrefix(input, K.routeTechnical.scrambling), weight: 0.16 },
    { value: averageByPrefix(input, K.routeTechnical.exposure), weight: 0.16 },
    { value: averageByPrefix(input, K.routeTechnical.rockfall), weight: 0.08 },
    { value: averageByPrefix(input, K.routeTechnical.objectiveHazard), weight: 0.12 },
    { value: averageByPrefix(input, K.routeTechnical.consequence), weight: 0.1 },
    { value: 100 - averageByPrefix(input, K.routeTechnical.trailMarking), weight: 0.04 }
  ]);
  const environmentalDemand = weightedAverage([
    { value: averageByPrefix(input, K.weather.heat), weight: 0.08 },
    { value: averageByPrefix(input, K.weather.cold), weight: 0.08 },
    { value: averageByPrefix(input, K.weather.storm), weight: 0.16 },
    { value: averageByPrefix(input, K.weather.wind), weight: 0.12 },
    { value: averageByPrefix(input, K.weather.precipitation), weight: 0.1 },
    { value: averageByPrefix(input, K.weather.lightning), weight: 0.12 },
    { value: averageByPrefix(input, K.weather.visibility), weight: 0.1 },
    { value: averageByPrefix(input, K.weather.avalanche), weight: 0.1 },
    { value: averageByPrefix(input, K.weather.remoteness), weight: 0.14 }
  ]);
  const logisticsDemand = weightedAverage([
    { value: averageByPrefix(input, K.ops.bailout), weight: 0.16 },
    { value: 100 - averageByPrefix(input, K.ops.water), weight: 0.1 },
    { value: averageByPrefix(input, K.ops.daylight), weight: 0.1 },
    { value: averageByPrefix(input, K.ops.seasonality), weight: 0.08 },
    { value: averageByPrefix(input, K.ops.mandatoryGear), weight: 0.16 },
    { value: averageByPrefix(input, K.ops.access), weight: 0.08 },
    { value: averageByPrefix(input, K.ops.exit), weight: 0.08 },
    { value: 100 - averageByPrefix(input, K.ops.signal), weight: 0.06 },
    { value: averageByPrefix(input, K.ops.rescueDelay), weight: 0.08 },
    { value: averageByPrefix(input, K.ops.commitment), weight: 0.1 }
  ]);
  const physicalFit = ratioMatch(physicalCapacity, physicalDemand);
  const technicalFit = ratioMatch(technicalCapacity, technicalDemand);
  const environmentalFit = ratioMatch(environmentalCapacity, environmentalDemand);
  const logisticsFit = ratioMatch(logisticsCapacity, logisticsDemand);
  const resilienceFit = clamp(resilienceCapacity);
  const distanceMismatch = Math.max(0, averageByPrefix(input, K.routePhysical.distance) - physicalCapacity);
  const elevationMismatch = Math.max(0, averageByPrefix(input, K.routePhysical.gain) - physicalCapacity);
  const altitudeMismatch = Math.max(0, averageByPrefix(input, K.routePhysical.altitude) - get(input, "user_profile_altitude_tolerance_score"));
  const exposureMismatch = Math.max(0, averageByPrefix(input, K.routeTechnical.exposure) - get(input, "user_profile_exposure_tolerance_score"));
  const routeFindingMismatch = Math.max(0, averageByPrefix(input, K.routeTechnical.routeFinding) - averageByPrefix(input, K.userExperience.navigation));
  const weatherMismatch = Math.max(0, averageByPrefix(input, K.weather.storm) - averageByPrefix(input, K.userSkills.weather));
  const gearMismatch = Math.max(0, averageByPrefix(input, K.ops.mandatoryGear) - logisticsCapacity);
  const commitmentMismatch = Math.max(0, averageByPrefix(input, K.ops.commitment) - get(input, "user_profile_schedule_flexibility_score"));
  const fatigueRisk = weightedAverage([
    { value: averageByPrefix(input, K.userRecovery.fatigue), weight: 0.4 },
    { value: averageByPrefix(input, K.userRecovery.strain), weight: 0.25 },
    { value: 100 - averageByPrefix(input, K.userRecovery.sleep), weight: 0.2 },
    { value: 100 - averageByPrefix(input, K.userRecovery.recovery), weight: 0.15 }
  ]);
  const injuryRisk = weightedAverage([
    { value: averageByPrefix(input, K.userConstraints.knee), weight: 0.22 },
    { value: averageByPrefix(input, K.userConstraints.ankle), weight: 0.22 },
    { value: averageByPrefix(input, K.userConstraints.pain), weight: 0.2 },
    { value: averageByPrefix(input, K.userConstraints.health), weight: 0.18 },
    { value: averageByPrefix(input, K.userFitness.durability), weight: -0.18 }
  ]);
  const technicalRisk = weightedAverage([
    { value: averageByPrefix(input, K.routeTechnical.technicality), weight: 0.24 },
    { value: averageByPrefix(input, K.routeTechnical.scrambling), weight: 0.2 },
    { value: averageByPrefix(input, K.routeTechnical.exposure), weight: 0.2 },
    { value: averageByPrefix(input, K.routeTechnical.consequence), weight: 0.18 },
    { value: averageByPrefix(input, K.routeTechnical.routeFinding), weight: 0.18 }
  ]);
  const environmentalRisk = weightedAverage([
    { value: averageByPrefix(input, K.weather.storm), weight: 0.22 },
    { value: averageByPrefix(input, K.weather.wind), weight: 0.16 },
    { value: averageByPrefix(input, K.weather.lightning), weight: 0.22 },
    { value: averageByPrefix(input, K.weather.visibility), weight: 0.14 },
    { value: averageByPrefix(input, K.weather.avalanche), weight: 0.14 },
    { value: averageByPrefix(input, K.weather.remoteness), weight: 0.12 }
  ]);
  const logisticalRisk = weightedAverage([
    { value: averageByPrefix(input, K.ops.bailout), weight: 0.22 },
    { value: averageByPrefix(input, K.ops.commitment), weight: 0.2 },
    { value: averageByPrefix(input, K.ops.rescueDelay), weight: 0.18 },
    { value: 100 - averageByPrefix(input, K.ops.signal), weight: 0.16 },
    { value: averageByPrefix(input, K.ops.access), weight: 0.12 },
    { value: averageByPrefix(input, K.ops.exit), weight: 0.12 }
  ]);
  const weatherWindowRisk = weightedAverage([
    { value: averageByPrefix(input, K.weather.storm), weight: 0.25 },
    { value: averageByPrefix(input, K.weather.wind), weight: 0.2 },
    { value: averageByPrefix(input, K.weather.precipitation), weight: 0.15 },
    { value: averageByPrefix(input, K.weather.visibility), weight: 0.15 },
    { value: averageByPrefix(input, K.weather.lightning), weight: 0.25 }
  ]);
  const objectiveHazardRisk = weightedAverage([
    { value: averageByPrefix(input, K.routeTechnical.objectiveHazard), weight: 0.4 },
    { value: averageByPrefix(input, K.routeTechnical.rockfall), weight: 0.2 },
    { value: averageByPrefix(input, K.weather.avalanche), weight: 0.2 },
    { value: averageByPrefix(input, "route_surface_river_crossing_"), weight: 0.2 }
  ]);
  const decisionQualityRisk = 100 - weightedAverage([
    { value: get(input, "user_profile_decision_discipline_score"), weight: 0.3 },
    { value: averageByPrefix(input, K.userSkills.decisionMaking), weight: 0.3 },
    { value: averageByPrefix(input, K.userSkills.riskAssessment), weight: 0.2 },
    { value: averageByPrefix(input, K.userSkills.paceControl), weight: 0.2 }
  ]);
  const modelConfidence = avg([
    averageByPrefix(input, K.dataq.user),
    averageByPrefix(input, K.dataq.route),
    averageByPrefix(input, K.dataq.weather),
    averageByPrefix(input, K.dataq.map),
    averageByPrefix(input, K.dataq.hazard),
    averageByPrefix(input, K.dataq.history),
    averageByPrefix(input, K.dataq.gear)
  ]);
  return {
    derived_core_physical_capacity_score: round(physicalCapacity),
    derived_core_technical_capacity_score: round(technicalCapacity),
    derived_core_environmental_capacity_score: round(environmentalCapacity),
    derived_core_logistics_capacity_score: round(logisticsCapacity),
    derived_core_physical_demand_score: round(physicalDemand),
    derived_core_technical_demand_score: round(technicalDemand),
    derived_core_environmental_demand_score: round(environmentalDemand),
    derived_core_logistics_demand_score: round(logisticsDemand),
    derived_subscores_physical_fit_score: round(physicalFit),
    derived_subscores_technical_fit_score: round(technicalFit),
    derived_subscores_environmental_fit_score: round(environmentalFit),
    derived_subscores_logistics_fit_score: round(logisticsFit),
    derived_subscores_resilience_fit_score: round(resilienceFit),
    derived_mismatch_distance_mismatch: round(distanceMismatch),
    derived_mismatch_elevation_mismatch: round(elevationMismatch),
    derived_mismatch_altitude_mismatch: round(altitudeMismatch),
    derived_mismatch_exposure_mismatch: round(exposureMismatch),
    derived_mismatch_route_finding_mismatch: round(routeFindingMismatch),
    derived_mismatch_weather_mismatch: round(weatherMismatch),
    derived_mismatch_gear_mismatch: round(gearMismatch),
    derived_mismatch_commitment_mismatch: round(commitmentMismatch),
    derived_risk_fatigue_risk: round(clamp(fatigueRisk)),
    derived_risk_injury_risk: round(clamp(injuryRisk)),
    derived_risk_technical_risk: round(clamp(technicalRisk)),
    derived_risk_environmental_risk: round(clamp(environmentalRisk)),
    derived_risk_logistical_risk: round(clamp(logisticalRisk)),
    derived_risk_weather_window_risk: round(clamp(weatherWindowRisk)),
    derived_risk_objective_hazard_risk: round(clamp(objectiveHazardRisk)),
    derived_risk_decision_quality_risk: round(clamp(decisionQualityRisk)),
    derived_confidence_model_score: round(clamp(modelConfidence)),
    derived_confidence_user_score: round(clamp(averageByPrefix(input, K.dataq.user))),
    derived_confidence_route_score: round(clamp(averageByPrefix(input, K.dataq.route))),
    derived_confidence_weather_score: round(clamp(averageByPrefix(input, K.dataq.weather))),
    derived_confidence_gear_score: round(clamp(averageByPrefix(input, K.dataq.gear))),
    derived_confidence_history_score: round(clamp(averageByPrefix(input, K.dataq.history))),
    derived_confidence_data_reliability_score: round(clamp(modelConfidence))
  };
}
function calculateRouteReadiness847(input) {
  const derived = derive847(input);
  const subScores = {
    physical_fit: derived.derived_subscores_physical_fit_score ?? 0,
    technical_fit: derived.derived_subscores_technical_fit_score ?? 0,
    environmental_fit: derived.derived_subscores_environmental_fit_score ?? 0,
    logistics_fit: derived.derived_subscores_logistics_fit_score ?? 0,
    resilience_fit: derived.derived_subscores_resilience_fit_score ?? 0
  };
  const penalties = {
    fatigue_penalty: round(Math.max(0, (derived.derived_risk_fatigue_risk - 65) * 0.22)),
    injury_penalty: round(Math.max(0, (derived.derived_risk_injury_risk - 55) * 0.24)),
    technical_penalty: round(Math.max(0, (derived.derived_risk_technical_risk - 70) * 0.18)),
    environmental_penalty: round(Math.max(0, (derived.derived_risk_environmental_risk - 65) * 0.2)),
    logistical_penalty: round(Math.max(0, (derived.derived_risk_logistical_risk - 65) * 0.16)),
    mismatch_penalty: round(avg([
      derived.derived_mismatch_distance_mismatch ?? 0,
      derived.derived_mismatch_elevation_mismatch ?? 0,
      derived.derived_mismatch_altitude_mismatch ?? 0,
      derived.derived_mismatch_exposure_mismatch ?? 0,
      derived.derived_mismatch_route_finding_mismatch ?? 0,
      derived.derived_mismatch_weather_mismatch ?? 0,
      derived.derived_mismatch_gear_mismatch ?? 0,
      derived.derived_mismatch_commitment_mismatch ?? 0
    ]) * 0.18)
  };
  const hardStops = [];
  if (get(input, "user_profile_recent_illness_flag_score") >= 80)
    hardStops.push("recent_illness");
  if (get(input, "user_profile_medical_constraints_flag_score") >= 80)
    hardStops.push("medical_constraint");
  if (derived.derived_mismatch_exposure_mismatch >= 55 && averageByPrefix(input, K.userConstraints.vertigo) >= 60) {
    hardStops.push("exposure_vertigo_conflict");
  }
  if (averageByPrefix(input, K.weather.lightning) >= 85)
    hardStops.push("lightning_window");
  if (averageByPrefix(input, K.weather.avalanche) >= 80)
    hardStops.push("avalanche_window");
  if (derived.derived_mismatch_gear_mismatch >= 60)
    hardStops.push("mandatory_gear_gap");
  if (averageByPrefix(input, K.routeTechnical.objectiveHazard) >= 85 && averageByPrefix(input, K.userSkills.selfRescue) < 45) {
    hardStops.push("objective_hazard_self_rescue_gap");
  }
  const baseScore = weightedAverage([
    { value: subScores.physical_fit, weight: 0.28 },
    { value: subScores.technical_fit, weight: 0.24 },
    { value: subScores.environmental_fit, weight: 0.18 },
    { value: subScores.logistics_fit, weight: 0.16 },
    { value: subScores.resilience_fit, weight: 0.14 }
  ]);
  const totalPenalty = Object.values(penalties).reduce((sum, value) => sum + value, 0);
  const hardStopPenalty = hardStops.length * 12;
  const finalScore = round(clamp(baseScore - totalPenalty - hardStopPenalty));
  const confidence = round(derived.derived_confidence_model_score ?? 60);
  let band = "not_ready";
  let decision = "do_not_go";
  if (finalScore >= 78) {
    band = "strong";
    decision = "go";
  } else if (finalScore >= 60) {
    band = "good";
    decision = "go_with_caution";
  } else if (finalScore >= 40) {
    band = "caution";
    decision = "adapt_plan";
  }
  if (hardStops.length > 0) {
    decision = "do_not_go";
    if (finalScore >= 40)
      band = "caution";
  }
  const populatedVariables = VARIABLE_KEYS.filter((key) => typeof input[key] === "number").length;
  return {
    score: finalScore,
    band,
    decision,
    confidence,
    totalVariables: ROUTE_READINESS_VARIABLES.length,
    populatedVariables,
    subScores,
    penalties,
    hardStops,
    derived
  };
}
var demoInput = (() => {
  const d = createEmpty847Input(50);
  d.user_profile_general_resilience_score = 72;
  d.user_profile_decision_discipline_score = 76;
  d.user_profile_schedule_flexibility_score = 68;
  d.user_profile_heat_tolerance_score = 70;
  d.user_profile_cold_tolerance_score = 60;
  d.user_profile_altitude_tolerance_score = 58;
  d.user_profile_exposure_tolerance_score = 62;
  d.user_profile_recent_illness_flag_score = 0;
  d.user_profile_medical_constraints_flag_score = 0;
  d.user_fitness_aerobic_capacity_status = 78;
  d.user_fitness_muscular_endurance_status = 74;
  d.user_fitness_leg_strength_status = 71;
  d.user_fitness_uphill_efficiency_status = 73;
  d.user_fitness_downhill_tolerance_status = 66;
  d.user_fitness_mobility_status = 70;
  d.user_fitness_durability_status = 72;
  d.user_recovery_fatigue_status = 35;
  d.user_recovery_recovery_status = 70;
  d.user_recovery_sleep_status = 67;
  d.user_recovery_hrv_status = 63;
  d.user_recovery_strain_status = 42;
  d.user_constraints_knee_risk = 18;
  d.user_constraints_ankle_risk = 14;
  d.user_constraints_vertigo_risk = 28;
  d.user_constraints_pain_risk = 16;
  d.user_constraints_health_risk = 10;
  d.user_experience_hiking_experience = 85;
  d.user_experience_trekking_experience = 76;
  d.user_experience_scrambling_experience = 61;
  d.user_experience_navigation_experience = 64;
  d.user_experience_snow_experience = 40;
  d.user_experience_ice_experience = 28;
  d.user_experience_altitude_experience = 55;
  d.user_experience_multi_day_experience = 71;
  d.user_experience_bivouac_experience = 58;
  d.user_gear_footwear_readiness = 78;
  d.user_gear_layering_readiness = 72;
  d.user_gear_pack_readiness = 70;
  d.user_gear_hydration_readiness = 76;
  d.user_gear_nutrition_readiness = 71;
  d.user_gear_navigation_tools_readiness = 74;
  d.user_gear_emergency_kit_readiness = 68;
  d.user_gear_battery_system_readiness = 73;
  d.user_skills_weather_reading_skill = 64;
  d.user_skills_route_planning_skill = 70;
  d.user_skills_bailout_planning_skill = 66;
  d.user_skills_self_rescue_skill = 55;
  d.user_skills_pace_control_skill = 72;
  d.user_skills_risk_assessment_skill = 68;
  d.user_skills_decision_making_skill = 74;
  d.route_physical_distance_load = 63;
  d.route_physical_elevation_gain_load = 76;
  d.route_physical_elevation_loss_load = 64;
  d.route_physical_moving_time_load = 69;
  d.route_physical_total_time_load = 72;
  d.route_physical_max_altitude_load = 61;
  d.route_physical_avg_gradient_load = 58;
  d.route_physical_steepest_section_load = 62;
  d.route_technical_terrain_technicality_demand = 66;
  d.route_technical_route_finding_demand = 57;
  d.route_technical_scrambling_demand = 61;
  d.route_technical_exposure_demand = 54;
  d.route_technical_rockfall_demand = 35;
  d.route_technical_objective_hazard_demand = 48;
  d.route_technical_consequence_of_error_demand = 57;
  d.route_technical_trail_marking_demand = 45;
  d.weather_environment_heat_risk = 34;
  d.weather_environment_cold_risk = 41;
  d.weather_environment_storm_risk = 39;
  d.weather_environment_wind_risk = 46;
  d.weather_environment_precipitation_risk = 33;
  d.weather_environment_lightning_risk = 18;
  d.weather_environment_visibility_risk = 29;
  d.weather_environment_avalanche_risk = 5;
  d.weather_environment_remoteness_risk = 52;
  d.route_operations_bailout_difficulty = 57;
  d.route_operations_water_availability_difficulty = 38;
  d.route_operations_daylight_difficulty = 46;
  d.route_operations_seasonality_difficulty = 44;
  d.route_operations_mandatory_gear_difficulty = 58;
  d.route_operations_access_difficulty = 40;
  d.route_operations_exit_difficulty = 36;
  d.route_operations_signal_difficulty = 48;
  d.route_operations_rescue_delay_difficulty = 43;
  d.route_operations_commitment_difficulty = 53;
  d.history_context_similar_route_match = 70;
  d.history_context_similar_elevation_match = 66;
  d.history_context_similar_altitude_match = 58;
  d.history_context_similar_exposure_match = 61;
  d.history_context_similar_terrain_match = 64;
  d.history_context_recent_mountain_days_match = 69;
  d.history_context_recent_failures_match = 32;
  d.data_quality_user_data_confidence = 88;
  d.data_quality_route_data_confidence = 84;
  d.data_quality_weather_data_confidence = 81;
  d.data_quality_map_data_confidence = 79;
  d.data_quality_hazard_data_confidence = 74;
  d.data_quality_history_data_confidence = 76;
  d.data_quality_gear_data_confidence = 83;
  return d;
})();

// engine/readiness/adapters/userTo847Input.js
function userTo847Input(user = {}) {
  const input = createEmpty847Input(50);
  input.user_profile_general_resilience_score = Number(user.general_resilience_score ?? 55);
  input.user_profile_decision_discipline_score = Number(user.decision_discipline_score ?? 55);
  input.user_profile_schedule_flexibility_score = Number(user.schedule_flexibility_score ?? 55);
  input.user_profile_altitude_tolerance_score = Number(user.altitude_tolerance_score ?? 50);
  input.user_profile_exposure_tolerance_score = Number(user.exposure_tolerance_score ?? 50);
  input.user_fitness_aerobic_capacity_status = Number(user.aerobic_capacity_status ?? 55);
  input.user_fitness_muscular_endurance_status = Number(user.muscular_endurance_status ?? 52);
  input.user_fitness_leg_strength_status = Number(user.leg_strength_status ?? 52);
  input.user_skills_route_planning_skill = Number(user.route_planning_skill ?? 50);
  input.user_skills_risk_assessment_skill = Number(user.risk_assessment_skill ?? 50);
  input.user_skills_self_rescue_skill = Number(user.self_rescue_skill ?? 45);
  input.user_gear_footwear_readiness = Number(user.footwear_readiness ?? 55);
  input.user_gear_navigation_tools_readiness = Number(user.navigation_tools_readiness ?? 55);
  input.user_gear_emergency_kit_readiness = Number(user.emergency_kit_readiness ?? 50);
  input.user_profile_recent_illness_flag_score = Number(user.recent_illness_flag_score ?? 0);
  input.user_profile_medical_constraints_flag_score = Number(user.medical_constraints_flag_score ?? 0);
  input.user_recovery_fatigue_status = Number(user.recovery_fatigue_status ?? 45);
  input.user_recovery_sleep_status = Number(user.recovery_sleep_status ?? 55);
  input.user_recovery_recovery_status = Number(user.recovery_recovery_status ?? 55);
  input.data_quality_user_data_confidence = Number(user.data_quality_user_data_confidence ?? 65);
  input.data_quality_history_data_confidence = Number(user.data_quality_history_data_confidence ?? 55);
  input.data_quality_gear_data_confidence = Number(user.data_quality_gear_data_confidence ?? 60);
  return input;
}

// engine/readiness/adapters/merge847Input.js
function merge847Input(...inputs) {
  return Object.assign({}, ...inputs);
}

// engine/readiness/adapters/routeTo847Input.js
function clamp01To100(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num))
    return fallback;
  return Math.max(0, Math.min(100, num));
}
var DIFFICULTY_BASE = {
  F: 30,
  PD: 45,
  AD: 62,
  D: 78,
  ED: 88
};
function difficultyToDemand(route = {}) {
  const raw = String(route.dificultad || "").toUpperCase();
  if (raw.startsWith("PD"))
    return DIFFICULTY_BASE.PD;
  if (raw.startsWith("AD"))
    return DIFFICULTY_BASE.AD;
  if (raw.startsWith("D"))
    return DIFFICULTY_BASE.D;
  if (raw.startsWith("ED"))
    return DIFFICULTY_BASE.ED;
  if (raw.startsWith("F"))
    return DIFFICULTY_BASE.F;
  return 50;
}
function routeTo847Input(route = {}) {
  const input = createEmpty847Input(50);
  const altitude = clamp01To100((Number(route.altitud_m) || 0) / 80);
  const technicalDemand = difficultyToDemand(route);
  input.route_physical_max_altitude_load = altitude;
  input.route_physical_elevation_gain_load = clamp01To100((Number(route.desnivel_m) || Number(route.altitud_m) * 0.4 || 0) / 40);
  input.route_physical_distance_load = clamp01To100(Number(route.distancia_km) * 6 || 55);
  input.route_technical_terrain_technicality_demand = technicalDemand;
  input.route_technical_scrambling_demand = route.scramble?.si ? clamp01To100(technicalDemand + 8) : clamp01To100(technicalDemand - 8);
  input.route_technical_exposure_demand = clamp01To100(technicalDemand + (route.scramble?.grado ? 6 : 0));
  input.route_operations_mandatory_gear_difficulty = Array.isArray(route.botas) ? clamp01To100(35 + route.botas.length * 12) : 50;
  input.route_operations_commitment_difficulty = clamp01To100(route.tipo?.includes("Travesía") ? 68 : 52);
  input.weather_environment_storm_risk = 45;
  input.weather_environment_lightning_risk = 35;
  input.weather_environment_avalanche_risk = 20;
  input.data_quality_route_data_confidence = 75;
  input.data_quality_map_data_confidence = 72;
  input.data_quality_weather_data_confidence = 60;
  return input;
}

// engine/readiness/adapters/routeDemandTo847Input.js
function clamp01To1002(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num))
    return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}
function routeDemandTo847Input(routeDemand = {}) {
  const input = createEmpty847Input(50);
  const distanceKm = Number(routeDemand.physical?.distance) || 0;
  const gain = Number(routeDemand.physical?.elevation_gain) || 0;
  const loss = Number(routeDemand.physical?.elevation_loss) || 0;
  const durationHours = Number(routeDemand.physical?.duration_estimate) || 0;
  const maxAltitude = Number(routeDemand.environmental?.altitude?.max) || 0;
  const complexity = Number(routeDemand.technical?.terrain_complexity) || 50;
  const exposureScore = Number(routeDemand.technical?.exposure_score);
  const remoteness = Number(routeDemand.environmental?.remoteness) || 35;
  const commitment = Number(routeDemand.logistics?.commitment) || 45;
  const bailoutDifficulty = Number(routeDemand.logistics?.bailout_difficulty) || 45;
  const completeness = Number(routeDemand.confidence?.completeness) || 0;
  input.route_physical_distance_load = clamp01To1002(distanceKm * 5.5, 50);
  input.route_physical_elevation_gain_load = clamp01To1002(gain / 35, 48);
  input.route_physical_elevation_loss_load = clamp01To1002(loss / 35, 48);
  input.route_physical_moving_time_load = clamp01To1002(durationHours * 8, 50);
  input.route_physical_total_time_load = clamp01To1002(durationHours * 9, 50);
  input.route_physical_max_altitude_load = clamp01To1002(maxAltitude / 80, 40);
  input.route_physical_avg_gradient_load = clamp01To1002(gain / Math.max(distanceKm * 1000, 1) * 100 * 5, 40);
  input.route_technical_terrain_technicality_demand = clamp01To1002(complexity, 50);
  input.route_technical_route_finding_demand = clamp01To1002(complexity + 6, 55);
  input.route_technical_scrambling_demand = clamp01To1002(complexity + 8, 55);
  input.route_technical_exposure_demand = Number.isFinite(exposureScore) ? clamp01To1002(exposureScore, 52) : clamp01To1002(complexity + 4, 52);
  input.weather_environment_remoteness_risk = clamp01To1002(remoteness, 35);
  input.route_operations_commitment_difficulty = clamp01To1002(commitment, 45);
  input.route_operations_bailout_difficulty = clamp01To1002(bailoutDifficulty, 45);
  input.data_quality_route_data_confidence = clamp01To1002(72 + completeness * 24, 75);
  input.data_quality_map_data_confidence = clamp01To1002(65 + completeness * 20, 70);
  input.data_quality_weather_data_confidence = 58;
  return input;
}

// engine/readiness/adapters/readinessSourceTo847Input.js
function readinessSourceTo847Input(source) {
  if (!source || typeof source !== "object") {
    return routeTo847Input({});
  }
  if (source.sourceType === "gpx_track" && source.routeDemand) {
    return routeDemandTo847Input(source.routeDemand);
  }
  if (source.sourceType === "gpx_track") {
    return routeTo847Input(source.routeLike || {});
  }
  return routeTo847Input(source);
}

// engine/readiness/currentUserProfile.js
var STORAGE_KEY = "gountain.currentRefinementProfile.v1";
var MINIMAL_REFINEMENT_FIELDS = [
  "recent_elevation_capacity",
  "similar_route_experience",
  "exposure_tolerance",
  "multi_day_experience",
  "current_form",
  "gear_readiness"
];
var DEFAULT_MINIMAL_REFINEMENT_PROFILE = {
  recent_elevation_capacity: 50,
  similar_route_experience: 45,
  exposure_tolerance: 50,
  multi_day_experience: 40,
  current_form: 52,
  gear_readiness: 55
};
function clampProfileValue(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n))
    return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function getSafeLocalStorage() {
  if (typeof window === "undefined")
    return null;
  try {
    const storage = window.localStorage;
    const probe = "__gountain_refinement_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}
function sanitizeCurrentUserProfile(rawProfile = {}) {
  const sanitized = { ...DEFAULT_MINIMAL_REFINEMENT_PROFILE };
  Object.entries(DEFAULT_MINIMAL_REFINEMENT_PROFILE).forEach(([key, defaultValue]) => {
    sanitized[key] = clampProfileValue(rawProfile[key], defaultValue);
  });
  return sanitized;
}
function loadCurrentUserProfile() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_MINIMAL_REFINEMENT_PROFILE };
  }
  const fromWindow = sanitizeCurrentUserProfile(window.__CURRENT_USER_PROFILE__ || {});
  const storage = getSafeLocalStorage();
  if (!storage)
    return fromWindow;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw)
      return fromWindow;
    return sanitizeCurrentUserProfile(JSON.parse(raw));
  } catch {
    return fromWindow;
  }
}
function saveCurrentUserProfile(profile) {
  if (typeof window === "undefined")
    return;
  const sanitized = sanitizeCurrentUserProfile(profile);
  window.__CURRENT_USER_PROFILE__ = sanitized;
  const storage = getSafeLocalStorage();
  if (!storage)
    return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {}
}
function createUpdatedCurrentUserProfile(profile, key, value) {
  return sanitizeCurrentUserProfile({
    ...profile,
    [key]: value
  });
}
function toExpandedUserProfile(refinementProfile = {}) {
  const p = sanitizeCurrentUserProfile(refinementProfile);
  const fitness = p.current_form;
  const gear = p.gear_readiness;
  return {
    general_resilience_score: Math.round((fitness + p.multi_day_experience) / 2),
    decision_discipline_score: Math.round((p.similar_route_experience + p.exposure_tolerance) / 2),
    schedule_flexibility_score: Math.round((50 + p.multi_day_experience) / 2),
    altitude_tolerance_score: p.recent_elevation_capacity,
    exposure_tolerance_score: p.exposure_tolerance,
    aerobic_capacity_status: fitness,
    muscular_endurance_status: Math.round((fitness + p.multi_day_experience) / 2),
    leg_strength_status: Math.round((fitness + p.recent_elevation_capacity) / 2),
    route_planning_skill: p.similar_route_experience,
    risk_assessment_skill: Math.round((p.similar_route_experience + p.exposure_tolerance) / 2),
    self_rescue_skill: Math.round((p.similar_route_experience + p.current_form) / 2),
    footwear_readiness: gear,
    navigation_tools_readiness: gear,
    emergency_kit_readiness: Math.round((gear + p.multi_day_experience) / 2),
    recovery_fatigue_status: Math.round(100 - fitness),
    recovery_sleep_status: Math.round((fitness + 55) / 2),
    recovery_recovery_status: Math.round((fitness + p.multi_day_experience) / 2),
    data_quality_user_data_confidence: 65,
    data_quality_history_data_confidence: Math.round((p.similar_route_experience + 55) / 2),
    data_quality_gear_data_confidence: Math.round((gear + 60) / 2)
  };
}
function getRefinementCompletion(profile = {}) {
  const p = sanitizeCurrentUserProfile(profile);
  const changedFields = MINIMAL_REFINEMENT_FIELDS.filter((field) => p[field] !== DEFAULT_MINIMAL_REFINEMENT_PROFILE[field]);
  const changed = changedFields.length;
  return {
    changed,
    changedFields,
    total: MINIMAL_REFINEMENT_FIELDS.length,
    percent: Math.round(changed / MINIMAL_REFINEMENT_FIELDS.length * 100)
  };
}

// engine/readiness/readinessTransparency.js
var STATE_LABELS = {
  preliminary: "Preliminary estimate",
  partial: "Partially refined",
  strong: "Strongly personalized"
};
var KEY_REFINEMENT_FIELDS = [
  "current_form",
  "similar_route_experience",
  "recent_elevation_capacity",
  "gear_readiness"
];
function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n))
    return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function classifyReadinessState(completion = {}) {
  const changed = Number.isFinite(completion.changed) ? completion.changed : 0;
  const total = Number.isFinite(completion.total) && completion.total > 0 ? completion.total : 6;
  const percent = clampPercent(completion.percent ?? changed / total * 100);
  const changedFields = new Set(completion.changedFields || []);
  const keyCompleted = KEY_REFINEMENT_FIELDS.filter((field) => changedFields.has(field)).length;
  if (percent <= 17 || changed <= 1 && keyCompleted <= 1) {
    return {
      id: "preliminary",
      label: STATE_LABELS.preliminary,
      keyCompleted
    };
  }
  if (percent >= 67 && (changed >= 4 || keyCompleted >= 3)) {
    return {
      id: "strong",
      label: STATE_LABELS.strong,
      keyCompleted
    };
  }
  return {
    id: "partial",
    label: STATE_LABELS.partial,
    keyCompleted
  };
}
function calculateEstimateQuality(completion = {}) {
  const state = classifyReadinessState(completion);
  const coverage = clampPercent(completion.percent);
  const userShare = Math.round(coverage / 100 * 45);
  const routeShare = 40;
  const defaultShare = Math.max(0, 100 - routeShare - userShare);
  const byState = {
    preliminary: "Mostly route + defaults; personalize key fields before trusting fine-grained precision.",
    partial: "Route fit is personalized in places, but defaults still influence the estimate.",
    strong: "Meaningful user refinement is applied; estimate is now mostly route + your inputs."
  };
  return {
    state,
    coverage,
    sourceMix: {
      route: routeShare,
      user: userShare,
      defaults: defaultShare
    },
    qualityMessage: byState[state.id]
  };
}
function getConfidencePresentation(rawConfidence, completion = {}, context = {}) {
  const quality = calculateEstimateQuality(completion);
  const raw = clampPercent(rawConfidence);
  const caps = {
    preliminary: 62,
    partial: 76,
    strong: 92
  };
  const safeContext = context && typeof context === "object" ? context : {};
  const isGpxSource = safeContext.sourceType === "gpx_track";
  const gpxBonus = isGpxSource ? 4 : 0;
  const displayedConfidence = Math.min(raw, caps[quality.state.id] + gpxBonus);
  const detailByState = {
    preliminary: "Confidence is intentionally capped until more personalization is provided.",
    partial: "Confidence reflects mixed evidence from route facts and partial personalization.",
    strong: "Confidence can rise because key personalization inputs are now covered."
  };
  const gpxDetail = isGpxSource ? " GPX geometry improves route evidence quality versus static inferred route fields." : "";
  return {
    displayedConfidence,
    rawConfidence: raw,
    detail: `${detailByState[quality.state.id]}${gpxDetail}`
  };
}
function buildReadinessExplanation({ readiness, summary, estimateQuality, routeContext }) {
  const demands = readiness?.derived || {};
  const routeDifficulty = [
    ["Physical demand", demands.derived_core_physical_demand_score],
    ["Technical demand", demands.derived_core_technical_demand_score],
    ["Environmental demand", demands.derived_core_environmental_demand_score]
  ].filter(([, value]) => typeof value === "number").sort((a, b) => b[1] - a[1])[0];
  const highlights = routeContext?.routeDemand?.insights?.highlights || [];
  const technicalWhy = highlights.length ? highlights.slice(0, 2).join("; ") : "Technical demand is inferred from gradient profile, terrain transitions, and altitude context.";
  return {
    routeDriven: routeDifficulty ? `${routeDifficulty[0]} is currently the strongest route-driven limiter (${Math.round(routeDifficulty[1])}/100).` : "Route-driven difficulty is estimated from terrain, altitude, and route constraints.",
    technicalWhy,
    userGap: summary?.gaps?.length ? `Top user-specific gap: ${summary.gaps[0]}.` : "No major user-specific gaps are currently flagged.",
    uncertainty: estimateQuality.state.id === "strong" ? "Uncertainty is lower because most high-impact refinement inputs are no longer defaulted." : `Uncertainty remains meaningful: about ${estimateQuality.sourceMix.defaults}% of this estimate is still default/inferred.`
  };
}

// components/ReadinessRefinementForm.jsx
var REFINEMENT_FIELDS = [
  {
    key: "recent_elevation_capacity",
    label: "Recent elevation capacity",
    helper: "How well your body has recently handled sustained gain / altitude."
  },
  {
    key: "similar_route_experience",
    label: "Similar route experience",
    helper: "Hands-on recency with similar terrain and commitment."
  },
  {
    key: "exposure_tolerance",
    label: "Exposure tolerance",
    helper: "Comfort and control on airy sections."
  },
  {
    key: "multi_day_experience",
    label: "Multi-day experience",
    helper: "Experience sustaining performance across long efforts."
  },
  {
    key: "current_form",
    label: "Current form",
    helper: "Current fitness and freshness this week."
  },
  {
    key: "gear_readiness",
    label: "Gear readiness",
    helper: "Confidence in critical footwear/navigation/safety kit."
  }
];
function ReadinessRefinementForm({ profile, onChange, completion }) {
  return /* @__PURE__ */ React.createElement("details", {
    className: "readiness-refinement",
    "aria-live": "polite"
  }, /* @__PURE__ */ React.createElement("summary", {
    className: "readiness-refinement__summary-row"
  }, /* @__PURE__ */ React.createElement("span", null, "Refine estimate"), /* @__PURE__ */ React.createElement("strong", null, completion.percent, "% refined")), /* @__PURE__ */ React.createElement("p", {
    className: "readiness-refinement__hint"
  }, "Keep this secondary: adjust only high-impact fields to refine the decision score."), /* @__PURE__ */ React.createElement("div", {
    className: "readiness-refinement__fields"
  }, REFINEMENT_FIELDS.map((field) => {
    const value = Number(profile?.[field.key] ?? 0);
    return /* @__PURE__ */ React.createElement("label", {
      key: field.key,
      className: "readiness-refinement__field"
    }, /* @__PURE__ */ React.createElement("span", null, field.label), /* @__PURE__ */ React.createElement("small", null, field.helper), /* @__PURE__ */ React.createElement("div", {
      className: "readiness-refinement__inputs"
    }, /* @__PURE__ */ React.createElement("input", {
      type: "range",
      min: "0",
      max: "100",
      step: "1",
      value,
      onChange: (event) => onChange(field.key, event.target.value)
    }), /* @__PURE__ */ React.createElement("input", {
      type: "number",
      min: "0",
      max: "100",
      step: "1",
      value,
      onChange: (event) => onChange(field.key, event.target.value)
    })));
  })));
}

// components/RouteReadinessPanel.jsx
var PENALTY_LABELS = {
  fatigue_penalty: "Fatigue load exceeds current recovery",
  injury_penalty: "Injury risk is elevated for this plan",
  technical_penalty: "Technical route demand is above skills",
  environmental_penalty: "Weather / environment adds meaningful risk",
  logistical_penalty: "Logistics and route operations are limiting",
  mismatch_penalty: "Route-to-user mismatch across key demands"
};
var HARD_STOP_LABELS = {
  recent_illness: "Recent illness flag is too high",
  medical_constraint: "Medical constraints require plan deferral",
  exposure_vertigo_conflict: "Exposure and vertigo conflict is unsafe",
  lightning_window: "Lightning hazard window is currently critical",
  avalanche_window: "Avalanche hazard window is currently critical",
  mandatory_gear_gap: "Mandatory gear gap creates a hard stop",
  objective_hazard_self_rescue_gap: "Objective hazards exceed self-rescue margin"
};
function formatFallbackLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function summarize(result) {
  if (!result)
    return { sentence: "Readiness unavailable.", gaps: [] };
  const sentence = result.hardStops.length ? "Critical blockers detected. Do not proceed until hard stops are resolved." : result.score >= 70 ? "Preliminary readiness looks solid for this route." : result.score >= 50 ? "Preliminary readiness is moderate; refine assumptions below." : "Preliminary readiness is low; refine assumptions before deciding.";
  const sortedPenalties = Object.entries(result.penalties).sort((a, b) => b[1] - a[1]).filter(([, value]) => value > 0).slice(0, 3).map(([name]) => PENALTY_LABELS[name] || formatFallbackLabel(name));
  return { sentence, gaps: sortedPenalties };
}
function formatValue(value, fallback = "—") {
  if (value == null || value === "")
    return fallback;
  if (Array.isArray(value))
    return value.length ? value.join(", ") : fallback;
  return value;
}
function RouteReadinessPanel({
  destination,
  userProfile,
  onChangeUserProfile
}) {
  const expandedProfile = useMemo3(() => toExpandedUserProfile(userProfile || {}), [userProfile]);
  const readiness = useMemo3(() => {
    if (!destination)
      return null;
    const routeInput = readinessSourceTo847Input(destination);
    const userInput = userTo847Input(expandedProfile);
    const merged = merge847Input(routeInput, userInput);
    return calculateRouteReadiness847(merged);
  }, [destination, expandedProfile]);
  const completion = useMemo3(() => getRefinementCompletion(userProfile), [userProfile]);
  const estimateQuality = useMemo3(() => calculateEstimateQuality(completion), [completion]);
  const confidencePresentation = useMemo3(() => {
    if (!destination || !readiness) {
      return {
        displayedConfidence: 0,
        rawConfidence: 0,
        detail: "Confidence is unavailable until a route is selected."
      };
    }
    return getConfidencePresentation(readiness.confidence, completion, destination);
  }, [destination, readiness, completion]);
  useEffect(() => {
    if (!destination) {
      console.debug("[RouteReadinessPanel] destination prop is empty");
      return;
    }
    console.debug("[RouteReadinessPanel] destination prop received", destination);
  }, [destination]);
  useEffect(() => {
    if (!destination)
      return;
    console.debug("[RouteReadinessPanel] readiness result generated", readiness);
  }, [destination, readiness]);
  if (!destination) {
    return /* @__PURE__ */ React4.createElement("section", {
      className: "route-readiness",
      "aria-live": "polite"
    }, /* @__PURE__ */ React4.createElement("h3", null, "Selected route"), /* @__PURE__ */ React4.createElement("p", null, "Select a route to open the decision panel."));
  }
  if (!readiness) {
    return /* @__PURE__ */ React4.createElement("section", {
      className: "route-readiness",
      "aria-live": "polite"
    }, /* @__PURE__ */ React4.createElement("h3", null, "Selected route"), /* @__PURE__ */ React4.createElement("p", null, "Readiness data is not available for this route yet."));
  }
  const summary = summarize(readiness);
  const explanation = buildReadinessExplanation({
    readiness,
    summary,
    estimateQuality,
    routeContext: destination
  });
  const topSubscores = Object.entries(readiness.subScores).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return /* @__PURE__ */ React4.createElement("section", {
    className: "route-readiness",
    "aria-live": "polite"
  }, /* @__PURE__ */ React4.createElement("h3", null, "Selected route"), /* @__PURE__ */ React4.createElement("div", {
    className: "route-readiness__primary",
    "data-testid": "readiness-primary"
  }, /* @__PURE__ */ React4.createElement("h4", null, "Readiness decision"), /* @__PURE__ */ React4.createElement("div", {
    className: "route-readiness__metrics"
  }, /* @__PURE__ */ React4.createElement("span", null, "Score: ", /* @__PURE__ */ React4.createElement("strong", null, readiness.score)), /* @__PURE__ */ React4.createElement("span", null, "Band: ", /* @__PURE__ */ React4.createElement("strong", null, readiness.band)), /* @__PURE__ */ React4.createElement("span", null, "Decision: ", /* @__PURE__ */ React4.createElement("strong", null, readiness.decision)), /* @__PURE__ */ React4.createElement("span", null, "State: ", /* @__PURE__ */ React4.createElement("strong", null, estimateQuality.state.label)), /* @__PURE__ */ React4.createElement("span", null, "Confidence: ", /* @__PURE__ */ React4.createElement("strong", null, confidencePresentation.displayedConfidence))), /* @__PURE__ */ React4.createElement("p", {
    className: "route-readiness__summary"
  }, summary.sentence), /* @__PURE__ */ React4.createElement("p", {
    className: "route-readiness__quality-message"
  }, estimateQuality.qualityMessage), /* @__PURE__ */ React4.createElement("p", {
    className: "route-readiness__progressive-note"
  }, "Estimate starts from route demand and improves as you refine ", completion.changed, "/", completion.total, " high-impact fields."), /* @__PURE__ */ React4.createElement("div", {
    className: "route-readiness__source-mix"
  }, /* @__PURE__ */ React4.createElement("span", null, "Route data ", estimateQuality.sourceMix.route, "%"), /* @__PURE__ */ React4.createElement("span", null, "User inputs ", estimateQuality.sourceMix.user, "%"), /* @__PURE__ */ React4.createElement("span", null, "Estimated/default ", estimateQuality.sourceMix.defaults, "%")), /* @__PURE__ */ React4.createElement("p", {
    className: "route-readiness__confidence-note"
  }, "Confidence uses data coverage guardrails (", confidencePresentation.rawConfidence, " raw): ", confidencePresentation.detail)), /* @__PURE__ */ React4.createElement("div", {
    className: "route-readiness__route-info",
    "data-testid": "route-info"
  }, /* @__PURE__ */ React4.createElement("h4", null, formatValue(destination.name || destination.nombre)), /* @__PURE__ */ React4.createElement("dl", null, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Continent"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.continente))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Type"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.tipo))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Altitude"), /* @__PURE__ */ React4.createElement("dd", null, destination.altitud_m ? `${destination.altitud_m} m` : "—")), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Difficulty"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.dificultad))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Months"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.meses))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Boots"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.botas))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Gear"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.equipo))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("dt", null, "Logistics"), /* @__PURE__ */ React4.createElement("dd", null, formatValue(destination.logistica || destination.permisos || destination.guia))))), /* @__PURE__ */ React4.createElement("ul", {
    className: "route-readiness__subscores"
  }, topSubscores.map(([name, value]) => /* @__PURE__ */ React4.createElement("li", {
    key: name
  }, formatFallbackLabel(name), ": ", Math.round(value)))), summary.gaps.length > 0 ? /* @__PURE__ */ React4.createElement("ul", {
    className: "route-readiness__gaps"
  }, summary.gaps.map((gap) => /* @__PURE__ */ React4.createElement("li", {
    key: gap
  }, gap))) : /* @__PURE__ */ React4.createElement("p", {
    className: "route-readiness__gaps-empty"
  }, "No major limiting gaps detected."), /* @__PURE__ */ React4.createElement("div", {
    className: "route-readiness__explanation"
  }, /* @__PURE__ */ React4.createElement("strong", null, "Why this score looks like this"), /* @__PURE__ */ React4.createElement("ul", null, /* @__PURE__ */ React4.createElement("li", null, explanation.routeDriven), /* @__PURE__ */ React4.createElement("li", null, explanation.technicalWhy), /* @__PURE__ */ React4.createElement("li", null, explanation.userGap), /* @__PURE__ */ React4.createElement("li", null, explanation.uncertainty))), readiness.hardStops.length > 0 ? /* @__PURE__ */ React4.createElement("div", {
    className: "route-readiness__hardstops"
  }, /* @__PURE__ */ React4.createElement("strong", null, "Hard stops:"), /* @__PURE__ */ React4.createElement("ul", null, readiness.hardStops.map((stop) => /* @__PURE__ */ React4.createElement("li", {
    key: stop
  }, HARD_STOP_LABELS[stop] || formatFallbackLabel(stop))))) : null, /* @__PURE__ */ React4.createElement(ReadinessRefinementForm, {
    profile: userProfile,
    onChange: onChangeUserProfile,
    completion
  }));
}

// engine/gpx/parseGPX.js
var EARTH_RADIUS_M = 6371000;
function toRad(value) {
  return value * Math.PI / 180;
}
function haversineMeters(a, b) {
  if (!a || !b)
    return 0;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}
function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function classifySegments(points = []) {
  const segments = { flat: 0, moderate: 0, steep: 0 };
  for (let i = 1;i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    if (prev.ele == null || current.ele == null)
      continue;
    const distance = haversineMeters(prev, current);
    if (distance <= 0)
      continue;
    const gradient = Math.abs((current.ele - prev.ele) / distance * 100);
    if (gradient < 5)
      segments.flat += 1;
    else if (gradient < 12)
      segments.moderate += 1;
    else
      segments.steep += 1;
  }
  const total = segments.flat + segments.moderate + segments.steep;
  if (!total) {
    return {
      counts: segments,
      ratio: { flat: 0, moderate: 0, steep: 0 }
    };
  }
  return {
    counts: segments,
    ratio: {
      flat: Number((segments.flat / total).toFixed(3)),
      moderate: Number((segments.moderate / total).toFixed(3)),
      steep: Number((segments.steep / total).toFixed(3))
    }
  };
}
function extractPoints(gpxString) {
  const points = [];
  const trkPointRegex = /<trkpt\s+[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/gi;
  let match = trkPointRegex.exec(gpxString);
  while (match) {
    const lat = parseNumber(match[1]);
    const lon = parseNumber(match[2]);
    const body = match[3] || "";
    const eleMatch = body.match(/<ele>([^<]+)<\/ele>/i);
    const timeMatch = body.match(/<time>([^<]+)<\/time>/i);
    const ele = eleMatch ? parseNumber(eleMatch[1]) : null;
    if (lat != null && lon != null) {
      points.push({
        lat,
        lon,
        ele,
        time: timeMatch?.[1] || null
      });
    }
    match = trkPointRegex.exec(gpxString);
  }
  return points;
}
function estimateDurationHours(distanceKm, elevationGainM) {
  const flatKmPerHour = 4.5;
  const ascentMPerHour = 500;
  const flatHours = distanceKm / flatKmPerHour;
  const ascentHours = elevationGainM / ascentMPerHour;
  return Number((flatHours + ascentHours).toFixed(2));
}
async function loadGpxString(input) {
  if (!input) {
    throw new Error("GPX input is required");
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("<"))
      return trimmed;
    if (typeof window !== "undefined") {
      throw new Error("File paths are not supported in browser context");
    }
    const { readFile } = await import("node:fs/promises");
    const buffer = await readFile(input, "utf8");
    return buffer;
  }
  if (typeof Blob !== "undefined" && input instanceof Blob) {
    return input.text();
  }
  if (typeof input.text === "function") {
    return input.text();
  }
  throw new Error("Unsupported GPX input. Provide GPX XML string, file path, Blob, or File.");
}
async function parseGPX(input) {
  const gpxString = await loadGpxString(input);
  const points = extractPoints(gpxString);
  if (points.length < 2) {
    return {
      points,
      totalDistanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      altitudeProfile: { min: null, max: null },
      segmentation: classifySegments(points),
      durationEstimateHours: 0
    };
  }
  let totalDistanceM = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;
  let minAltitude = Infinity;
  let maxAltitude = -Infinity;
  for (let i = 1;i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    totalDistanceM += haversineMeters(prev, current);
    if (current.ele != null) {
      minAltitude = Math.min(minAltitude, current.ele);
      maxAltitude = Math.max(maxAltitude, current.ele);
    }
    if (prev.ele != null && current.ele != null) {
      const delta = current.ele - prev.ele;
      if (delta > 0)
        elevationGainM += delta;
      else
        elevationLossM += Math.abs(delta);
    }
  }
  if (points[0].ele != null) {
    minAltitude = Math.min(minAltitude, points[0].ele);
    maxAltitude = Math.max(maxAltitude, points[0].ele);
  }
  const totalDistanceKm = Number((totalDistanceM / 1000).toFixed(2));
  const gain = Math.round(elevationGainM);
  return {
    points,
    totalDistanceKm,
    elevationGainM: gain,
    elevationLossM: Math.round(elevationLossM),
    altitudeProfile: {
      min: Number.isFinite(minAltitude) ? Math.round(minAltitude) : null,
      max: Number.isFinite(maxAltitude) ? Math.round(maxAltitude) : null
    },
    segmentation: classifySegments(points),
    durationEstimateHours: estimateDurationHours(totalDistanceKm, gain)
  };
}

// engine/domain/routeDemandModel.js
var UNKNOWN = "unknown";
function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n))
    return 0;
  return Math.max(0, Math.min(1, n));
}
function createRouteDemandModel(overrides = {}) {
  return {
    physical: {
      distance: 0,
      elevation_gain: 0,
      elevation_loss: 0,
      duration_estimate: 0,
      ...overrides.physical || {}
    },
    technical: {
      terrain_complexity: 0,
      exposure: UNKNOWN,
      ...overrides.technical || {}
    },
    environmental: {
      altitude: { min: null, max: null },
      remoteness: 0,
      weather_exposure: UNKNOWN,
      ...overrides.environmental || {}
    },
    logistics: {
      commitment: 0,
      bailout_difficulty: 0,
      ...overrides.logistics || {}
    },
    confidence: {
      completeness: 0,
      source: "gpx",
      ...overrides.confidence || {}
    },
    insights: {
      terrain_model: "baseline",
      highlights: [],
      ...overrides.insights || {}
    }
  };
}
function normalizeRouteDemandConfidence(completenessRaw) {
  const bounded = clamp01(completenessRaw);
  return Number(bounded.toFixed(2));
}

// engine/gpx/gpxToRouteDemand.js
function clamp01To1003(value, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n))
    return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}
function inferTerrainComplexity(segmentation = {}) {
  const steepRatio = segmentation?.ratio?.steep || 0;
  const moderateRatio = segmentation?.ratio?.moderate || 0;
  return clamp01To1003(30 + steepRatio * 55 + moderateRatio * 25, 45);
}
function haversineMeters2(a, b) {
  if (!a || !b)
    return 0;
  const toRad2 = (v) => Number(v) * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad2((b.lat || 0) - (a.lat || 0));
  const dLon = toRad2((b.lon || 0) - (a.lon || 0));
  const lat1 = toRad2(a.lat || 0);
  const lat2 = toRad2(b.lat || 0);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function median(values = []) {
  if (!values.length)
    return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
function stddev(values = []) {
  if (!values.length)
    return 0;
  const avg2 = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - avg2) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
function classifyTerrainBand({ avgAbsGradient = 0, sustainedSteepRatio = 0, sharpDeltaRatio = 0, unevenness = 0 }) {
  const score = avgAbsGradient * 2.7 + sustainedSteepRatio * 34 + sharpDeltaRatio * 28 + unevenness * 22;
  if (score >= 80)
    return "very_high";
  if (score >= 58)
    return "high";
  if (score >= 36)
    return "moderate";
  return "low";
}
function splitIntoMeaningfulSegments(points = []) {
  if (points.length < 2)
    return [];
  const legs = [];
  for (let i = 1;i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const distanceM = haversineMeters2(a, b);
    if (!Number.isFinite(distanceM) || distanceM < 8)
      continue;
    if (!Number.isFinite(a.ele) || !Number.isFinite(b.ele))
      continue;
    const elevationDelta = b.ele - a.ele;
    const gradient = elevationDelta / distanceM * 100;
    legs.push({ distanceM, elevationDelta, gradient, absGradient: Math.abs(gradient) });
  }
  if (!legs.length)
    return [];
  const gradientValues = legs.map((leg) => leg.absGradient);
  const medianGradient = median(gradientValues);
  const transitionThreshold = Math.max(4, medianGradient * 0.85);
  const maxSegmentDistanceM = 700;
  const segments = [];
  let current = null;
  const finalize = () => {
    if (!current || current.legs.length < 1)
      return;
    const gradients = current.legs.map((leg) => leg.gradient);
    const absGradients = current.legs.map((leg) => leg.absGradient);
    const steepLegs = current.legs.filter((leg) => leg.absGradient >= 18).length;
    const sharpDeltas = gradients.slice(1).filter((g, idx) => Math.abs(g - gradients[idx]) >= 10).length;
    const sustainedClimbDistanceM = current.legs.filter((leg) => leg.gradient >= 12).reduce((sum, leg) => sum + leg.distanceM, 0);
    const sustainedSteepRatio = current.distanceM > 0 ? sustainedClimbDistanceM / current.distanceM : 0;
    const sharpDeltaRatio = current.legs.length > 1 ? sharpDeltas / (current.legs.length - 1) : 0;
    const unevenness = Math.min(1, stddev(absGradients) / 8);
    const avgAbsGradient = absGradients.reduce((sum, value) => sum + value, 0) / absGradients.length;
    const terrainBand = classifyTerrainBand({
      avgAbsGradient,
      sustainedSteepRatio,
      sharpDeltaRatio,
      unevenness
    });
    const technicalScore = clamp01To1003(24 + avgAbsGradient * 2.2 + sustainedSteepRatio * 30 + sharpDeltaRatio * 20 + unevenness * 18 + steepLegs / current.legs.length * 16, 45);
    segments.push({
      distance_km: Number((current.distanceM / 1000).toFixed(2)),
      elevation_gain_m: Math.max(0, Math.round(current.elevationDeltaM)),
      elevation_loss_m: Math.max(0, Math.round(-current.elevationDeltaM)),
      avg_abs_gradient: Number(avgAbsGradient.toFixed(2)),
      sustained_steep_ratio: Number(sustainedSteepRatio.toFixed(3)),
      sharp_transition_ratio: Number(sharpDeltaRatio.toFixed(3)),
      unevenness: Number(unevenness.toFixed(3)),
      terrain_band: terrainBand,
      technical_score: technicalScore
    });
  };
  legs.forEach((leg, index) => {
    if (!current) {
      current = { legs: [leg], distanceM: leg.distanceM, elevationDeltaM: leg.elevationDelta };
      return;
    }
    const prev = current.legs[current.legs.length - 1];
    const transition = Math.abs(leg.absGradient - prev.absGradient);
    const forceSplit = transition >= transitionThreshold || current.distanceM >= maxSegmentDistanceM;
    if (forceSplit) {
      finalize();
      current = { legs: [leg], distanceM: leg.distanceM, elevationDeltaM: leg.elevationDelta };
      return;
    }
    current.legs.push(leg);
    current.distanceM += leg.distanceM;
    current.elevationDeltaM += leg.elevationDelta;
    if (index === legs.length - 1)
      finalize();
  });
  if (current && segments.length === 0) {
    finalize();
  }
  return segments;
}
function classifyExposure({ gradientScore = 0, altitudeMax = 0, transitionRisk = 0, terrainScore = 0 }) {
  const score = clamp01To1003(gradientScore * 0.42 + Math.min(100, altitudeMax / 45) * 0.22 + transitionRisk * 0.16 + terrainScore * 0.2, 40);
  const level = score >= 66 ? "high" : score >= 42 ? "medium" : "low";
  return { score, level };
}
function deriveTechnicalFromSegments(gpxData = {}) {
  const segments = splitIntoMeaningfulSegments(gpxData.points || []);
  if (!segments.length) {
    return {
      segments: [],
      terrainComplexity: inferTerrainComplexity(gpxData.segmentation),
      exposure: { score: 38, level: "low" },
      highlights: []
    };
  }
  const totalDistanceKm = segments.reduce((sum, segment) => sum + segment.distance_km, 0) || 1;
  const weightedTerrain = segments.reduce((sum, segment) => sum + segment.technical_score * (segment.distance_km / totalDistanceKm), 0);
  const transitionRisk = clamp01To1003(segments.reduce((sum, s) => sum + s.sharp_transition_ratio, 0) / segments.length * 100, 35);
  const gradientScore = clamp01To1003(segments.reduce((sum, s) => sum + s.avg_abs_gradient, 0) / segments.length * 5.2, 40);
  const altitudeMax = Number(gpxData.altitudeProfile?.max) || 0;
  const exposure = classifyExposure({
    gradientScore,
    altitudeMax,
    transitionRisk,
    terrainScore: weightedTerrain
  });
  const highSegments = segments.filter((segment) => segment.technical_score >= 68).length;
  const veryHighSegments = segments.filter((segment) => segment.terrain_band === "very_high").length;
  const highlights = [];
  if (highSegments > 0)
    highlights.push(`${highSegments} segment(s) show sustained steep technical load`);
  if (veryHighSegments > 0)
    highlights.push(`${veryHighSegments} segment(s) have very high terrain variability`);
  if (exposure.level !== "low")
    highlights.push(`Exposure estimated as ${exposure.level} due to gradient + altitude transitions`);
  return {
    segments,
    terrainComplexity: clamp01To1003(weightedTerrain, 45),
    exposure,
    highlights
  };
}
function inferRemoteness(distanceKm = 0) {
  return clamp01To1003(25 + distanceKm * 2.1, 30);
}
function inferCommitment(distanceKm = 0, durationEstimate = 0) {
  return clamp01To1003(20 + distanceKm * 1.7 + durationEstimate * 3.2, 35);
}
function inferBailoutDifficulty(segmentation = {}, elevationGain = 0) {
  const steepFactor = (segmentation?.ratio?.steep || 0) * 40;
  const elevationFactor = Math.min(30, elevationGain / 50);
  return clamp01To1003(25 + steepFactor + elevationFactor, 38);
}
function gpxToRouteDemand(gpxData = {}) {
  const hasDistance = Number.isFinite(gpxData.totalDistanceKm);
  const hasGain = Number.isFinite(gpxData.elevationGainM);
  const hasLoss = Number.isFinite(gpxData.elevationLossM);
  const hasAltitude = Number.isFinite(gpxData.altitudeProfile?.max) || Number.isFinite(gpxData.altitudeProfile?.min);
  const hasSegmentation = Boolean(gpxData.segmentation);
  const observed = [hasDistance, hasGain, hasLoss, hasAltitude, hasSegmentation].filter(Boolean).length;
  const completeness = normalizeRouteDemandConfidence(observed / 5);
  const distance = hasDistance ? Number(gpxData.totalDistanceKm.toFixed(2)) : 0;
  const elevationGain = hasGain ? Math.round(gpxData.elevationGainM) : 0;
  const elevationLoss = hasLoss ? Math.round(gpxData.elevationLossM) : 0;
  const durationEstimate = Number.isFinite(gpxData.durationEstimateHours) ? Number(gpxData.durationEstimateHours.toFixed(2)) : Number((distance / 4.5 + elevationGain / 500).toFixed(2));
  const technicalModel = deriveTechnicalFromSegments(gpxData);
  return createRouteDemandModel({
    physical: {
      distance,
      elevation_gain: elevationGain,
      elevation_loss: elevationLoss,
      duration_estimate: durationEstimate
    },
    technical: {
      terrain_complexity: technicalModel.terrainComplexity,
      exposure: technicalModel.exposure.level,
      exposure_score: technicalModel.exposure.score,
      route_segments: technicalModel.segments
    },
    environmental: {
      altitude: {
        min: Number.isFinite(gpxData.altitudeProfile?.min) ? gpxData.altitudeProfile.min : null,
        max: Number.isFinite(gpxData.altitudeProfile?.max) ? gpxData.altitudeProfile.max : null
      },
      remoteness: inferRemoteness(distance),
      weather_exposure: "unknown"
    },
    logistics: {
      commitment: inferCommitment(distance, durationEstimate),
      bailout_difficulty: inferBailoutDifficulty(gpxData.segmentation, elevationGain)
    },
    confidence: {
      completeness,
      source: "gpx"
    },
    insights: {
      terrain_model: "phase5_heuristic_segmentation",
      highlights: technicalModel.highlights
    }
  });
}

// App.jsx
var EVENT_NAME = "gountain:destinations-updated";
var SELECT_EVENT = "gountain:destination-selected";
var getWindowDestinations = () => {
  if (typeof window === "undefined")
    return [];
  return Array.isArray(window.__AVAILABLE_DESTINATIONS__) ? window.__AVAILABLE_DESTINATIONS__ : [];
};
var normalizeDestinationName = (destination) => {
  if (!destination)
    return destination;
  return {
    ...destination,
    name: destination.name || destination.nombre || ""
  };
};
function App({ destinations = [], onSelectDestination }) {
  const [availableDestinations, setAvailableDestinations] = useState3(() => {
    const fromWindow = getWindowDestinations();
    return fromWindow.length ? fromWindow : destinations;
  });
  const [selectedDestination, setSelectedDestination] = useState3(null);
  const [userProfile, setUserProfile] = useState3(() => loadCurrentUserProfile());
  const [gpxError, setGpxError] = useState3("");
  const [gpxStatus, setGpxStatus] = useState3("");
  const gpxInputRef = useRef(null);
  useEffect2(() => {
    if (destinations.length) {
      setAvailableDestinations(destinations);
    }
  }, [destinations]);
  useEffect2(() => {
    const handleUpdate = (event) => {
      const next = Array.isArray(event.detail) ? event.detail : [];
      setAvailableDestinations(next.map(normalizeDestinationName));
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);
  useEffect2(() => {
    const onDestinationSelected = (event) => {
      setSelectedDestination(normalizeDestinationName(event.detail));
    };
    window.addEventListener(SELECT_EVENT, onDestinationSelected);
    return () => window.removeEventListener(SELECT_EVENT, onDestinationSelected);
  }, []);
  useEffect2(() => {
    if (typeof window === "undefined")
      return;
    if (!selectedDestination) {
      console.debug("[RouteReadiness] selectedDestination cleared");
      return;
    }
    console.debug("[RouteReadiness] selectedDestination updated", selectedDestination);
  }, [selectedDestination]);
  useEffect2(() => {
    saveCurrentUserProfile(userProfile);
  }, [userProfile]);
  const sanitizedDestinations = useMemo4(() => availableDestinations.map(normalizeDestinationName).filter((destination) => destination && destination.name), [availableDestinations]);
  const handleSelect = (destination) => {
    const normalized = normalizeDestinationName(destination);
    setSelectedDestination(normalized);
    onSelectDestination?.(normalized);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: normalized }));
    }
  };
  const handleProfileChange = (key, value) => {
    setUserProfile((current) => createUpdatedCurrentUserProfile(current, key, value));
  };
  const handleGPXUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file)
      return;
    try {
      setGpxError("");
      setGpxStatus(`Processing ${file.name}...`);
      const parsed = await parseGPX(file);
      const routeDemand = gpxToRouteDemand(parsed);
      const gpxDestination = {
        id: `gpx-${Date.now()}`,
        sourceType: "gpx_track",
        name: `GPX: ${file.name}`,
        nombre: `GPX: ${file.name}`,
        routeDemand,
        gpxMetrics: parsed,
        altitud_m: parsed.altitudeProfile?.max || null,
        distancia_km: parsed.totalDistanceKm,
        desnivel_m: parsed.elevationGainM,
        tipo: "GPX import",
        dificultad: "Auto-estimated",
        meses: "Unknown",
        botas: [],
        equipo: []
      };
      setSelectedDestination(gpxDestination);
      onSelectDestination?.(gpxDestination);
      setGpxStatus(`Loaded ${file.name}`);
    } catch (error) {
      console.error("[RouteReadiness] failed to parse GPX", error);
      setGpxError("Could not parse GPX file. Please upload a valid GPX track.");
      setGpxStatus("");
    } finally {
      event.target.value = "";
    }
  };
  return /* @__PURE__ */ React5.createElement("div", {
    className: "app-ui"
  }, /* @__PURE__ */ React5.createElement("div", {
    className: "app-ui__search"
  }, /* @__PURE__ */ React5.createElement(SearchBar, {
    destinations: sanitizedDestinations,
    onSelect: handleSelect,
    showActionIcon: true
  }), /* @__PURE__ */ React5.createElement("div", {
    className: "app-ui__gpx-upload",
    role: "group",
    "aria-label": "Analyze GPX route"
  }, /* @__PURE__ */ React5.createElement("input", {
    id: "gpx-upload-input",
    className: "app-ui__gpx-input",
    type: "file",
    ref: gpxInputRef,
    accept: ".gpx,application/gpx+xml,application/xml,text/xml",
    onChange: handleGPXUpload,
    "aria-describedby": "gpx-upload-help"
  }), /* @__PURE__ */ React5.createElement("button", {
    type: "button",
    className: "app-ui__gpx-trigger",
    onClick: () => gpxInputRef.current?.click(),
    "aria-controls": "gpx-upload-input"
  }, "Upload GPX"), /* @__PURE__ */ React5.createElement("span", {
    id: "gpx-upload-help",
    className: "app-ui__gpx-help"
  }, "Upload or analyze a .gpx track file"), gpxStatus ? /* @__PURE__ */ React5.createElement("p", {
    className: "app-ui__gpx-status",
    "aria-live": "polite"
  }, gpxStatus) : null, gpxError ? /* @__PURE__ */ React5.createElement("p", {
    className: "app-ui__gpx-error"
  }, gpxError) : null)), /* @__PURE__ */ React5.createElement("div", {
    className: "app-ui__route-panel"
  }, /* @__PURE__ */ React5.createElement(RouteReadinessPanel, {
    destination: selectedDestination,
    userProfile,
    onChangeUserProfile: handleProfileChange
  })), /* @__PURE__ */ React5.createElement(BottomNavigation, {
    initialActiveId: "search"
  }));
}

// main.jsx
var rootElement = document.getElementById("react-ui");
if (rootElement) {
  rootElement.dataset.reactUiMount = "starting";
  try {
    const root = createRoot(rootElement);
    root.render(/* @__PURE__ */ React6.createElement(App, null));
    rootElement.dataset.reactUiMount = "mounted";
  } catch (error) {
    rootElement.dataset.reactUiMount = "error";
    rootElement.innerHTML = `
      <div class="app-ui-debug">
        React UI failed to mount. Check console for details.
      </div>
    `;
    console.error("[React UI] mount failed", error);
  }
}
