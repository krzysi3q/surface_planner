# Project Texture Management Feature

## Overview

This feature enhancement allows users to save and load projects with their custom textures intact. The implementation optimizes file size by only including textures that are actually used in the project, making project files portable while maintaining reasonable sizes.

## Features

### Texture Preservation in Projects
- **Smart Embedding**: Only textures that are actually used by tiles in the project are saved
- **Automatic Import**: When loading a project, textures are automatically added to the user's texture library
- **Deduplication**: If the same texture already exists in the library, it won't be duplicated
- **ID Mapping**: Texture references are properly updated when importing to maintain tile-texture relationships

### File Size Optimization
- **Used-Only Policy**: Only textures referenced by tiles are included in the export
- **Efficient Storage**: Textures are stored as base64 strings within the JSON project file
- **No Redundancy**: Duplicate textures are automatically detected and merged

### User Experience
- **Seamless Operation**: Export and import work exactly the same as before from the user's perspective
- **Status Messages**: Users receive feedback about how many textures were included/imported
- **Backward Compatibility**: Old project files without textures still work perfectly

## Technical Implementation

### Data Structure Changes

#### Project File Format
```typescript
interface SurfaceType {
  id: string;
  points: Point[][];
  pattern: Pattern;
  textures?: TextureItem[]; // New: embedded textures
}
```

#### Texture Library Context
New methods added to `TextureLibraryContext`:
- `addTexturesFromProject(textures)`: Bulk import textures from project
- `getUsedTextures(textureIds)`: Get texture data for specific IDs

### Core Functions

#### Export Process
1. **Identify Used Textures**: Scan all tiles in the project to find referenced texture IDs
2. **Collect Texture Data**: Retrieve the actual texture data from the library
3. **Embed in Project**: Add the texture array to the project data
4. **Generate File**: Export as JSON with embedded textures

#### Import Process
1. **Parse Project File**: Load and validate the project JSON
2. **Extract Textures**: Check for embedded texture data
3. **Import to Library**: Add textures to the user's library (with deduplication)
4. **Update References**: Map old texture IDs to new ones if needed
5. **Load Project**: Apply the project with updated texture references

### Utility Functions

#### `getUsedTextureIds(surface)`
Scans through all tiles in a surface and returns an array of unique texture IDs that are actually being used.

```typescript
export const getUsedTextureIds = (surface: SurfaceData): string[] => {
  const textureIds: string[] = [];
  surface.pattern.tiles.forEach(tile => {
    if (tile.textureId) {
      textureIds.push(tile.textureId);
    }
  });
  return [...new Set(textureIds)]; // Remove duplicates
};
```

#### `updateTextureReferences(surface, idMapping)`
Updates all texture references in tiles based on an ID mapping (old ID → new ID).

```typescript
export const updateTextureReferences = (
  surface: SurfaceData,
  idMapping: Map<string, string>
): SurfaceData => {
  const updatedTiles = surface.pattern.tiles.map(tile => {
    if (tile.textureId && idMapping.has(tile.textureId)) {
      return { ...tile, textureId: idMapping.get(tile.textureId) };
    }
    return tile;
  });
  // ... return updated surface
};
```

## Usage Examples

### Export with Textures
```javascript
// User has a project with 5 tiles, 3 using different textures
// Only the 3 used textures will be embedded in the exported file
// Project file size is optimized while maintaining full functionality
```

### Import with Textures
```javascript
// User receives a project file with embedded textures
// Textures are automatically added to their library
// If any textures already exist (same base64), they're reused
// Project loads with all textures properly applied
```

## Benefits

### For Users
- **Portability**: Projects can be shared between devices/users with textures intact
- **Simplicity**: No need to manually manage texture files separately
- **Efficiency**: Only necessary textures are included, keeping file sizes reasonable

### For Developers
- **Clean Architecture**: Texture management is centralized in the TextureLibraryContext
- **Backward Compatibility**: Old project files continue to work without modification
- **Extensible**: Easy to add additional texture metadata or features in the future

## File Structure

```
src/
├── components/Planner/
│   ├── types.ts                     # Updated with TextureItem type
│   ├── utils.ts                     # New utility functions
│   ├── Planner.tsx                  # Updated export/import functions
│   └── PatternEditor/
│       └── TextureLibraryContext.tsx # Enhanced with bulk operations
```

## Future Enhancements

- **Texture Compression**: Further optimize file sizes with image compression
- **Texture Metadata**: Store additional information like original filename, upload date
- **Texture Sharing**: Cloud-based texture library for sharing between users
- **Batch Operations**: Import/export multiple projects with texture management
