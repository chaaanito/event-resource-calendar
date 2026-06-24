/**
 * @typedef {Object} CalendarRoom
 * @description Defines a resource row within the calendar matrix grid layout.
 * @property {string|number} id - REQUIRED: Unique identifier for the room or resource. Must be absolutely unique across all room rows.
 * @property {string} name - REQUIRED: Fallback display title of the room/resource used if `renderRoomHeader` is omitted.
 * @property {*} [key: string] - OPTIONAL: Any additional open-ended properties used for custom filtering or rich rendering templates.
 * @example
 * // Example of a valid CalendarRoom object
 * { id: 'room-101', name: 'Conference Room A', capacity: 12, hasProjector: true }
 */

/**
 * @typedef {Object} TimeSlot
 * @description Defines a timeline column structure partitioning the matrix grid workspace.
 * @property {string|number} id - REQUIRED: Unique identifier for the chronological slot. Must be unique across all columns.
 * @property {string} label - REQUIRED: Fallback timeline display text used if `renderTimeSlotHeader` is omitted.
 * @property {*} [key: string] - OPTIONAL: Any additional extensible properties used for custom filtering or rich rendering templates.
 * @example
 * // Example of a valid TimeSlot object
 * { id: 'slot-0900', label: '09:00 AM', isLunchHour: false }
 */

/**
 * @typedef {Object} CalendarEvent
 * @description Represents an allocated timeline event mapped directly into a specific intersection cell.
 * @property {string|number} id - REQUIRED: Unique identifier for the scheduled event element.
 * @property {string|number} roomId - REQUIRED: Relational foreign key binding the item to a valid {@link CalendarRoom.id}.
 * @property {string|number} timeId - REQUIRED: Relational foreign key binding the item to a valid {@link TimeSlot.id}.
 * @property {string} title - REQUIRED: Plain-text title injected inside the DOM node element card.
 * @property {string} [color='#3b82f6'] - OPTIONAL: Valid CSS color value (hex, rgb, hsl, keyword) for the background tracking card.
 * @property {*} [key: string] - OPTIONAL: Custom meta data attributes parsed down to click event callback streams.
 * @example
 * // Example of a valid CalendarEvent object
 * { id: 'evt-1', roomId: 'room-101', timeId: 'slot-0900', title: 'Q3 Planning Sync', color: '#10b981', attendees: 5 }
 */

/**
 * @typedef {Object} CalendarHoliday
 * @description Maps specific dates to holiday statuses, shifting backgrounds and appending context data to interaction payloads.
 * @property {string|Date|number} date - REQUIRED: Parsable temporal timestamp mapping the holiday milestone. Must be resolvable by `new Date()`.
 * @property {string} name - REQUIRED: The human-readable label injected into global notice badges and cell descriptors.
 * @property {*} [key: string] - OPTIONAL: Open-ended customer specific holiday data.
 * @example
 * // Example of a valid CalendarHoliday object
 * { date: '2026-12-25', name: 'Christmas Day', isCompanyPaid: true }
 */

/**
 * @typedef {Object} CustomButton
 * @description Injectable client control appended directly onto the right-hand toolbar grouping matrix.
 * @property {string} label - REQUIRED: Text descriptor rendered inside the interactive control button element frame.
 * @property {function(MouseEvent): void} onClick - REQUIRED: Action handler fired immediately upon client interactions.
 * @property {string} [className] - OPTIONAL: Space-delimited functional CSS style modifiers for custom visual overrides.
 * @example
 * // Example of a valid CustomButton object
 * { label: 'Export PDF', className: 'bg-red-500 text-white', onClick: (e) => console.log('Exporting...', e) }
 */

