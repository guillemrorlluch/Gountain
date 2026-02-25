"use strict";
(() => {
  // widget-src/code.tsx
  var { widget } = figma;
  var { AutoLayout, Text, SVG, useSyncedState } = widget;
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
  function computeReadiness(route, user) {
    const gateFailures = [];
    if (route.exposure >= 8 && user.skill <= 5) {
      gateFailures.push("High exposure / insufficient skill");
    }
    if (route.weather >= 8 && user.gear <= 6) {
      gateFailures.push("Severe weather / gear insufficient");
    }
    if (route.elevLoad >= 8 && user.fitness <= 5) {
      gateFailures.push("Elevation load exceeds fitness");
    }
    const routeDemand = 0.25 * route.difficulty + 0.25 * route.elevLoad + 0.15 * route.distLoad + 0.2 * route.exposure + 0.15 * route.weather;
    const userCapacity = 0.3 * user.fitness + 0.25 * user.skill + 0.15 * user.experience + 0.2 * user.gear + 0.1 * user.recovery;
    const margin = userCapacity - routeDemand;
    let score = clamp(Math.round(50 + margin * 10), 0, 100);
    if (user.recovery <= 3) score -= 10;
    if (route.weather >= 7) score -= 5;
    score = clamp(score, 0, 100);
    let state = "BORDERLINE";
    if (gateFailures.length > 0) {
      state = "NOT RECOMMENDED";
    } else if (score >= 70) {
      state = "READY";
    } else if (score < 50) {
      state = "NOT RECOMMENDED";
    }
    const recs = [];
    if (user.fitness < route.elevLoad) recs.push("Reduce elevation or improve aerobic base");
    if (user.skill < route.difficulty) recs.push("Choose less technical terrain");
    if (user.gear < route.weather) recs.push("Upgrade weather protection layers");
    if (user.recovery < 5) recs.push("Prioritize recovery before attempt");
    return {
      score,
      state,
      gateFailures,
      recs: recs.slice(0, 3)
    };
  }
  function stateColor(state) {
    if (state === "READY") return "#1B5E20";
    if (state === "NOT RECOMMENDED") return "#B71C1C";
    return "#E65100";
  }
  function iconButtonSvg(kind) {
    if (kind === "minus") {
      return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="21" height="21" rx="11" fill="#111923" stroke="#2A3645"/>
      <rect x="6" y="10.125" width="10" height="1.75" rx="0.875" fill="#E6EDF3"/>
    </svg>`;
    }
    return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="21" height="21" rx="11" fill="#111923" stroke="#2A3645"/>
    <path d="M10.125 6H11.875V10.125H16V11.875H11.875V16H10.125V11.875H6V10.125H10.125V6Z" fill="#E6EDF3"/>
  </svg>`;
  }
  function StepperControl({ label, value, setValue }) {
    const safeValue = clamp(value, 0, 10);
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 4, width: "fill-parent" }, /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "horizontal", spacing: 8, width: "fill-parent" }, /* @__PURE__ */ figma.widget.h(Text, { fill: "#E6EDF3", fontSize: 12, width: 240 }, label), /* @__PURE__ */ figma.widget.h(Text, { fill: "#9FB3C8", fontSize: 12, width: 44, horizontalAlignText: "right" }, safeValue, "/10")), /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "horizontal", spacing: 8, verticalAlignItems: "center", width: "fill-parent" }, /* @__PURE__ */ figma.widget.h(
      SVG,
      {
        src: iconButtonSvg("minus"),
        onClick: () => {
          setValue(clamp(safeValue - 1, 0, 10));
        }
      }
    ), /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "horizontal", spacing: 3, padding: 0 }, Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        key: `${label}-${i}`,
        width: 20,
        height: 6,
        cornerRadius: 999,
        fill: i < safeValue ? "#4FC3F7" : "#273241"
      }
    ))), /* @__PURE__ */ figma.widget.h(
      SVG,
      {
        src: iconButtonSvg("plus"),
        onClick: () => {
          setValue(clamp(safeValue + 1, 0, 10));
        }
      }
    )));
  }
  function Widget() {
    const [difficulty, setDifficulty] = useSyncedState("difficulty", 6);
    const [elevLoad, setElevLoad] = useSyncedState("elevLoad", 6);
    const [distLoad, setDistLoad] = useSyncedState("distLoad", 5);
    const [exposure, setExposure] = useSyncedState("exposure", 4);
    const [weather, setWeather] = useSyncedState("weather", 4);
    const [fitness, setFitness] = useSyncedState("fitness", 6);
    const [skill, setSkill] = useSyncedState("skill", 6);
    const [experience, setExperience] = useSyncedState("experience", 5);
    const [gear, setGear] = useSyncedState("gear", 6);
    const [recovery, setRecovery] = useSyncedState("recovery", 6);
    const result = computeReadiness(
      { difficulty, elevLoad, distLoad, exposure, weather },
      { fitness, skill, experience, gear, recovery }
    );
    return /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        direction: "vertical",
        spacing: 12,
        padding: 16,
        width: 380,
        fill: "#0B0F14",
        cornerRadius: 12
      },
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 18, fill: "#FFFFFF", fontWeight: 700 }, "Gountain - Route Readiness"),
      /* @__PURE__ */ figma.widget.h(AutoLayout, { padding: 8, cornerRadius: 999, fill: stateColor(result.state) }, /* @__PURE__ */ figma.widget.h(Text, { fill: "#FFFFFF", fontSize: 12, fontWeight: 700 }, result.state)),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 32, fill: "#FFFFFF", fontWeight: 700 }, result.score),
      /* @__PURE__ */ figma.widget.h(Text, { fill: "#9FB3C8", fontSize: 12 }, "Route Demand"),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Difficulty", value: difficulty, setValue: setDifficulty }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Elevation Load", value: elevLoad, setValue: setElevLoad }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Distance Load", value: distLoad, setValue: setDistLoad }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Exposure", value: exposure, setValue: setExposure }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Weather", value: weather, setValue: setWeather }),
      /* @__PURE__ */ figma.widget.h(Text, { fill: "#9FB3C8", fontSize: 12 }, "User Readiness"),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Fitness", value: fitness, setValue: setFitness }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Skill", value: skill, setValue: setSkill }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Experience", value: experience, setValue: setExperience }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Gear", value: gear, setValue: setGear }),
      /* @__PURE__ */ figma.widget.h(StepperControl, { label: "Recovery", value: recovery, setValue: setRecovery }),
      result.gateFailures.length > 0 && /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 4 }, /* @__PURE__ */ figma.widget.h(Text, { fill: "#FF6B6B", fontSize: 12 }, "Gate Failures"), result.gateFailures.map((failure, i) => /* @__PURE__ */ figma.widget.h(Text, { key: `gate-${i}`, fill: "#FF6B6B", fontSize: 12 }, `${i + 1}. ${failure}`))),
      result.recs.length > 0 && /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 4 }, /* @__PURE__ */ figma.widget.h(Text, { fill: "#9FB3C8", fontSize: 12 }, "Recommendations"), result.recs.map((rec, i) => /* @__PURE__ */ figma.widget.h(Text, { key: `rec-${i}`, fill: "#FFFFFF", fontSize: 12 }, `${i + 1}. ${rec}`)))
    );
  }
  widget.register(Widget);
})();
