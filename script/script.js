
class TileObject {
    constructor(id, mine, flag, index, covered, adjMines) {
        this.id = id;
        this.flag = flag;
        this.mine = mine;
        this.index = index;
        this.covered = covered;
        this.adjMines = adjMines;
    }
}

let height = 8;
let width = 8;
let mines = 10;
createBoard(width, height);

const tileArr = Array.from(document.querySelectorAll(".tile"))
const adjDeltas = [-width-1, -1, width-1, width, -width, -width+1, +1, width+1];
const tileMap = new Map(); // {div.tile#id: TileObject}
let tilesUncovered = 0;
let minesFlagged = 0;
let mineSet = newMineIndexes();
let timer = setInterval(countTime, 1000);

startNewGame();

document.getElementById("smile").addEventListener("click", startNewGame);

function startNewGame() {
    for (let i = 0; i < tileArr.length; i++) {
        tileMap.set(tileArr[i], new TileObject(tileArr[i].id, false, false, i, true, 0));
        tileArr[i].addEventListener("click", selectedDiv);
        tileArr[i].addEventListener("contextmenu", placeFlag);
        tileArr[i].addEventListener("contextmenu", (e) => {e.preventDefault()});
        document.getElementById("smile").innerHTML = ":)";
        document.getElementById("flags").innerHTML = mines;
        document.getElementById("time").innerHTML = 0;
        for (let i=0; i<tileArr.length; i++) {
            tileArr[i].innerHTML = null;
            tileArr[i].style.backgroundColor = "bisque";
            tileArr[i].classList.add("uncoveredTile");
        }
        clearInterval(timer);
        mineSet = newMineIndexes();
        tilesUncovered = 0
        minesFlagged = 0;
    }
}

function createBoard(width, height) {
    for (let j=0; j<height; j++) {
        for (let i=0; i<width; i++) {
        let id = i.toString() + j.toString();
        let div = document.createElement("div");
        div.classList.add("tile");
        document.body.appendChild(div);
        }
        let nextRow = document.createElement("div");
        nextRow.classList.add("nextRow");
        document.body.appendChild(nextRow);
    }
    
    
}

function inArray(index, arr) {
    if (index >= 0 && index < arr.length)
        return true;
    else
        return false;
}

function countTime() {
    document.getElementById("time").innerHTML++;
}

function newMineIndexes() {
    let mineIndexSet = new Set();
    while (mineIndexSet.size < mines) {
        mineIndexSet.add(parseInt((Math.random() * (height*width)), 10));
    }
    return mineIndexSet;
}

function createClues(setOfIndexes) {
    for (const index of setOfIndexes) {
        tileMap.get(tileArr[index]).mine = true;
        let relAdjDeltas = getRelAdjIndexes(adjDeltas, index, width);
        for (let j=0; j<relAdjDeltas.length; j++) {
            tileMap.get(tileArr[relAdjDeltas[j]]).adjMines++;
        }
    }
}

