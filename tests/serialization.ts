import { test } from "vitest";
import { assertEqual, assertPin } from "@/utils/assert";
import {
  ConnectionValue, DesignData, Layer, MetalValue, decodeSync, encodeSync
} from "@/serialization";
import { Network, FieldGraph, CircuitSimulation, Sequence } from "@/simulation";


// Check if default DesignData encodes to KOHCTPYKTOP empty string
test('check empty', () => {
  const target = 'eNrt2bEJgDAARUFj0mQGV7B3FvdfRLBWiQZMxFNSHR8beQimOU15DXkJaXhyGxoaGhoaGhoath/un3Pj+bVrjPHw1Ov1cymltI8iFaWSUkr/rVJJKaVSSSmlUkkppVJJKaWfSaV/3JTSfrRFkQpTeXzq1QtAKb2fyteLtAFcBcYj';
  const empty = new FieldGraph();
  const save = empty.toSaveString();
  assertEqual(save, target);
});


// Load a string, mutate it, reencode it.
test('check mutations', () => {
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
})


// This test verifies that the serialization compensates for it and spits out a clean design.
test('serialization-metal-bug', () => {
  // This source design includes many instances of the 0x0400 metal bug from the original game.
  const source = 'eNrtml124yAMhZMrv3QNs4V5n7XM/jcyjW1Af1w7dt1OWpLjE7fX6EMQhIBMv6dfb3/vb3/u0+3IexS8d9+0INy7FEIj2gciD/Nl1FJwxs8Pe2Yx4OrAiMzHtWCrki7IfERrHISqMh9rwYz4hI/tkZ0+Qtm8PeNjTtzho/s67fexVRI7v6uuVS1xZz+ysUH6sT8+Nn18bjzi6HgcPg4fh48HfRzJw2cXnNM59F+zKiLpdVaV5YX5qflTcwVSX9PtIU+3VZWqq2feHyp/KePlP/WmFX7cLuaq/n4/t6aIL17IqdzsL3Iz7tBVTsruZKMYz9noup3IgV2M99mwbW7ZtTlztpETttUD2xVP2eBsX7m+nLLB2YveZ4OzwdmhYROZsMHZpe6R/YgTSdMm5RndjTIJKhb4zKpyiVO1Zdr3vj6BZai14T3fXxq4WMDcFVG/nSqjzkMd6lCfUV8nVIq6iTNXmYFUwqxyS20g44rjisU5rrIcuXY2DlxtOXCFc6m/4P5S7kY7n/GXt/OJ/h3cF+OOUPlJqpiB7lcIWJP/ZYG85mBl1VGSeBZIxeRvUssmXGM5cFVgSbnOsri8kXBVnTN/hfkbLEtvasi43F8zTry/vgflo/p3cP9rroxQ+XWhks6GZlNkDR1m+Kt+XEKHzbKaDcqVLEOrXEnCTuPyL4+EOgeubHDd3pLjcn8Zt9vOu7jM3612HtyX5Y6s8gtVfeKAuO9c5kMdKsuCoRwwdff91AFUyd/q7Bu4xnLg+t10yzWWA1c4l/oL7i/lbrTzGX95O5/o38F9Me4PCZWnzptgL205X/c1VVSu4xcO+qS7DubOOTja0pSo1bJoy+LVcAje4QrjrotaSZfYAonctgCXhFsz0nKcaLjq+DvntlZMuFoMXL1yS7h1kKVcbHNBueBcUC4oF5wLygXlgnNBuaBccC4oF5QLzrXjSHarejUjIROWeF14xv0hoTK/zqq1awD3k6K2S+Z/bOR22LSsLXtZ+rNh24NpqiQ/cwpqws1WM5KUhURurXNcKtsB3uGKnnFSrvpw/nrTwV/CdWcFsZ0Pc3GOi+u4uI6L67i4joujXD3MermujrLXRiRS53811dAC';
  const target = 'eNrtmlFy2zAMRONd/+QMvUL/e5be/yKdSiYJAuBKlqIkbmmPJs6siEeQJgQSvv+8/3j/fXv/dbu/HXnPhrfhWzaEe5dGaMT+hsjDcnVqabjgl5s9sxhwfVBE5eOjYeuSbah8RBschK4qH2vDjPiEj+2WnT7C2Hx7xsecuMNH93Xa72PrJHZ+V92o9sSd86jWhpjH8frY9PG59Yij63H6OH2cPh70cSYPn91wSecwfi0qyfQ6q3J9Yblr+Wu5BOsLVmVVzR1E+cdYbq3rPaXt34+rtaoXlb51x2XUDbdZHnCTlru4KJZTLqS/oOIWy0Mu3EBbbh3DlNupkdvLnusaZ1xIru/XUM24kNxVHnIhuZDcMJpRHXMhuaXXAy4kF5Lr1hGDCsNlMoPmq23Vdkf5fGlEUpFwV6j851TOPk91qlN9Rn2dUEnzIT6zyhPIZMImb7QGMi4dlz3OcY3lyO0fw4FrLQcuNVf6C+2v5G6M8xl/9TifmN/JfTHuDJWfpIYNuMvuHxtwlESa64bBJvEqkLLL31jbJtzOcuCawJJynWW6vFFwTZ8zf6n8DZY5ejRkXO0v/GZJLTR+1PxO7rfmcobKrwuV8mnYH4c8Tufs8jfzuIaOPstqNiSXWYZWuUzCTuPqLw9DnwOXG1x3qOS42l/FHY7zLq7yd2ucJ/dluTOr/EK1K+DEA+fyPLShsmwYSuVoeO5nKkslfyNH3M5y4Poj9J6LvkDluNRc6S+0v5K7Mc5n/NXjfGJ+J/fFuP9JqDxVb0J/Wcv5vq+pNLlOVgFH21OSda5jjRttaypUmEp0sxwq4KHGPeBScR+b2kGNG6oCXmuvllsz0lJN7Limxp1z2yiOKqQPMXDtzi3h1kWWcrHNheRCcyG5kFxoLiQXkgtsVsDHXEguNHezAi640NxxjVurdjfDkAkzXhfWuD8kVObXWbVODeB+K9ROyfyviNwJm5WtZS9z/DRsZzBNZfL7paAm3Gw3w6QtGLm1z3Gr3C/wAZf2iZNyzR/nrzcd/BVcVyuI43yYi3NcXMfFdVxcx8V1XBzl2mU2ynVtlL02Iok+/wFi6M+0';
  const design = DesignData.from(decodeSync(source));
  const reencoded = encodeSync(design);
  assertEqual(reencoded, target);
});


