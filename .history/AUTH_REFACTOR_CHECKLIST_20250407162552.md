# Auth Context Refactoring Checklist

This checklist tracks the progress of refactoring `contexts/auth-context.tsx`.

- [x] 1. **Extract Supabase Logic:** Create `services/authService.ts` to house all direct Supabase client interactions.
- [x] 2. **Create Custom Auth Listener Hook:** Extract `onAuthStateChange` logic into `hooks/useAuthListener.ts`.
- [x] 3. **Refactor `initializeAuth`:** Simplify using `authService` and the new hook.
- [x] 4. **Refactor `login` Function:** Remove polling logic and rely on the auth listener.
- [x] 5. **Standardize Error Handling:** Implement consistent error handling, potentially via `authService` or helpers.
- [x] 6. **Simplify Reducer/State:** Review and simplify `authReducer` and `AuthState`.
- [x] 7. **Type Refinements:** Ensure robust TypeScript types throughout.
- [x] 8. **Review & Finalize:** Ensure all functionality remains identical and clean up any remaining issues.
