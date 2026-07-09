const btn = document.getElementById("btn");
const inp = document.getElementById("inp");
const taskList = document.querySelector(".taskList");

btn.addEventListener("click", addTask);

function addTask(){

    if(inp.value == ""){
        alert("Please Enter a Task");
        return;
    }

    let task = document.createElement("div");
    task.classList.add("task");

    task.innerHTML = `
        <div class="section-A">
            <input type="checkbox" class="checkbox">
            <span>${inp.value}</span>
        </div>

        <div class="section-B">
            <span class="up-arrow">⬆️</span>

            <span class="bin">
                <i class="fa-regular fa-trash-can"></i>
            </span>

            <span class="down-arrow">⬇️</span>
        </div>
    `;

    taskList.appendChild(task);

    inp.value = "";
}

taskList.addEventListener("click", function(e){

    // Checkbox
    if(e.target.classList.contains("checkbox")){

        e.target.nextElementSibling.classList.toggle("checked");
    }

    // Up Button
    else if(e.target.classList.contains("up-arrow")){

        let currentTask = e.target.parentElement.parentElement;

        let previousTask = currentTask.previousElementSibling;

        if(previousTask){
            currentTask.after(previousTask);
        }

    }

    // Down Button
    else if(e.target.classList.contains("down-arrow")){

        let currentTask = e.target.parentElement.parentElement;

        let nextTask = currentTask.nextElementSibling;

        if(nextTask){
            currentTask.before(nextTask);
        }

    }

    // Delete Button
    else if (e.target.classList.contains("bin")) {

    let currentTask = e.target.parentElement.parentElement;

    currentTask.remove();

}

else if (e.target.classList.contains("fa-trash-can")) {

    let currentTask = e.target.parentElement.parentElement.parentElement;

    currentTask.remove();

}

});