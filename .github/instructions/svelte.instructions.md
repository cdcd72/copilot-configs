---
description: Guidelines for writing code in Svelte and SvelteKit, including coding standards and best practices for both frameworks.
applyTo: '**/*.svelte, **/*.ts'
---

### Guidelines for SVELTE

#### SVELTE_CODING_STANDARDS

- Use runes for $state, $effect and $props management instead of the $ prefix
- Use the $ prefix for reactive store values instead of manual store subscription
- Use slot props for better component composition
- Leverage the :global() modifier sparingly for global CSS
- Implement Svelte transitions and animations for smooth UI changes
- Use simple callback props instead of createEventDispatcher
- Use lifecycle functions (onMount, onDestroy) for setup and cleanup
- Leverage special elements like <svelte:window> and <svelte:component> for dynamic behavior

#### SVELTE_RUNES_GUIDE

**State Management:**

- Use `$state()` for mutable reactive state
- Use `$state.raw()` for immutable state (objects/arrays that should not be deeply reactive)
- Prefer `$state()` with objects when you need nested reactivity
- Use private fields (`#field`) in classes for encapsulated state

**Derived State:**

- Use `$derived` for simple computed values that depend on reactive state
- Use `$derived.by()` for complex calculations requiring multiple statements or logic blocks
- Prefer `$derived` over `$effect` when you only need computed values, not side effects

**Props:**

- Always define TypeScript interfaces for component props
- Use destructuring with type annotations: `let { prop1, prop2 }: Props = $props()`
- Set default values in destructuring: `let { variant = 'default' }: Props = $props()`
- Mark optional props with `?` in the interface

**Effects:**

- Use `$effect()` for side effects (DOM manipulation, subscriptions, timers)
- Always return cleanup functions from effects when needed
- Avoid using `$effect()` for derived state calculations (use `$derived` instead)
- Example with cleanup:
    ```typescript
    $effect(() => {
        const timer = setInterval(() => { /* ... */ }, 1000);
        return () => clearInterval(timer);
    });
    ```

#### TYPESCRIPT_INTEGRATION

- Use `PageLoad` and `PageServerLoad` types from `./$types` for load functions
- Define explicit interfaces for component props instead of inline types
- Use type imports for type-only dependencies: `import type { PageLoad } from './$types'`
- Leverage TypeScript's strict mode for better type safety
- Use generic types for reusable components when appropriate

#### STATE_MANAGEMENT_PATTERNS

**Global State (.svelte.ts files):**

- Create reactive state modules in `.svelte.ts` files for shared state
- Use class-based state for complex state with methods and encapsulation
- Use object-based state for simpler shared state
- Export a single instance for global state or export the class for multiple instances
- Example:
    ```typescript
    // theme.svelte.ts
    class ThemeState {
        #currentTheme = $state<Theme>('dark');
        get current() { return this.#currentTheme; }
        setTheme(theme: Theme) { this.#currentTheme = theme; }
    }
    export const themeState = new ThemeState();
    ```

**Component State:**

- Keep state local to components when possible
- Lift state up only when multiple components need to share it
- Use props for parent-child communication
- Use callbacks for child-parent communication

#### SVELTE_KIT

**Data Loading:**

- Use `+page.server.ts` for server-side data fetching and operations requiring secrets/credentials
- Use `+page.ts` for client-side data loading and browser-only operations (like dynamic imports)
- Combine both: `+page.server.ts` can pass data to `+page.ts` via the `data` parameter
- Use `+layout.server.ts` for data needed across multiple routes
- Always use typed load functions: `PageLoad`, `PageServerLoad`, `LayoutLoad`, `LayoutServerLoad`
- Example combining both:

    ```typescript
    // +page.server.ts
    export const load: PageServerLoad = async () => {
        const posts = await getPosts();
        return { posts };
    };

    // +page.ts
    export const load: PageLoad = async ({ params, data }) => {
        const post = await import(`$posts/${params.slug}/index.md`);
        return { ...data, post };
    };
    ```

**Forms and Actions:**

- Implement form actions for handling form submissions with progressive enhancement
- Use the enhance function for progressive enhancement of forms
- Handle form validation on both client and server sides

**Routing and Navigation:**

- Use page stores ($page) to access route parameters and other page data
- Implement +error.svelte files for custom error handling at the route level
- Implement route groups (folders with parentheses) for logical organization without URL impact
- Use `pushState` for programmatic navigation with state

**Server-Side Features:**

- Leverage SvelteKit's server-only modules for sensitive operations
- Leverage SvelteKit hooks for global middleware functionality
- Implement content negotiation with accept header in load functions
- Use `import.meta.glob()` for dynamic file imports with pattern matching

#### PERFORMANCE_OPTIMIZATION

- Use `{#key}` blocks to force component re-rendering when needed
- Avoid unnecessary `$effect()` calls - prefer `$derived` for computed values
- Use `$state.raw()` for large immutable data structures to reduce reactivity overhead
- Leverage code splitting with dynamic imports for large components
- Use `import.meta.glob()` with `eager: true` only when all resources are needed immediately
- Implement lazy loading for images and heavy components
- Use proper CSS containment (contain property) for performance-critical sections

#### VALIDATION

- After creating or editing any Svelte component (`.svelte`) or module (`.svelte.ts`/`.svelte.js`), run `svelte-autofixer` from the `svelte-code-writer` skill to validate the code
- Use `npx @sveltejs/mcp svelte-autofixer <file>` to detect common issues before finalizing changes
