
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

let gameWon = false;
let tileWidth = 30;
let height = 16;
let width = 16;
let mines = 40;
let minesFlagged = 0;
let tilesUncovered = 0;
let currentDifficulty = "Intermediate";
let timer = setInterval(countTime, 1000);
let minSet = new Set();
let tileMap = new Map(); // {div.tile#id: TileObject}
let tileArr = Array.from(document.querySelectorAll(".tile"));
let adjDeltas = [-width-1, -1, width-1, width, -width, -width+1, +1, width+1];
let customMenu = document.getElementById("customMenu");
let widthSliderValue = document.getElementById("widthSliderValue");
let widthSlider = document.getElementById("widthSlider");
let heightSlider = document.getElementById("heightSlider");
let heightSliderValue = document.getElementById("heightSliderValue");
const storedValueIds = ["gamesStarted", "gamesLost", "gamesWon"];

createBoard(width, height);
startGame();
updateLeaderboard();

document.getElementById("smile").addEventListener("click", startGame);
document.getElementById("beginner").addEventListener("click", createBeginnerBoard);
document.getElementById("intermediate").addEventListener("click", createIntermediateBoard);
document.getElementById("expert").addEventListener("click", createExpertBoard);
document.getElementById("custom").addEventListener("click", toggleCustomMenu);
document.getElementById("newGame").addEventListener("click", createCustomGame);
document.getElementById("resetStoredValues").addEventListener("click", resetStoredValues);

function resetStoredValues() {
    for (let i=0; i<storedValueIds.length; i++) {
        document.getElementById(storedValueIds[i]).innerHTML = "0";
    }
    for (let i=1; i<=parseInt(localStorage.getItem("gamesStarted")); i++) {
        if (localStorage.getItem("game" + i) != null) {
            document.getElementById("game" + i).remove();
        }
    }
    localStorage.clear();
}

function updateLeaderboard() {
    for (let i=1; i<=parseInt(localStorage.getItem("gamesStarted")); i++) {
        if (localStorage.getItem("game" + i) != null && document.getElementById("game" + i) == null) {
            let rowOfStats = document.createElement("tr");
            rowOfStats.id = "game" + i;

            let game = document.createElement("td");
            let difficulty = document.createElement("td")
            let time = document.createElement("td")

            game.innerHTML = localStorage.getItem("game" + i);
            difficulty.innerHTML = localStorage.getItem("difficulty" + i);
            time.innerHTML = localStorage.getItem("time" + i);

            rowOfStats.appendChild(game);
            rowOfStats.appendChild(difficulty);
            rowOfStats.appendChild(time);
            document.getElementById("wonGameStats").appendChild(rowOfStats);
        }
    }
}

function incrimentStoredValue(key) {
    let temp = localStorage.getItem(key);
    temp++;
    localStorage.setItem(key, temp);
    document.getElementById(key).innerHTML = temp;
}

function createBeginnerBoard() {
    currentDifficulty = "Beginner";
    width = 8;
    height = 8;
    mines = 10;
    createBoard(width, height);
    startGame();
}

function createIntermediateBoard() {
    currentDifficulty = "Intermediate";
    width = 16;
    height = 16;
    mines = 40;
    createBoard(width, height);
    startGame();
}

function createExpertBoard() {
    currentDifficulty = "Expert";
    width = 32;
    height = 16;
    mines = 99;
    createBoard(width, height);
    startGame();
}

function createCustomGame() {
    currentDifficulty = "Custom";
    width = parseInt(widthSlider.value);
    height = heightSlider.value;
    if (document.getElementById("mineInput").value < height*width && document.getElementById("mineInput").value > 0) {
        mines = parseInt(document.getElementById("mineInput").value);
    }
    createBoard(width, height);
    startGame();
}

function toggleCustomMenu() {
    if (customMenu.style.display == "none") {
        customMenu.style.display = "flex";
        widthSlider.value = width;
        widthSliderValue.innerHTML = width;
        heightSlider.value = height;
        heightSliderValue.innerHTML = height;
    }
    else {
        customMenu.style.display = "none";
    }
}

widthSlider.oninput = function() {
    width = parseInt(widthSlider.value);
    height = parseInt(heightSlider.value);
    if ((width-1)*height > mines) {
        heightSliderValue.innerHTML = height;
        widthSliderValue.innerHTML = width;
        createBoard(width, height);
        startGame();
    }}

heightSlider.oninput = function() {
    width = parseInt(widthSlider.value);
    height = parseInt(heightSlider.value);
    if (width*height-1 > mines) {
        widthSliderValue.innerHTML = width;
        heightSliderValue.innerHTML = height;
        createBoard(width, height);
        startGame();
    }}

