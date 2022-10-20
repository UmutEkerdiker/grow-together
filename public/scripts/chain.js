let addChain = document.getElementById("add-chain");

let myChains = document.getElementById("my-chains");
let form = document.getElementById("chain-form");

let addNewChain = function (e) {
    e.preventDefault();
    let chainName = document.getElementById("chain-name").value;
    document.getElementById("chain-header").innerText = chainName;
    console.log(chainName);

}

form.addEventListener("submit", addNewChain, true);