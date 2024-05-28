
class tileObject {
    constructor(id, index, mine, adjMines) {
        this.id = id;
        this.index = index;
        this.mine = mine;
        this.adjMines = adjMines;
    }
}

const tileNL = document.querySelectorAll(".tile");
const tileArr = Array.from(tileNL)
const tileObjectArr = [];

const tileMap = new Map();

for (let i = 0; i < tileArr.length; i++) {
    tileObjectArr[i] = new tileObject(tileArr[i].id, i, false, 0);
    tileMap.set(tileArr[i].id, tileObjectArr[i]);
}

const mineIndexSet = new Set();
while (mineIndexSet.size < 10) {
    mineIndexSet.add(parseInt((Math.random() * 64), 10));
}

for (const index of mineIndexSet) {
    const adjIndex = [-9, -1, 7, 8, -8, -7, 1, 9];
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
    if (index > 0 && index < arr.length)
        return true;
    else
        return false;
}

function uncoverTile(tile) {
    if (tileMap.get(tile.id).mine == true) {
        tile.innerHTML = "Mine";
    }
    else {
        tile.innerHTML = tileMap.get(tile.id).adjMines;
    }  
}
