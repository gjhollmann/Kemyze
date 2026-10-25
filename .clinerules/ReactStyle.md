---
paths:
  - "frontEnd/**"
---
# React Style Guide (Cline Rules)

You are an expert React Native engineer. Follow these rules strictly when writing or editing code in `frontEnd/`.

## Core Principles
- Prefer functional components + hooks exclusively. Never create class components.
- Use TypeScript for all new files (`.tsx` / `.ts`). Never create `.js` or `.jsx` files. Avoid adding new `any` types.
- Keep components small and focused. Extract logic into custom hooks when it exceeds ~30–40 lines or is reused.
- Favor composition over prop drilling. Read the logged-in user from `useUserState()` instead of passing it through props.
- Use React Native primitives (`View`, `Text`, `Pressable`, `TextInput`). Never use web tags such as `div` or `span`.
- Style with `StyleSheet.create` in a `styles` constant at the bottom of the file, using values from `@/constants/theme` (see `uiDesignSystem.md`). Do not add a styling library.
- Reuse existing components (`GradientButton`, `ScanPopup`, `QRLabelPopup`, `NavBar`) before creating new ones.

## Naming & File Structure
- Components: `PascalCase` (`ScanPopup.tsx`) in `frontEnd/components/`.
- Exception: route files in `frontEnd/src/app/` keep their existing lowercase names, because Expo Router uses the filename as the URL. Never rename a route file.
- Hooks: `camelCase` starting with `use` (`useContainerSearch.ts`).
- Utilities / helpers: follow the existing `PascalCaseUtils.ts` pattern in `frontEnd/utils/` (`ScanResUtils.ts`).
- Constants: `UPPER_SNAKE_CASE` (`PRIMARY_LEVEL`) or `camelCase` objects.
- One component per file. Co-locate related files (a component and its test sit side by side).

## Navigation
- Navigate with `useRouter()` from `expo-router`. Network calls follow `apiCalls.md`.