function getRelAdjIndexes(adjDeltasArr, index, width) {
    let relAdjIndexes = [];
    let start=0;
    let end=8;
    if (index%width == 0) {
        start=3;
    }
    else if (index%width == width-1) {
        end = 5;
    }
    for (let i=start; i<end; i++) {
        if (inArray(adjDeltasArr[i] + index, tileArr)) {
            relAdjIndexes.push(adjDeltasArr[i] + index);
        }    
    }
    return relAdjIndexes;
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
        timer = setInterval(countTime, 1000);
    }
    if (tileMap.get(tile).covered == true) { 
        tilesUncovered++; 
        tile.classList.remove("uncoveredTile");
        tile.style.backgroundColor = "floralwhite";
        tileMap.get(tile).covered = false;
        if (tileMap.get(tile).mine == true) { // Game Over
            tilesUncovered+=1024; // Prevents winscreen when a mine is clicked when tilesUncovered=totalTile-mines-1
            tileMap.get(tile).covered = false;
            clearInterval(timer);
            document.getElementById("smile").innerHTML = "X(";
            mineSet.forEach(function (index) {
                if (tileMap.get(tileArr[parseInt(index, 10)]).flag == false) {
                    addPicture(tileArr[parseInt(index, 10)]);
                }
            });
            for (let i=0; i<tileArr.length; i++) {
                tileArr[i].removeEventListener("click", selectedDiv);
                tileArr[i].removeEventListener("contextmenu", placeFlag);
            } 
        }
        else if (tileMap.get(tile).adjMines == 0) {
            let tileIndex = tileMap.get(tile).index;
            let relAdjIndexes = getRelAdjIndexes(adjDeltas, tileIndex, width);
            for (let j=0; j<relAdjIndexes.length; j++) {
                if (tileMap.get(tileArr[relAdjIndexes[j]]).covered == true) {
                    uncoverTile(tileArr[relAdjIndexes[j]]);
                }
            }
        }
        else {
            addPicture(tile);
        }
        if (tilesUncovered == (height*width)-mines) {
            displayWinScreen();
        }
    }
    else { // Chording
        let adjFlags = 0;
        let relAdjIndexes = getRelAdjIndexes(adjDeltas, tileMap.get(tile).index, width);
        for (let i=0; i<relAdjIndexes.length; i++) {
            if (tileMap.get(tileArr[relAdjIndexes[i]]).flag == true) {
                adjFlags++;
            }
        }
        if (adjFlags == tileMap.get(tile).adjMines) {
            let relAdjIndexes = getRelAdjIndexes(adjDeltas, tileMap.get(tile).index, width);
            for (let j=0; j<relAdjIndexes.length; j++) {
                if (tileMap.get(tileArr[relAdjIndexes[j]]).covered == true) {
                    uncoverTile(tileArr[relAdjIndexes[j]]);
                }
            }
        }
    }
}

function placeFlag() {
    let tile = this;
    if (tileMap.get(tile).covered == true) {
        let img=document.createElement("img");
        img.src="images/flag.png";
        tile.appendChild(img);
        tileMap.get(tile).flag = true;
        tileMap.get(tile).covered = false;
        tile.classList.remove("uncoveredTile");
        document.getElementById("flags").innerHTML--;
        if (tileMap.get(tile).mine == true) {
            minesFlagged++;
        }
    }
    else if (tileMap.get(tile).flag == true) {
        tile.removeChild(tile.firstChild);
        tileMap.get(tile).flag = false;
        tileMap.get(tile).covered = true;
        tile.classList.add("uncoveredTile");
        document.getElementById("flags").innerHTML++;
        if (tileMap.get(tile).mine == true) {
            minesFlagged--;
        }
    }
    if (minesFlagged == mines && tilesUncovered == (height*width)-mines) {
        displayWinScreen();
    }
}

function displayWinScreen() {
    document.getElementById("smile").innerHTML = ":D";
    clearInterval(timer);
    for (let i=0; i<tileArr.length; i++) {
        tileArr[i].removeEventListener("click", selectedDiv);
        tileArr[i].removeEventListener("contextmenu", placeFlag);
    } 
}

function addPicture(tile) {
    let img = document.createElement("img");
    if (tileMap.get(tile).mine == true) {
        img.src="images/mine.png";
    }
    else {
        switch (tileMap.get(tile).adjMines) {
        case 1:
            img.src="images/1.png";
            break;
        case 2:
            img.src="images/2.png";
            break;
        case 3:
            img.src="images/3.png";
            break;
        case 4:
            img.src="images/4.png";
            break;
        case 5:
            img.src="images/5.png";
            break;
        case 6:
            img.src="images/6.png";
            break;
        case 7:
            img.src="images/7.png";
            break;
        case 8:
            img.src="images/8.png";
            break;
        }
    }
    
    tile.appendChild(img);
}