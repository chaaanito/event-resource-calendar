# EventResource

A lightweight, high-performance vanilla JavaScript resource calendar library. Features O(1) internal event mapping, extensible rich HTML layout renderers, holiday detection, and scroll freezing.

## Installation

\`\`\`bash
npm install event-resource-calendar
\`\`\`

## Quick Start

\`\`\`javascript
import EventResource from 'event-resource-calendar';

const calendar = new EventResource({
container: '#calendar-root',
defaultView: 'daily',
defaultDate: '2026-06-24',
showControls: true,
stickyHeaders: true,
rooms: [{ id: 'r1', name: 'Studio A', capacity: 10 }],
timeSlots: [{ id: 't1', label: '09:00 AM' }],
initialEvents: [{
id: 'evt-1',
roomId: 'r1',
timeId: 't1',
title: 'Morning Sync',
color: '#10b981'
}]
});
\`\`\`

## Configuration Options

Pass these properties into the `EventResource` constructor to customize your calendar.

| Property          | Type           | Default      | Description                                                           |
| :---------------- | :------------- | :----------- | :-------------------------------------------------------------------- |
| **container**     | `string\|Node` | _Required_   | CSS selector or DOM pointer mount node.                               |
| **rooms**         | `Array`        | `[]`         | Master source list establishing rows along the vertical plane.        |
| **timeSlots**     | `Array`        | `[]`         | Master source list defining columns mapped along the horizontal path. |
| **initialEvents** | `Array`        | `[]`         | In-memory event array populating coordinates on load.                 |
| **holidays**      | `Array`        | `[]`         | Configuration identifying structural exceptions and global days.      |
| **customButtons** | `Array`        | `[]`         | Extensible collections rendering specialized tool structures.         |
| **showControls**  | `boolean`      | `false`      | Visibility of structural management toolbars.                         |
| **stickyHeaders** | `boolean`      | `true`       | Toggles CSS sticky double-axis tracking logic.                        |
| **defaultView**   | `string`       | `'daily'`    | Default presentation layout. Must be 'daily' or 'weekly'.             |
| **defaultDate**   | `Date\|string` | `new Date()` | Frame configuration locking starting lifecycle boundaries.            |

### Callbacks & Renderers

| Property                 | Type       | Description                                                        |
| :----------------------- | :--------- | :----------------------------------------------------------------- |
| **onCellClick**          | `Function` | Callback capturing clicks targeting empty coordinates.             |
| **onEventClick**         | `Function` | Callback targeting allocated calendar card coordinates.            |
| **fetchEvents**          | `Function` | Async method returning structural item sets based on date/view.    |
| **renderRoomHeader**     | `Function` | HTML generator returning structural formatting for row slots.      |
| **renderTimeSlotHeader** | `Function` | HTML generator returning structural formatting for column slots.   |
| **renderEvent**          | `Function` | HTML generator returning custom markup for individual event cards. |

## Data Models

### CalendarRoom

Defines a resource row within the calendar matrix grid layout.

| Property  | Type             | Description                                                |
| :-------- | :--------------- | :--------------------------------------------------------- |
| **id**    | `string\|number` | **Required.** Unique identifier for the room or resource.  |
| **name**  | `string`         | **Required.** Fallback display title of the room/resource. |
| **[key]** | `any`            | Optional custom properties (e.g., capacity, hasProjector). |

### TimeSlot

Defines a timeline column structure partitioning the matrix grid workspace.

| Property  | Type             | Description                                                 |
| :-------- | :--------------- | :---------------------------------------------------------- |
| **id**    | `string\|number` | **Required.** Unique identifier for the chronological slot. |
| **label** | `string`         | **Required.** Fallback timeline display text.               |
| **[key]** | `any`            | Optional custom properties (e.g., isLunchHour).             |

### CalendarEvent

Represents an allocated timeline event mapped directly into a specific intersection cell.

| Property   | Type             | Description                                                           |
| :--------- | :--------------- | :-------------------------------------------------------------------- |
| **id**     | `string\|number` | **Required.** Unique identifier for the scheduled event element.      |
| **roomId** | `string\|number` | **Required.** Foreign key binding the item to a valid Room ID.        |
| **timeId** | `string\|number` | **Required.** Foreign key binding the item to a valid TimeSlot ID.    |
| **title**  | `string`         | **Required.** Plain-text title injected inside the card element.      |
| **color**  | `string`         | Optional CSS color value for the background card. Default: `#3b82f6`. |
| **[key]**  | `any`            | Optional custom meta data attributes.                                 |

## Interaction Payloads

When interacting with the grid, the library fires callbacks with contextual payloads.

### ClickContextPayload (Empty Cell Click)

| Property    | Type           | Description                                                        |
| :---------- | :------------- | :----------------------------------------------------------------- |
| **date**    | `Date`         | Chronological state baseline actively mounted inside the viewport. |
| **view**    | `string`       | Current structural mode index ('daily' or 'weekly').               |
| **holiday** | `Object\|null` | Associated holiday data object if applicable.                      |
| **row**     | `Object`       | Track metadata coordinates (`index` and `data`).                   |
| **col**     | `Object`       | Timeline metadata coordinates (`index` and `data`).                |
| **cell**    | `Object`       | Target cell contents (`roomId`, `timeId`, and `events` array).     |

### EventClickPayload (Event Card Click)

Inherits everything from `ClickContextPayload` and adds:

| Property        | Type         | Description                                                                 |
| :-------------- | :----------- | :-------------------------------------------------------------------------- |
| **event**       | `Object`     | **Required.** The unique target event parameters bound to the clicked card. |
| **nativeEvent** | `MouseEvent` | **Required.** Raw browser click interaction data.                           |
