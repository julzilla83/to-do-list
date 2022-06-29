import './styles.css';
import { createProject } from './data-structure';
import { addToDo } from './data-structure';
import { projects } from './data-structure';
import DOM from './dom';
import {
    addBtnEvent,
    cancelBtnEvent,
    enrollBtnEvent,
    addDelProjEvent,
    createProjectEntryPopup,
    createTaskEntryPopup,
    addTaskBtnEvent,
    cancelTaskBtnEvent,
    enrollTaskBtnEvent,
    deleteTaskBtnEvent,
    renderProjects,
    renderTasks,
    hideAllDatePicker,
} from './dom';

import { saveToLocal, readFromLocal } from '../dist/local-storage';

// let proj1 = createProject('Project 1', 'Just testing my codes.');
// addToDo(proj1,'1st Task', '03-30-2022',false,'low');
// addToDo(proj1,'2nd Task', '03-29-2022',true,'high');
// proj1.todoList.splice(0,1);

createProjectEntryPopup();
createTaskEntryPopup();

// let projectTitle = document.querySelector('.new-project-input');
// let projectDesc = document.querySelector('.new-project-desc-input');
// DOM.addAttribute(projectTitle, 'name', 'project-name');
// DOM.addAttribute(projectDesc, 'name', 'project-desc');

// DOM.addProject('Project Numbah 1', 'Blah blah blah description 1', true, '');
// DOM.addProject('Project Numbah 2', 'Blah blah blah description 2', true, '');
// DOM.addProject('Project Numbah 3', 'Blah blah blah description 3', true, '');

// // projects[0].addToDo('1st Task', '03-30-2022',false,'low');
// // projects[0].addToDo('2nd Task', '03-30-2023',false,'low');
// // projects[0].removeTask(0);

// DOM.addTask(0,'Unang Task', '2022-05-30', true, 'low', true, '');
// DOM.addTask(0,'Pangalawang Task', '2022-04-25', false, 'medium', true, '');
// DOM.addTask(1,'Importante', '2022-06-15', false, 'high', true, '');
// DOM.addTask(2,'Task ng 3rd Project', '2022-06-26', 'true', 'low', true, '');

// console.log(projects);

// const tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
const localtime = new Date();
let day = localtime.getDate()+1;
let month = localtime.getMonth() + 1;
let year = localtime.getFullYear();
if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;
const tomorrow =  year + "-" + month + "-" + day; //html only accepts this date format

if (localStorage.getItem('ProjectsData') !== null){
    readFromLocal();
    for (let i=0; i<projects.length; i++){
        DOM.addProject(projects[i].title, projects[i].description, false, i);
        // console.log(projects[i].todoList.length);
        if (projects[i].todoList.length === 0){
            DOM.addTask(i,'Default 1st Task', tomorrow, false, 'low', true, 0);
            saveToLocal();
        } else {
            for (let j=0; j<projects[i].todoList.length; j++){
                renderTasks(i);
            }
        }
    }

} else {
    DOM.addProject('Default Project', 'Description for Default Project', true, '');

    DOM.addTask(0,'Default 1st Task', tomorrow, false, 'low', true, '');
    DOM.addTask(0,'Default 2nd Task', tomorrow, false, 'medium', true, '');

    saveToLocal();
}

// hideAllDatePicker();
addBtnEvent();
cancelBtnEvent();
enrollBtnEvent();
cancelTaskBtnEvent();
enrollTaskBtnEvent();
// deleteTaskBtnEvent();
// addDelProjEvent();
// addTaskBtnEvent();