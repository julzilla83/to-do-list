import { renderProjects } from './dom'
let projects = [];

class Project {
    constructor(
        title,
        description,
    ){
        this.title = title;
        this.description = description;
        this.todoList = [];
    }
}

class ToDo {
    constructor(
        name,
        dueDate,
        complete,
        priority
    ){
        this.name = name;
        this.dueDate = dueDate;
        this.complete = complete;
        this.priority = priority
    }
}

const createProject = (name, description) => {
    const newProject = new Project(name, description);
    updateProjectsArray(newProject);
    return newProject;
}

Project.prototype.addToDo = function (name, dueDate, status, priority) {
    const toDo = new ToDo (name, dueDate, status, priority);
    this.todoList.push(toDo);
}

Project.prototype.removeTask = function (task_index) {
    this.todoList.splice(task_index,1);
}

const updateProjectsArray = newProject => {
    projects.push(newProject);
}

const deleteProject = (projectIndex) => {
    projects.splice(projectIndex,1);
    renderProjects();
}

const deleteTask = (projectIndex, taskIndex) => {
    projects[projectIndex].todoList.splice(taskIndex,1);
}

export { createProject, projects, deleteProject, deleteTask };