(function () {
  "use strict";

  const TASK_NAME = "Check with Workshop Manager About Ordering Tyres";
  const TASK_ID = "recurring-monday-tyres";
  const TASK_CATEGORY = "Orders";

  function getMondayDate() {
    const today = new Date();
    const day = today.getDay();
    const daysUntilMonday = (8 - day) % 7;

    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    monday.setHours(0, 0, 0, 0);

    return [
      monday.getFullYear(),
      String(monday.getMonth() + 1).padStart(2, "0"),
      String(monday.getDate()).padStart(2, "0")
    ].join("-");
  }

  function createRecurringTask() {
    const today = new Date();

    // Only process on Mondays
    if (today.getDay() !== 1) return;

    const monday = getMondayDate();
    const uniqueId = TASK_ID + "-" + monday;

    // Avoid adding duplicate tasks
    if (localStorage.getItem(uniqueId)) return;

    const task = {
      id: uniqueId,
      title: TASK_NAME,
      category: TASK_CATEGORY,
      frequency: "Weekly",
      repeatDay: "Monday",
      status: "Pending",
      date: monday
    };

    // Store separately to protect existing handover data
    const key = "handover_recurring_tasks";

    let tasks = [];

    try {
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      tasks = Array.isArray(stored) ? stored : [];
    } catch (error) {
      console.error("Recurring task data could not be read", error);
      return;
    }

    if (!tasks.some(item => item.id === uniqueId)) {
      tasks.push(task);

      localStorage.setItem(key, JSON.stringify(tasks));
      localStorage.setItem(uniqueId, "created");

      console.log("Monday recurring tyre task created:", task);
    }
  }

  createRecurringTask();
})();
