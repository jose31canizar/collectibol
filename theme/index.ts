export { theme, type Theme } from "./theme";
import {
  createBox,
  createText,
  createRestyleComponent,
} from "@shopify/restyle";
import { TouchableOpacity as RNTouchableOpacity } from "react-native";
import { Theme } from "./theme";

export const Box = createBox<Theme>();
export const Text = createText<Theme>();

export const TouchableOpacity = createRestyleComponent<
  React.ComponentProps<typeof RNTouchableOpacity> & {
    variant?: "primary" | "accent";
  },
  Theme
>([], RNTouchableOpacity);
