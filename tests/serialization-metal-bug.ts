import { assertEqual } from "@/utils/assert";
import { DesignData, decode, encode } from "@/serialization";

// This source design includes many instances of the 0x0400 metal bug from the original game.
// This test verifies that the serialization compensates for it and spits out a clean design.

export default async function() {
  const source = 'eNrtml124yAMhZMrv3QNs4V5n7XM/jcyjW1Af1w7dt1OWpLjE7fX6EMQhIBMv6dfb3/vb3/u0+3IexS8d9+0INy7FEIj2gciD/Nl1FJwxs8Pe2Yx4OrAiMzHtWCrki7IfERrHISqMh9rwYz4hI/tkZ0+Qtm8PeNjTtzho/s67fexVRI7v6uuVS1xZz+ysUH6sT8+Nn18bjzi6HgcPg4fh48HfRzJw2cXnNM59F+zKiLpdVaV5YX5qflTcwVSX9PtIU+3VZWqq2feHyp/KePlP/WmFX7cLuaq/n4/t6aIL17IqdzsL3Iz7tBVTsruZKMYz9noup3IgV2M99mwbW7ZtTlztpETttUD2xVP2eBsX7m+nLLB2YveZ4OzwdmhYROZsMHZpe6R/YgTSdMm5RndjTIJKhb4zKpyiVO1Zdr3vj6BZai14T3fXxq4WMDcFVG/nSqjzkMd6lCfUV8nVIq6iTNXmYFUwqxyS20g44rjisU5rrIcuXY2DlxtOXCFc6m/4P5S7kY7n/GXt/OJ/h3cF+OOUPlJqpiB7lcIWJP/ZYG85mBl1VGSeBZIxeRvUssmXGM5cFVgSbnOsri8kXBVnTN/hfkbLEtvasi43F8zTry/vgflo/p3cP9rroxQ+XWhks6GZlNkDR1m+Kt+XEKHzbKaDcqVLEOrXEnCTuPyL4+EOgeubHDd3pLjcn8Zt9vOu7jM3612HtyX5Y6s8gtVfeKAuO9c5kMdKsuCoRwwdff91AFUyd/q7Bu4xnLg+t10yzWWA1c4l/oL7i/lbrTzGX95O5/o38F9Me4PCZWnzptgL205X/c1VVSu4xcO+qS7DubOOTja0pSo1bJoy+LVcAje4QrjrotaSZfYAonctgCXhFsz0nKcaLjq+DvntlZMuFoMXL1yS7h1kKVcbHNBueBcUC4oF5wLygXlgnNBuaBccC4oF5QLzrXjSHarejUjIROWeF14xv0hoTK/zqq1awD3k6K2S+Z/bOR22LSsLXtZ+rNh24NpqiQ/cwpqws1WM5KUhURurXNcKtsB3uGKnnFSrvpw/nrTwV/CdWcFsZ0Pc3GOi+u4uI6L67i4joujXD3MermujrLXRiRS53811dAC';
  const target = 'eNrtmlFy2zAMRONd/+QMvUL/e5be/yKdSiYJAuBKlqIkbmmPJs6siEeQJgQSvv+8/3j/fXv/dbu/HXnPhrfhWzaEe5dGaMT+hsjDcnVqabjgl5s9sxhwfVBE5eOjYeuSbah8RBschK4qH2vDjPiEj+2WnT7C2Hx7xsecuMNH93Xa72PrJHZ+V92o9sSd86jWhpjH8frY9PG59Yij63H6OH2cPh70cSYPn91wSecwfi0qyfQ6q3J9Yblr+Wu5BOsLVmVVzR1E+cdYbq3rPaXt34+rtaoXlb51x2XUDbdZHnCTlru4KJZTLqS/oOIWy0Mu3EBbbh3DlNupkdvLnusaZ1xIru/XUM24kNxVHnIhuZDcMJpRHXMhuaXXAy4kF5Lr1hGDCsNlMoPmq23Vdkf5fGlEUpFwV6j851TOPk91qlN9Rn2dUEnzIT6zyhPIZMImb7QGMi4dlz3OcY3lyO0fw4FrLQcuNVf6C+2v5G6M8xl/9TifmN/JfTHuDJWfpIYNuMvuHxtwlESa64bBJvEqkLLL31jbJtzOcuCawJJynWW6vFFwTZ8zf6n8DZY5ejRkXO0v/GZJLTR+1PxO7rfmcobKrwuV8mnYH4c8Tufs8jfzuIaOPstqNiSXWYZWuUzCTuPqLw9DnwOXG1x3qOS42l/FHY7zLq7yd2ucJ/dluTOr/EK1K+DEA+fyPLShsmwYSuVoeO5nKkslfyNH3M5y4Poj9J6LvkDluNRc6S+0v5K7Mc5n/NXjfGJ+J/fFuP9JqDxVb0J/Wcv5vq+pNLlOVgFH21OSda5jjRttaypUmEp0sxwq4KHGPeBScR+b2kGNG6oCXmuvllsz0lJN7Limxp1z2yiOKqQPMXDtzi3h1kWWcrHNheRCcyG5kFxoLiQXkgtsVsDHXEguNHezAi640NxxjVurdjfDkAkzXhfWuD8kVObXWbVODeB+K9ROyfyviNwJm5WtZS9z/DRsZzBNZfL7paAm3Gw3w6QtGLm1z3Gr3C/wAZf2iZNyzR/nrzcd/BVcVyuI43yYi3NcXMfFdVxcx8V1XBzl2mU2ynVtlL02Iok+/wFi6M+0';

  const design = DesignData.from(await decode(source));
  const reencoded = await encode(design);

  assertEqual(reencoded, target);
}