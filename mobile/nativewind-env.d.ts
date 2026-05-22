/// <reference types="nativewind/types" />

import "react-native";
import "react-native-safe-area-context";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }

  interface TouchableOpacityProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }
}

declare module "react-native-safe-area-context" {
  interface SafeAreaViewProps {
    className?: string;
  }
}
