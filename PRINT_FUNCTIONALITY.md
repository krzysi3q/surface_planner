# Print Functionality Documentation

## Overview

The floor planner now includes a print feature that allows users to print their designs on standard A4 paper, regardless of the project's position or zoom level on screen.

## Features

- **Auto-fitting**: The print function automatically calculates the bounding box of all visible content (surfaces, walls, and drawing-in-progress) and scales it to fit on an A4 page
- **Centered layout**: Content is automatically centered on the page with appropriate padding
- **Multi-language support**: Print button tooltip supports English, Polish, Spanish, and Chinese
- **Clean output**: Creates a clean white background for printing and removes UI elements

## How it works

1. **Content Detection**: The system scans for all drawable elements:
   - Main surface polygons
   - Current drawing surfaces (temporary)
   - Wall drawing points
   - Current wall being drawn (preview)

2. **Bounding Box Calculation**: Calculates the minimum and maximum X,Y coordinates to determine the content area

3. **Auto-scaling**: 
   - Uses A4 portrait dimensions (793x1122 pixels at 96dpi)
   - Calculates scale factor to fit content with 40px padding
   - Never scales up (max scale = 1), only scales down if needed

4. **Print Preparation**:
   - Clones the Konva stage for printing
   - Adds white background
   - Centers content on page
   - Creates temporary print-specific styles

## Usage

1. Click the printer icon in the toolbar (desktop only)
2. The system will automatically prepare the print view
3. Browser print dialog will appear
4. Print as normal

## Technical Implementation

- Uses Konva stage cloning to maintain rendering quality
- Creates off-screen container to avoid UI interference
- Applies print-specific CSS for clean output
- Automatic cleanup after printing

## Browser Compatibility

Works with all modern browsers that support:
- Canvas 2D context
- CSS print media queries
- DOM manipulation

## Limitations

- Currently desktop only (touch devices show different toolbar)
- Requires JavaScript enabled
- Content must exist to trigger auto-fitting (fallback to regular print if empty)
