/**
 * @typedef {import('./event-resource.types.js').EventResourceOptions} EventResourceOptions
 * @typedef {import('./event-resource.types.js').GridResource} GridResource
 * @typedef {import('./event-resource.types.js').GridColumn} GridColumn
 * @typedef {import('./event-resource.types.js').GridEvent} GridEvent
 * @typedef {import('./event-resource.types.js').GridHoliday} GridHoliday
 */

export default class EventResource {
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
        "EventResource: A valid container is required and must exist in the DOM.",
      );
    }

    this.container = resolvedContainer;

    // Data Options
    this.resources = options.resources || [];
    this.columns = options.columns || [];
    this.events = options.initialEvents || [];
    this.holidays = options.holidays || [];
    this.customButtons = options.customButtons || [];

    // UI Controls & State
    this.showControls = options.showControls || false;
    this.stickyHeaders = options.stickyHeaders !== false;
    this.currentView = options.defaultView || "daily";
    this.currentDate = options.defaultDate
      ? new Date(options.defaultDate)
      : new Date();
    this.isFetching = false;

    // Callbacks & Async Fetchers
    this.onCellClick = options.onCellClick || null;
    this.onEventClick = options.onEventClick || null;
    this.fetchEvents = options.fetchEvents || null;
    this.fetchResources = options.fetchResources || null;
    this.fetchColumns = options.fetchColumns || null;
    this.fetchHolidays = options.fetchHolidays || null;
    this.renderResourceHeader = options.renderResourceHeader || null;
    this.renderColumnHeader = options.renderColumnHeader || null;
    this.renderEvent = options.renderEvent || null;

    this.eventsMap = new Map();
    this._buildEventsMap();
    this.forceRender();
  }

  // --- State & Date Management ---
  _getNormalizedDateString = (dateObj) => {
    const d = new Date(dateObj);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  _getHolidayForDate = (dateObj) => {
    const targetDate = this._getNormalizedDateString(dateObj);
    return (
      this.holidays.find(
        (h) => this._getNormalizedDateString(h.date) === targetDate,
      ) || null
    );
  };

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

  setDate = async (newDate) => {
    this.currentDate = new Date(newDate);
    await this.forceRender();
  };

  setView = async (newView) => {
    if (this.currentView === newView) return;
    this.currentView = newView;
    await this.forceRender();
  };

  navigate = async (direction) => {
    const daysToMove = this.currentView === "weekly" ? 7 : 1;
    const multiplier = direction === "next" ? 1 : -1;
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + daysToMove * multiplier);
    await this.setDate(newDate);
  };

  // --- Extended Public API ---
  setResources = (newResources) => {
    this.resources = newResources;
    this.render();
  };

  setColumns = (newColumns) => {
    this.columns = newColumns;
    this.render();
  };

  addEvent = (newEvent) => {
    this.events.push(newEvent);
    this._buildEventsMap();
    this._renderEvents();
  };

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

  removeEvent = (eventId) => {
    this.events = this.events.filter((e) => String(e.id) !== String(eventId));
    this._buildEventsMap();
    this._renderEvents();
  };

  clearAllEvents = () => {
    this.events = [];
    this.eventsMap.clear();
    this._renderEvents();
  };

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

  // --- DOM Creation & Rendering ---
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

  render = () => {
    this._renderSkeleton();
    this._renderEvents();
  };

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
    grid.style.gridTemplateColumns = `150px repeat(${this.columns.length || 1}, minmax(120px, auto))`;

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

  _renderEvents = () => {
    // Clean up old events efficiently
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
      eventDiv.dataset.eventId = ev.id; // Bound for event delegation lookup
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
