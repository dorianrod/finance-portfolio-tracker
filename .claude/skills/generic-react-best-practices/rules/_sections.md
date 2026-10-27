# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.
A rule's impact can never exceed the impact of its section (enforced by `scripts/build.mjs`).

---

## 1. Architecture & Boundaries (arch)

**Impact:** CRITICAL  
**Description:** A domain-first layout, vertical feature slices and strict import boundaries keep capabilities cohesive, prevent circular dependencies and make every file's ownership and responsibility obvious from its location.

## 2. API Hooks & Server State (api)

**Impact:** CRITICAL  
**Description:** All HTTP access goes through typed query/mutation hooks, with schema validation on input and output, Suspense/error boundaries around them and explicit handling of API errors. Getting this layer right guarantees typed, validated data everywhere else.

## 3. Security (security)

**Impact:** CRITICAL  
**Description:** Session isolation, protected file access and safe external navigation. Mistakes here leak data across users or expose the authenticated tab.

## 4. Query Keys & Cache (cache)

**Impact:** HIGH  
**Description:** One query key convention per domain and precise invalidation avoid stale screens after mutations.

## 5. Domain Types (types)

**Impact:** HIGH  
**Description:** Strict domain entities (real dates, literal unions, explicit nullability) decouple the UI from the raw API shape and remove defensive code downstream.

## 6. Yup Schemas (yup)

**Impact:** HIGH  
**Description:** Yup schemas are the single coercion barrier between the API and the domain, and the source of translated form validation. They must be tolerant where data is legacy and strict where logic depends on it.

## 7. UI Composition & Accessibility (ui)

**Impact:** HIGH  
**Description:** Structural expectations of compound components, dialogs, forms and styling. Breaking them causes silent layout bugs, lost form values or inaccessible controls.

## 8. Jotai Client State (state)

**Impact:** MEDIUM-HIGH  
**Description:** Jotai holds client-only shared state (filters, selection, edit modes, tabs). Reusable factories, explicit names and correct locations keep stores predictable and free of circular imports.

## 9. Helpers (helpers)

**Impact:** MEDIUM-HIGH  
**Description:** Explicit helper categories separate selection, aggregation, calculation, mapping, presentation, validation and business decisions so each function has predictable ownership and dependencies.

## 10. Internationalization (i18n)

**Impact:** MEDIUM-HIGH  
**Description:** Every user-facing string goes through react-i18next with static, analyzable keys so that tooling can detect missing or unused keys.

## 11. Testing (test)

**Impact:** MEDIUM-HIGH  
**Description:** Jest + React Testing Library tests exercise visible behavior through the real hook stack, stubbing only the network boundary, which makes them robust to refactors.

## 12. Code Quality (quality)

**Impact:** HIGH
**Description:** Conventions that keep the codebase consistent and reviewable, beyond what ESLint and TypeScript already enforce.
