import { ConnectionValue } from '@/serialization';
import type { DesignDataLayer } from '@/serialization';

const loader = useImageLoader();

const sprites = {
  ma3: '/tiles/ma3.png',
  mt3: '/tiles/mt3.png',
  ma2: '/tiles/ma2.png',
  mc1: '/tiles/mc1.png',
  mt: '/tiles/mt.png',
  mj: '/tiles/mj.png',
  mt2: '/tiles/mt2.png',
  ms: '/tiles/ms.png',
  ma: '/tiles/ma.png',
  mt1: '/tiles/mt1.png',
  ma1: '/tiles/ma1.png',
  mc3: '/tiles/mc3.png',
  mc2: '/tiles/mc2.png',
  ms1: '/tiles/ms1.png',
  mc: '/tiles/mc.png',
  md: '/tiles/md.png',
  pa3: '/tiles/pa3.png',
  pt3: '/tiles/pt3.png',
  pa2: '/tiles/pa2.png',
  pc1: '/tiles/pc1.png',
  pt: '/tiles/pt.png',
  pj: '/tiles/pj.png',
  pt2: '/tiles/pt2.png',
  ps: '/tiles/ps.png',
  pa: '/tiles/pa.png',
  pt1: '/tiles/pt1.png',
  pa1: '/tiles/pa1.png',
  pc3: '/tiles/pc3.png',
  pc2: '/tiles/pc2.png',
  ps1: '/tiles/ps1.png',
  pc: '/tiles/pc.png',
  pd: '/tiles/pd.png',
  na3: '/tiles/na3.png',
  nt3: '/tiles/nt3.png',
  na2: '/tiles/na2.png',
  nc1: '/tiles/nc1.png',
  nt: '/tiles/nt.png',
  nj: '/tiles/nj.png',
  nt2: '/tiles/nt2.png',
  ns: '/tiles/ns.png',
  na: '/tiles/na.png',
  nt1: '/tiles/nt1.png',
  na1: '/tiles/na1.png',
  nc3: '/tiles/nc3.png',
  nc2: '/tiles/nc2.png',
  ns1: '/tiles/ns1.png',
  nc: '/tiles/nc.png',
  nd: '/tiles/nd.png',
  pg: '/tiles/pg.png',
  pg1: '/tiles/pg1.png',
  ng: '/tiles/ng.png',
  ng1: '/tiles/ng1.png',
  mb: '/tiles/mb.png',
  pb: '/tiles/pb.png',
  nb: '/tiles/nb.png',
  mb1: '/tiles/mb1.png',
  pb1: '/tiles/pb1.png',
  nb1: '/tiles/nb1.png',
};

export enum TileType {
  Metal,
  PSilicon,
  NSilicon,
  PGateV,
  PGateH,
  NGateV,
  NGateH,
}

/**
 * -1 = prev connection, 0 = prev+next, 1 = next, null = no connection
 */
export type TileRenderDirection = number | null;

type Rotation = 0 | 1 | 2 | 3;

type Tile = {
  rot: Rotation;
  img: HTMLImageElement;
};