/**
 * @typedef {Object} ClickContextPayload
 * @description Consolidated operational telemetry shared universally across grid click response lifecycles.
 * @property {Date} date - Chronological state baseline actively mounted inside the viewport template frame.
 * @property {'daily'|'weekly'} view - Current structural mode index configuration.
 * @property {CalendarHoliday|null} holiday - Associated holiday data object if the current frame falls on a configured day milestone.
 * @property {Object} row - Track metadata coordinates.
 * @property {number} row.index - Vertical index array placement coordinate.
 * @property {CalendarRoom} row.data - Complete root object data context passed down from initialization.
 * @property {Object} col - Timeline metadata coordinates.
 * @property {number} col.index - Horizontal layout coordinate tracking indexes.
 * @property {TimeSlot} col.data - Complete root chronological object parameters.
 * @property {Object} cell - Operational target cell contents.
 * @property {string|number} cell.roomId - Unique cell row lookup index.
 * @property {string|number} cell.timeId - Unique cell column chronological coordinate index.
 * @property {CalendarEvent[]} cell.events - Contextual array containing all events currently occupying this grid location.
 */

/**
 * @typedef {Object} EventClickPayload
 * @description Multi-layered payload shared exclusively with the `onEventClick` subscriber method.
 * @extends ClickContextPayload
 * @property {CalendarEvent} event - REQUIRED: The explicit, unique target event parameters bound to the clicked card element.
 * @property {MouseEvent} nativeEvent - REQUIRED: Raw browser click interaction data used for analytical intercept positioning or element tracking.
 */

/**
 * @typedef {Object} EventResourceOptions
 * @description Input operational context map parsing standard parameters through class factories.
 * @property {string|HTMLElement|Node} container - REQUIRED: CSS selector engine target or explicit DOM pointer mount node.
 * @property {CalendarRoom[]} [rooms=[]] - OPTIONAL: Master source list establishing rows along the vertical plane matrix mapping layout.
 * @property {TimeSlot[]} [timeSlots=[]] - OPTIONAL: Master source list defining columns mapped along the horizontal path lane.
 * @property {CalendarEvent[]} [initialEvents=[]] - OPTIONAL: In-memory event array populating coordinates during setup initialization workflows.
 * @property {CalendarHoliday[]} [holidays=[]] - OPTIONAL: Array configuration identifying structural exceptions and specialized global days.
 * @property {CustomButton[]} [customButtons=[]] - OPTIONAL: Extensible collections rendering specialized tool structures within toolbars.
 * @property {boolean} [showControls=false] - OPTIONAL: Flag managing initialization visibility of structural management toolbars.
 * @property {boolean} [stickyHeaders=true] - OPTIONAL: Toggles CSS sticky double-axis tracking logic across layout headers on load.
 * @property {'daily'|'weekly'} [defaultView='daily'] - OPTIONAL: Default presentation structure layout selection state. Must be 'daily' or 'weekly'.
 * @property {Date|string|number} [defaultDate=new Date()] - OPTIONAL: Frame configuration locking starting lifecycle boundaries.
 * @property {function(ClickContextPayload): void} [onCellClick] - OPTIONAL: Interaction callback capturing clicks targeting empty coordinates.
 * @property {function(EventClickPayload): void} [onEventClick] - OPTIONAL: Interaction callback targeting allocated calendar card coordinates.
 * @property {function(Date, 'daily'|'weekly'): Promise<CalendarEvent[]>} [fetchEvents] - OPTIONAL: Data fetching intercept. Async method returning structural item sets.
 * @property {function(CalendarRoom): string} [renderRoomHeader] - OPTIONAL: HTML generator intercept returning structural formatting strings for row slots.
 * @property {function(TimeSlot): string} [renderTimeSlotHeader] - OPTIONAL: HTML generator intercept returning structural formatting strings for column slots.
 * @property {function(CalendarEvent): string} [renderEvent] - OPTIONAL: HTML generator intercept returning custom markup for individual event cards. Overrides default title text.
 * @example
 */

/**
 * EventResource
 * A lightweight, high-performance vanilla JavaScript resource calendar library.
 * Features O(1) internal event mapping, extensible rich HTML layout renderers, holiday detection, and scroll freezing.
 * @class
 */
