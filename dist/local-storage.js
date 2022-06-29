import { projects, createProject } from "../src/data-structure"


const saveToLocal = () => {
    // if (localStorage.getItem('data') === null){
        localStorage.setItem('ProjectsData', JSON.stringify(projects));
    // }
}

const readFromLocal = () => {
    let toDoList = localStorage.getItem('ProjectsData');
    let deserialized = JSON.parse(toDoList);
    // console.log(projects);
    projects.length = 0;
    // projects.push.apply(projects,deserialized );

    projectEnroller(deserialized);
    // console.log(projects.addToDo);

}

const projectEnroller = (fromJSON) => {
    for (let i = 0; i < fromJSON.length; i++){
        createProject(fromJSON[i].title, fromJSON[i].description);
        // console.log(fromJSON[i].todoList);
        for (let j = 0; j < fromJSON[i].todoList.length; j++){
            projects[i].addToDo(fromJSON[i].todoList[j].name, fromJSON[i].todoList[j].dueDate, fromJSON[i].todoList[j].complete, fromJSON[i].todoList[j].priority);
            
        }
    }
}
// console.log(projects);

const updateProjectStorageData = () => {
    saveToLocal();
    readFromLocal();
    // console.log(projects);
}

export { saveToLocal, readFromLocal, updateProjectStorageData };