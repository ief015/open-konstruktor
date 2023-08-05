# KOHCTPYKTOP design save data findings

For decoding design save strings:

```js
function decode(filename, saveData) {
  fs.writeFileSync(filename, zlib.inflateSync(Buffer.from(saveData, 'base64')).toString('binary'));
}
```

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

## Section 1: Field Data

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

Columns have 2 byte elements, making this section at most twice as large as all other sections.

## Section 2: ???

Columns have 1 byte elements, but can sometimes be 2 bytes, so far making this the only section
observed to have a varying size.

This section has a length of at least `0x528` ((27 * n + 3) * 44).
Currently unknown what this sections is.

## Section 3-9: ???

Columns have 1 byte elements.

These sections has a length of `0x528` ((27 * 1 + 3) * 44).
Currently unknown what these sections are.