export default class EventResource {
  /**
   * Initializes a new EventResource calendar instance, mounts it to the DOM, and fires initial render passes.
   * @param {EventResourceOptions} options - Configuration parameters required to bootstrap the calendar matrix.
   * @throws {Error} Throws if a valid `container` element, Node, or string selector cannot be resolved in the DOM.
   * @example
   * const calendar = new EventResource({
   * // 1. Core Mount & State
   * container: '#calendar-root',
   * defaultView: 'daily',
   * defaultDate: '2026-06-24', // Accepts string, number (epoch), or Date object
   * * // 2. Structural UI Toggles
   * showControls: true,
   * stickyHeaders: true,
   * * // 3. Grid Definitions (Rows, Columns, and Exceptions)
   * rooms: [{ id: 'r1', name: 'Studio A', capacity: 10 }],
   * timeSlots: [{ id: 't1', label: '09:00 AM' }],
   * holidays: [{ date: '2026-12-25', name: 'Christmas Day' }],
   * * // 4. Initial In-Memory Data
   * initialEvents: [{
   * id: 'evt-1',
   * roomId: 'r1',
   * timeId: 't1',
   * title: 'Morning Sync',
   * color: '#10b981'
   * }],
   * * // 5. Toolbar Extensions
   * customButtons: [{
   * label: 'Export PDF',
   * className: 'bg-red-500 text-white hover:bg-red-600',
   * onClick: (e) => console.log('Triggering PDF generation...', e)
   * }],
   * * // 6. Interaction Event Hooks
   * onCellClick: (payload) => {
   * console.log(`Empty slot clicked! Room: ${payload.cell.roomId}, Time: ${payload.cell.timeId}`);
   * },
   * onEventClick: (payload) => {
   * alert(`Opening details for: ${payload.event.title}`);
   * },
   * * // 7. Rich HTML Generation Intercepts
   * renderRoomHeader: (room) => `<div class="p-2 border-b"><h3>${room.name}</h3><small>Cap: ${room.capacity}</small></div>`,
   * renderTimeSlotHeader: (slot) => `<div class="text-center font-bold text-gray-700">${slot.label}</div>`,
   * * // 8. Async Lifecycle Management
   * fetchEvents: async (date, view) => {
   * const res = await fetch(`/api/events?date=${date.toISOString()}&view=${view}`);
   * return await res.json();
   * }
   * });
   * renderEvent: (event) => `
   * <div class="flex flex-col gap-1 p-1">
   * <span class="font-bold text-xs truncate">${event.title}</span>
   * <span class="text-[10px] opacity-75">${event.roomName || 'TBD'}</span>
   * </div>
   * `
   */
  constructor(options) {
    let resolvedContainer = null;

    if (typeof options.container === "string") {
      resolvedContainer = document.querySelector(options.container);

      if (!resolvedContainer) {
        resolvedContainer =
          document.getElementById(options.container) ||
          document.getElementsByClassName(options.container)[0];
      }
    } else if (
      options.container instanceof Node ||
      options.container instanceof Element
    ) {
      resolvedContainer = options.container;
    } else if (
      options.container &&
      typeof options.container[0] !== "undefined"
    ) {
      resolvedContainer = options.container[0];
    }

    if (!resolvedContainer) {
      throw new Error(
        "EventResource: A valid container (CSS selector string, Node, or HTMLElement) is required and must exist in the DOM.",
      );
    }

    /**
     * @type {HTMLElement}
     * @description The verified root DOM node where the calendar is mounted.
     */
    this.container = resolvedContainer;

    // 2. Data Options
    /** @type {CalendarRoom[]} */
    this.rooms = options.rooms || [];
    /** @type {TimeSlot[]} */
    this.timeSlots = options.timeSlots || [];
    /** @type {CalendarEvent[]} */
    this.events = options.initialEvents || [];
    /** @type {CalendarHoliday[]} */
    this.holidays = options.holidays || [];
    /** @type {CustomButton[]} */
    this.customButtons = options.customButtons || [];

    // 3. UI Controls & State
    /** @type {boolean} */
    this.showControls = options.showControls || false;
    /** @type {boolean} */
    this.stickyHeaders = options.stickyHeaders !== false;
    /** @type {'daily'|'weekly'} */
    this.currentView = options.defaultView || "daily";
    /** @type {Date} */
    this.currentDate = options.defaultDate
      ? new Date(options.defaultDate)
      : new Date();
    /** @type {boolean} */
    this.isFetching = false;

    // 4. Callbacks & Rich Formatting Helpers
    /** @type {function|null} */
    this.onCellClick = options.onCellClick || null;
    /** @type {function|null} */
    this.onEventClick = options.onEventClick || null;
    /** @type {function|null} */
    this.fetchEvents = options.fetchEvents || null;
    /** @type {function|null} */
    this.renderRoomHeader = options.renderRoomHeader || null;
    /** @type {function|null} */
    this.renderTimeSlotHeader = options.renderTimeSlotHeader || null;
    /** @type {function|null} */
    this.renderEvent = options.renderEvent || null;

    // 5. Initialization
    /**
     * @type {Map<string, CalendarEvent[]>}
     * @description Internal O(1) lookup map isolating events into cell clusters based on `roomId-timeId` keys.
     * @private
     */
    this.eventsMap = new Map();
    this._injectStyles();
    this._buildEventsMap();
    this.forceRender();
  }

