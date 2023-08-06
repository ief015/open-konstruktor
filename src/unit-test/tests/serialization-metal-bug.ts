import { assertEqual } from "..";
import { DesignData, decode, encode } from "../../serialization";

// This source design includes many instances of the 0x0400 metal bug from the original game.
// This test verifies that the serialization compensates for it and spits out a clean design.

const source = 'eNrtml124yAMhZMrv3QNs4V5n7XM/jcyjW1Af1w7dt1OWpLjE7fX6EMQhIBMv6dfb3/vb3/u0+3IexS8d9+0INy7FEIj2gciD/Nl1FJwxs8Pe2Yx4OrAiMzHtWCrki7IfERrHISqMh9rwYz4hI/tkZ0+Qtm8PeNjTtzho/s67fexVRI7v6uuVS1xZz+ysUH6sT8+Nn18bjzi6HgcPg4fh48HfRzJw2cXnNM59F+zKiLpdVaV5YX5qflTcwVSX9PtIU+3VZWqq2feHyp/KePlP/WmFX7cLuaq/n4/t6aIL17IqdzsL3Iz7tBVTsruZKMYz9noup3IgV2M99mwbW7ZtTlztpETttUD2xVP2eBsX7m+nLLB2YveZ4OzwdmhYROZsMHZpe6R/YgTSdMm5RndjTIJKhb4zKpyiVO1Zdr3vj6BZai14T3fXxq4WMDcFVG/nSqjzkMd6lCfUV8nVIq6iTNXmYFUwqxyS20g44rjisU5rrIcuXY2DlxtOXCFc6m/4P5S7kY7n/GXt/OJ/h3cF+OOUPlJqpiB7lcIWJP/ZYG85mBl1VGSeBZIxeRvUssmXGM5cFVgSbnOsri8kXBVnTN/hfkbLEtvasi43F8zTry/vgflo/p3cP9rroxQ+XWhks6GZlNkDR1m+Kt+XEKHzbKaDcqVLEOrXEnCTuPyL4+EOgeubHDd3pLjcn8Zt9vOu7jM3612HtyX5Y6s8gtVfeKAuO9c5kMdKsuCoRwwdff91AFUyd/q7Bu4xnLg+t10yzWWA1c4l/oL7i/lbrTzGX95O5/o38F9Me4PCZWnzptgL205X/c1VVSu4xcO+qS7DubOOTja0pSo1bJoy+LVcAje4QrjrotaSZfYAonctgCXhFsz0nKcaLjq+DvntlZMuFoMXL1yS7h1kKVcbHNBueBcUC4oF5wLygXlgnNBuaBccC4oF5QLzrXjSHarejUjIROWeF14xv0hoTK/zqq1awD3k6K2S+Z/bOR22LSsLXtZ+rNh24NpqiQ/cwpqws1WM5KUhURurXNcKtsB3uGKnnFSrvpw/nrTwV/CdWcFsZ0Pc3GOi+u4uI6L67i4joujXD3MermujrLXRiRS53811dAC';
const target = 'eJztmV1y2zAMhGPALz5Dr9D3niX3v0imkgDidy3b8rT0iB7FTpbYjyBFSIqvv6+/bt+X25/L9euZ1xl4aV8wkMJLgmgQfYfMo+VwqgQu+KVzZIpBGAMiohy3wDEkG4hypDE5lIaKctTAivhAjqPLzhzJeO5bR0jckWM4nfbnOAZph7ojx6+SuHMd0d4A69jvj7s5PrYfYeCZ45njmeMbcgSvM/AtgcvtHPVtUZm5PF5VeW209FreLZeJtZFVWVXTg0l+Mc4jWvtI7N+Pq5vqonKMdtzUHHc4N9wicheXxLnkUoj03IANXHFuuRQm2nJ1DkuuUzPXy5EbgisueSU6h3G1asVt5tnJLdePq1VLbprNrPZcglwZdcMlyCXIDfuIk0qGy8UKmlPbqqOHfH5rRaK+7SuVH6cyVP/VqLA645hP9VQ/Rp2nVLL5kK9Z2w/WWHffaA0q7ihDq8oeF7jGOXOta8G1zonLmAvzJZwv5Gbvw/JtvF9f35M7Gde2KdVZSmV6AHcibbf96/Pvdg8mjxpyE48Kqbqvj6saW3Cdc+KawlJyg7PnEuKaMVf5Mso3OTtuUWYdF+druud8rVxwg+q59g8ndy5uegD3bUp1mlIJr4baZRQHXwzNOq6lg83pZD0gl6s7NOUm1XHxycNpzImbxhy4Rii4OF/EzTGPcFG+0fTkfgz3v6kbB6qzlEr9j3L1D1i5FG7XTCk78sDA6wLzcOboLQC9f9Orb+I658QNIw5c55y4jLkwX8L5Qu6deX4lXzzPmIvzPblzcV2bUn3/N+DkD+vsbsAS13xp5jY6pW+xdTOvf7rF77jFCKvqzNaZozpiNdGSy4i7PdQ6Z7FZn4Mil0ZswdU7UuaCKx23ipmdxywWXCsm7lifkivBNddZdyritvla647bzbOx7rkEuc36Omuo9tzqvCIXDLjF+RxjW26xj2p1id+tml0o52FQw/FyRWrbMaWyPl5VdWlI3z2X5PJXJsVyzo15Vecoj2Kbr7NEpP02NVo7rqgFN400cbWcJa6OmVLCfoM3XPm155q3kG+0TvkCrhOreX6ai/O9y7VpH8w12tFc73EoN7XjuPQs126z7l7XVtn3ViQw5h9i6M+0';

export default async function() {

  const design = DesignData.from(await decode(source));
  const reencoded = await encode(design);

  assertEqual(reencoded, target);

}