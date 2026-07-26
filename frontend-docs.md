# ERP React — Frontend Documentation

---

## Section 1: Running the Project

### Prerequisites

- **Node.js** v18 or later
- **npm** (ships with Node.js)

### Setup

```bash
npm install
```

### Environment

Create a `.env` file at the project root:

```env
VITE_PUBLIC_API_URL=https://stage-erp-api.marka-tech.com/api/v1
```

All API calls go directly to this URL — no dev proxy is configured.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then production build (`vite build`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

The dev server runs on `http://localhost:5173` by default.

### Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling (utility-first) |
| react-router-dom v7 | Routing |
| react-hook-form + zod | Form state & validation |
| lucide-react | Icons |
| sonner | Toast notifications |
| Vite | Build tool & dev server |

---

## Section 2: Project Architecture & Folder Structure

The project follows **Domain-Driven Design (DDD) / Clean Architecture** with a **modular monolith** structure. Code is split into two top-level directories under `src/`:

- **`core/`** — Shared cross-cutting code (API client, auth, generic CRUD, UI primitives, registry)
- **`modules/`** — Feature modules, each containing its own domain, application, infrastructure, and presentation layers

### High-Level Structure

```
src/
├── core/
│   ├── domain/           # Interfaces, entity types, value objects
│   │   ├── common/
│   │   │   ├── api/ApiClient.ts
│   │   │   ├── responce/DomainResponse.ts
│   │   │   └── errors/ApiError.ts
│   │   └── repositories/ICrudRepository.ts
│   ├── application/
│   │   └── usecases/manageEntityUsecase.ts
│   ├── infrastructure/
│   │   ├── api/fetchApiClient.ts
│   │   ├── auth/ (AuthProvider, authStorage, ProtectedRoute)
│   │   └── repositories/CrudRepository.ts
│   ├── presentation/
│   │   ├── context/ (Theme, Language, Sidebar, ApiClient)
│   │   ├── layouts/ (LayoutSwitcher, Sidebar, dashboard)
│   │   ├── hooks/data/ (useEntity, useNestedEntityCrud)
│   │   └── ui/ (Button, Dialog, inputs, pickers, filters, Spinner)
│   ├── registry/
│   │   ├── storage/ (storageRegistry.ts, StorageProvider.tsx)
│   │   ├── hr/ (hrRegistry.ts, HrProvider.tsx)
│   │   ├── chat/ (chatRegistry.ts, ChatProvider.tsx)
│   │   └── user/ (userRegistry.ts, UserProvider.tsx)
│   ├── moduleRegistry.ts    # Auto-discovers modules
│   └── utils/
├── modules/
│   ├── auth/         # Authentication (login)
│   ├── hr/           # Human resources
│   ├── storage/      # File management
│   ├── investments/  # Investment & plot management
│   ├── users/        # User & role management
│   └── chat/         # Real-time chat (floating button + dialog)
└── theme.css         # Tailwind v4 theme (colors, animations, fonts)
```

### Module Internal Structure (DDD Layers)

Each module follows Clean Architecture with four layers. Here is a representative example (`investments`):

```
src/modules/investments/
├── index.tsx                         # Module registration (routes, locales, API registration)
├── application/
│   ├── dtos/
│   │   ├── dossierDto.ts
│   │   └── installmentDto.ts
│   └── usecases/
│       ├── manageDossierPartners.ts
│       └── manageInstallments.ts
├── domain/
│   ├── entities/
│   │   ├── plot.ts
│   │   ├── contract.ts
│   │   ├── investor.ts
│   │   ├── dossier.ts
│   │   └── facility.ts
│   ├── repositories/
│   │   ├── IDossierPartnersRepository.ts
│   │   └── IInstallmentRepository.ts
│   └── valueObjects/
│       ├── investments/
│       └── plots/
├── infrastructure/
│   └── repositories/
│       ├── DossierPartnersRepository.ts
│       └── InstallmentRepository.ts
└── presentation/
    ├── hooks/ (useDossierPartners, useInstallments)
    ├── locales/ (en.json, ar.json)
    ├── pages/
    │   ├── plots/ (PlotsPage, CreatePlotPage, EditPlotPage, ShowDossierPage)
    │   ├── plots/components/ (PlotForm, PlotDetailsSection, RentContractSection, ...)
    │   ├── contracts/
    │   ├── investors/
    │   └── dossiers/
    ├── schemas/
    │   ├── plotForm.schema.ts
    │   ├── contractForm.schema.ts
    │   ├── investorForm.schema.ts
    │   └── ...
    └── components/

### Layer Responsibilities

#### Layer 1 — `domain/` (Business Logic & Interfaces)

Contains pure TypeScript interfaces and types. **Zero dependencies** on frameworks, React, or infrastructure.

| Folder | Purpose | Example |
|---|---|---|
| `entities/` | Domain model interfaces | `Employee { id, name, email, ... }` |
| `repositories/` | Abstract data-access interfaces | `IEmployeeRepository { findAll, findById, ... }` |
| `valueObjects/` | Small reusable types | `UserStatus`, `LeaveType` |

#### Layer 2 — `application/` (Use Cases & DTOs)

Orchestrates business operations. Depends only on the `domain` layer.

| Folder | Purpose | Example |
|---|---|---|
| `usecases/` | Factory functions receiving a repository | `createManageEmployeeUseCase(repo)` |
| `dtos/` | Create/Update payloads (omit server-generated fields) | `CreateEmployeeDto` |

#### Layer 3 — `infrastructure/` (Concrete Implementations)

Implements the repository interfaces. Depends on `domain` and receives the `ApiClient` via dependency injection.

| Folder | Purpose | Example |
|---|---|---|
| `repositories/` | Factory functions using `ApiClient` | `createDossierPartnersRepository(apiClient)` |

#### Layer 4 — `presentation/` (React UI)

All React code. Depends on `application` + `infrastructure` (wired together by hooks).

| Folder | Purpose | Example |
|---|---|---|
| `components/` | UI components | `PlotForm.tsx`, `ChatDialog.tsx` |
| `hooks/` | Stateful logic, wires repo + use case | `useInstallments.ts` |
| `pages/` | Full page components | `PlotsPage.tsx` |
| `schemas/` | Zod validation schemas | `plotForm.schema.ts` |
| `locales/` | Translation files | `en.json`, `ar.json` |
| `utils/` | Module-specific helpers | — |

### File Placement Quick Reference

```
┌──────────────────────────────────────────────────────┐
│ Concern                    │ Location                │
├──────────────────────────────────────────────────────┤
│ Entity interface           │ domain/entities/        │
│ Repository interface       │ domain/repositories/    │
│ Value object               │ domain/valueObjects/    │
│ Use case                   │ application/usecases/   │
│ DTO                        │ application/dtos/       │
│ Repository implementation  │ infrastructure/         │
│ React hook                 │ presentation/hooks/     │
│ Page component             │ presentation/pages/     │
│ Reusable component         │ presentation/components/│
│ Zod schema                 │ presentation/schemas/   │
│ Translation file           │ presentation/locales/   │
│ Module entry point         │ index.tsx               │
│ Shared cross-cutting code  │ src/core/               │
└──────────────────────────────────────────────────────┘
```

### Core Layer Structure

| Path | Contents |
|---|---|
| `core/domain/` | Shared interfaces: `ApiClient.ts`, `DomainResponse.ts`, `DomainPagination.ts`, `ICrudRepository.ts`, error types |
| `core/application/` | Generic use case factory: `manageEntityUsecase.ts` |
| `core/infrastructure/` | `fetchApiClient.ts`, auth (`AuthProvider`, `authStorage`, `ProtectedRoute`), generic `CrudRepository.ts` |
| `core/presentation/` | Contexts (Theme, Language, Sidebar, ApiClient), layouts, UI components (Button, Dialog, inputs, pickers, filters, Spinner), generic hooks (`useEntity`, `useNestedEntityCrud`) |
| `core/registry/` | Cross-module registries: `storage/`, `hr/`, `chat/`, `user/` (each has a registry `.ts` + `Provider.tsx`) |
| `core/moduleRegistry.ts` | Auto-discovers all modules from `src/modules/*/index.{ts,tsx}` |

---

## Section 3: Key Architecture Decisions

### 3.1 Why `fetch` Instead of Axios

The project uses the **native `fetch` API** (`src/core/infrastructure/api/fetchApiClient.ts`) rather than a third-party library like Axios.

**Reasons:**

- **Zero external dependencies** — `fetch` is built into every modern browser; no additional package to install or maintain
- **Smaller bundle size** — Avoids ~30KB (minified) for Axios
- **Security** — Native `fetch` has a smaller attack surface; no risk of supply-chain vulnerabilities in Axios or its transitive dependencies
- **Sufficient for our needs** — The custom wrapper handles everything required: Bearer token injection, `Accept-Language` header, JSON parsing, 401 auto-redirect, blob downloads, FormData support
- **Standard API** — `fetch` is the web standard; developers already familiar with the platform don't need to learn a library-specific API

**The `createFetchApiClient` factory:**

```typescript
createFetchApiClient(baseURL: string, getLanguage: () => string): ApiClient
```

Returns an object with typed HTTP methods:

```typescript
export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  put<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  patch<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  delete<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
}
```

**Automatic behavior:**
- Attaches `Authorization: Bearer <token>` from `localStorage['access_token']`
- Sets `Accept-Language` header from the language context
- On 401 response: clears auth from localStorage and redirects to `/auth`
- Supports JSON, blob, text, and arrayBuffer response types
- Handles `FormData` (skips `Content-Type` header, letting the browser set `multipart/form-data`)

### 3.2 DDD / Clean Architecture

The project layers code into four concentric layers per module:

```
┌──────────────────────────────────────┐
│  Presentation (React components/hooks)│  ← Depends on application + infrastructure
├──────────────────────────────────────┤
│  Application (use cases, DTOs)       │  ← Depends on domain
├──────────────────────────────────────┤
│  Domain (entities, interfaces)       │  ← No dependencies
├──────────────────────────────────────┤
│  Infrastructure (repositories)       │  ← Implements domain interfaces
└──────────────────────────────────────┘
```

**Dependency rule:** Inner layers never import from outer layers. Domain has zero external dependencies. Application depends only on domain. Infrastructure implements domain interfaces. Presentation depends on application and infrastructure via hooks that wire them together.

**Dependency injection:** Repositories receive `ApiClient` via constructor parameter (factory functions). Hooks in the presentation layer call `useApiClient()` to get the shared client instance and pass it to repository factories via `useMemo`. This keeps all layers testable and framework-agnostic.

```
Hook (presentation)
  └─ useApiClient() → ApiClient instance
       └─ createXxxRepository(apiClient) → Repository
            └─ createXxxUseCase(repository) → Use Case
```

### 3.3 Generic CRUD Pattern

For simple entities (system lookups, reference data), the project provides a reusable CRUD abstraction that avoids boilerplate:

| Layer | File | Purpose |
|---|---|---|
| Domain | `core/domain/repositories/ICrudRepository.ts` | Generic interface: `findAll`, `findById`, `create`, `update`, `delete` |
| Infrastructure | `core/infrastructure/repositories/CrudRepository.ts` | Generic implementation wrapping `ApiClient` calls |
| Application | `core/application/usecases/manageEntityUsecase.ts` | Generic use case factory wrapping any repository |
| Presentation | `core/presentation/hooks/data/useEntity.ts` | Generic hook (creates repo + use case, manages loading/error/data state) |

Modules can either:
- **Use the generic pattern directly** for simple CRUD pages (e.g., lookup tables like `CitiesPage`, `JobStatusesPage`)
- **Create custom hooks** for complex operations with pagination, search, filtering, sorting (e.g., `useEmployees.ts`)

### 3.4 Module Registration & Auto-Discovery

`src/core/moduleRegistry.ts` auto-discovers all modules at startup:

```typescript
const modulesMap = import.meta.glob("/src/modules/*/index.{ts,tsx}", { eager: true });
```

Each module's `index.tsx` must `export default` an object matching the `Module` interface:

```typescript
export interface Module {
  name: string;
  routes: ModuleRoute[];
  locales: Record<string, LocaleDictionary>;
  navGroups?: NavGroup[];
}
```

Auto-discovery is triggered synchronously in `App.tsx` via `autoRegisterModulesSync()` before the React tree renders. This ensures all modules are registered before any component needs to access routes or locales.

**Module registration also handles cross-module APIs.** For example, `src/modules/users/index.tsx` registers the `getCurrentUser` function:

```typescript
const client = createFetchApiClient(API_BASE_URL, () => document.documentElement.lang || 'en');
const repository = createUserRepository(client);
const useCase = createManageUserUseCase(repository);
registerUserApi({ getCurrentUser: useCase.getCurrentUser });
```

### 3.5 Routing

Each module defines its own routes in its `index.tsx`. Routes are collected by `getAllRoutes()` and combined into a single React Router configuration in `App.tsx`.

The `ModuleRoute` type:

```typescript
export type ModuleRoute = {
  path: string;                     // e.g., "/investments/plots"
  element: ReactNode;               // Page component
  layout: "default" | "dashboard" | "auth" | "none";
  label: string;                    // Translation key for navigation
  nav?: boolean;                    // Show in sidebar?
  order?: number;                   // Sort order in sidebar
  moduleName: string;
  icon?: ReactNode;                 // Sidebar icon
  group?: string;                   // Sidebar group (matches NavGroup.id)
  parentNav?: string;               // For nested routes (parent's href)
  requiresAuth?: boolean;           // Defaults to true
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
};
```

**Route assembly flow:**

```
autoRegisterModulesSync()
  → import.meta.glob("/src/modules/*/index.{ts,tsx}")
    → registerModule(module) for each module
      → getAllRoutes() collects all routes
        → App.tsx maps routes, wrapping with LayoutSwitcher + ProtectedRoute
          → createBrowserRouter(routeConfigs)
```

### 3.6 Sidebar Navigation

Navigation is built from registered modules after auto-discovery:

- **`getNavGroups()`** — Collects all `NavGroup` objects from modules, sorted by `order`, with auto-populated `moduleName`
- **`getNavItems()`** — Collects all routes with `nav: true`, attaches children via `parentNav`, returns root-level items

```
NavGroup { id: "investments", label: "investments", order: 10 }
├── NavItem { label: "plots.title",        href: "/investments/plots",        group: "investments" }
├── NavItem { label: "contracts.title",    href: "/investments/contracts",    group: "investments" }
├── NavItem { label: "investors.title",    href: "/investments/investors",    group: "investments" }
└── NavItem { label: "dossiers.title",     href: "/investments/dossiers",     group: "investments" }

NavGroup { id: "hr", label: "hr", order: 20 }
└── NavItem { label: "employees.title", href: "/hr/employees", group: "hr" }
```

Each nav group is rendered in the sidebar by the `Sidebar` component with its items underneath. Module name scopes translation keys for localization.

### 3.7 Permission-Based Route Protection

`ProtectedRoute` (`src/core/infrastructure/auth/ProtectedRoute.tsx`) wraps all authenticated routes:

```typescript
<ProtectedRoute requiredPermission="investments.plots.view">
  {route.element}
</ProtectedRoute>
```

It checks three levels of access control:

1. **Authentication** — If not authenticated, redirect to `/auth`
2. **Required role** — If `requiredRole` is set, the user's `role` must match (supports arrays for multiple roles)
3. **Required permission** — If `requiredPermission` is set, the user's `permissions[]` array must include it (supports arrays — any match grants access)

Missing permissions redirect to `/unauthorized`.

### 3.8 Authentication Flow

**Login:**

```
POST /users/login
  → Response: { data: { user: AuthUser, token: string } }
    → localStorage.setItem("access_token", token)
    → localStorage.setItem("auth_user", JSON.stringify(user))
    → AuthContext: isAuthenticated = true, user = user
```

**Startup (AuthProvider.tsx):**

```
App mounts
  ├─ checkAuth() (synchronous)
  │    ├─ Token invalid? → loading = false, redirect to /auth
  │    └─ Token valid?   → user = localStorage user, keep loading = true
  │
  └─ useEffect([isAuthenticated])
       ├─ getCurrentUser() registered? → call GET /users/current
       │    ├─ Success → user = fresh API data, save to localStorage, loading = false
       │    └─ Error   → logout (clear localStorage, isAuthenticated = false)
       └─ Not registered? → loading = false (fallback)
```

**Loading behavior:**

The loading state is managed at the App level via `AppContent` (a component inside `AuthProvider`). The entire app — including `RouterProvider` — shows a full-page spinner until auth is resolved. No individual per-route loading spinners.

**Cross-tab sync:**

A `storage` event listener on `window` keeps auth state synchronized across browser tabs.

**Logout:**
- Clears `access_token` and `auth_user` from `localStorage`
- Sets `isAuthenticated = false` and `user = null` in context
- Redirects to `/auth`

**401 handling:**
The `ApiClient` interceptor automatically clears auth and redirects on any 401 response.

### 3.9 Theming

Defined in `src/theme.css` using CSS custom properties with Tailwind v4's `@theme` directive.

**Light theme** (`:root`):
- Primary: green (`#1a6b3c`)
- Secondary: gold (`#c9a84c`)
- Background: `#f2f4f3`
- Card: `#ffffff`
- Text: `#1a2e1a`

**Dark theme** (`.dark`):
- Primary: lighter green (`#34d399`)
- Background: `#09090b`
- Card: `#18181b`
- Text: `#fafafa`

**Usage in components:**
```html
<div className="bg-card text-text border-border">
<div className="bg-primary text-white">
<span className="text-text-muted">
```

All colors, fonts, and animations are defined in the `@theme` block and generate corresponding Tailwind utilities.

### 3.10 Form Handling

- **react-hook-form** — Manages form state, validation, submission
- **zod** — Schema validation, integrated via `@hookform/resolvers`
- Zod schemas stored in `presentation/schemas/` per module
- `GenericCreateForm` component in `core/presentation/` for reusable creation dialogs
- Supported input components: `FormInput`, `SelectOrCreate`, `MultiSelectOrCreate`, `SelectFromTable`, `DataMatrixInput`, `SelectOnMap`

### 3.11 Cross-Module Communication (Registries)

Modules expose APIs to other modules via a registry pattern that avoids direct imports between modules.

**Pattern (4 parts):**

1. **Registry** — Core defines an interface + `register`/`get` functions
2. **Module registers** — Module calls `registerXxxApi(...)` eagerly in its `index.tsx`
3. **Provider** — A React Provider calls `getXxxApi()` and provides the value via context
4. **Consumer** — Other modules use a `useXxx()` hook to access the API

**Example — Storage module:**

```typescript
// 1. core/registry/storage/storageRegistry.ts
export interface StorageApi {
  FilePickerComponent?: React.ComponentType<FilePickerProps>;
  ImageComponent?: React.ComponentType<ImageProps>;
}
let storageApi: StorageApi | null = null;
export const registerStorageApi = (api: StorageApi) => { storageApi = api; };
export const getStorageApi = () => storageApi;

// 2. src/modules/storage/index.tsx (registration)
registerStorageApi({ FilePickerComponent, ImageComponent });

// 3. core/registry/storage/StorageProvider.tsx
export const StorageProvider = ({ children }) => {
  const api = getStorageApi();
  return <StorageContext.Provider value={api}>{children}</StorageContext.Provider>;
};

// 4. src/core/registry/storage/StorageProvider.tsx (consumption via context)
const storage = useStorage();
if (storage?.FilePickerComponent) {
  <storage.FilePickerComponent ... />;
}
```

### 3.12 Auto-Discovery Order

```
App.tsx mounts
  ├─ autoRegisterModulesSync()
  │    ├─ import src/modules/auth/index.tsx    → registers auth routes
  │    ├─ import src/modules/investments/index.tsx → registers investments routes
  │    ├─ import src/modules/users/index.tsx   → registers user routes + registerUserApi()
  │    ├─ import src/modules/chat/index.tsx    → registers chat API + floating button
  │    └─ ... (all other modules)
  │
  ├─ setIsReady(true)
  │    └─ Render provider tree
  │
  └─ Provider tree (outer → inner):
       ThemeProvider
         SidebarProvider
           LanguageProvider
             ApiClientProvider
               AuthProvider
                 ├─ checkAuth() → localStorage user
                 ├─ useEffect → getCurrentUser() API call
                 │    └─ blocks loading until resolved
                 └─ AppContent
                      ├─ loading? → full-page spinner
                      └─ ready    → StorageProvider > HrProvider > ChatProvider > UserProvider
                           └─ RouterProvider (contains all routes)
```

---

## Section 4: Coding Conventions

### General

- **No comments** in production code unless absolutely necessary
- **No emojis** in code or UI
- **Arabic-first** UI — all user-facing strings use Arabic; `dir="rtl"` is set on dialogs and layouts

### Exports

- **Named exports** for all functions and components
- **Default export only** for module `index.tsx` (required by auto-discovery)

### TypeScript

- Do **not** use `React.FC` — use regular function declarations:
  ```typescript
  function MyComponent({ prop1, prop2 }: Props) {
    return <div>...</div>;
  }
  ```
- Use explicit `children` prop when needed:
  ```typescript
  interface Props { children: React.ReactNode; }
  ```
- Avoid `any` where possible — prefer proper types or generics

### File Naming

| Type | Convention | Example |
|---|---|---|
| Component | PascalCase | `ChatDialog.tsx`, `ContactItem.tsx` |
| Hook | camelCase, prefixed with `use` | `useEmployees.ts`, `useChat.ts` |
| Utility | camelCase | `formatDate.ts`, `apiHelpers.ts` |
| Folder | kebab-case | `by-duration-licenses/`, `industrial-decision-types/` |
| Entity | camelCase | `plot.ts`, `contract.ts` |
| Zod schema | camelCase | `plotForm.schema.ts` |
| Locale | language code | `en.json`, `ar.json` |

### Imports

- Use **relative paths** within the same module
- `src/` is the root for cross-module imports (resolved by Vite)
- Keep imports organized: React/libraries first, then core, then module-specific

### State Management

- **React Context** — for shared global state (auth, theme, language, sidebar)
- **Local component state** — for feature-specific UI state
- **Custom hooks** — for data-fetching logic (repository + use case wiring)
- **No Redux** — Context + hooks is sufficient for this project's scale