  // --- State & Date Management ---

  /**
   * Transforms a multi-format date payload into a strictly normalized `YYYY-MM-DD` string for standardized comparison operations.
   * @param {Date|string|number} dateObj - REQUIRED: The temporal object, ISO string, or epoch timestamp to normalize.
   * @returns {string} The normalized local date string, formatted strictly as "YYYY-MM-DD".
   * @private
   * @example
   * // Returns "2026-06-24"
   * this._getNormalizedDateString(new Date('2026-06-24T12:00:00Z'));
   */
  _getNormalizedDateString = (dateObj) => {
    const d = new Date(dateObj);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  /**
   * Scans the internal `holidays` array to determine if the provided date target matches a configured milestone.
   * @param {Date|string|number} dateObj - REQUIRED: The temporal target to evaluate against known holidays.
   * @returns {CalendarHoliday|null} Returns the exact matched holiday configuration object, or `null` if no match occurs.
   * @private
   * @example
   * const holiday = this._getHolidayForDate('2026-12-25');
   * if (holiday) console.log(holiday.name); // Logs "Christmas"
   */
  _getHolidayForDate = (dateObj) => {
    const targetDate = this._getNormalizedDateString(dateObj);
    return (
      this.holidays.find(
        (h) => this._getNormalizedDateString(h.date) === targetDate,
      ) || null
    );
  };

  /**
   * Wipes and rebuilds the highly-optimized internal collision map. Groups flat event arrays into isolated index blocks.
   * Executes dynamically behind the scenes prior to every grid rendering phase to ensure data consistency.
   * @returns {void}
   * @private
   */
  _buildEventsMap = () => {
    this.eventsMap.clear();
    for (const ev of this.events) {
      const key = `${ev.roomId}-${ev.timeId}`;
      if (!this.eventsMap.has(key)) {
        this.eventsMap.set(key, []);
      }
      this.eventsMap.get(key).push(ev);
    }
  };

  /**
   * Forces a chronological state shift, rewiring internal date parameters and firing synchronous asynchronous re-render loops.
   * @param {Date|string|number} newDate - REQUIRED: The new calendar baseline target date parameter.
   * @returns {Promise<void>} Resolves automatically when the async data refetch and complete re-render lifecycle are complete.
   * @example
   * // Jump directly to Halloween 2026
   * await calendar.setDate('2026-10-31');
   */
  setDate = async (newDate) => {
    this.currentDate = new Date(newDate);
    await this.forceRender();
  };

  /**
   * Mutates the application structural layout framework dynamically between daily and weekly granularities.
   * @param {'daily'|'weekly'} newView - REQUIRED: The strict target structural mode selection string.
   * @returns {Promise<void>} Resolves when the refetch, DOM teardown, and structural framework update complete.
   * @example
   * // Swap calendar into weekly perspective mode
   * await calendar.setView('weekly');
   */
  setView = async (newView) => {
    if (this.currentView === newView) return;
    this.currentView = newView;
    await this.forceRender();
  };

  /**
   * Calculates timeline vector offsets based on the currently active view mode, steps the internal date parameter, and triggers reconciliations.
   * Moves timeline by exactly 1 day for 'daily' views, or exactly 7 days for 'weekly' views.
   * @param {'prev'|'next'} direction - REQUIRED: The chronological vector direction keyword.
   * @returns {Promise<void>} Resolves upon successful navigation and canvas redraw.
   * @example
   * // Step forward in time based on current view step sizes
   * await calendar.navigate('next');
   */
  navigate = async (direction) => {
    const daysToMove = this.currentView === "weekly" ? 7 : 1;
    const multiplier = direction === "next" ? 1 : -1;

    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + daysToMove * multiplier);

    await this.setDate(newDate);
  };

