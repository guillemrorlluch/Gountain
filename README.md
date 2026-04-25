# Gountain

Gountain is an interactive outdoor platform for exploring mountain routes and peaks through a map-based interface, smart filters, and gear-aware insights.

Built for hikers, trekkers, and mountain athletes who want to move beyond discovery and make better decisions in the mountains.

---

## What it does

- Explore routes and peaks on an interactive Mapbox-based interface  
- Filter by elevation, terrain type, difficulty, and seasonality  
- Access structured route data (distance, gain, altitude, exposure)  
- Get contextual gear guidance (e.g. boot category per terrain)  
- Evaluate route suitability through a readiness-oriented system  

---

## Product Approach

Gountain is not a route directory.

It is being developed as a **decision-support layer for mountain activities**, combining:

- Route demand signals (terrain, elevation, exposure, conditions)  
- User-side inputs (experience, capacity, equipment)  
- A structured evaluation system that highlights gaps and constraints  

The goal is to reduce miscalibrated decisions in the mountains and provide a clearer path for progression.

---

## Tech

- **Frontend**: React (Vercel deployment)  
- **Mapping**: Mapbox GL JS (custom layers, clustering, terrain)  
- **Data Layer**: Structured JSON → evolving toward database-backed system  
- **Architecture (in progress)**:
  - Scoring / evaluation engine  
  - Modular data model for routes and user profiles  
  - API layer for dynamic computation  

---

## Status

In active development.

Core UX and map system are implemented.  
Evaluation logic and data architecture are being iterated.

---

## Note

This repository represents an early-stage version of the product.  
Core logic, scoring models, and advanced evaluation systems are not publicly exposed.