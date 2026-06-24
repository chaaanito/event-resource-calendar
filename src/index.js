/**
 * @typedef {import('./event-resource.types.js').EventResourceOptions} EventResourceOptions
 * @typedef {import('./event-resource.types.js').CalendarRoom} CalendarRoom
 * @typedef {import('./event-resource.types.js').TimeSlot} TimeSlot
 * @typedef {import('./event-resource.types.js').CalendarEvent} CalendarEvent
 * @typedef {import('./event-resource.types.js').CalendarHoliday} CalendarHoliday
 * @typedef {import('./event-resource.types.js').CustomButton} CustomButton
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
    this.rooms = options.rooms || [];
    this.timeSlots = options.timeSlots || [];
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
    this.fetchRooms = options.fetchRooms || null;
    this.fetchTimeSlots = options.fetchTimeSlots || null;
    this.fetchHolidays = options.fetchHolidays || null;

    this.renderRoomHeader = options.renderRoomHeader || null;
    this.renderTimeSlotHeader = options.renderTimeSlotHeader || null;
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
      // PERFORMANCE FIX: Use '::' as a delimiter in case user IDs contain hyphens
      const key = `${ev.roomId}::${ev.timeId}`;
      if (!this.eventsMap.has(key)) {
        this.eventsMap.set(key, []);
      }
      this.eventsMap.get(key).push(ev);
    }
  };

  setDate = async (newDate) => {
    this.currentDate = new Date(newDate);
    await this.forceRender(); // Requires full rebuild to evaluate new holidays
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

  // --- Public API ---

  addEvent = (newEvent) => {
    this.events.push(newEvent);
    this._buildEventsMap();
    // PERFORMANCE FIX: Only redraw the events, leave the layout untouched
    this._renderEvents();
  };

  removeEvent = (eventId) => {
    this.events = this.events.filter((e) => e.id !== eventId);
    this._buildEventsMap();
    // PERFORMANCE FIX: Only redraw the events, leave the layout untouched
    this._renderEvents();
  };

  clearAllEvents = () => {
    this.events = [];
    this.eventsMap.clear();
    // PERFORMANCE FIX: Fast clear of events without layout thrashing
    this._renderEvents();
  };

  forceRender = async () => {
    if (this.isFetching) return;

    // 1. Draw empty skeleton instantly based on current memory
    this.render();

    const hasAsyncSources =
      typeof this.fetchEvents === "function" ||
      typeof this.fetchRooms === "function" ||
      typeof this.fetchTimeSlots === "function" ||
      typeof this.fetchHolidays === "function";

    if (hasAsyncSources) {
      this.isFetching = true;
      try {
        const [freshEvents, freshRooms, freshTimeSlots, freshHolidays] =
          await Promise.all([
            typeof this.fetchEvents === "function"
              ? this.fetchEvents(this.currentDate, this.currentView)
              : Promise.resolve(this.events),
            typeof this.fetchRooms === "function"
              ? this.fetchRooms(this.currentDate, this.currentView)
              : Promise.resolve(this.rooms),
            typeof this.fetchTimeSlots === "function"
              ? this.fetchTimeSlots(this.currentDate, this.currentView)
              : Promise.resolve(this.timeSlots),
            typeof this.fetchHolidays === "function"
              ? this.fetchHolidays(this.currentDate, this.currentView)
              : Promise.resolve(this.holidays),
          ]);

        this.events = freshEvents || [];
        this.rooms = freshRooms || [];
        this.timeSlots = freshTimeSlots || [];
        this.holidays = freshHolidays || [];
      } catch (error) {
        console.error("EventResource: Failed to refetch calendar data.", error);
      } finally {
        this.isFetching = false;
      }
    }

    this._buildEventsMap();
    // 2. Re-render entirely to apply fetched layout rules and fetched events
    this.render();
  };

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
    this.fetchRooms = null;
    this.fetchTimeSlots = null;
    this.fetchHolidays = null;
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

  _renderToolbar = (wrapper) => {
    const toolbar = document.createElement("div");
    toolbar.className = "er-toolbar";

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
    btnFreeze.textContent = this.stickyHeaders ? "Freeze 📌" : "Unfreeze 🔓";
    btnFreeze.onclick = () => {
      this.stickyHeaders = !this.stickyHeaders;
      this.render();
    };
    navGroup.appendChild(btnFreeze);

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
   * Manual render hook. Triggers a complete synchronization of the Skeleton UI and the Data Layer.
   * @returns {void}
   */
  render = () => {
    this._renderSkeleton();
    this._renderEvents();
  };

  /**
   * PERFORMANCE FIX: Renders ONLY the static layout (rows, columns, headers, empty cells).
   * Never touches actual event data or cards.
   * @private
   */
  _renderSkeleton = () => {
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
    grid.style.gridTemplateColumns = `150px repeat(${this.timeSlots.length || 1}, minmax(120px, 1fr))`;

    const corner = document.createElement("div");
    corner.className = "er-header-cell er-corner";
    grid.appendChild(corner);

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

        // Inject queryable coordinates for high-speed DOM updates
        cell.dataset.roomId = room.id;
        cell.dataset.timeId = time.id;

        cell.addEventListener("click", () => {
          if (this.onCellClick) {
            // PERFORMANCE FIX: Dynamically fetch current events at click time.
            // Avoids needing to detach/reattach listeners when data changes.
            const currentEvents =
              this.eventsMap.get(`${room.id}::${time.id}`) || [];

            this.onCellClick({
              date: this.currentDate,
              view: this.currentView,
              holiday: activeHoliday,
              row: { index: rowIndex, data: room },
              col: { index: colIndex, data: time },
              cell: { roomId: room.id, timeId: time.id, events: currentEvents },
            });
          }
        });

        grid.appendChild(cell);
      });
    });

    if (
      this.rooms.length === 0 &&
      this.timeSlots.length === 0 &&
      this.isFetching
    ) {
      const loadingIndicator = document.createElement("div");
      loadingIndicator.style.padding = "20px";
      loadingIndicator.style.color = "#6b7280";
      loadingIndicator.style.textAlign = "center";
      loadingIndicator.textContent = "Loading grid data...";
      grid.appendChild(loadingIndicator);
    }

    gridWrapper.appendChild(grid);
    wrapper.appendChild(gridWrapper);
    this.container.appendChild(wrapper);
  };

  /**
   * PERFORMANCE FIX: Renders ONLY the event cards. Leaves the skeleton UI completely intact.
   * Uses O(1) DOM targeting via data attributes.
   * @private
   */
  _renderEvents = () => {
    // 1. Wipe only the existing event DOM nodes, leaving empty cells perfectly intact
    const existingEvents = this.container.querySelectorAll(".er-event");
    existingEvents.forEach((el) => el.remove());

    const activeHoliday = this._getHolidayForDate(this.currentDate);

    // 2. Map and inject fresh events into their specific coordinate cells
    this.events.forEach((ev) => {
      const cell = this.container.querySelector(
        `[data-room-id="${ev.roomId}"][data-time-id="${ev.timeId}"]`,
      );

      // If cell doesn't exist (e.g., event is scheduled for a room not currently in view), skip rendering
      if (!cell) return;

      const eventDiv = document.createElement("div");
      eventDiv.className = "er-event";
      eventDiv.style.backgroundColor = ev.color || "#3b82f6";

      if (typeof this.renderEvent === "function") {
        eventDiv.innerHTML = this.renderEvent(ev);
      } else {
        eventDiv.textContent = ev.title;
      }

      eventDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.onEventClick) {
          // Dynamically fetch sibling events sharing this exact coordinate
          const sharedEvents =
            this.eventsMap.get(`${ev.roomId}::${ev.timeId}`) || [];

          // Look up current row/col index dynamically based on UI position
          const roomIndex = this.rooms.findIndex(
            (r) => String(r.id) === String(ev.roomId),
          );
          const timeIndex = this.timeSlots.findIndex(
            (t) => String(t.id) === String(ev.timeId),
          );

          this.onEventClick({
            event: ev,
            nativeEvent: e,
            date: this.currentDate,
            view: this.currentView,
            holiday: activeHoliday,
            row: { index: roomIndex, data: this.rooms[roomIndex] },
            col: { index: timeIndex, data: this.timeSlots[timeIndex] },
            cell: {
              roomId: ev.roomId,
              timeId: ev.timeId,
              events: sharedEvents,
            },
          });
        }
      });

      cell.appendChild(eventDiv);
    });
  };
}
