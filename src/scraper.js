import $ from 'jquery';
import TurndownService from 'turndown';

/**
 * @typedef {{
 * id: string
 * number: string
 * title: string
 * description: string
 * }} Task
 */

/**
 * @typedef {{
 * id: string
 * title: string
 * description: string
 * tags: string[]
 * tasks: Task[]
 * }} Project
 */

const turndown = new TurndownService({
  codeBlockStyle: 'fenced',
  headingStyle: 'atx',
  linkStyle: 'inlined',
});

// Scraper file will run in the context of web page.

export function getProjectDescription() {
  const description = $('#project-description.panel > .panel-body').first();
  const markup = turndown.turndown(description.html());
  return markup;
}


export function getProjectID() {
  // console.log(location);
  return location.pathname.match(/\/projects\/(\d+)/)[1];
}

export function getProjectTitle() {
  return $('.project.row > div > h1').text().trim();
}

/**
 * Get tags of the project
 * @returns {string[]} Array of tags
 */
export function getProjectTags() {
  return $('div[data-react-class="tags/Tags"] > div > span')
    .toArray()
    .map((el) => $(el).text().trim());
}

/**
 * Get the task details
 * @param {string} taskId - The task id
 */
export function getProjectTask(taskId) {
  const task = $(`div[data-role='task${taskId}']`);
  const taskNum = task.attr('id').replace('task-num-', '');
  const taskTitle = task.find('.panel-title').text().replace(/\d+\./, '').trim();
  const taskDescription = task
    .find('.panel-body')
    .children()
    .not('.task_progress_score_bar')
    .get()
    .map((el) => $(el).html())
    .join('');
  const markup = turndown.turndown(taskDescription);
  return {
    taskId,
    taskNum,
    taskTitle,
    taskDescription: markup,
  };
}

export function getProjectTasks() {
  const taskIds = $('h2:contains("Tasks") ~ div[id|="task-num"]')
    .toArray()
    .map((el) => $(el).find(".task-card").attr('id').replace('task-', ''));
  return taskIds.map((taskId) => {
    return getProjectTask(taskId);
  });
}

export default function scrapeProject() {
  /**@type {Project} */
  const project = {
    id: getProjectID(),
    title: getProjectTitle(),
    description: getProjectDescription(),
    tags: getProjectTags(),
    tasks: new Array(),
  };
  const tasks = getProjectTasks();
  project.tasks = tasks.map(task => ({
    id: task.taskId,
    number: task.taskNum,
    title: task.taskTitle,
    description: task.taskDescription,
  }));
  return project;
}
