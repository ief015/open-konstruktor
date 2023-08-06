# KOHCTPYKTOP design save data findings

# Format

Save data is compressed with zlib and encoded to base64.

Uncompressed data length is varied, but not by much. Position of EOF in an empty save is `0x332B`.

The first 4 bytes are dimensions of the layers.
They are `04 2C 04 1B`, representing the 44 (`2C`) columns of 27 (`1B`) elements.

The next 3 bytes appear to be layer markers found throughout the design data. They are `09 59 01`.

See [Layers](#layers).

# Layers

Layers are split up by markers as mentioned in [Format](#format). There appears to always be
9 layers in total. These layers include 2D data (in vertical columns top-bottom from left-right format).
Each column starts with the following bytes: `09 37 01`.

## Layer 1: Silicon

This layer has a length of `0x9CC` ((27 * 2 + 3) * 44).
This appears to be the tile field for silicon.

By placing single squares of n-silicon in each corner, the following addresses in the save data are
determined:

- Top left:     `0x000000EF`
- Bottom left:  `0x00000123`
- Top right:    `0x000008BA`
- Bottom right: `0x000008EE`

This suggests the following:

- Tiles are written in vertical strokes: from top-left, to bottom, then from left to right.
- The four blocked off columns on either side of the field are serialized in the design data, even
though they are never changed. The central 36 columns are user-editable.

Columns have 2 byte elements, making this layer at most twice as large as all other layers:

- `04 00`: Empty
- `04 01`: N Silicon
- `04 02`: P Silicon

The purpose of the `04` bytes is currently unknown.

## Layer 2: Metal

This layer has a length of at least `0x528` ((27 + 3 + n) * 44) so far making this the only layer
observed to have a varying size.
The cause of varying column size (*n*) is currently unknown.
It may have something to do with level pin terminals, but this speculation.

Columns have 1 byte elements:

- `02`: Empty
- `03`: Metal

## Layer 3-4: Gate layers? (speculation)

These layers has a length of `0x528` ((27 + 3) * 44).
Currently unknown what these layers are.

Columns have 1 byte elements.

## Layer 5: Vias

This layers has a length of `0x528` ((27 + 3) * 44).

Columns have 1 byte elements:

- `02`: Empty
- `03`: Via

## Layer 6-9: Tile connectivity layers? (speculation)

These layers has a length of `0x528` ((27 + 3) * 44).
Currently unknown what these layers are.

Columns have 1 byte elements.