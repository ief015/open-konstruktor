# KOHCTPYKTOP design save data findings

# Format

Save data is compressed with zlib and encoded to base64.

Uncompressed data length is varied, but not by much. Position of EOF in an empty save is `0x332B`.

The first 4 bytes appear to be unchanged in all design saves, possibly a magic number.
They are `04 2C 04 1B`.

The next 3 bytes appear to be section markers found throughout the design data. They are `09 59 01`.

See [Sections](#sections).

# Sections

Sections are split up by markers as mentioned in [Format](#format). There appears to always be
9 sections in total. These sections include 2D data (in vertical columns top-bottom from left-right format).
Each column starts with the following bytes: `09 37 01`.

## Section 1: Silicon layer
---

This section has a length of `0x9CC` ((27 * 2 + 3) * 44 ).
This appears to be the tile field for silicon.

By placing single squares of n-silicon in each corner, the following addresses in the save data are
determined:

top left:     `0x000000EF`
bottom left:  `0x00000123`
top right:    `0x000008BA`
bottom right: `0x000008EE`

This suggests the following:

- Tiles are written in vertical strokes: from top-left, to bottom, then from left to right.
- The four blocked off columns on either side of the field are serialized in the design data, even
though they are never changed.
- rows x columns : 27 x 44

Columns have 2 byte elements, making this section at most twice as large as all other sections:

`04 01`: N Silicon
`04 02`: P Silicon
`00 00`: Metal
`00 00`: N Silicon + Metal
`00 00`: N Silicon + Via
`00 00`: N Silicon + Metal + Via
`00 00`: P Silicon + Metal
`00 00`: P Silicon + Via
`00 00`: P Silicon + Metal + Via

## Section 2: Metal layer
---

This section has a length of at least `0x528` ((27 + 3 + n) * 44) so far making this the only section
observed to have a varying size. The cause of varying column size (*n*) is currently unknown.

It may have something to do with level pin terminals, but this speculation.

Columns have 1 byte elements:

`02`: No metal
`03`: Metal

## Section 3-4: Gate layers? (speculation)
---

These sections has a length of `0x528` ((27 * 1 + 3) * 44).
Currently unknown what these sections are.

Columns have 1 byte elements.

## Second 5: Via layer
---

This sections has a length of `0x528` ((27 * 1 + 3) * 44).

Columns have 1 byte elements:

`02`: No via
`03`: Via

## Section 6-9: Tile connectivity layers? (speculation)
---

These sections has a length of `0x528` ((27 * 1 + 3) * 44).
Currently unknown what these sections are.

Columns have 1 byte elements.