const tiles: {
  [key in TileType.Metal | TileType.PSilicon | TileType.NSilicon]: {
    [key in number | '']: {
      [key in number | '']: Tile;
    };
  };
} = {
  [TileType.Metal]: {
    ['-1']: {
      // left connection
      ['-1']: { rot: 3, img: loader.findImage(sprites.ma3) },
      ['0']: { rot: 3, img: loader.findImage(sprites.mt3) },
      ['1']: { rot: 2, img: loader.findImage(sprites.ma2) },
      ['']: { rot: 1, img: loader.findImage(sprites.mc1) },
    },
    ['0']: {
      // left and right connections
      ['-1']: { rot: 0, img: loader.findImage(sprites.mt) },
      ['0']: { rot: 0, img: loader.findImage(sprites.mj) },
      ['1']: { rot: 2, img: loader.findImage(sprites.mt2) },
      ['']: { rot: 0, img: loader.findImage(sprites.ms) },
    },
    ['1']: {
      // right connection
      ['-1']: { rot: 0, img: loader.findImage(sprites.ma) },
      ['0']: { rot: 1, img: loader.findImage(sprites.mt1) },
      ['1']: { rot: 1, img: loader.findImage(sprites.ma1) },
      ['']: { rot: 3, img: loader.findImage(sprites.mc3) },
    },
    ['']: {
      // no x connection
      ['-1']: { rot: 2, img: loader.findImage(sprites.mc2) },
      ['0']: { rot: 1, img: loader.findImage(sprites.ms1) },
      ['1']: { rot: 0, img: loader.findImage(sprites.mc) },
      ['']: { rot: 0, img: loader.findImage(sprites.md) },
    },
  },

  [TileType.PSilicon]: {
    ['-1']: {
      // left connection
      ['-1']: { rot: 3, img: loader.findImage(sprites.pa3) },
      ['0']: { rot: 3, img: loader.findImage(sprites.pt3) },
      ['1']: { rot: 2, img: loader.findImage(sprites.pa2) },
      ['']: { rot: 1, img: loader.findImage(sprites.pc1) },
    },
    ['0']: {
      // left and right connections
      ['-1']: { rot: 0, img: loader.findImage(sprites.pt) },
      ['0']: { rot: 0, img: loader.findImage(sprites.pj) },
      ['1']: { rot: 2, img: loader.findImage(sprites.pt2) },
      ['']: { rot: 0, img: loader.findImage(sprites.ps) },
    },
    ['1']: {
      // right connection
      ['-1']: { rot: 0, img: loader.findImage(sprites.pa) },
      ['0']: { rot: 1, img: loader.findImage(sprites.pt1) },
      ['1']: { rot: 1, img: loader.findImage(sprites.pa1) },
      ['']: { rot: 3, img: loader.findImage(sprites.pc3) },
    },
    ['']: {
      // no x connection
      ['-1']: { rot: 2, img: loader.findImage(sprites.pc2) },
      ['0']: { rot: 1, img: loader.findImage(sprites.ps1) },
      ['1']: { rot: 0, img: loader.findImage(sprites.pc) },
      ['']: { rot: 0, img: loader.findImage(sprites.pd) },
    },
  },

  [TileType.NSilicon]: {
    ['-1']: {
      // left connection
      ['-1']: { rot: 3, img: loader.findImage(sprites.na3) },
      ['0']: { rot: 3, img: loader.findImage(sprites.nt3) },
      ['1']: { rot: 2, img: loader.findImage(sprites.na2) },
      ['']: { rot: 1, img: loader.findImage(sprites.nc1) },
    },
    ['0']: {
      // left and right connections
      ['-1']: { rot: 0, img: loader.findImage(sprites.nt) },
      ['0']: { rot: 0, img: loader.findImage(sprites.nj) },
      ['1']: { rot: 2, img: loader.findImage(sprites.nt2) },
      ['']: { rot: 0, img: loader.findImage(sprites.ns) },
    },
    ['1']: {
      // right connection
      ['-1']: { rot: 0, img: loader.findImage(sprites.na) },
      ['0']: { rot: 1, img: loader.findImage(sprites.nt1) },
      ['1']: { rot: 1, img: loader.findImage(sprites.na1) },
      ['']: { rot: 3, img: loader.findImage(sprites.nc3) },
    },
    ['']: {
      // no x connection
      ['-1']: { rot: 2, img: loader.findImage(sprites.nc2) },
      ['0']: { rot: 1, img: loader.findImage(sprites.ns1) },
      ['1']: { rot: 0, img: loader.findImage(sprites.nc) },
      ['']: { rot: 0, img: loader.findImage(sprites.nd) },
    },
  },
};

const gateTiles = {
  [TileType.PGateV]: loader.findImage(sprites.pg),
  [TileType.PGateH]: loader.findImage(sprites.pg1),
  [TileType.NGateV]: loader.findImage(sprites.ng),
  [TileType.NGateH]: loader.findImage(sprites.ng1),
};

