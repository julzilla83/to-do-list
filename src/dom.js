import { createProject, projects, deleteProject, deleteTask } from "./data-structure";
import { formatDistanceToNow } from 'date-fns';
import { parseISO } from 'date-fns';
import { updateProjectStorageData, saveToLocal, readFromLocal } from "../dist/local-storage";

const DOM = (function(){

    //error here, when re-render is called.
    const addProject = (name, description, updateProjArray, index) => {
        if (updateProjArray) {
            createProject(name, description);
             index = projects.length-1;
        }

        // console.log(projects.length-1);
        const projectContainer = `.project-container[data-projectIndex="${index}"]`;
        const projectInfo = `.project-container[data-projectIndex="${index}"] .project-info`;
        createNode('li', '.project-list', 'project', index, name);
        createNode('div', '.main', 'project-container', index, '');
        createNode('div', projectContainer, 'project-info', index, '');

        createNode('INPUT', projectInfo, 'project-name', index, '');
        const projectName = `.project-container[data-projectIndex="${index}"] .project-name`;
        addAttribute(qS(projectName), 'value', name);
        addAttribute(qS(projectName), 'type', 'text');
        addClass(projectName, 'input-locked');

        createNode('INPUT', projectInfo, 'project-description', index, '');
        const projectDescription = `.project-container[data-projectIndex="${index}"] .project-description`;
        addAttribute(qS(projectDescription), 'value', description);
        addAttribute(qS(projectDescription), 'type', 'text');
        addClass(projectDescription, 'input-locked');

        createNode('div', projectInfo, 'btn-container', '', '');
        createNode('button', projectInfo + ' div:last-child', 'proj-edit-btn', index, 'Edit');
        createNode('button', projectInfo + ' div:last-child', 'proj-del-btn', index, 'Delete');
        createNode('div', projectContainer, 'task-list-container', index, '');
        createNode('button', projectContainer, 'add-task-btn', index, '+');

        saveToLocal();

        setDelProjBtnListener(index);
        setAddTaskBtnListener(index);
        setEditProjBtnListener(index);
    }

    const qS = (selector) => {
        return document.querySelector(selector);
    }

    const qSA = (selector) => {
        return document.querySelectorAll(selector);
    }

    const setEditProjBtnListener = (index) => {
        let editProjBtn = qS(`.project-container[data-projectIndex="${index}"] .proj-edit-btn`);
        let deleteProjBtn = qS(`.project-container[data-projectIndex="${index}"] .proj-del-btn`);
        let projInfos = qSA(`.project-container[data-projectIndex="${index}"] input[type=text]`);
        editProjBtn.addEventListener('click', (e)=> {
            if (editProjBtn.textContent === 'Edit') {
                editProjBtn.textContent = 'Save';
                deleteProjBtn.textContent = 'Cancel';
                projInfos.forEach((element) => {
                    element.classList.remove('input-locked');
                })
            } else {
                editProjBtn.textContent = 'Edit';
                deleteProjBtn.textContent = 'Delete'
                projInfos.forEach((element) => {
                    element.classList.add('input-locked');
                    // update element value attribute
                    element.setAttribute('value',element.value);
                })
                updateProjects(index, qS(`.project-container[data-projectIndex="${index}"] .project-name`).value, qS(`.project-container[data-projectIndex="${index}"] .project-description`).value);
                renderProjects();
            }

        })
    }

    const updateProjects = function(index, projectName, projectDesc){
        projects[index].title = projectName;
        projects[index].description = projectDesc;
        saveToLocal();
        // console.log(projects);
    }

    const setDelProjBtnListener = (index) => {
        let delProjBtn = document.querySelector(`.project-container[data-projectIndex="${index}"] .proj-del-btn`);
        let editProjBtn = qS(`.project-container[data-projectIndex="${index}"] .proj-edit-btn`);
        let projInfos = qSA(`.project-container[data-projectIndex="${index}"] input[type=text]`);
        delProjBtn.addEventListener('click', ()=> {
            if (delProjBtn.textContent === 'Delete') {
                deleteProjSequence(delProjBtn);
                saveToLocal();
            } else {
                delProjBtn.textContent = 'Delete';
                editProjBtn.textContent = 'Edit';
                qS(`.project-container[data-projectIndex="${index}"] .project-name`).value = projects[index].title;
                qS(`.project-container[data-projectIndex="${index}"] .project-description`).value = projects[index].description;
                projInfos.forEach((element) => {
                    element.classList.add('input-locked');
                })
            }
            
        })
    }

    const setAddTaskBtnListener = (index) => {
        let addTaskBtn = document.querySelector(`.project-container[data-projectIndex="${index}"] .add-task-btn`);
        addTaskBtn.addEventListener('click', ()=> {
            let taskEntryDiv = document.querySelector('.newTaskEntry');
            taskEntryDiv.removeAttribute('data-projectIndex');
            DOM.addAttribute(taskEntryDiv, 'data-projectIndex', index)
            DOM.hideElement('.newProjEntry');
            DOM.showElement('.popup-container');
            DOM.showElement('.newTaskEntry');
        });
    }

    const addTask = (
        project_index,
        name,
        dueDate,
        status,
        priority,
        updateTodoArray,
        taskIndex
        ) => {
        if (updateTodoArray) {
            projects[project_index].addToDo(name, dueDate, status, priority, updateTodoArray);
            taskIndex = projects[project_index].todoList.length-1;
        }

        let taskParent = `.project-container[data-projectIndex="${project_index}"] .task-list-container`;
        createNode('div', taskParent, 'task-container', taskIndex, '');
        let taskElementsParent = `.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${taskIndex}"]`;

        createNode('div', taskElementsParent, 'checkbox-container', '', '')
        createNode('INPUT', taskElementsParent + ' .checkbox-container', 'status', project_index, status);
        createNode('label', taskElementsParent + ' .checkbox-container', 'checkbox-label', '', '');
        let checkbox = qS(taskElementsParent + ' .checkbox-container' + ' .status')
        let checkboxLabel = qS(taskElementsParent + ' .checkbox-container' + ' label');
        addAttribute(checkbox, 'id', 'checkbox' + '_' + project_index + '_' + taskIndex);
        addAttribute(checkboxLabel, 'for', 'checkbox' + '_' + project_index + '_' + taskIndex); // added proj index and task index to make id unique

        createNode('INPUT', taskElementsParent, 'task', project_index, name);
        const taskDescription = `.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${taskIndex}"] .task`;
        addAttribute(qS(taskDescription), 'value', name);
        addAttribute(qS(taskDescription), 'type', 'text');
        addClass(taskDescription, 'input-locked');

        createNode('label', taskElementsParent, 'target', '', 'Due: ');
        createNode('INPUT', taskElementsParent, 'due-date', project_index, '');
        const dueDateNode = `.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${taskIndex}"] .due-date`;
        addAttribute(qS(dueDateNode), 'type', 'date');
        addAttribute(qS(dueDateNode), 'value', dueDate);
        addClass(dueDateNode, 'input-locked');
        
        let remaining = formatDistanceToNow(parseISO(dueDate), 'includeSeconds', { addSuffix: true });
        createNode('label', taskElementsParent, 'remaining', '', remaining);
        
        // createNode('p', taskElementsParent, 'priority', project_index, `Priority: ${priority}`);
        createNode('label', taskElementsParent, 'new-task-priority', '', 'Priority: ');
        createNode('select', taskElementsParent, 'priority-level', 'task-options', '');
        const taskOptions = document.querySelector(`.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${taskIndex}"] .priority-level`);
        addAttribute(taskOptions,'name','priority-level');
        addAttribute(taskOptions,'id','priority-level');
        addAttribute(taskOptions, 'value', priority);

        const taskParentSelect = `.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${taskIndex}"] .priority-level`
        addClass(taskParentSelect, 'input-locked');
        createNode('option', taskParentSelect, 'low-priority', 'low-priority', 'Low');
        const lowPriority = document.querySelector(taskParentSelect + ' .low-priority');
        addAttribute(lowPriority,'value','low');
        if (priority === 'low' || priority === 'Low') addAttribute(lowPriority,'selected','');
    
        createNode('option', taskParentSelect, 'med-priority', 'med-priority', 'Medium');
        const medPriority = document.querySelector(taskParentSelect +' .med-priority');
        addAttribute(medPriority,'value','medium');
        if (priority === 'medium' || priority === 'Medium') addAttribute(medPriority,'selected','');
    
        createNode('option', taskParentSelect, 'high-priority', 'high-priority', 'High');
        const highPriority = document.querySelector(taskParentSelect + ' .high-priority');
        addAttribute(highPriority,'value','high');
        if (priority === 'high' || priority === 'High') addAttribute(highPriority,'selected','');

        createNode('button', taskElementsParent, 'task-edit-btn', project_index, 'Edit');
        createNode('button', taskElementsParent, 'task-delete-btn', project_index, 'Delete');

        const delTaskBtn = document.querySelector(`.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${taskIndex}"] > *:last-child`)
        delTaskBtn.setAttribute('data-taskIndex', taskIndex);

        let deleteTaskBtnSequencePseudo = deleteTaskBtnSequence.bind(null, delTaskBtn);
        delTaskBtn.removeEventListener('click', deleteTaskBtnSequencePseudo);
        delTaskBtn.addEventListener('click', deleteTaskBtnSequencePseudo);

        setEditTaskBtnListener(project_index, taskIndex);
        setStatusCheckboxListener(project_index, taskIndex);
        toggleDatePicker(project_index, taskIndex, true);
        updateTimeRemaining(project_index,taskIndex);
    }

    const setEditTaskBtnListener = (projIndex, taskIndex) => {
        let editTaskBtn = qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .task-edit-btn`);
        let deleteTaskBtn = qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .task-delete-btn`);
        let taskData = qSA(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] input, 
            .project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] select`);
        editTaskBtn.addEventListener('click', ()=> {
            if (editTaskBtn.textContent === 'Edit') {
                editTaskBtn.textContent = 'Save';
                deleteTaskBtn.textContent = 'Cancel';
                toggleDatePicker(projIndex, taskIndex, false);
                taskData.forEach((element) => {
                    element.classList.remove('input-locked');
                })
            } else {
                editTaskBtn.textContent = 'Edit';
                deleteTaskBtn.textContent = 'Delete';
                toggleDatePicker(projIndex, taskIndex, true);
                taskData.forEach((element) => {
                    if (element.className !== "status") element.classList.add('input-locked');
                    updateTask(projIndex,taskIndex);
                    updateTimeRemaining(projIndex,taskIndex);
                    saveToLocal();
                })
            }
        })
    }

    const setStatusCheckboxListener = (projIndex, taskIndex) => {
        let statusCheckbox = qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .status`);
        statusCheckbox.addEventListener('click', ()=>{
            updateTask(projIndex,taskIndex);
            saveToLocal();
            // console.log(projects);
        })
    }

    const updateTask = (projIndex,taskIndex) => {
        let status = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .status`);
        let taskname = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .task`).value;
        let dueDate = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .due-date`).value;
        let priority = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .priority-level`).value;
        let remaining = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .remaining`);
        status = (status.checked)  ? status = true : status = false;
        projects[projIndex].todoList[taskIndex].complete = status;
        projects[projIndex].todoList[taskIndex].name = taskname;
        projects[projIndex].todoList[taskIndex].dueDate = dueDate;
        projects[projIndex].todoList[taskIndex].priority = priority;
        // console.log(projects);
        // updateProjectStorageData();

        //update selection option
        let priority_options = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .priority-level > option`);
        let low_priority = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .low-priority`);
        let med_priority = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .med-priority`);
        let high_priority = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .high-priority`);
        //clear all options
        // priority_options.removeAttribute('selected');
        low_priority.removeAttribute('selected');
        med_priority.removeAttribute('selected');
        high_priority.removeAttribute('selected');
        if (priority === 'low') addAttribute(low_priority,'selected','');
        if (priority === 'medium') addAttribute(med_priority,'selected','');
        if (priority === 'high') addAttribute(high_priority,'selected','');
        // console.log(priority_options);

        let timeLeft = formatDistanceToNow(parseISO(dueDate), { addSuffix: true });
        remaining.textContent = timeLeft;
    }

    const restoreTasks = (projIndex,taskIndex) => {
        DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .status`).value = projects[projIndex].todoList[taskIndex].complete;
        DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .task`).value = projects[projIndex].todoList[taskIndex].name;
        DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .due-date`).value = projects[projIndex].todoList[taskIndex].dueDate;
        DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .priority-level`).value = projects[projIndex].todoList[taskIndex].priority;
    }
    
    const createNode = (
        type,
        parent,
        className,
        attribute,
        textContent
        ) => {
        let node = document.createElement(type);
        if (className !== null) node.classList.add(className);
        if (className === 'project') {
            addProjectListClickEvent(node);
            //loop through each project and just show the latest tasks from the latest project
            toggleTasksContainerVisibility(node); 
        }

        if (className === 'status'){
            node.setAttribute("type", "checkbox");
            if (textContent === 'true' || textContent === true) {
                node.checked = true;
            } else {
                node.checked = false;
            }
        }
        
        if (attribute !== '' && attribute >= 0) {
            if (className === 'task-container') {
                addAttribute(node, 'data-taskIndex', attribute)
            } else {
                node.setAttribute('data-projectIndex',attribute);
            }
        }

        if (textContent !== null) node.textContent = textContent;

        let parentNode = document.querySelector(parent);
        parentNode.appendChild(node);

    }

    const addAttribute = (node, attribute, attributeValue) => {
        node.setAttribute(attribute,attributeValue);
    }

    const toggleTasksContainerVisibility = (projectNode) => {
        let allProjects = document.getElementsByClassName('project-container');
        for (let item in Array.from(allProjects)) {
            if (projectNode.getAttribute('data-projectIndex') !== allProjects[item].getAttribute('data-projectIndex')){
                allProjects[item].classList.add('hidden');
            } else {
                allProjects[item].classList.remove('hidden');
            }
        }
    }

    const addProjectListClickEvent = (node) => {
        node.addEventListener('click', () => {
            toggleTasksContainerVisibility(node);
        })
    }

    const hideElement = (className) => {
        let node = document.querySelector(className);
        node.classList.add('hidden');
    }

    const showElement = (className) => {
        let node = document.querySelector(className);
        node.classList.remove('hidden');
    }

    const addClass = (classSelector, newClassName) => {
        let node = document.querySelector(classSelector);
        node.classList.add(newClassName);
    }
    
    return {
        addProject: addProject,
        addTask: addTask,
        addAttribute: addAttribute,
        createNode: createNode,
        showElement: showElement,
        hideElement: hideElement,
        addClass: addClass,
        qS: qS,
        qSA: qSA,
        restoreTasks: restoreTasks
    }

})();

export default DOM;

//popup windows for new project/task
const createProjectEntryPopup = () => {
    DOM.createNode('div', 'body', 'popup-container', '', '');
    DOM.addClass('.popup-container', 'hidden');
    DOM.createNode('div', '.popup-container', 'newProjEntry', '', '');
    DOM.createNode('h3', '.newProjEntry', 'add-proj-title', '', 'Add New Project');
    
    DOM.createNode('label', '.newProjEntry', 'new-project-label', '', 'Project Name: ');
    DOM.createNode('INPUT', '.new-project-label', 'new-project-input', '', '');
    
    DOM.createNode('label', '.newProjEntry', 'new-project-label-description', '', 'Description: ');
    DOM.createNode('INPUT', '.new-project-label-description', 'new-project-desc-input', '', '');

    DOM.createNode('div', '.newProjEntry', 'btn-container', '', '');
    DOM.createNode('button', '.btn-container', 'popup-addProj-btn', '', 'Add');
    DOM.createNode('button', '.btn-container', 'popup-cancelProj-btn', '', 'Cancel');

    document.querySelector('.new-project-input').value = 'Default Project';
    document.querySelector('.new-project-desc-input').value = 'Default Project Description';
}

const createTaskEntryPopup = () => {
    DOM.createNode('div', '.popup-container', 'newTaskEntry', '', '');
    DOM.createNode('h3', '.newTaskEntry', 'add-task-title', '', 'Add New Task');
    DOM.createNode('label', '.newTaskEntry', 'new-task-label', '', 'Task Name: ');
    DOM.createNode('INPUT', '.new-task-label', 'new-task-input-title', '', '');
    DOM.createNode('label', '.newTaskEntry', 'new-task-dueDate', '', 'Due Date: ');
    DOM.createNode('INPUT', '.new-task-dueDate', 'new-task-input-dueDate', '', '');

    document.querySelector('.new-task-input-title').value = 'Default Task';

    let dueDateInput = document.querySelector('.new-task-input-dueDate');
    DOM.addAttribute(dueDateInput, 'type', 'date');

    const localtime = new Date();
    let day = localtime.getDate()+1;
    let month = localtime.getMonth() + 1;
    let year = localtime.getFullYear();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    const today =  year + "-" + month + "-" + day; //html only accepts this date format

    dueDateInput.value = today;
    // console.log(localtime);

    DOM.createNode('label', '.newTaskEntry', 'new-task-priority', '', 'Priority: ');
    DOM.createNode('select', '.new-task-priority', 'priority-level', 'task-options', '');
    const taskOptions = document.querySelector('.priority-level');
    DOM.addAttribute(taskOptions,'name','priority-level');
    DOM.addAttribute(taskOptions,'id','priority-level');
    
    DOM.createNode('option', '.priority-level', 'low-priority', 'low-priority', 'Low');
    const lowPriority = document.querySelector('.low-priority');
    DOM.addAttribute(lowPriority,'value','low');

    DOM.createNode('option', '.priority-level', 'med-priority', 'med-priority', 'Medium');
    const medPriority = document.querySelector('.med-priority');
    DOM.addAttribute(medPriority,'value','medium');

    DOM.createNode('option', '.priority-level', 'high-priority', 'high-priority', 'High');
    const highPriority = document.querySelector('.high-priority');
    DOM.addAttribute(highPriority,'value','high');

    DOM.createNode('div', '.newTaskEntry', 'btn-container', '', '');
    DOM.createNode('button', '.newTaskEntry .btn-container', 'popup-addTask-btn', '', 'Add');
    DOM.createNode('button', '.newTaskEntry .btn-container', 'popup-cancelTask-btn', '', 'Cancel');
}

export { createProjectEntryPopup, createTaskEntryPopup }

const addBtnEvent = () => {
    let btn = document.querySelector('.add-proj-btn');
    btn.addEventListener('click', ()=>{
        DOM.hideElement('.newTaskEntry');
        DOM.showElement('.popup-container');
        DOM.showElement('.newProjEntry');
    })
}

const cancelBtnEvent = () => {
    let btn = document.querySelector('.popup-cancelProj-btn');
    btn.addEventListener('click', ()=>{
        DOM.hideElement('.popup-container');
        DOM.hideElement('.newProjEntry');
    })
}

const addTaskBtnEvent = () => {
    let btns = document.getElementsByClassName('add-task-btn');
    const taskEntryDiv = document.querySelector('.newTaskEntry');
    for (let btn of Array.from(btns)) {
        let index = btn.getAttribute('data-projectIndex');       
        btn.addEventListener('click', ()=>{
            taskEntryDiv.removeAttribute('data-projectIndex');
            DOM.addAttribute(taskEntryDiv, 'data-projectIndex', index)
            DOM.hideElement('.newProjEntry');
            DOM.showElement('.popup-container');
            DOM.showElement('.newTaskEntry');
        })
    }
}

const cancelTaskBtnEvent = () => {
    let btn = document.querySelector('.popup-cancelTask-btn');
    btn.addEventListener('click', ()=>{
        DOM.hideElement('.popup-container');
        DOM.hideElement('.newTaskEntry');
    })
}

const deleteTaskBtnSequence = (btn) => {
    let task_index = btn.parentElement.getAttribute('data-taskIndex');
    let project_index = btn.getAttribute('data-projectIndex');

    let editTaskBtn = DOM.qS(`.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${task_index}"] .task-edit-btn`);
    let deleteTaskBtn = DOM.qS(`.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${task_index}"] .task-delete-btn`);
    let taskData = DOM.qSA(`.project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${task_index}"] input, 
        .project-container[data-projectIndex="${project_index}"] .task-container[data-taskIndex="${task_index}"] select`);

    if (deleteTaskBtn.textContent === 'Cancel') {
        deleteTaskBtn.textContent = 'Delete';
        editTaskBtn.textContent = 'Edit';
        toggleDatePicker(project_index, task_index, true);
        taskData.forEach((element) => {
            if (element.className !== "status") element.classList.add('input-locked');
        })
        DOM.restoreTasks(project_index, task_index);

    } else {
        deleteTask(project_index, task_index);
        renderTasks(project_index);
        toggleDatePicker(project_index, task_index, false);
    }

}

