import { test } from "vitest";
import { assertEqual } from "@/utils/assert";
import {
  ConnectionValue, DesignData, Layer, MetalValue, decodeSync, encodeSync
} from "@/serialization";
import FieldGraph from "@/simulation/FieldGraph";

// Check if default DesignData encodes to KOHCTPYKTOP empty string
function checkEmpty() {
  const target = 'eNrt2bEJgDAARUFj0mQGV7B3FvdfRLBWiQZMxFNSHR8beQimOU15DXkJaXhyGxoaGhoaGhoath/un3Pj+bVrjPHw1Ov1cymltI8iFaWSUkr/rVJJKaVSSSmlUkkppVJJKaWfSaV/3JTSfrRFkQpTeXzq1QtAKb2fyteLtAFcBcYj';

  const empty = new FieldGraph();
  const save = empty.toSaveString();

  assertEqual(save, target);
}

// Load a string, mutate it, reencode it.
function checkMutations() {
  const source = 'eNrt2UsOwiAABUD5bHoGr+Des3j/i2jQJYK2JX4YSDedvDQtyUsJ+ZSPyyUs55APa+a8wbguGMr0VQUFBQUFBQV3DZbfufh8FE0pVa/teh+3O9XnPjQ1tZmNlNK/09GNVGvCl6qSUkrn1t+vymQRKaWqslOGvQ24JaaUqkqLSClVlX1NipRS+h1VOfyMu6Ptl3ImSOlcOuaMe5eqrF/b1QacUvqufqCRrkBExn8=';
  const target = 'eNrt2UsOgjAUBVDbx4Q1uAXnrsX9b0SDDisopammp4QJJzflE24gnS7Teb6l+Zqm055t3GDeF0zL5q4KCgoKCgoKHhpcPufy+7FoRBT3en2Ox5HivC+NVV3N5oaaO81L6ejaupFKb/dHVUkppWPr/1dleIiUUlW5UYZR9ZtMKaVDVKWHSClVlZsaipRS+htV2XyNe0PXL6rXGnevs6J0dG2zxn1IVZb3evUDTin9Vjs00h0F1sZ8';

  const design = DesignData.from(decodeSync(source));
  const layerMetal = design.getLayer(Layer.Metal);
  const layerMetalH = design.getLayer(Layer.MetalConnectionsH);
  layerMetal[10][10] = MetalValue.None;
  layerMetalH[10][10] = ConnectionValue.None;
  layerMetalH[9][10] = ConnectionValue.None;
  const reencoded = encodeSync(design);

  assertEqual(reencoded, target);
}

test('serialization', () => {
  checkMutations();
  checkEmpty();
});
