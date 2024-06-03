
class tileObject {
    constructor(id, index, mine, covered, adjMines) {
        this.id = id;
        this.index = index;
        this.mine = mine;
        this.covered = covered;
        this.adjMines = adjMines;
    }
}

const tileNL = document.querySelectorAll(".tile");

const tileArr = Array.from(tileNL)
const tileObjectArr = [];
const adjIndex = [-9, -1, 7, 8, -8, -7, 1, 9];

const tileMap = new Map();
const tileIndexMap = new Map();
const tileIdMap = new Map();

for (let i = 0; i < tileArr.length; i++) {
    tileObjectArr[i] = new tileObject(tileArr[i].id, i, false, true, 0);
    tileMap.set(tileArr[i].id, tileObjectArr[i]);
    tileIdMap.set(tileArr[i].id, i);
    tileIndexMap.set(i, tileArr[i].id);
    tileArr[i].addEventListener("click", uncoverTile);
    tileArr[i].addEventListener("contextmenu", placeFlag);
    tileArr[i].addEventListener("contextmenu", (e) => {e.preventDefault()});
}

const mineIndexSet = new Set();
while (mineIndexSet.size < 10) {
    mineIndexSet.add(parseInt((Math.random() * 64), 10));
}

for (const index of mineIndexSet) {
    tileObjectArr[index].mine = true;
    tileObjectArr[index].adjMines = -1;
    let start=0;
    let end=adjIndex.length;
    if (index%8 == 0) {
        start=3;
    }
    else if (index%8 ==7) {
        end=adjIndex.length-3;
    }
    for (let j=start; j<end; j++) {
        if (isValid(index+adjIndex[j], tileObjectArr)) {
            tileObjectArr[index+adjIndex[j]].adjMines++;
        }
    }
}

function isValid(index, arr) {
    if (index >= 0 && index < arr.length)
        return true;
    else
        return false;
}

function uncoverTile() {
    let tile = this;
    if (tileMap.get(tile.id).mine == true && tile.id != "" && tileMap.get(tile.id).covered == true) {
        tileMap.get(tile.id).covered = false;
        tile.innerHTML = "mine";
        document.getElementById("smile").innerHTML = "X(";

        mineIndexSet.forEach(function (index) {
            tileArr[parseInt(index, 10)].innerHTML = "mine";
        });

        for (let i=0; i<tileArr.length; i++) {
            tileArr[i].removeEventListener("click", uncoverTile);
            tileArr[i].removeEventListener("contextmenu", placeFlag);
        } 
    }
    else if (tileMap.get(tile.id).adjMines == 0 && tile.id != "" && tileMap.get(tile.id).covered == true) {
        uncoverAdjTiles(tileIdMap.get(tile.id));
    }
    else if (tile.innerHTML != "F") {
        if (tileMap.get(tile.id).adjMines != 0) {
            tile.innerHTML = tileMap.get(tile.id).adjMines;
            tile.style.backgroundColor = "floralwhite";
            tileMap.get(tile.id).covered = false;
            assignColor(tile);
        }
    }  
}

function uncoverAdjTiles(tileIndex) {
    tileObjectArr[tileIndex].covered = false;
    tileArr[tileIndex].style.backgroundColor = "floralwhite";
    let start=0;
    let end=adjIndex.length;
    if (tileIndex%8 == 0) {
        start=3;
    }
    else if (tileIndex%8 == 7) {
        end=adjIndex.length-3;
    }
    for (let j=start; j<end; j++) {
        let delta = adjIndex[j];
        let relAdjIndex = tileIndex+delta;
        if (isValid(tileIndex+adjIndex[j], tileObjectArr) && tileArr[tileIndex+adjIndex[j]].innerHTML != "F" && tileObjectArr[relAdjIndex].covered == true) {
            if (tileObjectArr[relAdjIndex].covered == true && tileObjectArr[relAdjIndex].adjMines != 0) { // Base case
                tileObjectArr[relAdjIndex].covered = false;
                tileArr[relAdjIndex].innerHTML = tileObjectArr[relAdjIndex].adjMines;
                tileArr[relAdjIndex].style.backgroundColor = "floralwhite";
                assignColor(tileArr[relAdjIndex]);
            }
            else {
                uncoverAdjTiles(relAdjIndex);
            }
            
        }
        
    }
}

let minesFlagged = 0;
function placeFlag() {
    let tile = this;
    if (tileMap.get(tile.id).covered == true) {
        tile.innerHTML = "F";
        tileMap.get(tile.id).covered = false;
        document.getElementById("flags").innerHTML--;
        if (tileMap.get(tile.id).mine = true) {
            minesFlagged++;
        }
    }
    else if (tile.innerHTML == "F") {
        tile.innerHTML = "";
        tileMap.get(tile.id).covered = true;
        document.getElementById("flags").innerHTML++;
        if (tileMap.get(tile.id).mine = true) {
            minesFlagged--;
        }
    }
    if (minesFlagged == 10) {
        document.getElementById("smile").innerHTML = ":D";
        for (let i=0; i<tileArr.length; i++) {
            tileArr[i].removeEventListener("click", uncoverTile);
            tileArr[i].removeEventListener("contextmenu", placeFlag);
        } 
    }
}

function assignColor(tile) {
    switch (tile.innerHTML) {
        case "0":
            break;
        case "1":
            tile.style.color = "blue";
            break;
        case "2":
            tile.style.color = "green";
            break;
        case "3":
            tile.style.color = "red";
            break;
        case "4":
            tile.style.color = "darkblue";
            break;
        case "5":
            tile.style.color = "crimson";
            break;
        case "6":
            tile.style.color = "cyan";
            break;
        case "8":
            tile.style.color = "grey";
            break;
    }
}