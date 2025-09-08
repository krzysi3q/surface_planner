# Custom Texture Upload Feature

## Overview

The Pattern Editor now supports uploading custom texture images for tiles. This feature allows users to apply their own images as repeating patterns on tiles, giving them complete creative control over their designs.

## Features

### Upload Custom Textures
- **Supported formats**: JPEG, PNG, WebP
- **File size limit**: 10MB maximum
- **Automatic optimization**: Images are automatically resized to 512x512 pixels for optimal performance
- **Quality control**: Images are compressed to maintain reasonable file sizes while preserving visual quality

### Storage Format
- **Base64 encoding**: Images are converted to base64 strings for storage
- **JSON integration**: Textures are stored directly within the pattern JSON, making patterns fully portable
- **Self-contained**: No external dependencies - patterns with textures work independently

### User Interface
- **Desktop-focused**: Texture upload is available on desktop/laptop devices
- **Intuitive controls**: Simple upload button integrated into the tile editing panel
- **Visual feedback**: Clear indication when textures are applied
- **Error handling**: User-friendly error messages for invalid files

## How It Works

### Technical Implementation

1. **File Selection**: User clicks "Upload Texture" button to open file dialog
2. **Validation**: File type and size are validated client-side
3. **Processing**: Image is loaded into a canvas element for resizing
4. **Optimization**: Image is resized to 512x512px and compressed to JPEG format (80% quality)
5. **Conversion**: Processed image is converted to base64 data URL
6. **Storage**: Base64 string is stored in the tile's `texture` property
7. **Rendering**: Konva.js uses the base64 image as a fill pattern for the tile

### Code Structure

- `src/utils/imageUtils.ts`: Image processing utilities
- `src/components/Planner/PatternEditor/TextureUpload.tsx`: Upload UI component
- `src/components/Planner/PatternEditor/Tile.tsx`: Updated to support texture rendering
- `src/components/Planner/types.ts`: Extended TileType interface with texture property

## Usage Instructions

1. **Open Pattern Editor**: Navigate to the pattern editor in the planner
2. **Add a Tile**: Create any tile shape (rectangle, square, triangle, etc.)
3. **Select Tile**: Click on the tile to select it
4. **Upload Texture**: Click the "Upload Texture" button in the tile editing panel
5. **Choose Image**: Select a JPEG, PNG, or WebP image file (max 10MB)
6. **Apply**: The texture will be automatically applied to the selected tile
7. **Remove (Optional)**: Use the remove button (X) to clear the texture and revert to solid color

## Limitations

- **Device Support**: Texture upload is only available on desktop/laptop devices (not on touch devices)
- **File Size**: Maximum 10MB per image
- **Format Support**: Only JPEG, PNG, and WebP formats are supported
- **Performance**: Large numbers of textured tiles may impact rendering performance

## Future Enhancements

- Touch device support
- Texture scaling and positioning controls
- Texture library with common patterns
- Texture sharing between tiles
- Advanced texture effects (rotation, opacity, blend modes)

## Internationalization

The feature includes full internationalization support with translations for:
- English
- Polish 
- Spanish
- Chinese (Simplified)

All user-facing text, error messages, and tooltips are properly localized.
