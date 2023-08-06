import { assertEqual } from "..";
import { ConnectionValue, DesignData, Layer, MetalValue, decode, encode } from "../../serialization";

const source = 'eNrt2UsOwiAABUD5bHoGr+Des3j/i2jQJYK2JX4YSDedvDQtyUsJ+ZSPyyUs55APa+a8wbguGMr0VQUFBQUFBQV3DZbfufh8FE0pVa/teh+3O9XnPjQ1tZmNlNK/09GNVGvCl6qSUkrn1t+vymQRKaWqslOGvQ24JaaUqkqLSClVlX1NipRS+h1VOfyMu6Ptl3ImSOlcOuaMe5eqrF/b1QacUvqufqCRrkBExn8=';
const target = 'eJzt2T0OgzAMhuHmZ+EMvUL3noX7X4QqdKiU1EFQNxi/Riw8+oRZDMj5ke/THKZnyLc9h99g3BcM5TDyjAQJEiRIkCBBK8HyORe/V9GUUvM8rmu9rjTv+9YkqpiNilrVn+6Lot5VeyI1atuoRFEU9a32R2X12jlFVyiKXkotjEpxGPZ+wNW6QlHUkZoflcO6QlHUkVoYlaLWO58zdIWi6LVUfQO+VmfH3VH5oUbtuEd1haLeVWfH/ZNR2T6P66a2+W5EUfRDB0ykBQXWxnw=';

export default async function() {

  const design = DesignData.from(await decode(source));
  const layerMetal = design.getLayer(Layer.Metal);
  const layerMetalH = design.getLayer(Layer.MetalConnectionsH);
  layerMetal[10][10] = MetalValue.None;
  layerMetalH[10][10] = ConnectionValue.None;
  layerMetalH[9][10] = ConnectionValue.None;
  const reencoded = await encode(design);

  assertEqual(reencoded, target);

}
