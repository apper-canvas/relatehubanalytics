import { taskService } from "./taskService";
import { activityService } from "./activityService";
import { contactService } from "./contactService";
import { isValidDate, safeFormat, safeIsAfter, safeIsToday, safeIsTomorrow, safeSubDays, safeDateSort } from "@/utils/dateUtils";
import React from "react";
import Error from "@/components/ui/Error";

class AlertService {
  constructor() {
    this.dismissedAlerts = new Set();
  }

  // Simulate delay for realistic API behavior
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    
    try {
const [tasks, activities, contacts] = await Promise.all([
        taskService.getAll(),
        activityService.getAll(),
        contactService.getAll()
      ]);

      const alerts = [];
      const now = new Date();

      // Task-based alerts
tasks.forEach(task => {
        if (task.completed_c) return;

const dueDate = task.due_date_c;
        const alertKey = `task-${task.Id}`;

        if (this.dismissedAlerts.has(alertKey)) return;

// Overdue tasks
        if (safeIsAfter(now, dueDate)) {
          alerts.push({
            Id: `overdue-${task.Id}`,
            type: 'task_overdue',
            priority: 'high',
            title: 'Overdue Task',
message: `"${task.title_c}" was due ${safeFormat(dueDate, 'MMM d, yyyy', 'unknown date')}`,
            taskId: task.Id,
            task: task,
            timestamp: task.due_date_c,
            actions: [
              { type: 'complete', label: 'Mark Complete' },
              { type: 'dismiss', label: 'Dismiss' }
            ]
          });
        }
// Tasks due today
        else if (safeIsToday(dueDate)) {
          alerts.push({
            Id: `due-today-${task.Id}`,
            type: 'task_due_today',
            priority: 'medium',
            title: 'Due Today',
message: `"${task.title_c}" is due today`,
            taskId: task.Id,
            task: task,
            timestamp: task.due_date_c,
            actions: [
              { type: 'complete', label: 'Mark Complete' },
              { type: 'dismiss', label: 'Dismiss' }
            ]
          });
        }
// Tasks due tomorrow
        else if (safeIsTomorrow(dueDate)) {
          alerts.push({
            Id: `due-tomorrow-${task.Id}`,
            type: 'task_due_tomorrow',
            priority: 'low',
            title: 'Due Tomorrow',
message: `"${task.title_c}" is due tomorrow`,
            taskId: task.Id,
            task: task,
            timestamp: task.due_date_c,
            actions: [
              { type: 'dismiss', label: 'Dismiss' }
            ]
          });
        }
      });

// Activity-based alerts (follow-ups needed)
      const sevenDaysAgo = safeSubDays(now, 7);
      const recentActivities = activities
        .filter(activity => {
          const activityDate = activity.timestamp_c;
          return activityDate >= sevenDaysAgo && activityDate <= now;
        })
.sort((a, b) => safeDateSort(a.timestamp_c, b.timestamp_c));

      // Group by contact and suggest follow-ups for recent activities
      const contactActivityMap = {};
recentActivities.forEach(activity => {
        if (!contactActivityMap[activity.contact_id_c]) {
          contactActivityMap[activity.contact_id_c] = [];
        }
        contactActivityMap[activity.contact_id_c].push(activity);
      });

      Object.entries(contactActivityMap).forEach(([contactId, contactActivities]) => {
        const alertKey = `follow-up-${contactId}`;
        if (this.dismissedAlerts.has(alertKey)) return;

        const contact = contacts.find(c => c.Id === parseInt(contactId));
        const latestActivity = contactActivities[0];
        
        if (contact && contactActivities.length > 0) {
          alerts.push({
            Id: `follow-up-${contactId}`,
            type: 'contact_follow_up',
            priority: 'medium',
title: 'Follow-up Needed',
            message: `${contact.name_c} - ${contactActivities.length} recent ${contactActivities.length === 1 ? 'activity' : 'activities'}`,
            contactId: parseInt(contactId),
            contact: contact,
            activities: contactActivities,
            timestamp: latestActivity.timestamp_c,
            actions: [
              { type: 'dismiss', label: 'Dismiss' }
            ]
          });
        }
      });

      // Sort by priority and timestamp
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      alerts.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
return safeDateSort(a.timestamp, b.timestamp);
      });

      return alerts;
    } catch (error) {
      console.error('AlertService.getAll error:', error);
      throw new Error('Failed to load alerts');
    }
  }

  async dismissAlert(alertId) {
    await this.delay(100);
    this.dismissedAlerts.add(alertId.replace(/^(overdue|due-today|due-tomorrow|follow-up)-/, ''));
    return { success: true };
  }

async completeTask(taskId) {
    try {
      await taskService.update(taskId, { completed_c: true });
      this.dismissedAlerts.add(`task-${taskId}`);
      return { success: true };
    } catch (error) {
      console.error('AlertService.completeTask error:', error);
      throw new Error('Failed to complete task');
    }
  }

  clearDismissedAlerts() {
    this.dismissedAlerts.clear();
  }
}

export const alertService = new AlertService();