
class tileObject {
    constructor(id, mine, adjMines) {
        this.id = id;
        this.mine = mine;
        this.adjMines = adjMines;
    }
}

const tileNL = document.querySelectorAll(".tile");
const tileArr = Array.from(tileNL)
const tileObjectArr = [];

const tileMap = new Map();

for (let i = 0; i < tileArr.length; i++) {
    tileObjectArr[i] = new tileObject(tileArr[i].id, false, 0);
    tileMap.set(tileArr[i].id, tileObjectArr[i]);
}

const mineIndexSet = new Set();
while (mineIndexSet.size < 10) {
    mineIndexSet.add(parseInt((Math.random() * 64), 10));
}

for (const index of mineIndexSet) {
    tileObjectArr[index].mine = true;
}


function uncoverTile(tile) {
    tile.innerHTML = tileMap.get(tile.id).mine;
}
