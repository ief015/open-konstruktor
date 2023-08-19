import { kohctpyktop } from "@/circuits/kohctpyktop";
import { Network, FieldGraph } from "@/simulation";
import { assertEqual } from "@/utils/assert";

function andGateFromString() {
  const saveString = 'eNrtmUEOgyAQRYVhwxm8gnvP4v0v0hSNSWWkBa2W8oa4ev4wIeTzCW5wvZ+MH43rSkb1QhNG0Yz27xcHIUKECBEivEFoy4SJI72JVQ1xzu5XoCKifsfpXDLXs6HNzOsfal/prqFQaC1UEnTxh0s9Sev5I7OEQqHQtumPWCW5EQqF5mfO1qxSIq/ESKFQzDB2B1IlmwcKxSq5gL9JlVglFArVU2VFF/ATXrnDuSGkSigUmvcC/uodX3zjPsUq9e84XRdKNsGSrQWFQmN3uMSRlHoA6/zGXw==';
  const net = Network.from(saveString);
  const sim = kohctpyktop['02 KT221A DUAL 2-INPUT AND GATE'](net);
  sim.run(280);
  return sim.getRecordings();
}

function andGateFromDrawnField() {
  const field = new FieldGraph();
  field.draw('metal', [3, 8], [4, 8], [4, 9]);
  field.draw('metal', [3, 10], [5, 10]);
  field.draw('metal', [3, 14], [4, 14], [4, 11]);
  field.draw('n-silicon', [4, 9], [4, 11]);
  field.draw('p-silicon', [5, 10], [4, 10]);
  field.placeVia([4, 9]);
  field.placeVia([5, 10]);
  field.placeVia([4, 11]);
  field.draw('metal', [40, 12], [39, 12], [39, 13]);
  field.draw('metal', [40, 14], [38, 14]);
  field.draw('metal', [40, 18], [39, 18], [39, 15]);
  field.draw('n-silicon', [39, 13], [39, 15]);
  field.draw('p-silicon', [38, 14], [39, 14]);
  field.placeVia([39, 13]);
  field.placeVia([38, 14]);
  field.placeVia([39, 15]);
  const net = Network.from(field);
  const sim = kohctpyktop['02 KT221A DUAL 2-INPUT AND GATE'](net);
  sim.run(280);
  return sim.getRecordings();
}

function testCompareStringAndDrawing() {
  const stringRecordings = Array.from(andGateFromString().values());
  const drawnRecordings = Array.from(andGateFromDrawnField().values());
  for (const k in stringRecordings) {
    const stringRecording = stringRecordings[k];
    const drawnRecording = drawnRecordings[k];
    const {
      differences,
      ratio,
    } = stringRecording.getDifference(drawnRecording, { method: 'strict', length: 280 });
    assertEqual(differences, 0, `testCompareStringAndDrawing[${k}]:differences`);
    assertEqual(ratio, 1, `testCompareStringAndDrawing[${k}]:ratio`);
  }
}