const deleteTaskBtnEvent = () => {
    let btns = document.getElementsByClassName('task-delete-btn');
    for (let btn of Array.from(btns)) {
        let deleteTaskBtnSequencePseudo = deleteTaskBtnSequence.bind(null, btn);
        btn.removeEventListener('click', deleteTaskBtnSequencePseudo);
        btn.addEventListener('click', deleteTaskBtnSequencePseudo);
    }
}

const renderTasks = (project_index) => {
    let taskContainer = document.querySelector(`.task-list-container[data-projectIndex="${project_index}"]` );
        while(taskContainer.firstChild){
            taskContainer.removeChild(taskContainer.firstChild);
    }
        for (let taskIndex in projects[project_index].todoList) {
            DOM.addTask(
                project_index,
                projects[project_index].todoList[taskIndex].name,
                projects[project_index].todoList[taskIndex].dueDate,
                projects[project_index].todoList[taskIndex].complete,
                projects[project_index].todoList[taskIndex].priority,
                false,
                taskIndex
            )
            updateTimeRemaining(project_index,taskIndex);
        }
}

const enrollProject = () => {
    let projectTitle = document.querySelector('.new-project-input').value;
    let projectDesc = document.querySelector('.new-project-desc-input').value;
    DOM.addProject(projectTitle, projectDesc, true, '');
    DOM.hideElement('.popup-container');
    DOM.hideElement('.newProjEntry');

    // let today = new Date().toISOString().slice(0, 10);

    const localtime = new Date();
    let day = localtime.getDate()+1;
    let month = localtime.getMonth() + 1;
    let year = localtime.getFullYear();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    const today =  year + "-" + month + "-" + day; //html only accepts this date format
    
    DOM.addTask(projects.length-1,'Default Task', today, false, 'low', true, 0);
    saveToLocal();
}

