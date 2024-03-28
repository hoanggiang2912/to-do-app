const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const overlay = $('.overlay');
const taskInfoBox = $('.task-info__wrapper');

const validate = (input) => {
    const formMessage = input.parentElement.querySelector('.form__message');

    if (!notEmpty(input.value)) {
        formMessage.innerText = 'Please fill in the blank!';
        formMessage.style.color = 'orangered';
        return false;
    }
    return true;
}

const notEmpty = val => val.trim() !== '';

const openModal = (e, modal, overlay) => {
    e.preventDefault();

    modal.classList.add('show');
    overlay.classList.add('show');
}

const closeModal = (modal, overlay) => {
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

const toggleModal = (modal, overlay) => {
    modal.classList.toggle('show');
    overlay.classList.toggle('show');
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeModal(taskInfoBox, overlay);
    }
})

// create storage 
const createStorage = key => {
    const store = JSON.parse(localStorage.getItem(key)) ?? {};

    const save = () => {
        localStorage.setItem(key, JSON.stringify(store));
    }

    const storage = {
        get(key) {
            return store[key];
        },
        set(key, val) {
            store[key] = val;
            save();
        },
        remove(key) {
            delete store[key];
            save();
        }
    };

    return storage;
}
const storage = createStorage('task');

class Task {
    constructor(id='', name='', status='') {
        this.id = id;
        this.name = name;
        this.status = status;
    }
}

class TaskList extends Task {
    constructor(id='', name='', status='') {
        super(id, name, status);
        this.container = document.querySelector('.tasks');
    }
}

class TaskManager extends TaskList {
    constructor(id='', name='', status='', assign='', manager='') {
        super(id, name, status, assign);
        this.assign = assign;
        this.manager = manager;
        this.taskList = storage.get('taskList') ?? [];
        this.container = document.querySelector('.tasks');
    }

    removeTask(id) {
        const index = this.taskList.findIndex(task => task.id == id);
        this.taskList.splice(index, 1);

        storage.set('taskList', this.taskList);
    }

    getTaskList() {
        return this.taskList
    }

    render(taskList) {
        let html = '';
        taskList.forEach((task, index) => {
            const { id, name, status } = task;

            const className = status === 'doing'
                ? 'task-item--doing'
                : status === 'done'
                ? 'task-item--done'
                : 'task-item--pending';

            html += `
                <!-- single task start -->
                <div class="task-item ${className} rounded-8 flex-between pi20 pb12 v-center width-full" data-task-index="${index}">
                    <div class="task__name title-medium fw-smb">${name}</div>
                    <button class="icon-btn del-task-btn" data-task-id="${id}"><i class="fa fa-times"></i></button>
                </div>
                <!-- single task end -->
            `
        });
        if (this.container) {
            this.container.innerHTML = '';
            this.container.innerHTML = html;

            // delete task
            const deleteTaskBtns = $$('.del-task-btn');
            if (deleteTaskBtns) {
                deleteTaskBtns.forEach(btn => {
                    btn.addEventListener('click', e => {
                        e.stopPropagation();

                        const target = e.target;
                        const btn = target.closest('.del-task-btn');
                        const dataId = btn.dataset.taskId;

                        this.removeTask(dataId);
                        this.render(this.taskList);
                    })
                });
            }

            // handle view task details
            const taskItems = $$('.task-item');
            if (taskItems) {
                taskItems.forEach(item => {
                    item.addEventListener('click', e => {
                        const index = item.dataset.taskIndex;
                        // console.log(`this is task index ${index}`);

                        taskManager.renderTaskMangerBox(index);

                        openModal(e, taskInfoBox, overlay);
                    })

                    overlay.addEventListener('click', () => {
                        closeModal(taskInfoBox, overlay);
                    })
                });
            }
        }
    }

    clearTask() {
        this.taskList = [];
        storage.remove('taskList');
    }

    addTask(id, name, status, assign, manager) {
        this.taskList.push({
            id,
            name,
            status,
            assign,
            manager,
        });

        storage.set('taskList', this.taskList);
    }

