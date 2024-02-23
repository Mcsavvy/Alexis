import $ from 'jquery';
import TurndownService from 'turndown';

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

export function getProjectTask(taskId) {
  const task = $(`div[data-role='task${taskId}']`);
  const taskNum = task.attr('id').replace('task-num-', '');
  const taskTitle = task.find('.panel-title').text();
  const taskDescription = task
    .find('.panel-body')
    .children()
    .not('.task_progress_score_bar')
    .html();
  const markup = turndown.turndown(taskDescription);
  return {
    taskNum,
    taskTitle,
    taskDescription: markup,
  };
}

export function getProjectTasks() {
  console.log("tasks:", $('h2:contains("Tasks") '));
  const taskIds = $('h2:contains("Tasks") ~ div[id|="task-num"]')
    .toArray()
    .map((el) => $(el).find(".task-card").attr('id').replace('task-', ''));
  return taskIds.map((taskId) => {
    return getProjectTask(taskId);
  });
}
