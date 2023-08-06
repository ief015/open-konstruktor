# KOHCTPYKTOP Design save string format

All values formatted as `code` are hexidecimal. Data is little-endian.

# Format

Save data is compressed with zlib and encoded to base64.

Uncompressed data length is varied ([possibly due to a bug](#layer-2-metal)) when exported by the
game, but not by much. Position of EOF in an empty save is `332B`.

The first 4 bytes are dimensions of the layers.
They are `04 2C 04 1B`, representing the 44 (`2C`) columns of 27 (`1B`) elements.

The next 3 bytes appear to be layer markers found throughout the design data. They are `09 59 01`.

See [Layers](#layers).

By placing single squares of n-silicon in each corner, the following addresses in the save data are
determined:

- `000000EF` Top left
- `00000123` Bottom left
- `000008BA` Top right
- `000008EE` Bottom right

This suggests the following:

- Tiles are written in vertical strokes: from top-left, to bottom-left, from left to right.
- The four user-uneditable columns on either side of the field are serialized in the design data,
even though they are never changed (the only exception being the [metal horizontal connection layer](#layer-8-metal-horizontal-connections), 4th column).
- The central 36 columns are the user-editable columns.

# Layers

There are 9 layers in total.
Each layer starts with a layer marker `09 59 01` as mentioned in [Format](#format).
These layers include 2D data (in vertical columns top-bottom from left-right format).
Each column starts with the following bytes: `09 37 01`.

## Layer 1: Silicon

This layer has a length of `9CC` *((27 * 2 + 3) * 44)*.

Columns have 27 2-byte elements, making this layer at most twice as large as all other layers:

- `04 00` Empty
- `04 01` N Silicon
- `04 02` P Silicon

The purpose of the `04` bytes is currently unknown.

## Layer 2: Metal

This layer has a length of at least `528` *((27 + 3 + n) * 44)*, making this the only layer
observed to have a varying length.

Columns have at least 27 1-byte elements:

- `02` Empty
- `03` Metal

The cause of varying column size (*n*) is due to some elements of empty metal being written as
`04 00` instead of `02`. The cause of this is currently unknown. It may be caused by a bug when
exporting some designs in the game.

Instances of `04 00` in this layer can be safely replaced with `02`. Doing so will make all
uncompressed designs uniform in size, and re-encoding these changes will load perfectly fine in the
game.

## Layer 3: Vertical gate positions

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` No gate
- `03` Gate

The element with the connected value represents the position of the gate itself.
For example:

```
- - P - -
- N X N -
- - - - -
- P X P -
- - N - -

N = N silicon
P = P silicon
X = "Gate" value 0x03
```

The direction of connection is determined in the [silicon vertical connection layer](#layer-7-silicon-vertical-connections).

There is no distiction between NPN and PNP gates.

## Layer 4: Horizontal gate positions

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` Empty
- `03` Gate

Similar to [Layer 3](#layer-3-vertical-gate-positions),
the element with the connected value represents the position of the gate itself.

The direction of connection is determined in the [silicon horizontal connection layer](#layer-6-silicon-horizontal-connections).

There is no distiction between NPN and PNP gates.

## Layer 5: Vias

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` Empty
- `03` Via

## Layer 6: Silicon horizontal connections

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` No connection
- `03` Connected

The position of the connection in the layer represents a silicon tile with a connection to the
silicon tile to the right of it.

## Layer 7: Silicon vertical connections

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` No connection
- `03` Connected

The position of the connection in the layer represents a silicon tile with a connection to the
silicon tile underneath it.

## Layer 8: Metal horizontal connections

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` No connection
- `03` Connected

The position of the connection in the layer represents a metal tile with a connection to the
metal tile to the right of it.

## Layer 9: Metal vertical connections

This layer has a length of `528` *((27 + 3) * 44)*.

Columns have 27 1-byte elements:

- `02` No connection
- `03` Connected

The position of the connection in the layer represents a metal tile with a connection to the
metal tile underneath it.
