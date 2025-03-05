# UI Component Testing Checklist

Use this checklist to verify the UI components are functioning correctly after the ResourceDisplay fix.

## Initial Load Testing

- [ ] Application loads without errors
- [ ] Three-panel layout is visible (left, center, right)
- [ ] Game title is visible in the header
- [ ] Time display shows the correct date and time
- [ ] Time controls (pause/play) are visible and interactive

## Resource Display Testing

- [ ] ResourceDisplay component shows all resources
- [ ] Energy shows correct value and maximum (e.g., 75/100)
- [ ] Stress shows correct value and maximum (e.g., 30/100)
- [ ] Knowledge shows correct value
- [ ] Money shows correct value with currency format ($)
- [ ] Social shows correct value
- [ ] Skill Points shows correct value
- [ ] Resource bars are colored appropriately based on values
- [ ] Tooltips appear when hovering over resources

## Time Allocation Testing

- [ ] Time allocation sliders are visible for all activities
- [ ] Each slider shows correct hours per day and percentage
- [ ] Moving a slider updates the values in real-time
- [ ] Total allocation remains 24 hours when adjusting sliders
- [ ] Activity descriptions display correctly
- [ ] Reset button returns allocations to default values

## Time Controls Testing

- [ ] Pause button pauses the game time
- [ ] Play button resumes the game time
- [ ] Speed buttons (1x, 2x, 5x) change game speed
- [ ] Status indicator shows current state (paused/playing)
- [ ] Animation feedback occurs when clicking controls

## News Stream Testing

- [ ] News stream panel is visible
- [ ] Initial news items are displayed
- [ ] News items have sources and timestamps
- [ ] New items appear as game time advances

## Narrative Panel Testing

- [ ] Narrative panel is visible with current situation
- [ ] Narrative text is displayed correctly
- [ ] Clue section is visible with appropriate content
- [ ] Help button toggles help information

## Tutorial System Testing

- [ ] Tutorial appears on first load (if not completed)
- [ ] Tutorial steps correctly highlight UI elements
- [ ] Next/Previous buttons navigate through steps
- [ ] Skip button dismisses the tutorial
- [ ] Tutorial completion is saved

## Interaction Testing

- [ ] Play the game for 5 minutes with time running
- [ ] Verify resource values change based on allocations
- [ ] Check that stress penalties appear with poor rest allocation
- [ ] Verify news items appear as time advances
- [ ] Test tooltips and help panels throughout the interface

## Issues to Document

If any issues are found during testing, document them here:

1. Issue:

   - Component:
   - Behavior:
   - Expected:
   - Reproduction Steps:

2. Issue:
   - Component:
   - Behavior:
   - Expected:
   - Reproduction Steps:

## Overall Assessment

- [ ] Fix successfully resolves the initial error
- [ ] UI components function as expected
- [ ] Game mechanics work correctly
- [ ] Visual feedback is appropriate and helpful
- [ ] Performance is acceptable during gameplay
