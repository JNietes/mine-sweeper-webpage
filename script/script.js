
const tileNL = document.querySelectorAll(".tile");
const tileArr = Array.from(tileNL)
for (let i = 0; i < tileArr.length; i++) {
    console.log(tileArr[i].id);
}
function uncoverTile(id) {
    id.innerHTML = ":D";
}