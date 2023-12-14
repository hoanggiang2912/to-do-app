const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $('.add-btn');
const taskInput = $('.new-task');
let taskList = JSON.parse(sessionStorage.getItem('taskList')) || [];

addBtn.addEventListener('click', e => {
    e.preventDefault();
    if (taskInput.value != '') {
        taskList.push(taskInput.value);
        sessionStorage.setItem('taskList', JSON.stringify(taskList));
        $('.tasks').innerHTML = '';
        renderTaskList(taskList, '.tasks');
    } else {
        $('.form__message').innerText = `Your task can't be empty`
    }
});

taskInput.addEventListener('keydown', () => {
    $('.form__message').innerText = '';
})

const clearBtn = $('.clear-btn');
clearBtn.addEventListener('click', () => {
    taskList = [];
    sessionStorage.setItem('taskList', JSON.stringify(taskList));
    $('.tasks').innerHTML = '';
})


function renderTaskList (taskList, taskContainer) {
    taskList.forEach((taskItem, index) => {
        const li = document.createElement('li');
        li.classList.add('task-item', 'p12', 'rounded-8', 'flex', 'flex-between', 'v-center');

        const iconBtn = document.createElement('button');
        iconBtn.setAttribute('data-task-index', index);
        iconBtn.classList.add('icon-btn', 'delete-btn');
        
        const i = document.createElement('i');
        i.classList.add('fa-solid', 'fa-xmark');
        
        iconBtn.appendChild(i);
        const textNode = document.createTextNode(taskItem);
        li.appendChild(textNode);
        li.appendChild(iconBtn);
        $(taskContainer).appendChild(li);

        // Add event listener to the delete button
        iconBtn.addEventListener('click', e => {
            const taskIndex = e.target.parentElement.getAttribute('data-task-index');
            taskList.splice(taskIndex, 1);
            sessionStorage.setItem('taskList', JSON.stringify(taskList));
            $('.tasks').innerHTML = '';
            renderTaskList(taskList, '.tasks');
        });

        // Make the task item draggable
        li.setAttribute('draggable', 'true');

        // Add event listeners for the drag and drop functionality
        li.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', index);
            e.target.classList.add('dragging');
        });

        li.addEventListener('dragend', e => {
            e.target.classList.remove('dragging');
        });

        li.addEventListener('dragover', e => {
            e.preventDefault();
            return false;
        });

        li.addEventListener('drop', e => {
            e.preventDefault();
            const draggedFromIndex = e.dataTransfer.getData('text/plain');
            const draggedToIndex = index;
            const draggedElement = taskList[draggedFromIndex];
            taskList.splice(draggedFromIndex, 1);
            taskList.splice(draggedToIndex, 0, draggedElement);
            sessionStorage.setItem('taskList', JSON.stringify(taskList));
            $('.tasks').innerHTML = '';
            renderTaskList(taskList, '.tasks');
        });
    });
}
window.addEventListener('load', renderTaskList(taskList, '.tasks'));