const connectionTiles = {
  v: {
    [TileType.Metal]: loader.findImage(sprites.mb),
    [TileType.PSilicon]: loader.findImage(sprites.pb),
    [TileType.NSilicon]: loader.findImage(sprites.nb),
  },
  h: {
    [TileType.Metal]: loader.findImage(sprites.mb1),
    [TileType.PSilicon]: loader.findImage(sprites.pb1),
    [TileType.NSilicon]: loader.findImage(sprites.nb1),
  },
};

export default function useTileRenderer(ctx?: CanvasRenderingContext2D) {
  const tileSize = 12;

  const getDirectionX = (
    layerH: DesignDataLayer,
    x: number,
    y: number,
  ): TileRenderDirection => {
    const cx = layerH[x]?.[y] === ConnectionValue.Connected ? 1 : 0;
    const cxp = layerH[x - 1]?.[y] === ConnectionValue.Connected ? 1 : 0;
    return cx === 0 && cxp === 0 ? null : cx - cxp;
  };

  const getDirectionY = (
    layerV: DesignDataLayer,
    x: number,
    y: number,
  ): TileRenderDirection => {
    const cy = layerV[x]?.[y] === ConnectionValue.Connected ? 1 : 0;
    const cyp = layerV[x]?.[y - 1] === ConnectionValue.Connected ? 1 : 0;
    return cy === 0 && cyp === 0 ? null : cy - cyp;
  };

  let preloaded = false;
  const preloadImages = () => {
    if (preloaded) return Promise.resolve();
    preloaded = true;
    const images = Object.values(sprites).map((src) => loader.findImage(src));
    return Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            }
          }),
      ),
    );
  };

  /**
   * Renders a tile depending on its type and connections.
   * If a numerical direction is given, the tile will be rotated accordingly.
   * If a direction is false, the tile will be rendered without connections.
   */
  const renderTile = (
    tile: TileType,
    xConnectionDir: TileRenderDirection,
    yConnectionDir: TileRenderDirection,
  ) => {
    if (!ctx) return;
    switch (tile) {
      case TileType.Metal:
      case TileType.PSilicon:
      case TileType.NSilicon: {
        const { img } = tiles[tile][xConnectionDir ?? ''][yConnectionDir ?? ''];
        ctx.drawImage(img, 0, 0);
        if ((xConnectionDir ?? -1) >= 0) {
          ctx.drawImage(connectionTiles.h[tile], tileSize, 0);
        }
        if ((yConnectionDir ?? -1) >= 0) {
          ctx.drawImage(connectionTiles.v[tile], 0, tileSize);
        }
        break;
      }
      case TileType.PGateV: {
        const img = gateTiles[tile];
        ctx.drawImage(img, 0, 0);
        if ((yConnectionDir ?? -1) >= 0) {
          ctx.drawImage(connectionTiles.v[TileType.NSilicon], 0, tileSize);
        }
        ctx.drawImage(connectionTiles.h[TileType.PSilicon], tileSize, 0);
        break;
      }
      case TileType.PGateH: {
        const img = gateTiles[tile];
        ctx.drawImage(img, 0, 0);
        if ((xConnectionDir ?? -1) >= 0) {
          ctx.drawImage(connectionTiles.h[TileType.NSilicon], tileSize, 0);
        }
        ctx.drawImage(connectionTiles.v[TileType.PSilicon], 0, tileSize);
        break;
      }
      case TileType.NGateV: {
        const img = gateTiles[tile];
        ctx.drawImage(img, 0, 0);
        if ((yConnectionDir ?? -1) >= 0) {
          ctx.drawImage(connectionTiles.v[TileType.PSilicon], 0, tileSize);
        }
        ctx.drawImage(connectionTiles.h[TileType.NSilicon], tileSize, 0);
        break;
      }
      case TileType.NGateH: {
        const img = gateTiles[tile];
        ctx.drawImage(img, 0, 0);
        if ((xConnectionDir ?? -1) >= 0) {
          ctx.drawImage(connectionTiles.h[TileType.PSilicon], tileSize, 0);
        }
        ctx.drawImage(connectionTiles.v[TileType.NSilicon], 0, tileSize);
        break;
      }
    }
  };

  return {
    getDirectionX,
    getDirectionY,
    preloadImages,
    renderTile,
  };
}