  // --- Public API ---

  /**
   * Injects a raw configuration event into the application data state. Recompiles the collision map and forces a synchronous DOM update instantly.
   * @param {CalendarEvent} newEvent - REQUIRED: A valid object data map matching configuration structural specs exactly.
   * @returns {void}
   * @example
   * // Programmatically create a new event card
   * calendar.addEvent({
   * id: 'evt-999',
   * roomId: 'room-101',
   * timeId: 'slot-0900',
   * title: 'Ad-hoc Emergency Sync',
   * color: '#ef4444'
   * });
   */
  addEvent = (newEvent) => {
    this.events.push(newEvent);
    this._buildEventsMap();
    this.render();
  };

  /**
   * Executes a hard delete across the internal event arrays based strictly on a uniquely matched id reference string. Rebuilds structures automatically.
   * @param {string|number} eventId - REQUIRED: The exact, unique reference key index matching the target {@link CalendarEvent.id}.
   * @returns {void}
   * @example
   * // Purge a specific event from the DOM and memory
   * calendar.removeEvent('evt-999');
   */
  removeEvent = (eventId) => {
    this.events = this.events.filter((e) => e.id !== eventId);
    this._buildEventsMap();
    this.render();
  };

  /**
   * Wipes out all transient operational event records cached in client memory structures while preserving column rules and grid row configurations.
   * Excellent for resetting layouts between deep navigational transitions without destroying the core class instance.
   * @returns {void}
   * @example
   * // Clean the board completely
   * calendar.clearAllEvents();
   */
  clearAllEvents = () => {
    this.events = [];
    this.eventsMap.clear();
    this.render();
  };

  /**
   * Triggers a comprehensive data replenishment cycle. Evaluates external `fetchEvents` connector methods, updates map caches, and rebuilds the visual DOM.
   * Implements internal `isFetching` lock mechanisms to protect against asynchronous data race conditions or parallel API execution.
   * @returns {Promise<void>} Resolves once all external data resolves and the DOM reconciliation concludes successfully.
   * @example
   * // Force a data refresh from the server
   * await calendar.forceRender();
   */
  forceRender = async () => {
    if (this.isFetching) return;

    if (typeof this.fetchEvents === "function") {
      this.isFetching = true;
      try {
        const freshEvents = await this.fetchEvents(
          this.currentDate,
          this.currentView,
        );
        this.events = freshEvents || [];
      } catch (error) {
        console.error("EventResource: Failed to refetch events.", error);
      } finally {
        this.isFetching = false;
      }
    }

    this._buildEventsMap();
    this.render();
  };