    updateTask(index) {
        const editNameInpput = $('.edit-task-name__input');
        const editManangerInput = $('.edit-task-manager__input');
        const editAssignInput = $('.edit-task-assign__input');
        const editStatusInput = $('.edit-task-status__input');

        // const updatedTask = {
        //     id,
        //     name: editNameInpput.value,
        //     status: editStatusInput.value,
        //     assign: editAssignInput.value,
        //     manager: editManangerInput.value
        // }

        // const index = this.taskList.findIndex(task => task.id == id);
        // this.taskList.splice(index, 1, updatedTask);
        
        const task = this.taskList[parseInt(index)];
        task.name = editNameInpput.value;
        task.status = editStatusInput.value;
        task.assign = editAssignInput.value;
        task.manager = editManangerInput.value;

        storage.set('taskList', this.taskList);
    }

    renderTaskMangerBox (index) {
        const task = this.taskList[index];
        console.log(task.name);
        const {name, status, assign, manager} = task;
        
        const taskNameInput = $('.edit-task-name__input');
        const taskManager = $('.edit-task-manager__input');
        const statusInput = $('.form__input--select');
        const taskAssign = $('.edit-task-assign__input');

        taskNameInput.value = name;
        taskManager.value = manager;
        taskAssign.value = assign;
        statusInput.value = status;

        const saveBtn = $('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                
                this.updateTask(index);
                closeModal(taskInfoBox, overlay);
                this.render(this.taskList);
            });
        }
    }

    sort (element) {
        const sortType = element.dataset.sort;

        if (sortType == 'id') {
            this.render(this.taskList.sort((a, b) => a.id.localeCompare(b.id)));
        } else if (sortType == 'name') {
            this.render(this.taskList.sort((a, b) => a.name.localeCompare(b.name)));
        } else if (sortType == 'status') {
            this.render(this.taskList.sort((a, b) => a.status.localeCompare(b.status)));
        } else if (sortType == 'manager') {
            this.render(this.taskList.sort((a, b) => a.manager.localeCompare(b.manager)));
        }
    }
}

const addTaskBtn = $('.add-btn');
const taskNameInput = $('.new-task')
const managerInput = $('.manager');
const assignInput = $('.assign');
const statusInput = $('.status');
const formElement = $('.add-task-form');

const taskManager = new TaskManager();
taskManager.render(taskManager.taskList);

if (formElement) {
    formElement.addEventListener('submit', e => {
        e.preventDefault();

        // validate
        let flag = true;
        const inputs = $$('.add-task-form .form__input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (!validate(input))  flag = false;
            })

            input.addEventListener('input', () => {
                const message = input.parentElement.querySelector('.form__message');
                if (message) message.innerText = '';
            })
        });
        
        inputs.forEach(input => {
            if(!validate(input)) flag = false;
        });

        // add task
        const id = taskManager.taskList.length + 1;

        if (flag) {
            taskManager.addTask(id, taskNameInput.value, statusInput.value, assignInput.value, managerInput.value);
            taskManager.render(taskManager.taskList);
        }
    });
}

const clearBtn = $('.clear-btn');
clearBtn.addEventListener('click', () => {
    taskManager.clearTask();
    taskManager.render(taskManager.taskList);
});

const editTaskForm = $('.edit-task-form');
if (editTaskForm) {
    editTaskForm.addEventListener('submit', e => {
        e.preventDefault();

        // validate
        let flag = true;
        const inputs = $$('.edit-task-form .form__input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (!validate(input)) flag = false;
            })

            input.addEventListener('input', () => {
                const message = input.parentElement.querySelector('.form__message');
                if (message) message.innerText = '';
            })
        });

        inputs.forEach(input => {
            if (!validate(input)) flag = false;
        });

        if (flag) {
            const id = editTaskForm.dataset.taskId;
            taskManager.updateTask(id);
            taskManager.render(taskManager.taskList);
        }
    });
}

const discardBtn = $('.discard-btn');
if (discardBtn) {
    discardBtn.addEventListener('click', () => {
        closeModal(taskInfoBox, overlay);
    });
}

const sortBtn = $('.sort-btn');
const sortList = $('.sort-list');

if (sortBtn) {
    sortBtn.addEventListener('click', e => {
        e.preventDefault();
        toggleModal(sortList, overlay);
    })
}

const sortItems = $$(".sort-list__item");

if (sortItems) {
    sortItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();

            taskManager.sort(item);
            // taskManager.render(taskManager.taskList);
        })
    });
}