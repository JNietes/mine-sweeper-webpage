
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
    tileArr[i].addEventListener("click", function() { uncoverTile(this); });
    tileArr[i].addEventListener("contextmenu", function () { placeFlag(this) });
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

function uncoverTile(tile) {
    if (tileMap.get(tile.id).mine == true && tile.id != "" && tileMap.get(tile.id).covered == true) {
        tile.innerHTML = "Mine";
    }
    else if (tileMap.get(tile.id).adjMines == 0 && tileMap.get(tile.id).covered == true) {
        tile.style.backgroundColor = "floralwhite";
        tileMap.get(tile.id).covered = false;
        uncoverAdjTiles(tile.id);
    }
    else if (tile.innerHTML != "F") {
        if (tileMap.get(tile.id).adjMines != 0) {
            tile.innerHTML = tileMap.get(tile.id).adjMines;
            tile.style.backgroundColor = "floralwhite";
            tileMap.get(tile.id).covered = false;
            switch(tileMap.get(tile.id).adjMines) {
                case 1:
                    tile.style.color = "blue";
                    break;
                case 2:
                    tile.style.color = "green";
                    break;
                case 3:
                    tile.style.color = "red";
                    break;
                case 4:
                    tile.style.color = "darkblue";
                    break;
                case 5:
                    tile.style.color = "crimson";
                    break;
                case 6:
                    tile.style.color = "cyan";
                    break;
                case 8:
                    tile.style.color = "grey";
                    break;
            }
        }
    }  
}

function uncoverAdjTiles(tileId) {
    let tileIndex = tileIdMap.get(tileId);
    let start=0;
    let end=adjIndex.length;
    if (tileIndex%8 == 0) {
        start=3;
    }
    else if (tileIndex%8 == 7) {
        end=adjIndex.length-3;
    }
    for (let j=start; j<end; j++) {
        if (isValid(tileIndex+adjIndex[j], tileObjectArr) && tileArr[tileIndex+adjIndex[j]].innerHTML != "F") {
            let delta = adjIndex[j];
            let relAdjIndex = tileIndex+delta;
            uncoverTile(document.getElementById(tileIndexMap.get(relAdjIndex)));
        }
    }
}

function placeFlag(tile) {
    if (tileMap.get(tile.id).covered == true) {
        tile.innerHTML = "F";
        tileMap.get(tile.id).covered = false;
    }
    else if (tile.innerHTML == "F") {
        tile.innerHTML = "";
        tileMap.get(tile.id).covered = true;
    }
}