  /**
   * Executes irreversible teardown routines protecting application host memory state cycles.
   * Wipes parameters, drops listener closures, clears map caches, and securely unmounts UI sub-trees from the primary node without shattering external reactive bindings.
   * @returns {void}
   * @example
   * // Unmount calendar gracefully
   * calendar.destroy();
   * calendar = null;
   */
  destroy = () => {
    this.events = [];
    this.rooms = [];
    this.timeSlots = [];
    this.holidays = [];
    this.customButtons = [];
    this.eventsMap.clear();
    this.onCellClick = null;
    this.onEventClick = null;
    this.fetchEvents = null;
    this.renderRoomHeader = null;
    this.renderTimeSlotHeader = null;

    if (this.container) {
      const wrapper = this.container.querySelector(".er-container");
      if (wrapper) {
        this.container.removeChild(wrapper);
      }
    }
  };

  // --- DOM Creation & Rendering ---

  /**
   * Generates and mounts the sophisticated navigation, date-selection, and view toggle toolbar components inside the DOM container.
   * @param {HTMLElement} wrapper - REQUIRED: The main root layout frame container reference node where the toolbar will be injected.
   * @returns {void}
   * @private
   * @example
   * // Internal execution call structure
   * this._renderToolbar(wrapperElementNode);
   */
  _renderToolbar = (wrapper) => {
    const toolbar = document.createElement("div");
    toolbar.className = "er-toolbar";

    // Left: Navigation Controls
    const navGroup = document.createElement("div");
    navGroup.className = "er-toolbar-group";

    const btnPrev = document.createElement("button");
    btnPrev.className = "er-btn";
    btnPrev.textContent = "◀";
    btnPrev.onclick = () => this.navigate("prev");

    const btnToday = document.createElement("button");
    btnToday.className = "er-btn";
    btnToday.textContent = "Today";
    btnToday.onclick = () => this.setDate(new Date());

    const btnNext = document.createElement("button");
    btnNext.className = "er-btn";
    btnNext.textContent = "▶";
    btnNext.onclick = () => this.navigate("next");

    // Date Picker HTML5 Input Integration
    const datePicker = document.createElement("input");
    datePicker.type = "date";
    datePicker.className = "er-date-picker";
    datePicker.value = this._getNormalizedDateString(this.currentDate);
    datePicker.onchange = (e) => {
      if (e.target.value) {
        this.setDate(e.target.value);
      }
    };

    navGroup.append(btnPrev, btnToday, btnNext, datePicker);

    // Right: View Framework Mode Toggles & Freezing Management Elements
    const viewGroup = document.createElement("div");
    viewGroup.className = "er-toolbar-group";

    // Append Client Extensible Custom Action Elements
    this.customButtons.forEach((btnConfig) => {
      const customBtn = document.createElement("button");
      customBtn.className = `er-btn ${btnConfig.className || ""}`.trim();
      customBtn.textContent = btnConfig.label;
      customBtn.onclick = (e) => btnConfig.onClick(e);
      viewGroup.appendChild(customBtn);
    });

    const btnDaily = document.createElement("button");
    btnDaily.className = `er-btn ${this.currentView === "daily" ? "active" : ""}`;
    btnDaily.textContent = "Daily";
    btnDaily.onclick = () => this.setView("daily");

    const btnWeekly = document.createElement("button");
    btnWeekly.className = `er-btn ${this.currentView === "weekly" ? "active" : ""}`;
    btnWeekly.textContent = "Weekly";
    btnWeekly.onclick = () => this.setView("weekly");

    viewGroup.append(btnDaily, btnWeekly);

    toolbar.append(navGroup, viewGroup);

    const btnFreeze = document.createElement("button");
    btnFreeze.className = `er-btn er-freeze-btn ${this.stickyHeaders ? "active" : ""}`;
    btnFreeze.textContent = this.stickyHeaders ? "Freeze 📌" : "Unfreeze 🔓";
    btnFreeze.onclick = () => {
      this.stickyHeaders = !this.stickyHeaders;
      this.render();
    };
    navGroup.appendChild(btnFreeze);

    // Active Holiday Indicator Check
    const currentHoliday = this._getHolidayForDate(this.currentDate);
    if (currentHoliday) {
      const holidayBadge = document.createElement("span");
      holidayBadge.className = "er-holiday-badge";
      holidayBadge.textContent = `🎉 ${currentHoliday.name}`;
      navGroup.appendChild(holidayBadge);
    }

    wrapper.appendChild(toolbar);
  };

