var project = document.getElementById("game");
var finishEl = project.getElementsByClassName("finish")[0];
var finishMovesEl = finishEl.getElementsByClassName("movesShower")[0];
var finishMinimumEl = finishEl.getElementsByClassName("minimum")[0];
var finishMultipleEl = finishEl.getElementsByClassName("multiple")[0];

var moveCounterEl = project.getElementsByClassName("moveCounter")[0];
var difficultyEl = project.getElementsByClassName("difficulty")[0];
var playnewButtonEl = project.getElementsByClassName("playnew")[0];
var playgameButtonEl = project.getElementsByClassName("playgame")[0];


var towerEls = [].slice.call(project.getElementsByClassName("tower"), 0);

for(var i=0; i<towerEls.length; i++) {
  var towerEl = towerEls[i];
  towerEl.data = {}
  towerEl.data.index = i;
}


difficultyEl.onchange = function(e) {
  startnewGame();
}


var state = {
  startIndex: 0,
  timesDone: 0,
  skipInfo: 0,
  amount: 3,
  maxDiff: 10,
  stored: null,
  storedDisc: null,
  moves: 0,
  done: false,
};

if(localStorage == undefined) {
  localStorage = {}
}
if(localStorage.hanoiDifficulty == undefined) {
  localStorage.hanoiDifficulty = 3;
  localStorage.hanoistartIndex = 0;
  localStorage.skipInfo = 0;
}
state.amount = +localStorage.hanoiDifficulty;
difficultyEl.value = "" + state.amount;
state.startIndex = +localStorage.hanoistartIndex;


function init() {
  state.stored = null;
  state.moves = 0;
  state.done = false;
  state.timesDone = 0;
  hideFinish();
  for(var i=0; i<towerEls.length; i++) {
    var towerEl = towerEls[i];
    towerEl.onclick = towerClick;
    var discContainer = towerEl.children[0];
    empty(discContainer);
  }
  
  var towerEl = towerEls[state.startIndex];
  var discContainer = towerEl.children[0];
  
  for(var i=0; i<state.amount; i++) {
    var discEl = document.createElement("div");
    discEl.className = "disc d" + (state.maxDiff - state.amount + i + 1);
    discContainer.appendChild(discEl);
  }
  
  updateMoveCounter();
}
onkeydown = function(e) {
  var keyCode = e.keyCode || e.which;
  var fixedKC;
  if(keyCode > 36 && keyCode < 40) {
    fixedKC = keyCode - 37;
  } else if(keyCode > 48 && keyCode < 52) {
    fixedKC = keyCode - 49;
  }
  if(keyCode == 40) { fixedKC = 1 }
  
  if(fixedKC > -1 && fixedKC < 3) {
    choose(fixedKC);
  }
}

var towerClick = function() {
  choose(this.data.index);
}

var choose = function(index) {
  var towerEl = project.getElementsByClassName("tower")[index];
  var discEl = towerEl.children[0].children[0];
  if(state.stored == null) {
    if(discEl != undefined) {
      state.stored = index;
      state.storedDisc = discEl;
      discEl.className += " selected";
    }
  } else if(index == state.stored) {
    
    state.storedDisc.className = state.storedDisc.className.split(" ").slice(0,-1).join(" ");
    state.stored = null;
    
  } else {
    if(isStoredValid(discEl)) {
      doMove(towerEl.children[0], index);
    }
  }
}

var startnewGame = function() {
  var difficulty = +difficultyEl.value
  state.amount = difficulty;
  init();
}

playnewButtonEl.onclick = startnewGame;

var isStoredValid = function(discEl) {
  if(discEl == undefined) return true;
  var storedSize = +state.storedDisc.className.split(" ")[1].slice(1);
  var targetSize = +discEl.className.split(" ")[1].slice(1);
  
  var valid = false;
  if(targetSize > storedSize) {
    valid = true;
  }
  
  return valid;
}

var doMove = function(discContainerEl, fixedKC) {
  discContainerEl.insertBefore(state.storedDisc, discContainerEl.firstChild);
  state.storedDisc.className = state.storedDisc.className.split(" ").slice(0,-1).join(" ");
  state.stored = null;
  
  state.moves++;
  updateMoveCounter();
  checkIfDone(discContainerEl, fixedKC);
}

var checkIfDone = function(discContainerEl, fixedKC) {
  if(fixedKC != state.startIndex && discContainerEl.children.length == state.amount) {
    state.done = true;
    var newDifficulty = Math.min(state.amount + 1, state.maxDiff);
    difficultyEl.value = "" + newDifficulty
    localStorage.hanoiDifficulty = newDifficulty;
    state.startIndex = fixedKC;
    state.timesDone++;
    localStorage.hanoistartIndex = fixedKC;
    playnewButtonEl.focus();
    displayFinish();
  }
}

var updateMoveCounter = function() {
  moveCounterEl.firstChild.nodeValue = "moves: " + state.moves;
}

var displayFinish = function() {
  finishEl.className = finishEl.className.split(" ").slice(0, 1).join(" ");
  finishMovesEl.firstChild.nodeValue = state.moves;
  if(wasMinimalMoves()) {
    finishMinimumEl.className = "minimum";
  } else {
    finishMinimumEl.className = "minimum hidden";
  }
  
  if(state.timesDone > 1) {
    finishMultipleEl.className = "multiple";
    finishMultipleEl.firstChild.nodeValue = state.timesDone + " times ";
  } else {
    finishMultipleEl.className = "multiple hidden";
  }
  
}
var hideFinish = function() {
  finishEl.className += " hidden";
}

var empty = function(node) {
  var fc = node.firstChild;
  while(fc) {
    node.removeChild(fc);
    fc = node.firstChild;
  }
}

var wasMinimalMoves = function() {
  return (Math.pow(2, state.amount)-1) * state.timesDone == state.moves;
}

init();