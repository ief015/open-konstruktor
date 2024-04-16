import { DesignDataLayer, ConnectionValue } from "@/serialization";

const loader = useImageLoader();

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
export type TileRenderDirection = number|null;

type Rotation = 0|1|2|3;

type Tile = {
  rot: Rotation;
  img: HTMLImageElement;
}

const tiles: {
  [key in TileType.Metal | TileType.PSilicon | TileType.NSilicon]: {
    [key in number|'']: {
      [key in number|'']: Tile;
    };
  };
} = {

  [TileType.Metal]: {
    ['-1']: { // left connection
      ['-1']:    { rot: 3, img: loader.findImage('/tiles/ma3.png') },
      ['0']:     { rot: 3, img: loader.findImage('/tiles/mt3.png') },
      ['1']:     { rot: 2, img: loader.findImage('/tiles/ma2.png') },
      ['']:      { rot: 1, img: loader.findImage('/tiles/mc1.png') },
    },
    ['0']: { // left and right connections
      ['-1']:    { rot: 0, img: loader.findImage('/tiles/mt.png') },
      ['0']:     { rot: 0, img: loader.findImage('/tiles/mj.png') },
      ['1']:     { rot: 2, img: loader.findImage('/tiles/mt2.png') },
      ['']:      { rot: 0, img: loader.findImage('/tiles/ms.png') },
    },
    ['1']: { // right connection
      ['-1']:    { rot: 0, img: loader.findImage('/tiles/ma.png') },
      ['0']:     { rot: 1, img: loader.findImage('/tiles/mt1.png') },
      ['1']:     { rot: 1, img: loader.findImage('/tiles/ma1.png') },
      ['']:      { rot: 3, img: loader.findImage('/tiles/mc3.png') },
    },
    ['']: { // no x connection
      ['-1']:    { rot: 2, img: loader.findImage('/tiles/mc2.png') },
      ['0']:     { rot: 1, img: loader.findImage('/tiles/ms1.png') },
      ['1']:     { rot: 0, img: loader.findImage('/tiles/mc.png') },
      ['']:      { rot: 0, img: loader.findImage('/tiles/md.png') },
    },
  },

  [TileType.PSilicon]: {
    ['-1']: { // left connection
      ['-1']:    { rot: 3, img: loader.findImage('/tiles/pa3.png') },
      ['0']:     { rot: 3, img: loader.findImage('/tiles/pt3.png') },
      ['1']:     { rot: 2, img: loader.findImage('/tiles/pa2.png') },
      ['']:      { rot: 1, img: loader.findImage('/tiles/pc1.png') },
    },
    ['0']: { // left and right connections
      ['-1']:    { rot: 0, img: loader.findImage('/tiles/pt.png') },
      ['0']:     { rot: 0, img: loader.findImage('/tiles/pj.png') },
      ['1']:     { rot: 2, img: loader.findImage('/tiles/pt2.png') },
      ['']:      { rot: 0, img: loader.findImage('/tiles/ps.png') },
    },
    ['1']: { // right connection
      ['-1']:    { rot: 0, img: loader.findImage('/tiles/pa.png') },
      ['0']:     { rot: 1, img: loader.findImage('/tiles/pt1.png') },
      ['1']:     { rot: 1, img: loader.findImage('/tiles/pa1.png') },
      ['']:      { rot: 3, img: loader.findImage('/tiles/pc3.png') },
    },
    ['']: { // no x connection
      ['-1']:    { rot: 2, img: loader.findImage('/tiles/pc2.png') },
      ['0']:     { rot: 1, img: loader.findImage('/tiles/ps1.png') },
      ['1']:     { rot: 0, img: loader.findImage('/tiles/pc.png') },
      ['']:      { rot: 0, img: loader.findImage('/tiles/pd.png') },
    },
  },

  [TileType.NSilicon]: {
    ['-1']: { // left connection
      ['-1']:    { rot: 3, img: loader.findImage('/tiles/na3.png') },
      ['0']:     { rot: 3, img: loader.findImage('/tiles/nt3.png') },
      ['1']:     { rot: 2, img: loader.findImage('/tiles/na2.png') },
      ['']:      { rot: 1, img: loader.findImage('/tiles/nc1.png') },
    },
    ['0']: { // left and right connections
      ['-1']:    { rot: 0, img: loader.findImage('/tiles/nt.png') },
      ['0']:     { rot: 0, img: loader.findImage('/tiles/nj.png') },
      ['1']:     { rot: 2, img: loader.findImage('/tiles/nt2.png') },
      ['']:      { rot: 0, img: loader.findImage('/tiles/ns.png') },
    },
    ['1']: { // right connection
      ['-1']:    { rot: 0, img: loader.findImage('/tiles/na.png') },
      ['0']:     { rot: 1, img: loader.findImage('/tiles/nt1.png') },
      ['1']:     { rot: 1, img: loader.findImage('/tiles/na1.png') },
      ['']:      { rot: 3, img: loader.findImage('/tiles/nc3.png') },
    },
    ['']: { // no x connection
      ['-1']:    { rot: 2, img: loader.findImage('/tiles/nc2.png') },
      ['0']:     { rot: 1, img: loader.findImage('/tiles/ns1.png') },
      ['1']:     { rot: 0, img: loader.findImage('/tiles/nc.png') },
      ['']:      { rot: 0, img: loader.findImage('/tiles/nd.png') },
    },
  },

};

const gateTiles = {
  [TileType.PGateV]: loader.findImage('/tiles/pg.png'),
  [TileType.PGateH]: loader.findImage('/tiles/pg1.png'),
  [TileType.NGateV]: loader.findImage('/tiles/ng.png'),
  [TileType.NGateH]: loader.findImage('/tiles/ng1.png'),
}

const connectionTiles = {
  v: {
    [TileType.Metal]: loader.findImage('/tiles/mb.png'),
    [TileType.PSilicon]: loader.findImage('/tiles/pb.png'),
    [TileType.NSilicon]: loader.findImage('/tiles/nb.png'),
  },
  h: {
    [TileType.Metal]: loader.findImage('/tiles/mb1.png'),
    [TileType.PSilicon]: loader.findImage('/tiles/pb1.png'),
    [TileType.NSilicon]: loader.findImage('/tiles/nb1.png'),
  },
}

export default function useTileRenderer(ctx: CanvasRenderingContext2D) {

  const tileSize = 12;

  const getDirectionX = (layerH: DesignDataLayer, x: number, y: number): TileRenderDirection => {
    const cx = (layerH[x]?.[y] === ConnectionValue.Connected) ? 1 : 0;
    const cxp = (layerH[x-1]?.[y] === ConnectionValue.Connected) ? 1 : 0;
    return ((cx === 0 && cxp === 0) ? null : (cx - cxp));
  }

  const getDirectionY = (layerV: DesignDataLayer, x: number, y: number): TileRenderDirection => {
    const cy = (layerV[x]?.[y] === ConnectionValue.Connected) ? 1 : 0;
    const cyp = (layerV[x]?.[y-1] === ConnectionValue.Connected) ? 1 : 0;
    return ((cy === 0 && cyp === 0) ? null : (cy - cyp));
  }

  /**
   * Renders a tile depending on its type and connections.
   * If a numerical direction is given, the tile will be rotated accordingly.
   * If a direction is false, the tile will be rendered without connections.
   */
  const renderTile = (tile: TileType, xConnectionDir: TileRenderDirection, yConnectionDir: TileRenderDirection) => {
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
  }

  return {
    getDirectionX,
    getDirectionY,
    renderTile,
  };
}