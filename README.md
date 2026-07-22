# EventResource

A highly versatile, lightweight, high-performance vanilla JavaScript matrix grid library. Features skeleton-first asynchronous rendering, O(1) internal event mapping, extensible rich HTML layout renderers, holiday detection, double-axis scroll freezing, and DOM-fragment rendering for extreme efficiency.

Unlike standard calendars, this library is completely agnostic. Use it to map Teachers to Students, Equipment to Projects, or Spaces to Time slots.

# Installation

npm install @chaaanito/event-resource-calendar

# Quick Start

import EventResource from "@chaaanito/event-resource-calendar";
import "@chaaanito/event-resource-calendar/style.css"; // Required for grid structural styling

const grid = new EventResource({
container: "#grid-root",
defaultView: "daily",
defaultDate: "2026-06-24",
showControls: true,
stickyHeaders: true,
// Define Rows (Resources)
resources: [
{
id: "r1",
name: "Dr. Smith (Teacher)",
},
],
// Define Columns
columns: [
{
id: "c1",
label: "Math 101 (Class)",
},
],
// Allocate Events to intersections
initialEvents: [
{
id: "evt-1",
resourceId: "r1",
columnId: "c1",
title: "Semester Assignment",
color: "#10b981",
},
],
});

## Configuration Options

Pass these properties into the `EventResource` constructor to customize your matrix grid.

| Property          | Type           | Default      | Description                                                           |
| :---------------- | :------------- | :----------- | :-------------------------------------------------------------------- |
| **container**     | `string\|Node` | _Required_   | CSS selector or explicit DOM pointer mount node.                      |
| **resources**     | `Array`        | `[]`         | Master source list establishing rows along the vertical plane.        |
| **columns**       | `Array`        | `[]`         | Master source list defining columns mapped along the horizontal path. |
| **initialEvents** | `Array`        | `[]`         | In-memory event array populating coordinates on load.                 |
| **holidays**      | `Array`        | `[]`         | Configuration identifying structural exceptions and global days.      |
| **customButtons** | `Array`        | `[]`         | Extensible collections rendering specialized tool structures.         |
| **showControls**  | `boolean`      | `false`      | Visibility of structural management toolbars (Datepicker, arrows).    |
| **stickyHeaders** | `boolean`      | `true`       | Toggles CSS sticky double-axis tracking logic across layout headers.  |
| **defaultView**   | `string`       | `'daily'`    | Default presentation layout mode. Must be 'daily' or 'weekly'.        |
| **defaultDate**   | `Date\|string` | `new Date()` | Frame configuration locking starting lifecycle boundaries.            |

### Callbacks & Renderers

| Property                 | Type       | Description                                                               |
| :----------------------- | :--------- | :------------------------------------------------------------------------ |
| **onCellClick**          | `Function` | Callback capturing clicks targeting empty coordinates.                    |
| **onEventClick**         | `Function` | Callback targeting allocated grid card coordinates.                       |
| **fetchEvents**          | `Function` | Async method resolving to an array of `GridEvent` objects.                |
| **fetchResources**       | `Function` | Async method resolving to an array of `GridResource` objects dynamically. |
| **fetchColumns**         | `Function` | Async method resolving to an array of `GridColumn` objects dynamically.   |
| **fetchHolidays**        | `Function` | Async method resolving to an array of `GridHoliday` objects dynamically.  |
| **renderResourceHeader** | `Function` | HTML generator returning structural formatting strings for row slots.     |
| **renderColumnHeader**   | `Function` | HTML generator returning structural formatting strings for column slots.  |
| **renderEvent**          | `Function` | HTML generator returning custom markup for individual event cards.        |

---

## Data Models

### GridResource

Defines a resource row within the matrix grid layout.

| Property  | Type             | Description                                               |
| :-------- | :--------------- | :-------------------------------------------------------- |
| **id**    | `string\|number` | **Required.** Unique identifier for the row or resource.  |
| **name**  | `string`         | **Required.** Fallback display title of the resource.     |
| **[key]** | `any`            | Optional custom properties (e.g., capacity, role, title). |

### GridColumn

Defines a column structure partitioning the matrix grid workspace.

