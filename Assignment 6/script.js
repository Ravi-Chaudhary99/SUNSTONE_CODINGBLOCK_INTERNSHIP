let boxes = document.querySelectorAll(".box");
let turn = document.getElementById("turn");
let reset = document.getElementById("reset");

let player = "X";

let win = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

boxes.forEach(function(box){

    box.addEventListener("click", function(){

        if(box.innerHTML != ""){
            return;
        }

        box.innerHTML = player;

        checkWinner();

        if(player == "X"){
            player = "O";
        }
        else{
            player = "X";
        }

        turn.innerHTML = "Player " + player + " Turn";

    });

});

function checkWinner(){

    for(let i=0; i<win.length; i++){

        let a = win[i][0];
        let b = win[i][1];
        let c = win[i][2];

        if(
            boxes[a].innerHTML != "" &&
            boxes[a].innerHTML == boxes[b].innerHTML &&
            boxes[b].innerHTML == boxes[c].innerHTML
        ){

            alert("Player " + boxes[a].innerHTML + " Wins!");

            boxes.forEach(function(box){
                box.disabled = true;
            });

        }

    }

}

reset.addEventListener("click", function(){

    boxes.forEach(function(box){
        box.innerHTML = "";
        box.disabled = false;
    });

    player = "X";
    turn.innerHTML = "Player X Turn";

});