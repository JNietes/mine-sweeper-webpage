
class TileObject {
    constructor(id, mine, index, covered, adjMines) {
        this.id = id;
        this.mine = mine;
        this.index = index;
        this.covered = covered;
        this.adjMines = adjMines;
    }
}

const adjDeltas = [-9, -1, 7, 8, -8, -7, 1, 9]; // [-width-1, -1, width-1, width, -width, -width+1, +1, width+1]
const tileArr = Array.from(document.querySelectorAll(".tile"))
const tileMap = new Map(); // {div.tile#id: TileObject}

for (let i = 0; i < tileArr.length; i++) {
    tileMap.set(tileArr[i], new TileObject(tileArr[i].id, false, i, true, 0));
    tileArr[i].addEventListener("click", selectedDiv);
    tileArr[i].addEventListener("contextmenu", placeFlag);
    tileArr[i].addEventListener("contextmenu", (e) => {e.preventDefault()});
}

const mineIndexSet = new Set();
while (mineIndexSet.size < 10) {
    mineIndexSet.add(parseInt((Math.random() * 64), 10));
}

for (const index of mineIndexSet) {
    tileMap.get(tileArr[index]).mine = true;
    let start=0;
    let end=adjDeltas.length;
    if (index%8 == 0) {
        start=3;
    }
    else if (index%8 ==7) {
        end=adjDeltas.length-3;
    }
    for (let j=start; j<end; j++) {
        if (inArray(index+adjDeltas[j], tileArr)) {
            tileMap.get(tileArr[index+adjDeltas[j]]).adjMines++;
        }
    }
}

function inArray(index, arr) {
    if (index >= 0 && index < arr.length)
        return true;
    else
        return false;
}

function selectedDiv() {
    uncoverTile(this);
}

let tilesUncovered = 0;
function uncoverTile(tile) {
    if (tileMap.get(tile).covered == true) { 
        tilesUncovered++;
        tile.style.backgroundColor = "floralwhite";
        tileMap.get(tile).covered = false;
        if (tileMap.get(tile).mine == true) { // Game Over
            tileMap.get(tile).covered = false;
            document.getElementById("smile").innerHTML = "X(";
            mineIndexSet.forEach(function (index) {
                tileArr[parseInt(index, 10)].innerHTML = "mine";
            });
            for (let i=0; i<tileArr.length; i++) {
                tileArr[i].removeEventListener("click", selectedDiv);
                tileArr[i].removeEventListener("contextmenu", placeFlag);
            } 
        }
        else if (tileMap.get(tile).adjMines == 0) {
            let start=0;
            let end=adjDeltas.length;
            let tileIndex = tileMap.get(tile).index;
            if (tileIndex%8 == 0) {
                start=3;
            }
            else if (tileIndex%8 == 7) {
                end=adjDeltas.length-3;
            }
            for (let j=start; j<end; j++) {
                let relAdjIndex = tileIndex+adjDeltas[j];
                if (inArray(relAdjIndex, tileArr) && tileMap.get(tileArr[relAdjIndex]).covered == true) {
                    uncoverTile(tileArr[relAdjIndex]);
                }
            }
        }
        else {
            tile.innerHTML = tileMap.get(tile).adjMines;
            assignColor(tile);
        }
        if (tilesUncovered == 54) {
            displayWinScreen();
        }
    }
}

let minesFlagged = 0;
function placeFlag() {
    let tile = this;
    if (tileMap.get(tile).covered == true) {
        tile.innerHTML = "F";
        tileMap.get(tile).covered = false;
        document.getElementById("flags").innerHTML--;
        if (tileMap.get(tile).mine = true) {
            minesFlagged++;
        }
    }
    else if (tile.innerHTML == "F") {
        tile.innerHTML = "";
        tileMap.get(tile).covered = true;
        document.getElementById("flags").innerHTML++;
        if (tileMap.get(tile).mine = true) {
            minesFlagged--;
        }
    }
    if (minesFlagged == 10 && tilesUncovered == 54) {
        displayWinScreen();
    }
}

function displayWinScreen() {
    document.getElementById("smile").innerHTML = ":D";
    for (let i=0; i<tileArr.length; i++) {
        tileArr[i].removeEventListener("click", selectedDiv);
        tileArr[i].removeEventListener("contextmenu", placeFlag);
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