| Property  | Type             | Description                                                |
| :-------- | :--------------- | :--------------------------------------------------------- |
| **id**    | `string\|number` | **Required.** Unique identifier for the column slot.       |
| **label** | `string`         | **Required.** Fallback column display text.                |
| **[key]** | `any`            | Optional extensible properties (e.g., isLunchHour, grade). |

### GridEvent

Represents an allocated event mapped directly into a specific intersection cell.

| Property       | Type             | Description                                                           |
| :------------- | :--------------- | :-------------------------------------------------------------------- |
| **id**         | `string\|number` | **Required.** Unique identifier for the scheduled event element.      |
| **resourceId** | `string\|number` | **Required.** Foreign key binding the item to a valid Resource ID.    |
| **columnId**   | `string\|number` | **Required.** Foreign key binding the item to a valid Column ID.      |
| **title**      | `string`         | **Required.** Plain-text title injected inside the card element.      |
| **color**      | `string`         | Optional CSS color value for the background card. Default: `#3b82f6`. |
| **[key]**      | `any`            | Optional custom meta data attributes parsed down to click payloads.   |

### GridHoliday

Maps specific dates to holiday statuses, shifting backgrounds and appending context data.

| Property  | Type                   | Description                                                            |
| :-------- | :--------------------- | :--------------------------------------------------------------------- |
| **date**  | `string\|Date\|number` | **Required.** Parsable temporal timestamp mapping the milestone.       |
| **name**  | `string`               | **Required.** Human-readable label injected into global notice badges. |
| **[key]** | `any`                  | Optional open-ended customer specific holiday data.                    |

---

## Interaction Payloads

When interacting with the grid, the library fires callbacks with comprehensive contextual payloads.

### ClickContextPayload (Empty Cell Click)

Shared universally across grid click response lifecycles.

| Property    | Type           | Description                                                          |
| :---------- | :------------- | :------------------------------------------------------------------- |
| **date**    | `Date`         | Chronological state baseline actively mounted inside the viewport.   |
| **view**    | `string`       | Current structural mode index configuration ('daily' or 'weekly').   |
| **holiday** | `Object\|null` | Associated holiday data object if applicable to current date.        |
| **row**     | `Object`       | Track metadata coordinates (`index` and `data` objects).             |
| **col**     | `Object`       | Column metadata coordinates (`index` and `data` objects).            |
| **cell**    | `Object`       | Target cell contents (`resourceId`, `columnId`, and `events` array). |

### EventClickPayload (Event Card Click)

Inherits all properties from `ClickContextPayload` and adds:

| Property        | Type         | Description                                                                 |
| :-------------- | :----------- | :-------------------------------------------------------------------------- |
| **event**       | `Object`     | **Required.** The explicit, unique target event parameters clicked.         |
| **nativeEvent** | `MouseEvent` | **Required.** Raw browser click interaction data used for element tracking. |

---

## Public API Methods

Once instantiated, the grid instance exposes methods to control it programmatically.

| Method                              | Description                                                                                     |
| :---------------------------------- | :---------------------------------------------------------------------------------------------- |
| **`setResources(newResources)`**    | Swaps out the vertical axis data dynamically and redraws the grid skeleton.                     |
| **`setColumns(newColumns)`**        | Swaps out the horizontal axis data dynamically and redraws the grid skeleton.                   |
| **`addEvent(event)`**               | Injects a new event and performs an isolated, high-speed DOM append without layout thrashing.   |
| **`updateEvent(eventId, newData)`** | Dynamically updates an existing event's properties or location.                                 |
| **`removeEvent(eventId)`**          | Purges a specific event by ID from memory and removes it from the UI instantly.                 |
| **`clearAllEvents()`**              | Wipes all events from the board while preserving the layout skeleton rules.                     |
| **`setDate(newDate)`**              | Jumps the grid to a specific date. Automatically triggers `fetch` hooks if configured.          |
| **`setView(newView)`**              | Mutates the layout granularity between custom structural views.                                 |
| **`navigate(direction)`**           | Steps the timeline forward or backward based on the current view multiplier.                    |
| **`forceRender()`**                 | Triggers a manual full data replenishment cycle, drawing the skeleton and resolving all asyncs. |
| **`destroy()`**                     | Unmounts the DOM, clears memory caches, and drops listener closures to prevent leaks.           |
