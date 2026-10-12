---
name: kemyze-ui-screen
description: Build or restyle a Kemyze screen, modal, bottom sheet, form input, or button so it matches the team design system (dark navy panels, JetBrains Mono, blue gradient buttons). Use when creating a new page, changing layout or colors, adding a popup or picker, or moving an existing screen onto the shared theme in frontEnd/src/constants/theme.ts.
---

# Kemyze UI Screen Skill

Reference screens (the look to match): `SubPages/add_container.tsx`, `SubPages/edit_container.tsx`, `SubPages/editprofile.tsx`, `SubPages/createprofile.tsx`, `Pages/tertiaryprofilemanagement.tsx`.

## Core Principles
- All visual values come from `@/constants/theme`. No raw colors, font names, or sizes in screens.
- Reuse `GradientButton` (`frontEnd/components/GradientButton.tsx`) for primary actions.
- Make layouts responsive with `useWindowDimensions()`. Treat `width < SIZE.smallScreenWidth` as a small screen.

## Style Recipes
```ts
import { COLORS, FONT, FONT_SIZE, RADIUS, SIZE, SHADOW } from '@/constants/theme';

screen:      { flex: 1, backgroundColor: COLORS.screen },
panel:       { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.borderAccent, borderRadius: RADIUS.card, paddingHorizontal: 14, paddingVertical: 12 },
sheet:       { width: '100%', maxWidth: SIZE.sheetMaxWidth, alignSelf: 'center', backgroundColor: COLORS.panel,
               borderTopLeftRadius: RADIUS.panel, borderTopRightRadius: RADIUS.panel, borderWidth: 1, borderColor: COLORS.borderAccent, paddingHorizontal: 12 },
sheetHandle: { width: 42, height: 4, borderRadius: RADIUS.small, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 10 },
input:       { width: '100%', minHeight: SIZE.inputHeight, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.input,
               backgroundColor: COLORS.input, color: COLORS.textPrimary, fontFamily: FONT.regular, fontSize: FONT_SIZE.body, paddingHorizontal: 9 },
inputActive: { borderColor: COLORS.accent, backgroundColor: COLORS.inputActive },
option:      { minHeight: SIZE.optionHeight, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.overlayCard },
confirmCard: { width: '100%', maxWidth: SIZE.confirmMaxWidth, borderRadius: RADIUS.confirm, borderWidth: 1, borderColor: COLORS.borderAccent, backgroundColor: COLORS.panel, padding: 20 },
title:       { color: COLORS.textPrimary, fontFamily: FONT.bold, fontSize: FONT_SIZE.pageTitle },
label:       { color: COLORS.textSecondary, fontFamily: FONT.regular, fontSize: FONT_SIZE.label },
link:        { color: COLORS.accent, fontFamily: FONT.regular, fontSize: FONT_SIZE.body },
```

## Follow this order
1. Open one reference screen and find the closest existing pattern (sheet, picker, confirm card, review list).
2. Build with the recipes above. Put `StyleSheet.create` at the bottom of the file.
3. Use `GradientButton` for Save/Confirm, and the red delete gradient for destructive actions.
4. Add bottom padding for the nav bar (`SIZE.navBarHeight`) on tab screens.
5. Check on a small width (< 430) and in landscape.

## Common Pitfalls
- Copying `FONT` / `FONT_SIZE` / `PANEL_GRADIENT` into the file instead of importing them.
- Using `'monospace'`. It renders differently on iOS and Android.
- Using `#000000` / light gray popups (old `ScanPopup` style). Use the panel/confirm card style.
- Using `SafeAreaView` from `react-native` instead of `useSafeAreaInsets`.
