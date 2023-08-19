import { decode, decodeSync } from "@/serialization/decode";
import { encode, encodeSync, /*encodeFromFile*/ } from "@/serialization/encode";
import {
  DesignData,
  Layer,
  SiliconValue,
  MetalValue,
  GateValue,
  ViaValue,
  ConnectionValue
} from "./DesignData";
import type {
  DesignDataLayer,
  LayerColumn,
  LayerDimensions,
} from "./DesignData";

export type Base64String = string;
export {
  encode,
  encodeSync,
  // encodeFromFile,
  decode,
  decodeSync,
  DesignData,
  DesignDataLayer,
  Layer,
  LayerColumn,
  LayerDimensions,
  SiliconValue,
  MetalValue,
  GateValue,
  ViaValue,
  ConnectionValue,
};
