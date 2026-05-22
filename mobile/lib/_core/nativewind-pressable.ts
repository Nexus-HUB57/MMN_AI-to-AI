// NativeWind + Pressable: className pode engolir onPress em alguns cenários.
// O cast evita conflito de tipagem entre as definições de React/NativeWind.
import { Pressable } from "react-native";
import { remapProps } from "nativewind";

remapProps(Pressable as any, { className: false });
