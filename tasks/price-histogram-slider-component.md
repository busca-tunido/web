# Task: Price Histogram Range Slider Component

## Execution Profile

- **Wave / Batch**: Wave 1 (Backend Core & Frontend UI Foundations)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web UI Search Module)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated new component)`

## Target Files

- **Exclusive**:
  - `src/components/search/price-histogram-range-slider.tsx` [NEW]

## Objective

Build a visual and touch-friendly price range slider inspired by Airbnb:
1. Render a dynamic bar chart with 28 vertical bars representing the listing frequency distribution across prices.
2. Provide a synchronized dual-thumb range slider to select minimum and maximum prices.
3. Highlight bars within the selected `[min, max]` range in `bg-primary`, with outside bars dimmed in `bg-muted/40`.
4. Include two lower input pills ("Mínimo" and "Máximo") formatted in Chilean currency (e.g. `$150.000` and `$520.000+`).

## Technical Specifications

1. **`PriceHistogramRangeSlider` (`src/components/search/price-histogram-range-slider.tsx`)**:
   - Props:
     ```ts
     type PriceHistogramRangeSliderProps = {
       minBound: number;
       maxBound: number;
       minValue: number;
       maxValue: number;
       bins: Array<{ min: number; max: number; count: number }>;
       onChange: (range: { min: number; max: number }) => void;
       currency?: string;
       isLoading?: boolean;
     };
     ```
   - **Histogram Bars**:
     - Normalize heights relative to the maximum `count` in `bins`. Minimum height of 4px for empty bins.
     - Rounded top borders on bars (`rounded-t-xs`).
     - Bar color: if `bin.max >= minValue && bin.min <= maxValue`, apply active theme color (`bg-primary`), else `bg-muted/30`.
   - **Dual Slider Controls**:
     - Implement smooth pointer interaction (`onPointerDown`, `onPointerMove`, `onPointerUp`) supporting mobile touch.
     - Left thumb (`min`) and right thumb (`max`): circular interactive handles (`h-6 w-6 rounded-full bg-background border-2 border-foreground shadow-md`).
     - Prevent crossing: `minValue` cannot exceed `maxValue - step`.
   - **Pill Inputs**:
     - Left: Label *"Mínimo"*, value formatted with dots (`$200.000`).
     - Right: Label *"Máximo"*, value formatted with dots (`$450.000+`).

## Checklist

- [ ] Build SVG/Flex 28-bar histogram with normalized bar heights in `src/components/search/price-histogram-range-slider.tsx`.
- [ ] Implement dual-thumb touch slider aligned to histogram base.
- [ ] Connect dynamic active bar color transitions based on selected bounds.
- [ ] Render formatted Chilean currency minimum and maximum pills.
- [ ] Stage target file and commit with `feat(search): implement airbnb-style price histogram range slider component`.
