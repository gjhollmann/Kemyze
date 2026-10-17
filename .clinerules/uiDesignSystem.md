---
paths:
  - "frontEnd/**"
---
# UI Design System Rule

Every screen must look like the add/edit container and profile screens. The design system lives in `frontEnd/src/constants/theme.ts`.

## Always
- Import colors, fonts, sizes, and radius from `@/constants/theme` (`COLORS`, `GRADIENTS`, `FONT`, `FONT_SIZE`, `RADIUS`, `SIZE`, `SHADOW`).
- Use `FONT.regular` / `FONT.bold` (JetBrains Mono) for all text.
- Screen background: `COLORS.screen`.
- Panels, bottom sheets, and confirm cards: `COLORS.panel` background, `COLORS.borderAccent` 1px border, `RADIUS.panel` (sheets) or `RADIUS.confirm` (cards).
- Inputs and select fields: `COLORS.input` background, `COLORS.border` 1px border, `RADIUS.input`, `SIZE.inputHeight` min height, `COLORS.textPrimary` text. Pressed/active state: `COLORS.accent` border + `COLORS.inputActive` background.
- Primary actions: the shared `GradientButton` component. Destructive actions: the red `GRADIENTS.delete*` variant.
- Text: `COLORS.textPrimary` for main text, `COLORS.textSecondary` for labels and metadata, `COLORS.accent` for links, arrows, and back buttons.
- Safe areas: `useSafeAreaInsets` from `react-native-safe-area-context`.

## Never
- Never type a hex or `rgba(...)` color, font name, or font size directly in a screen. Add a token to `theme.ts` instead, and only after the team agrees.
- Never use `fontFamily: 'monospace'` or system fonts.
- Never copy `FONT`, `FONT_SIZE`, or `PANEL_GRADIENT` blocks into a new file. Import them.
- Never introduce a new button style (`TouchableOpacity`, `<Button>`) for primary actions.
- Never use `SafeAreaView` from `react-native`.

## When editing an existing screen
- Only move a screen onto `theme.ts` when the ticket asks for it or you are already changing that style block. Do not restyle unrelated screens in the same task.
