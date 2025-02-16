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
import CircuitDesignData from "@/serialization/CircuitDesignData";
import SnippetDesignData from "@/serialization/SnippetDesignData";


export type Base64String = string;
export {
  encode,
  encodeSync,
  // encodeFromFile,
  decode,
  decodeSync,
  DesignData,
  CircuitDesignData,
  SnippetDesignData,
  Layer,
  SiliconValue,
  MetalValue,
  GateValue,
  ViaValue,
  ConnectionValue,
};

export type {
  DesignDataLayer,
  LayerColumn,
  LayerDimensions,
};
