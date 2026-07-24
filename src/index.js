/**
 * @typedef {import('./event-resource.types.js').EventResourceOptions} EventResourceOptions
 * @typedef {import('./event-resource.types.js').GridResource} GridResource
 * @typedef {import('./event-resource.types.js').GridColumn} GridColumn
 * @typedef {import('./event-resource.types.js').GridEvent} GridEvent
 * @typedef {import('./event-resource.types.js').GridHoliday} GridHoliday
 */

/**
 * EventResource
 * A lightweight, high-performance vanilla JavaScript matrix grid library.
 * Features O(1) internal event mapping, DOM-fragment rendering, and extensible rich HTML layout renderers.
 */
export default class EventResource {
  /**
   * Initializes a new EventResource grid instance, mounts it to the DOM, and fires initial render passes.
   * @param {EventResourceOptions} options - Configuration parameters required to bootstrap the grid.
   * @throws {Error} Throws if a valid `container` element, Node, or string selector cannot be resolved in the DOM.
   * @example
   * const grid = new EventResource({
   *   container: '#app',
   *   resources: [{ id: 'r1', name: 'Dev Team' }],
   *   columns: [{ id: 'c1', label: 'Monday' }],
   *   initialEvents: [{ id: 'e1', resourceId: 'r1', columnId: 'c1', title: 'Sprint Planning' }],
   *   showControls: true
   * });
   */
  constructor(options) {
    /** @type {HTMLElement|null} */
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
        "EventResource: A valid container is required and must exist in the DOM.",
      );
    }

    /** @type {HTMLElement} The root DOM mount point. */
    this.container = resolvedContainer;

    // --- Data Options ---
    /** @type {GridResource[]} */
    this.resources = options.resources || [];
    /** @type {GridColumn[]} */
    this.columns = options.columns || [];
    /** @type {GridEvent[]} */
    this.events = options.initialEvents || [];
    /** @type {GridHoliday[]} */
    this.holidays = options.holidays || [];
    /** @type {CustomButton[]} */
    this.customButtons = options.customButtons || [];

    // --- UI Controls & State ---
    /** @type {boolean} */
    this.showControls = options.showControls || false;
    /** @type {boolean} */
    this.stickyHeaders = options.stickyHeaders !== false;
    /** @type {string} */
    this.currentView = options.defaultView || "daily";
    /** @type {Date} */
    this.currentDate = options.defaultDate
      ? new Date(options.defaultDate)
      : new Date();

    /** @type {boolean} Flag indicating if async data is currently resolving. */
    this.isFetching = false;

    // --- Callbacks & Async Fetchers ---
    this.onCellClick = options.onCellClick || null;
    this.onEventClick = options.onEventClick || null;
    this.fetchEvents = options.fetchEvents || null;
    this.fetchResources = options.fetchResources || null;
    this.fetchColumns = options.fetchColumns || null;
    this.fetchHolidays = options.fetchHolidays || null;
    this.renderResourceHeader = options.renderResourceHeader || null;
    this.renderColumnHeader = options.renderColumnHeader || null;
    this.renderEvent = options.renderEvent || null;

    /**
     * @type {Map<string, GridEvent[]>}
     * O(1) Lookup map binding coordinate strings (`resourceId::columnId`) to event arrays.
     */
    this.eventsMap = new Map();
    this._buildEventsMap();
    this.forceRender();
  }

  /**
   * Internal stringifier for temporal comparisons.
   * @private
   * @param {Date|string|number} dateObj - The raw date input.
   * @returns {string} Normalized YYYY-MM-DD string.
   */
  _getNormalizedDateString = (dateObj) => {
    const d = new Date(dateObj);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  /**
   * Detects if a specific date intersects with a configured structural holiday.
   * @private
   * @param {Date|string|number} dateObj - The target temporal coordinate.
   * @returns {GridHoliday|null} The matching holiday object, or null.
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
   * Compiles the high-speed O(1) collision map tracking event coordinate allocations.
   * @private
   * @returns {void}
   */
  _buildEventsMap = () => {
    this.eventsMap.clear();
    for (const ev of this.events) {
      const key = `${ev.resourceId}::${ev.columnId}`;
      if (!this.eventsMap.has(key)) {
        this.eventsMap.set(key, []);
      }
      this.eventsMap.get(key).push(ev);
    }
  };

  /**
   * Forces a chronological state shift, rewiring internal date parameters and firing synchronous/asynchronous re-render loops.
   * @param {Date|string|number} newDate - The new calendar baseline target date parameter.
   * @returns {Promise<void>} Resolves when the refetch and re-render lifecycle are complete.
   * @example
   * await grid.setDate('2024-12-25');
   * // Grid now displays data relative to Christmas 2024
   */
  setDate = async (newDate) => {
    this.currentDate = new Date(newDate);
    await this.forceRender();
  };

  /**
   * Mutates the application structural layout framework dynamically (e.g., 'daily' vs 'weekly').
   * @param {string} newView - The target structural mode selection string.
   * @returns {Promise<void>} Resolves when the structural framework update completes.
   * @example
   * await grid.setView('weekly');
   */
  setView = async (newView) => {
    if (this.currentView === newView) return;
    this.currentView = newView;
    await this.forceRender();
  };

  /**
   * Calculates timeline vector offsets, steps the internal date parameter, and triggers reconciliations.
   * @param {'prev'|'next'} direction - The chronological vector direction keyword.
   * @returns {Promise<void>} Resolves upon successful navigation and canvas redraw.
   * @example
   * await grid.navigate('next');
   * // Moves calendar forward by 1 day (or 7 days if view is 'weekly')
   */
  navigate = async (direction) => {
    const daysToMove = this.currentView === "weekly" ? 7 : 1;
    const multiplier = direction === "next" ? 1 : -1;
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + daysToMove * multiplier);
    await this.setDate(newDate);
  };

  /**
   * Swaps out the vertical axis data dynamically and redraws the grid skeleton.
   * @param {GridResource[]} newResources - The new array of resources.
   * @returns {void}
   * @example
   * grid.setResources([
   *   { id: 'r1', name: 'Alice' },
   *   { id: 'r2', name: 'Bob' }
   * ]);
   */
  setResources = (newResources) => {
    this.resources = newResources;
    this.render();
  };

  /**
   * Swaps out the horizontal axis data dynamically and redraws the grid skeleton.
   * @param {GridColumn[]} newColumns - The new array of columns.
   * @returns {void}
   * @example
   * grid.setColumns([
   *   { id: 'c1', label: 'Morning' },
   *   { id: 'c2', label: 'Afternoon' }
   * ]);
   */
  setColumns = (newColumns) => {
    this.columns = newColumns;
    this.render();
  };

  /**
   * Injects a new event into the matrix, recompiles the collision map, and renders it.
   * @param {GridEvent} newEvent - A valid object matching the Event configuration specs.
   * @returns {void}
   * @example
   * grid.addEvent({
   *   id: 'new-evt-1',
   *   resourceId: 'r1',
   *   columnId: 'c1',
   *   title: 'Ad-hoc Meeting',
   *   color: '#ef4444'
   * });
   */
  addEvent = (newEvent) => {
    this.events.push(newEvent);
    this._buildEventsMap();
    this._renderEvents();
  };

  /**
   * Dynamically updates an existing event's properties or grid coordinates.
   * @param {string|number} eventId - The unique ID of the event to update.
   * @param {Partial<GridEvent>} updatedData - The properties to overwrite.
   * @returns {void}
   * @example
   * grid.updateEvent('new-evt-1', {
   *   title: 'Rescheduled Meeting',
   *   columnId: 'c2' // Moves the event to column 'c2'
   * });
   */
  updateEvent = (eventId, updatedData) => {
    const index = this.events.findIndex(
      (e) => String(e.id) === String(eventId),
    );
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updatedData };
      this._buildEventsMap();
      this._renderEvents();
    }
  };

  /**
   * Executes a hard delete across the internal event arrays based strictly on ID.
   * @param {string|number} eventId - The unique reference ID matching the target GridEvent.
   * @returns {void}
   * @example
   * grid.removeEvent('new-evt-1');
   */
  removeEvent = (eventId) => {
    this.events = this.events.filter((e) => String(e.id) !== String(eventId));
    this._buildEventsMap();
    this._renderEvents();
  };

  /**
   * Wipes out all transient operational event records cached in memory while preserving structural layout.
   * @returns {void}
   * @example
   * grid.clearAllEvents();
   */
  clearAllEvents = () => {
    this.events = [];
    this.eventsMap.clear();
    this._renderEvents();
  };

  /**
   * Triggers a comprehensive data replenishment cycle. Evaluates external fetch connectors and redraws the UI.
   * @returns {Promise<void>} Resolves once all external data resolves and the DOM reconciliation concludes.
   * @example
   * await grid.forceRender();
   */
  forceRender = async () => {
    if (this.isFetching) return;
    this.render();
    const hasAsyncSources =
      typeof this.fetchEvents === "function" ||
      typeof this.fetchResources === "function" ||
      typeof this.fetchColumns === "function" ||
      typeof this.fetchHolidays === "function";
    if (hasAsyncSources) {
      this.isFetching = true;
      try {
        const [freshEvents, freshResources, freshColumns, freshHolidays] =
          await Promise.all([
            typeof this.fetchEvents === "function"
              ? this.fetchEvents(this.currentDate, this.currentView)
              : Promise.resolve(this.events),
            typeof this.fetchResources === "function"
              ? this.fetchResources(this.currentDate, this.currentView)
              : Promise.resolve(this.resources),
            typeof this.fetchColumns === "function"
              ? this.fetchColumns(this.currentDate, this.currentView)
              : Promise.resolve(this.columns),
            typeof this.fetchHolidays === "function"
              ? this.fetchHolidays(this.currentDate, this.currentView)
              : Promise.resolve(this.holidays),
          ]);
        this.events = freshEvents || [];
        this.resources = freshResources || [];
        this.columns = freshColumns || [];
        this.holidays = freshHolidays || [];
      } catch (error) {
        console.error("EventResource: Failed to refetch grid data.", error);
      } finally {
        this.isFetching = false;
      }
    }
    this._buildEventsMap();
    this.render();
  };

  /**
   * Irreversible teardown routine protecting host memory bounds. Drops listeners and unmounts UI sub-trees.
   * @returns {void}
   * @example
   * grid.destroy();
   * // Grid is unmounted and memory references cleared.
   */
  destroy = () => {
    this.events = [];
    this.resources = [];
    this.columns = [];
    this.holidays = [];
    this.customButtons = [];
    this.eventsMap.clear();
    this.onCellClick = null;
    this.onEventClick = null;
    if (this.container) {
      const wrapper = this.container.querySelector(".er-container");
      if (wrapper) {
        this.container.removeChild(wrapper);
      }
    }
  };

  /**
   * Internal generator injecting structural management tools (navigators, datepickers, custom actions).
   * @private
   * @param {HTMLElement} wrapper - The host container sub-tree.
   * @returns {void}
   */
  _renderToolbar = (wrapper) => {
    const toolbar = document.createElement("div");
    toolbar.className = "er-toolbar";
    const navGroup = document.createElement("div");
    navGroup.className = "er-toolbar-group";

    const btnPrev = document.createElement("button");
    btnPrev.className = "er-btn";
    btnPrev.textContent = "Prev";
    btnPrev.onclick = () => this.navigate("prev");

    const btnToday = document.createElement("button");
    btnToday.className = "er-btn";
    btnToday.textContent = "Today";
    btnToday.onclick = () => this.setDate(new Date());

    const btnNext = document.createElement("button");
    btnNext.className = "er-btn";
    btnNext.textContent = "Next";
    btnNext.onclick = () => this.navigate("next");

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

    const viewGroup = document.createElement("div");
    viewGroup.className = "er-toolbar-group";

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
    btnFreeze.textContent = this.stickyHeaders ? "Freeze" : "Unfreeze";
    btnFreeze.onclick = () => {
      this.stickyHeaders = !this.stickyHeaders;
      this.render();
    };

    navGroup.appendChild(btnFreeze);

    const currentHoliday = this._getHolidayForDate(this.currentDate);
    if (currentHoliday) {
      const holidayBadge = document.createElement("span");
      holidayBadge.className = "er-holiday-badge";
      holidayBadge.textContent = currentHoliday.name;
      navGroup.appendChild(holidayBadge);
    }

    wrapper.appendChild(toolbar);
  };

  /**
   * Manual render hook. Triggers a complete synchronization of the skeleton and event nodes.
   * @returns {void}
   * @example
   * // In case a manual force sync is needed without touching async lifecycles
   * grid.render();
   */
  render = () => {
    this._renderSkeleton();
    this._renderEvents();
  };

  /**
   * Resolves global delegation coordinates intercepting bubbling click events.
   * @private
   * @param {MouseEvent} e - Native click event.
   * @returns {void}
   */
  _handleGridClick = (e) => {
    const activeHoliday = this._getHolidayForDate(this.currentDate);
    // 1. Check for Event Click
    const eventEl = e.target.closest(".er-event");
    if (eventEl && this.onEventClick) {
      e.stopPropagation();
      const eventId = eventEl.dataset.eventId;
      const ev = this.events.find((ev) => String(ev.id) === String(eventId));
      if (!ev) return;
      const sharedEvents =
        this.eventsMap.get(`${ev.resourceId}::${ev.columnId}`) || [];
      const resourceIndex = this.resources.findIndex(
        (r) => String(r.id) === String(ev.resourceId),
      );
      const colIndex = this.columns.findIndex(
        (c) => String(c.id) === String(ev.columnId),
      );
      this.onEventClick({
        event: ev,
        nativeEvent: e,
        date: this.currentDate,
        view: this.currentView,
        holiday: activeHoliday,
        row: { index: resourceIndex, data: this.resources[resourceIndex] },
        col: { index: colIndex, data: this.columns[colIndex] },
        cell: {
          resourceId: ev.resourceId,
          columnId: ev.columnId,
          events: sharedEvents,
        },
      });
      return;
    }
    // 2. Check for Cell Click
    const cellEl = e.target.closest(".er-grid-cell");
    if (
      cellEl &&
      !cellEl.classList.contains("er-has-events") &&
      this.onCellClick
    ) {
      const resourceId = cellEl.dataset.resourceId;
      const columnId = cellEl.dataset.columnId;
      const resourceIndex = this.resources.findIndex(
        (r) => String(r.id) === String(resourceId),
      );
      const colIndex = this.columns.findIndex(
        (c) => String(c.id) === String(columnId),
      );
      const currentEvents =
        this.eventsMap.get(`${resourceId}::${columnId}`) || [];
      this.onCellClick({
        date: this.currentDate,
        view: this.currentView,
        holiday: activeHoliday,
        row: { index: resourceIndex, data: this.resources[resourceIndex] },
        col: { index: colIndex, data: this.columns[colIndex] },
        cell: { resourceId, columnId, events: currentEvents },
      });
    }
  };

  /**
   * Draws the baseline grid architecture, mapping axes and binding global delegation listeners via fragment batching.
   * Includes dynamic sizing adjustment for column widths.
   * @private
   * @returns {void}
   */
  _renderSkeleton = () => {
    this.container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement("div");
    wrapper.className = "er-container";

    if (this.showControls) {
      this._renderToolbar(wrapper);
    }

    const gridWrapper = document.createElement("div");
    gridWrapper.className = "er-grid-wrapper";
    const grid = document.createElement("div");
    grid.className = `er-grid ${this.stickyHeaders ? "er-sticky" : ""}`.trim();

    // Dynamic width layout based on inner cell requirements
    grid.style.gridTemplateColumns = `150px repeat(${this.columns.length || 1}, auto)`;

    // Event Delegation attached directly to the grid root
    grid.addEventListener("click", this._handleGridClick);

    // Use DocumentFragment for grid cells to batch DOM insertions
    const gridFragment = document.createDocumentFragment();
    const corner = document.createElement("div");
    corner.className = "er-header-cell er-corner";
    gridFragment.appendChild(corner);

    this.columns.forEach((col) => {
      const columnHeader = document.createElement("div");
      columnHeader.className = "er-header-cell er-column-header";
      if (typeof this.renderColumnHeader === "function") {
        columnHeader.innerHTML = this.renderColumnHeader(col);
      } else {
        columnHeader.textContent = col.label;
      }
      gridFragment.appendChild(columnHeader);
    });

    const activeHoliday = this._getHolidayForDate(this.currentDate);

    this.resources.forEach((resource) => {
      const resourceHeader = document.createElement("div");
      resourceHeader.className = "er-header-cell er-resource-header";
      if (typeof this.renderResourceHeader === "function") {
        resourceHeader.innerHTML = this.renderResourceHeader(resource);
      } else {
        resourceHeader.textContent = resource.name;
      }
      gridFragment.appendChild(resourceHeader);

      this.columns.forEach((col) => {
        const cell = document.createElement("div");
        cell.className = `er-grid-cell ${activeHoliday ? "er-holiday-cell" : ""}`;
        cell.dataset.resourceId = resource.id;
        cell.dataset.columnId = col.id;
        gridFragment.appendChild(cell);
      });
    });

    if (
      this.resources.length === 0 &&
      this.columns.length === 0 &&
      this.isFetching
    ) {
      const loadingIndicator = document.createElement("div");
      loadingIndicator.style.padding = "20px";
      loadingIndicator.style.color = "#6b7280";
      loadingIndicator.style.textAlign = "center";
      loadingIndicator.style.gridColumn = "1 / -1";
      loadingIndicator.textContent = "Loading grid data...";
      gridFragment.appendChild(loadingIndicator);
    }

    grid.appendChild(gridFragment);
    gridWrapper.appendChild(grid);
    wrapper.appendChild(gridWrapper);
    fragment.appendChild(wrapper);

    // Single DOM attachment
    this.container.appendChild(fragment);
  };

  /**
   * Projects active memory state into the structural skeleton visually binding elements to intersections.
   * @private
   * @returns {void}
   */
  _renderEvents = () => {
    const existingEvents = this.container.querySelectorAll(".er-event");
    existingEvents.forEach((el) => el.remove());

    const existingActiveCells =
      this.container.querySelectorAll(".er-has-events");
    existingActiveCells.forEach((cell) =>
      cell.classList.remove("er-has-events"),
    );

    this.events.forEach((ev) => {
      const cell = this.container.querySelector(
        `[data-resource-id="${ev.resourceId}"][data-column-id="${ev.columnId}"]`,
      );
      if (!cell) return;

      cell.classList.add("er-has-events");
      const eventDiv = document.createElement("div");
      eventDiv.className = "er-event";
      eventDiv.dataset.eventId = ev.id;
      eventDiv.style.backgroundColor = ev.color || "#3b82f6";

      if (typeof this.renderEvent === "function") {
        eventDiv.innerHTML = this.renderEvent(ev);
      } else {
        eventDiv.textContent = ev.title;
      }
      cell.appendChild(eventDiv);
    });
  };
}