  /**
   * Master execution engine responsible for parsing memory arrays into physical layout nodes.
   * Builds coordinate grid intersections, mounts event cards, appends propagation intercepts, maps CSS grid templates dynamically, and finalizes DOM commitments.
   * @returns {void}
   * @private
   * @example
   * // Synchronous UI redraw
   * this.render();
   */
  render = () => {
    this.container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "er-container";

    if (this.showControls) {
      this._renderToolbar(wrapper);
    }

    const gridWrapper = document.createElement("div");
    gridWrapper.className = "er-grid-wrapper";

    const grid = document.createElement("div");
    grid.className = `er-grid ${this.stickyHeaders ? "er-sticky" : ""}`.trim();
    grid.style.gridTemplateColumns = `150px repeat(${this.timeSlots.length}, minmax(120px, 1fr))`;

    const corner = document.createElement("div");
    corner.className = "er-header-cell er-corner";
    grid.appendChild(corner);

    // Column Map Processing Loop
    this.timeSlots.forEach((time) => {
      const timeHeader = document.createElement("div");
      timeHeader.className = "er-header-cell er-time-header";

      if (typeof this.renderTimeSlotHeader === "function") {
        timeHeader.innerHTML = this.renderTimeSlotHeader(time);
      } else {
        timeHeader.textContent = time.label;
      }

      grid.appendChild(timeHeader);
    });

    const activeHoliday = this._getHolidayForDate(this.currentDate);

    // Row Matrix Layout Intercept Processing Loops
    this.rooms.forEach((room, rowIndex) => {
      const roomHeader = document.createElement("div");
      roomHeader.className = "er-header-cell er-room-header";

      if (typeof this.renderRoomHeader === "function") {
        roomHeader.innerHTML = this.renderRoomHeader(room);
      } else {
        roomHeader.textContent = room.name;
      }

      grid.appendChild(roomHeader);

      this.timeSlots.forEach((time, colIndex) => {
        const cell = document.createElement("div");
        cell.className = `er-grid-cell ${activeHoliday ? "er-holiday-cell" : ""}`;

        const cellEvents = this.eventsMap.get(`${room.id}-${time.id}`) || [];

        cell.addEventListener("click", () => {
          if (this.onCellClick) {
            this.onCellClick({
              date: this.currentDate,
              view: this.currentView,
              holiday: activeHoliday,
              row: { index: rowIndex, data: room },
              col: { index: colIndex, data: time },
              cell: { roomId: room.id, timeId: time.id, events: cellEvents },
            });
          }
        });

        cellEvents.forEach((ev) => {
          const eventDiv = document.createElement("div");
          eventDiv.className = "er-event";

          // Apply base background color, allowing CSS/Tailwind classes inside the custom HTML to inherit or override it.
          eventDiv.style.backgroundColor = ev.color || "#3b82f6";

          // Intercept rendering if the custom hook exists
          if (typeof this.renderEvent === "function") {
            eventDiv.innerHTML = this.renderEvent(ev);
          } else {
            eventDiv.textContent = ev.title;
          }

          eventDiv.addEventListener("click", (e) => {
            e.stopPropagation();

            if (this.onEventClick) {
              this.onEventClick({
                event: ev,
                nativeEvent: e,
                date: this.currentDate,
                view: this.currentView,
                holiday: activeHoliday,
                row: { index: rowIndex, data: room },
                col: { index: colIndex, data: time },
                cell: { roomId: room.id, timeId: time.id, events: cellEvents },
              });
            }
          });

          cell.appendChild(eventDiv);
        });

        grid.appendChild(cell);
      });
    });

    gridWrapper.appendChild(grid);
    wrapper.appendChild(gridWrapper);
    this.container.appendChild(wrapper);
  };