const enrollBtnEvent = () => {
    let enrollBtn = document.querySelector('.popup-addProj-btn');
    enrollBtn.removeEventListener('click', enrollProject);
    enrollBtn.addEventListener('click', enrollProject);
    // console.log(projects)
}

const enrollTask = () => {
    const taskEntryDiv = document.querySelector('.newTaskEntry');
    let index = taskEntryDiv.getAttribute('data-projectIndex');
    let taskTitle = document.querySelector('.new-task-input-title').value;
    let dueDate = document.querySelector('.new-task-input-dueDate').value;
    let priority = document.querySelector('.popup-container .priority-level').value;
    DOM.addTask(index, taskTitle, dueDate, false, priority, true, '');
    DOM.hideElement('.popup-container');
    DOM.hideElement('.newTaskEntry');
    // updateProjectStorageData();
    // console.log(projects);
}

const enrollTaskBtnEvent = () => {
    let addTaskBtn = document.querySelector('.popup-addTask-btn');
    addTaskBtn.addEventListener('click', enrollTask);
}

const renderProjects = () => {
    let listContainer = document.querySelector('.project-list');
    let projectContainer = document.querySelector('.main');
    while(listContainer.firstChild){
        listContainer.removeChild(listContainer.firstChild);
    }
    while(projectContainer.firstChild){
        projectContainer.removeChild(projectContainer.firstChild);
      }
    for (let index in projects) {
        DOM.addProject(projects[index].title, projects[index].description, false, index);
        for (let taskIndex in projects[index].todoList) {
            DOM.addTask(
                index,
                projects[index].todoList[taskIndex].name,
                projects[index].todoList[taskIndex].dueDate,
                projects[index].todoList[taskIndex].complete,
                projects[index].todoList[taskIndex].priority,
                false,
                taskIndex
            )
            // console.log(projects);
        }
    }
    // addDelProjEvent();
    addTaskBtnEvent();
}