export default async function() {

  const source = 'eNrtmlFy2zAMRONd/+QMvUL/e5be/yKdSiYJAuBKlqIkbmmPJs6siEeQJgQSvv+8/3j/fXv/dbu/HXnPhrfhWzaEe5dGaMT+hsjDcnVqabjgl5s9sxhwfVBE5eOjYeuSbah8RBschK4qH2vDjPiEj+2WnT7C2Hx7xsecuMNH93Xa72PrJHZ+V92o9sSd86jWhpjH8frY9PG59Yij63H6OH2cPh70cSYPn91wSecwfi0qyfQ6q3J9Yblr+Wu5BOsLVmVVzR1E+cdYbq3rPaXt34+rtaoXlb51x2XUDbdZHnCTlru4KJZTLqS/oOIWy0Mu3EBbbh3DlNupkdvLnusaZ1xIru/XUM24kNxVHnIhuZDcMJpRHXMhuaXXAy4kF5Lr1hGDCsNlMoPmq23Vdkf5fGlEUpFwV6j851TOPk91qlN9Rn2dUEnzIT6zyhPIZMImb7QGMi4dlz3OcY3lyO0fw4FrLQcuNVf6C+2v5G6M8xl/9TifmN/JfTHuDJWfpIYNuMvuHxtwlESa64bBJvEqkLLL31jbJtzOcuCawJJynWW6vFFwTZ8zf6n8DZY5ejRkXO0v/GZJLTR+1PxO7rfmcobKrwuV8mnYH4c8Tufs8jfzuIaOPstqNiSXWYZWuUzCTuPqLw9DnwOXG1x3qOS42l/FHY7zLq7yd2ucJ/dluTOr/EK1K+DEA+fyPLShsmwYSuVoeO5nKkslfyNH3M5y4Poj9J6LvkDluNRc6S+0v5K7Mc5n/NXjfGJ+J/fFuP9JqDxVb0J/Wcv5vq+pNLlOVgFH21OSda5jjRttaypUmEp0sxwq4KHGPeBScR+b2kGNG6oCXmuvllsz0lJN7Limxp1z2yiOKqQPMXDtzi3h1kWWcrHNheRCcyG5kFxoLiQXkgtsVsDHXEguNHezAi640NxxjVurdjfDkAkzXhfWuD8kVObXWbVODeB+K9ROyfyviNwJm5WtZS9z/DRsZzBNZfL7paAm3Gw3w6QtGLm1z3Gr3C/wAZf2iZNyzR/nrzcd/BVcVyuI43yYi3NcXMfFdVxcx8V1XBzl2mU2ynVtlL02Iok+/wFi6M+0';
  const graph = FieldGraph.from(source);

  graph.erase(['metal', 'silicon'], [14, 0], [14, 26]);
  graph.erase(['metal', 'silicon'], [4, 12], [39, 12]);
  graph.erase(['metal', 'silicon'], [4, 19], [39, 19]);
  const targetErase = 'eNrtmWFy4yAMheP3/Kdn6BX2/55l73+RTm2DBEjCCXG3aUkmU3eexYcAC2Gtf9b3t3/L299lvT3ynYaL+lb/xYZQXzGEEFHdUhOxyl1FV3F05rYuDfGWu1oAzhFbHw9D6VJp6PsIGRwYXfV9zIY+8ZSPcstJHx9eOT2i6+NSdeq0jzKqOLlWq1G1iN15jJ6OYB79p6Pr433PIx59HqeP08fp44M+zuThqw23dA7+Z1NJmr9RlfsHn3dh+6u5233pFq0yq8jq0cp2IS0fKpip2fbzcm9tb12phe1mr7mVupkJV1p2uGXL57mdOQr9BSMujj573HS75S/yGJrcQm25Ivv+hlyEXL34QtUc55C7r1iXi5CLzvyGXIRchNzklbuuIi5CbvUc0bAVLo0ZROYWqu7VfnlpRIqeslOh8sep/GX+TnWqUx1UXydUUl24tlSZMNT22eGyUlniKi7RxFqaLRvc0pbXjNUQ97n+xuM8ML+T+2LcGSq/SG0O4Giy/3yMP/JGddRIuhVIRZHDrNi23KLlhlsFloZbtcwq1w24vQN45G/TMr1AanAZ+2vNgzuDfNb8Tu635nKGypfJKllmlWoe99BhZErOFCsuwyyrVTU3Xjx8clbZcGN/nSya4TjzDPe8v5P7g7gzq/yPqnrhbOxoaVMrQiWLVCitEeNdpdSEcs5Jetyi5YbbbsGaW5WvKi5DbmesYn9DbmecR/yNx3lgfif3xbi/JFQO1ZtQ/nTL9rlPVDn32RVw1LpT404NxSpUJbqsjzvcoxbpcBlxaXCHpjj1WdUThatq3CY3n8z9ymw64Ff+qnTD5KpnzPU35CLkIuYi5CLkIuYi5Pbmt1sB97kIueitq04FPODiHu4dFXDR0zpsVR1BLqxxPyVU2r9RNXnQvjOWt2Qk6Tglu2O5r+1BOMlq7UZFEFKrhW0zmK0q/rYnGRq2Fjf3GXxoN6TecUyu7681BYVtJdb++lwMcDHGxXVcXMfFdVx8Qy6L046d6+ooe21ECvr8AXJ9zgA=';
  assertEqual(graph.toSaveString(), targetErase, 'targetErase');

  graph.draw('metal', [15, 0], [15, 26]);
  graph.draw('metal', [4, 13], [39, 13]);
  graph.draw('metal', [4, 20], [39, 20]);
  const targetAddMetal = 'eNrtmlt22zAMRK0Z/WQN3UL/u5bufyNt9CAB4kHZspI4oX18omQEXoKgIMjI/Hv+9fZ3evszzbdH3sNwEu/mt9wQ4l0NUYloTmmJmOtZaqrYJnObJ0O8lakqwDGi9XEzrFPShrGPqIsDZ6qxj8UwJh7ysZ5y0MeHd06PGPo4NZM67GNdVRzcq82qesRuHLOrI4ljfHV0fbzvesSj1+Pwcfg4fHzQx1E8fLThUs4hfi0qSfdzVuX6wvtZWH7+Pyrc5bz9FKmyqCjqNspyUEfeVLBQi20hbaMLVdku9pLbqItZ5daRA64e+ThXRYVo1yp+vdsy42Kbc8TdT/f8RVlDb521arlVjv1NuUi5cvOlqrvOKXfdsSEXKRed+KZcpFyk3N2reF8lXKTc5jqiY1u5dCKIwlWqnNV6eGlGyjLhoVT57VT+MH+HOtShnlRfJ1VSHIS2FJVwNWGPy0alxjVcwuRauiM7XG3La9bqFPe5/ubrfCK+g/ti3JEqP0ilutBtEOVj/FY3ro8aSvcSaVVKzclqa7lqZMNtEovhNiOzqXUTbqdOZuavGZlRInW4zP314hBGkM+K7+B+aS5HqnyZqpK6qhRxXFOHUykFIRZcplWWVSU33zx8clVpuLm/QRXNdJ15hHvc38H9RtxRVX6iKr5whtfm2G+HIlVSlUKiCdJmjdoTKjVnufsarhrZcO0tWHLVyIbLlNtZq9zflNtZ5zP+5ut8Ir6D+2LcH5IqT/WboD9yZPXcZ7u6EH90O+Bo9KjHvVeRuQrRidb98YC79SIDLjMuHa537w+2pVX3Oct+Ipwet8tljUHUId0f8Bt/RbnhcsU1FvqbcpFykXORcpFykXORcnvx7XbAYy5SLrr7qvOfFTEX93Dv6IC3KoyqM8iFPe6npEr/c1bdPbDfGddvyUgycKreHfV9bU3Cuyz2btYEIaWqbM1iWrX6a59k6Nh63DJn8O67Yfy/QpIb++uFQM25EVt/GfqLE1yc4+I6Lq7j4jouviCX6mnHr3XrFUFem5GSOf8DzY7OTg==';
  assertEqual(graph.toSaveString(), targetAddMetal, 'targetAddMetal');

  graph.draw('n-silicon', [4, 23], [39, 23]);
  const targetAddSilicon = 'eNrtmlFy2zAMRONd/+QMvUL/e5be/yJtZIoASACULCtjO7THEycr8BEEBUFCrr+vvz7/Xj7/XK4f97zf2vCyxfCi3s1vuSHUWwwhRDSHtERc5SgzVZTJVA8U8aNO1QC2EXsfi6FMyRrGPkIWB85UYx+rYUzc5KMcstHHu3fOiBj6eGkmtdlHWVVs3KvNqnrEYRyzsyOJY3x2DH3cdz7i3vNx+jh9nD7e6ePdF9bnMHzBOmcp5xC/FpWk+zmq8vbC11FYfv7/VrnLceshWmVVUdUyyvJFRi4qWKnVtpLK6Eo1tou95jbqYiZcGTng2pG3c01UiHat4teXLTMuypwj7nq45y/qGnrrbNWeK3Lsb8pFytWbL1XddU65tx0bcpFyMYhvykXKRcpdvYr3VcJFym3OIzq2wqUTQVSuUfWsbl9PzUhZJtyUKt9O5Q/zd6pTnepB9XVSJdWX0JaqEhYTjrhSst5UWlzDJbpcS3dkh2ttW+6D1uoQ97H+5ut8IL6T+2LcmSq/SaU50fsg6tv4UjfebjWM7iVSUWrNSbHtuWbkjtsklo7bjMym1k24gzqZmb/dyIwSqcNl7q8XhzCCfFR8J/epuZyp8lvU/GqYPlUga+owVWWJY1W9SikIseIyrrIIR9XcfPNw72qkqsPN/fWqaPE3WGdu4W73d3LfiIuH7ueZKvfdVMoDZ3htjvVyqFIlTSmkmiBt1pCeUK05yYhrRu64/SVYc83IHZcpd7BWub8pd7DOR/zN1/lAfCf3xbg/pKo81G+C/eiRzX1f39WF+qPbAUejRz3utYrMVahOtO2PB9zSiwy4zLh0uN61P9iWvbrOWfcT4fS4XS4lBlGHdL3Bb/xV5YbLVedY6G/KRcpFzkXKRcpFzkXKHcV32AGPuUi5GO6rwX9WxFzs4e7ogLcqOtVmkBN73A9Jlf7nqLp60D8zlqdkJBk4JVfH7gacIqu9mzVByoFFNbbdYvYqGT/opmPrceucwd1Xw/h/hTQ39tcLgZlzI7b+MvQXB7g4xsV5XJzHxXlcPCGX5m7Hr3WpnxqcmpGSOf8D7XLOfg==';
  assertEqual(graph.toSaveString(), targetAddSilicon, 'targetAddSilicon');

  testCompareStringAndDrawing();

}

