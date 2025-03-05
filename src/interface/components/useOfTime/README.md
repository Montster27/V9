# Use of Time UI Components

This directory contains the UI components for the Use_of_Time system, which allows players to allocate their time across different activities using sliders. These components are part of the core gameplay mechanics where players balance their time between study, work, social activities, rest, and exercise.

## Components

### TimeAllocationSliders

Provides interactive sliders for players to adjust how many hours per day they want to spend on each activity. The component ensures all allocations sum to 24 hours by automatically adjusting other activities when one is changed.

**Features:**

- Slider for each activity type
- Shows hours per day and percentage of weekly time
- Displays activity descriptions and impact summaries
- Reset button to return to balanced defaults

### TimeDistributionView

Visualizes the current time allocation as a proportional bar chart, making it easy for players to see how they're distributing their time at a glance.

**Features:**

- Horizontal stacked bar representation
- Color-coded activity segments
- Legend with percentage and hours breakdown
- Weekly total summary

### ResourceImpactPreview

Shows the projected impact of the current time allocation on the player's resources, helping them understand the consequences of their choices.

**Features:**

- Weekly impact calculations for knowledge, money, social, energy, and stress
- Visual indicators for positive/negative changes
- Stress penalties warning for poor allocation choices
- Total stress impact summary

## Usage

These components are designed to be used together in the game UI, typically arranged vertically:

```jsx
import {
  TimeAllocationSliders,
  TimeDistributionView,
  ResourceImpactPreview,
} from './interface/components/useOfTime';

const GameUI = () => {
  return (
    <div className="game-panel">
      <TimeAllocationSliders />
      <TimeDistributionView />
      <ResourceImpactPreview />
    </div>
  );
};
```
