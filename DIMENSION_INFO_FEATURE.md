# Dimension Information Feature

## Overview
Added a comprehensive dimension information panel to the floor planner UI that displays real-time measurements for surfaces, walls, and corners.

## Features Implemented

### 1. Surface Area Display
- Shows the total surface area of all surfaces in square meters
- Updates automatically when surfaces are modified
- Uses the existing `getSurfaceArea()` utility function

### 2. Perimeter Display  
- Calculates and displays the total perimeter of all surfaces in meters
- Sums up all wall lengths across all surface planes
- Useful for estimating trim/molding requirements

### 3. Selected Wall Length
- Shows the length of the currently selected wall when in edit-wall mode
- Displayed with higher precision (3 decimal places) for accuracy
- Color-coded in blue to distinguish from general measurements

### 4. Corner Angle Display
- Shows the interior angle of the currently selected corner when in edit-corner mode
- Uses the existing `getAngles()` utility function
- Color-coded in green to distinguish from other measurements
- Displays angle in degrees with 1 decimal place precision

## Implementation Details

### Component Structure
- **File**: `src/components/Planner/components/DimensionInfo.tsx`
- **Integration**: Added to main `Planner.tsx` component
- **Positioning**: Bottom-left corner of the planner canvas

### UI Design
- Clean, professional panel with subtle shadow and border
- Responsive design that adapts to mobile and desktop screens
- Monospace font for numerical values for better alignment
- Color-coded sections for different types of measurements
- Clear section headers and labels

### Internationalization
- Added translations for all labels in 4 languages:
  - English: Surface Area, Perimeter, Selected Wall, Corner Angle
  - Spanish: Área de Superficie, Perímetro, Pared Seleccionada, Ángulo de Esquina
  - Polish: Powierzchnia, Obwód, Wybrana Ściana, Kąt Narożnika
  - Chinese: 表面积, 周长, 选中的墙, 角度

### Unit Conversion
- Automatically converts from internal pixel units to metric units
- Uses scale factor of 0.01 (1 pixel = 1cm)
- Surface area displayed in m² (square meters)
- Linear measurements displayed in m (meters)
- Angles displayed in degrees (°)

### Responsive Behavior
- Adapts text size and spacing for mobile devices
- Maintains readability across different screen sizes
- Positioned to avoid interference with existing UI elements

## User Experience
- Information is always visible (except in preview mode)
- Updates in real-time as user modifies the floor plan
- Contextual information appears when relevant (selected wall/corner)
- Non-intrusive placement that doesn't obstruct the main canvas

## Technical Benefits
- Reuses existing utility functions for calculations
- Minimal performance impact through React.useMemo optimization
- Clean separation of concerns with dedicated component
- Type-safe implementation with TypeScript
- Follows existing code patterns and styling conventions