  /**
   * Installs required native structural CSS behaviors directly into the `<head>` of the underlying document frame.
   * Uses a hardcoded ID lookup to ensure injection occurs exactly once per session globally, preventing DOM bloat across multiple library invocations.
   * @returns {void}
   * @private
   * @example
   * // Automatic execution during construction
   * this._injectStyles();
   */
  _injectStyles = () => {
    if (document.getElementById("er-library-styles")) return;

    const style = document.createElement("style");
    style.id = "er-library-styles";
    style.textContent = `
            .er-container {
                font-family: system-ui, -apple-system, sans-serif;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #fff;
                width: 100%;
                display: flex;
                flex-direction: column;
            }
            .er-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
                border-radius: 8px 8px 0 0;
                flex-wrap: wrap;
                gap: 12px;
            }
            .er-toolbar-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .er-btn {
                padding: 6px 12px;
                background: #fff;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                transition: all 0.2s;
            }
            .er-btn:hover { background: #f3f4f6; }
            .er-btn.active {
                background: #e0e7ff;
                color: #4f46e5;
                border-color: #c7d2fe;
            }
            .er-date-picker {
                padding: 5px 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-family: inherit;
                font-size: 0.875rem;
                color: #374151;
                background: #fff;
                cursor: pointer;
            }
            .er-holiday-badge {
                font-size: 0.875rem;
                font-weight: 600;
                color: #059669;
                background: #d1fae5;
                padding: 4px 10px;
                border-radius: 9999px;
                margin-left: 8px;
            }
            .er-grid-wrapper {
                overflow: auto;
                max-height: 65vh;
                width: 100%;
            }
            .er-grid {
                display: grid;
                grid-auto-rows: minmax(60px, auto);
            }
            .er-header-cell {
                padding: 12px;
                font-size: 0.875rem;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                border-right: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                box-sizing: border-box;
            }
            
            .er-grid.er-sticky .er-corner { 
                position: sticky; 
                top: 0; 
                left: 0; 
                z-index: 3; 
                background: #f9fafb; 
            }
            .er-grid.er-sticky .er-time-header { 
                position: sticky; 
                top: 0; 
                z-index: 2; 
                background: #f9fafb; 
                justify-content: center; 
                color: #4b5563; 
            }
            .er-grid.er-sticky .er-room-header { 
                position: sticky; 
                left: 0; 
                z-index: 2; 
                background: #f9fafb; 
                justify-content: flex-start; 
            }
            
            .er-grid:not(.er-sticky) .er-corner,
            .er-grid:not(.er-sticky) .er-time-header,
            .er-grid:not(.er-sticky) .er-room-header {
                position: static;
                background: #f9fafb;
            }
            .er-grid:not(.er-sticky) .er-time-header { justify-content: center; }

            .er-grid-cell {
                border-bottom: 1px solid #e5e7eb;
                border-right: 1px solid #e5e7eb;
                padding: 4px;
                transition: background-color 0.2s;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                gap: 4px;
                box-sizing: border-box;
            }
            .er-grid-cell:hover { background-color: #f3f4f6; }
            .er-holiday-cell { background-color: #fdfbf7; }
            .er-holiday-cell:hover { background-color: #fef3c7; }
            .er-event {
                padding: 4px 8px;
                border-radius: 4px;
                color: white;
                font-size: 0.75rem;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .er-event:hover { transform: scale(1.02); z-index: 10; }
            
            .er-rich-wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                gap: 2px;
            }
            .er-rich-title { font-weight: 600; color: #111827; }
            .er-rich-subtitle { font-size: 0.75rem; color: #6b7280; font-weight: 400; }
        `;
    document.head.appendChild(style);
  };
}