test('4-input-and-or-gate-imported', () => {

  const saveString = 'eNrtmkEOgjAQRWU+G87gFdx7Fu9/EZMKgkCnhQoRfDRdmNcfkJCXKUN9q6/No2ruVX1ZMwguDloYi4PVeywK2sfYIzi8VFt7V/cP8qwSJEiQIMFjB0M5Z/EjUEmzs5wGrvDbutmf1wYLErRdMU+n/6inFqPmZhP0tcKn8qhBodAY3dJIMRNmqRIaoeJuQKH/Qc+uynHltyCrgiwUCkWVB5KhJqXfcAOePq9ckYqKFApFlaevG+Ury3+TmaE7ZAiFospjUHcTLbcyVHoDLh4tKBRV9vHCHrd1Xax4F9tcqrGacoWW0eO2gh63XzcqoVn6mFDoOrpNj/srqpyf5bT1pPzLTihr/EnQj9R+4l0lFLoJ3dJIkeMJ5zrHaQ==';
  const fieldGraph = FieldGraph.from(saveString, 'circuit');
  const network = Network.from(fieldGraph);

  const pins = network.getPinNodes();
  const paths = network.getPathNodes();
  const gates = network.getGateNodes();

  assertEqual(pins.length, 12, 'pins.length');
  assertEqual(paths.length, 18, 'paths.length');
  assertEqual(gates.length, 8, 'gates.length');

  const pinVCC = pins[0];
  const pinA = pins[2];
  const pinB = pins[4];
  const pinC = pins[6];
  const pinD = pins[8];
  const pinX = pins[5];
  const pinY = pins[7];

  assertEqual(!!pinVCC.path, true, 'pinVCC.path');
  assertEqual(!!pinA.path, true, 'pinA.path');
  assertEqual(!!pinB.path, true, 'pinB.path');
  assertEqual(!!pinC.path, true, 'pinC.path');
  assertEqual(!!pinD.path, true, 'pinD.path');
  assertEqual(!!pinX.path, true, 'pinX.path');
  assertEqual(!!pinY.path, true, 'pinY.path');

  assertEqual(gates.filter(g => g.gatedPaths.includes(paths[0])).length, 2);

  for (const k in gates) {
    const gate = gates[k];
    assertEqual(gate.gatedPaths.length, 2, `gates[${k}].gatedPaths.length`);
    assertEqual(gate.switchingPaths.length, 1, `gate[${k}].switchingPaths.length`);
  }

  pinVCC.label = 'VCC';
  pinA.label = 'A';
  pinB.label = 'B';
  pinC.label = 'C';
  pinD.label = 'D';
  pinX.label = 'X';
  pinY.label = 'Y';

  const sim = new CircuitSimulation(network);

  pinVCC.active = true;

  // Pin A
  const seqA = new Sequence();
  for (let i = 0; i < 10; i++) {
    seqA.setFrame(i * 20 + 10, true);
    seqA.setFrame(i * 20 + 20, false);
  }
  seqA.setFrame(210, true);
  seqA.setFrame(240, false);
  seqA.setFrame(250, true);
  seqA.setFrame(270, false);
  sim.setInputSequence(pinA, seqA);

  // Pin B
  const seqB = new Sequence()
    .setFrame(20, true)
    .setFrame(40, false)
    .setFrame(60, true)
    .setFrame(80, false)
    .setFrame(90, true)
    .setFrame(120, false)
    .setFrame(140, true)
    .setFrame(160, false)
    .setFrame(190, true)
    .setFrame(200, false)
    .setFrame(220, true)
    .setFrame(240, false)
    .setFrame(260, true)
    .setFrame(270, false);
  sim.setInputSequence(pinB, seqB);

  // Pin C
  const seqC = new Sequence()
    .setFrame(30, true)
    .setFrame(80, false)
    .setFrame(90, true)
    .setFrame(100, false)
    .setFrame(120, true)
    .setFrame(160, false)
    .setFrame(200, true)
    .setFrame(240, false)
    .setFrame(260, true)
    .setFrame(270, false);
  sim.setInputSequence(pinC, seqC);

  // Pin D
  const seqD = new Sequence()
    .setFrame(30, true)
    .setFrame(40, false)
    .setFrame(80, true)
    .setFrame(160, false)
    .setFrame(200, true)
    .setFrame(210, false)
    .setFrame(220, true)
    .setFrame(240, false)
    .setFrame(250, true)
    .setFrame(270, false);
  sim.setInputSequence(pinD, seqD);

  sim.run(280, frame => {
    // Probe various frames for expected values
    switch (frame) {
      case 0:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 1:
      case 10:
      case 11:
        assertPin(pinX, 0);
        assertPin(pinY, 0);
        break;
      case 12:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 30:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 31:
        assertPin(pinX, 1);
        assertPin(pinY, 1);
        break;
      case 90:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 91:
        assertPin(pinX, 1);
        assertPin(pinY, 1);
        break;
      case 100:
      case 119:
      case 120:
      case 149:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 150:
      case 159:
        assertPin(pinX, 1);
        assertPin(pinY, 1);
        break;
      case 160:
      case 161:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 162:
        assertPin(pinX, 0);
        assertPin(pinY, 0);
        break;
    }
  });

});
