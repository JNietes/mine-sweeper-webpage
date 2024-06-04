
class TileObject {
    constructor(id, mine, index, covered, adjMines) {
        this.id = id;
        this.mine = mine;
        this.index = index;
        this.covered = covered;
        this.adjMines = adjMines;
    }
}

const tileArr = Array.from(document.querySelectorAll(".tile"))
const adjDeltas = [-9, -1, 7, 8, -8, -7, 1, 9]; // [-width-1, -1, width-1, width, -width, -width+1, +1, width+1]
const tileMap = new Map(); // {div.tile#id: TileObject}
let tilesUncovered = 0;
let minesFlagged = 0;
let mineSet = newMineIndexes();

document.getElementById("smile").addEventListener("click", startNewGame);

startNewGame();

function startNewGame() {
    for (let i = 0; i < tileArr.length; i++) {
        tileMap.set(tileArr[i], new TileObject(tileArr[i].id, false, i, true, 0));
        tileArr[i].addEventListener("click", selectedDiv);
        tileArr[i].addEventListener("contextmenu", placeFlag);
        tileArr[i].addEventListener("contextmenu", (e) => {e.preventDefault()});
        document.getElementById("smile").innerHTML = ":)";
        document.getElementById("flags").innerHTML = "10";
        for (let i=0; i<tileArr.length; i++) {
            tileArr[i].innerHTML = null;
            tileArr[i].style.color = "black";
            tileArr[i].classList.add("uncoveredTile");
            tileArr[i].style.backgroundColor = "bisque";
        }
        mineSet = newMineIndexes();
        tilesUncovered = 0
        minesFlagged = 0;
    }
}

function inArray(index, arr) {
    if (index >= 0 && index < arr.length)
        return true;
    else
        return false;
}

function newMineIndexes() {
    let mineIndexSet = new Set();
    while (mineIndexSet.size < 10) {
        mineIndexSet.add(parseInt((Math.random() * 64), 10));
    }
    return mineIndexSet;
}

function createClues(setOfIndexes) {
    for (const index of setOfIndexes) {
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
}

function selectedDiv() {
    uncoverTile(this);
}


function uncoverTile(tile) {
    if (tilesUncovered == 0) {
        while (mineSet.has(tileMap.get(tile).index)) {
            mineSet = newMineIndexes();
        }
        createClues(mineSet);
    }
    if (tileMap.get(tile).covered == true) { 
        tilesUncovered++; 
        tile.classList.remove("uncoveredTile");
        tile.style.backgroundColor = "floralwhite";
        tileMap.get(tile).covered = false;
        if (tileMap.get(tile).mine == true) { // Game Over
            tilesUncovered+=1024; // Prevents winscreen when a mine is clicked when tilesUncovered=totalTile-mines-1
            tileMap.get(tile).covered = false;
            document.getElementById("smile").innerHTML = "X(";
            mineSet.forEach(function (index) {
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
        if (tilesUncovered == 54) { // 54=tiles-mines
            displayWinScreen();
        }
    }
}

function placeFlag() {
    let tile = this;
    if (tileMap.get(tile).covered == true) {
        tile.innerHTML = "F";
        tileMap.get(tile).covered = false;
        document.getElementById("flags").innerHTML--;
        let mineAtTile = tileMap.get(tile).mine;
        if (tileMap.get(tile).mine == true) {
            minesFlagged++;
        }
    }
    else if (tile.innerHTML == "F") {
        tile.innerHTML = "";
        tileMap.get(tile).covered = true;
        document.getElementById("flags").innerHTML++;
        if (tileMap.get(tile).mine == true) {
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