function resetBoard() {
    tileWidth = tileArr[0].offsetWidth + tileArr[0].style.marginLeft + tileArr[0].style.marginRight;
    document.getElementById("tiles").style.width = (width * tileWidth) + "px";
    document.getElementById("smile").innerHTML = ":)";
    document.getElementById("mineInput").value = mines;
    document.getElementById("flags").innerHTML = mines;
    document.getElementById("time").innerHTML = "0";
    mineSet = newMineIndexes();
    clearInterval(timer);
    tilesUncovered = 0
    minesFlagged = 0;
    gameWon = false;
}

function startGame() {
    if (localStorage.getItem("gamesStarted") != null) {
        document.getElementById("gamesStarted").innerHTML = localStorage.getItem("gamesStarted");
    }
    if (localStorage.getItem("gamesLost") != null) {
        document.getElementById("gamesLost").innerHTML = localStorage.getItem("gamesLost");
    }
    if (localStorage.getItem("gamesWon") != null) {
        document.getElementById("gamesWon").innerHTML = localStorage.getItem("gamesWon");
    }
    resetBoard();
    for (let i=0; i < tileArr.length; i++) {
        tileMap.set(tileArr[i], new TileObject(tileArr[i].id, false, false, i, true, 0));
        tileArr[i].addEventListener("click", selectedDiv);
        tileArr[i].addEventListener("contextmenu", placeFlag);
        tileArr[i].addEventListener("contextmenu", (e) => {e.preventDefault()});
        tileArr[i].classList.add("uncoveredTile");
        tileArr[i].innerHTML = null;
    }
}

function createBoard(width, height) {
    if (document.getElementById("tiles").firstChild) {
        while (document.getElementById("tiles").firstChild) {
            document.getElementById("tiles").removeChild(document.getElementById("tiles").firstChild);
        }
    }
    for (let j=0; j<height; j++) {
        for (let i=0; i<width; i++) {
            let div = document.createElement("div");
            div.classList.add("tile");
            div.classList.add("uncoveredTile");
            document.getElementById("tiles").appendChild(div);
        }
        let nextRow = document.createElement("div");
        nextRow.classList.add("nextRow");
        document.getElementById("tiles").appendChild(nextRow);
    }   
    tileArr = Array.from(document.querySelectorAll(".tile"));
    tileMap = new Map(); // {div.tile#id: TileObject}
    adjDeltas = [-width-1, -1, width-1, width, -width, -width+1, +1, width+1];
    resetBoard();
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
        mineIndexSet.add(parseInt((Math.random() * tileArr.length), 10));
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
        incrimentStoredValue("gamesStarted");
    }
    if (tileMap.get(tile).covered == true) { 
        tilesUncovered++; 
        tile.classList.remove("uncoveredTile");
        tile.style.backgroundColor = "floralwhite";
        tileMap.get(tile).covered = false;
        if (tileMap.get(tile).mine == true) { // Game Over
            incrimentStoredValue("gamesLost");
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
        if (tilesUncovered == (height*width)-mines && gameWon == false) {
            gameWon = true; // Prevents callstack from executing this code
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
        img.draggable=false;
        tile.appendChild(img);
        tileMap.get(tile).flag = true;
        tileMap.get(tile).covered = false;
        document.getElementById("flags").innerHTML--;
        if (tileMap.get(tile).mine == true) {
            minesFlagged++;
        }
    }
    else if (tileMap.get(tile).flag == true) {
        tile.removeChild(tile.firstChild);
        tileMap.get(tile).flag = false;
        tileMap.get(tile).covered = true;
        document.getElementById("flags").innerHTML++;
        if (tileMap.get(tile).mine == true) {
            minesFlagged--;
        }
    }
    if (minesFlagged == mines && tilesUncovered == tileArr.length-mines) {
        displayWinScreen();
    }
}

function displayWinScreen() {
    incrimentStoredValue("gamesWon");
    document.getElementById("smile").innerHTML = ":D";
    clearInterval(timer);
    for (let i=0; i<tileArr.length; i++) {
        tileArr[i].removeEventListener("click", selectedDiv);
        tileArr[i].removeEventListener("contextmenu", placeFlag);
    } 
    let gameNumber = document.getElementById("gamesStarted").innerHTML;
    localStorage.setItem("game" + gameNumber, gameNumber);
    localStorage.setItem("difficulty" + gameNumber, currentDifficulty);
    localStorage.setItem("time" + gameNumber, document.getElementById("time").innerHTML);
    updateLeaderboard();
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
    img.draggable=false;
    tile.appendChild(img);
}