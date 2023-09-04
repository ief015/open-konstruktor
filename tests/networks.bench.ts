import { kohctpyktop } from "@/circuits/kohctpyktop";
import { Network } from "@/simulation";
import { bench } from "vitest";

const saveString = 'eNrtml124yAMhZMrv3QNs4V5n7XM/jcyjW1Af1w7dt1OWpLjE7fX6EMQhIBMv6dfb3/vb3/u0+3IexS8d9+0INy7FEIj2gciD/Nl1FJwxs8Pe2Yx4OrAiMzHtWCrki7IfERrHISqMh9rwYz4hI/tkZ0+Qtm8PeNjTtzho/s67fexVRI7v6uuVS1xZz+ysUH6sT8+Nn18bjzi6HgcPg4fh48HfRzJw2cXnNM59F+zKiLpdVaV5YX5qflTcwVSX9PtIU+3VZWqq2feHyp/KePlP/WmFX7cLuaq/n4/t6aIL17IqdzsL3Iz7tBVTsruZKMYz9noup3IgV2M99mwbW7ZtTlztpETttUD2xVP2eBsX7m+nLLB2YveZ4OzwdmhYROZsMHZpe6R/YgTSdMm5RndjTIJKhb4zKpyiVO1Zdr3vj6BZai14T3fXxq4WMDcFVG/nSqjzkMd6lCfUV8nVIq6iTNXmYFUwqxyS20g44rjisU5rrIcuXY2DlxtOXCFc6m/4P5S7kY7n/GXt/OJ/h3cF+OOUPlJqpiB7lcIWJP/ZYG85mBl1VGSeBZIxeRvUssmXGM5cFVgSbnOsri8kXBVnTN/hfkbLEtvasi43F8zTry/vgflo/p3cP9rroxQ+XWhks6GZlNkDR1m+Kt+XEKHzbKaDcqVLEOrXEnCTuPyL4+EOgeubHDd3pLjcn8Zt9vOu7jM3612HtyX5Y6s8gtVfeKAuO9c5kMdKsuCoRwwdff91AFUyd/q7Bu4xnLg+t10yzWWA1c4l/oL7i/lbrTzGX95O5/o38F9Me4PCZWnzptgL205X/c1VVSu4xcO+qS7DubOOTja0pSo1bJoy+LVcAje4QrjrotaSZfYAonctgCXhFsz0nKcaLjq+DvntlZMuFoMXL1yS7h1kKVcbHNBueBcUC4oF5wLygXlgnNBuaBccC4oF5QLzrXjSHarejUjIROWeF14xv0hoTK/zqq1awD3k6K2S+Z/bOR22LSsLXtZ+rNh24NpqiQ/cwpqws1WM5KUhURurXNcKtsB3uGKnnFSrvpw/nrTwV/CdWcFsZ0Pc3GOi+u4uI6L67i4joujXD3MermujrLXRiRS53811dAC';
const net = Network.from(saveString);
const sim = kohctpyktop['15 KR8S1 8-BIT ADDRESSABLE SRAM'].setup(net);

bench('steps-per-second', () => {
  if (sim.step(false)) {
    sim.reset(false);
  }
}, { time: 2000 });

bench('steps-per-second-recorded', () => {
  if (sim.step(true)) {
    sim.reset(true);
  }
}, { time: 2000 });

bench('steps-per-second-full-sequences', () => {
  sim.run(280, undefined, false);
}, { time: 2000 });

bench('steps-per-second-full-sequences-recorded', () => {
  sim.run(280, undefined, true);
}, { time: 2000 });