const deleteProjSequence = (delBtn) => {
    // console.log(projects);
    let projectIndex = delBtn.getAttribute('data-projectIndex');
    deleteProject(projectIndex);
    saveToLocal();
    enrollBtnEvent();     
}

const addDelProjEvent = () => {
    const delButtons = document.getElementsByClassName('proj-del-btn');
    for (let delBtn of Array.from(delButtons)) {
        //bind should be used when passing arguments in a callback
        let deleteProjSequencePsuedo = deleteProjSequence.bind(null, delBtn);
        delBtn.removeEventListener('click', deleteProjSequencePsuedo);
        delBtn.addEventListener('click', deleteProjSequencePsuedo);
    };
}

const updateTimeRemaining = (projIndex, taskIndex) => {
    let dueDate = DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .due-date`).value;
    let remaining = formatDistanceToNow(parseISO(dueDate), { addSuffix: true });
    DOM.qS(`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .remaining`).textContent = remaining;
}

const toggleDatePicker = (projIndex, taskIndex, hide) => {
    let datePicker = (`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .due-date`);
    let timeRemaining = (`.project-container[data-projectIndex="${projIndex}"] .task-container[data-taskIndex="${taskIndex}"] .remaining`);
    if (hide === true) {
        DOM.showElement(timeRemaining);
        DOM.hideElement(datePicker)
    } else {
        DOM.showElement(datePicker);
        DOM.hideElement(timeRemaining)
    }
}

const hideAllDatePicker = () => {
    const allDatePicker = DOM.qSA('.due-date');
    allDatePicker.forEach(picker => {
       DOM.addAttribute(picker, 'class', 'hidden');
    })
}

export { addBtnEvent, cancelBtnEvent, enrollBtnEvent, renderProjects, addDelProjEvent,
    addTaskBtnEvent, cancelTaskBtnEvent, enrollTaskBtnEvent, deleteTaskBtnEvent, renderTasks, updateTimeRemaining,
    hideAllDatePicker
 }

// NEXT STEPS:
// task delete button - Done
// project info edit - done
// task edit - Done
// date picker - Done
// update task data - Done
// set the drop down option of priority to actual value - Done
// revert to previous value when edit task is canceled - bug on priority value! - Done
// exclude status checkbox from being locked - Done

// add event listener on checkbox to update projects object - task status - Done
// instead of displaying the date, show how the time left - Added
// write data to browser's local storage - Done
// delete project bug, deletes two projects on 1 click - fixed
// stylize the overall look