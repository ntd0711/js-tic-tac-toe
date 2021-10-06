import { CELL_VALUE, GAME_STATUS, TURN } from './constants.js';

import {
  getCellElementList,
  getCurrentTurnElement,
  getCellElementAtIdx,
  getGameStatusElement,
  getReplayBtn,
  getUlElement,
} from './selectors.js';

import { checkGameStatus } from './utils.js';

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let isGameEnded = false;
let gameStatus = GAME_STATUS.LOADING;
let cellValues = new Array(9).fill('');

function addAndToggleTurn(cell) {
  cell.classList.remove(TURN.CROSS, TURN.CIRCLE);
  cell.classList.add(currentTurn);

  currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;

  const currTurnELement = getCurrentTurnElement();
  if (currTurnELement) {
    currTurnELement.classList.remove(TURN.CROSS, TURN.CIRCLE);
    currTurnELement.classList.add(currentTurn);
  }
}

function handleClickCell(cell, index) {
  const isCLicked = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING && gameStatus !== GAME_STATUS.LOADING;

  // only allow to click if game is playing or loading and that cell is not click yet
  if (isCLicked || isEndGame) return;

  cellValues[index] = currentTurn === TURN.CROSS ? CELL_VALUE.CROSS : CELL_VALUE.CIRCLE;
  addAndToggleTurn(cell);

  const game = checkGameStatus(cellValues);
  gameStatus = game.status;

  switch (gameStatus) {
    case GAME_STATUS.ENDED: {
      updateStatusGame(gameStatus);
      showReplayBtn();
      break;
    }

    case GAME_STATUS.O_WIN:
    case GAME_STATUS.X_WIN: {
      updateStatusGame(gameStatus);
      highlightCells(game.winPositions);
      showReplayBtn();
      break;
    }

    default:
      updateStatusGame(gameStatus);
      break;
  }
}

function updateStatusGame(status) {
  if (!status) throw new Error('not has status');

  const statusElement = getGameStatusElement();
  if (statusElement) statusElement.textContent = status;
}

function highlightCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error('invalid win position');
  }

  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);

    if (cell) cell.classList.add('win');
  }
}

function showReplayBtn() {
  const replayBtn = getReplayBtn();

  if (replayBtn) replayBtn.classList.add('show');
}

function hideReplayBtn() {
  const replayBtn = getReplayBtn();

  if (replayBtn) replayBtn.classList.remove('show');
}

function initCellElementList() {
  const cellElementList = getCellElementList();
  cellElementList.forEach((cell, index) => {
    cell.dataset.idx = index;
  });

  const ulElement = getUlElement();
  if (!ulElement) return;

  ulElement.addEventListener('click', (e) => {
    if (e.target.tagName !== 'LI') return;

    const index = Number.parseInt(e.target.dataset.idx);
    handleClickCell(e.target, index);
  });
}

function initReplayBtn() {
  const replayBtn = getReplayBtn();
  if (!replayBtn) return;

  replayBtn.addEventListener('click', resetGame);
}

function resetGame() {
  gameStatus = GAME_STATUS.LOADING;
  currentTurn = TURN.CROSS;
  cellValues = cellValues.map(() => '');
  updateStatusGame(gameStatus);

  const cellElementList = getCellElementList();
  if (!cellElementList) return;

  for (const cell of cellElementList) {
    cell.className = '';
  }

  const currTurnELement = getCurrentTurnElement();
  if (currTurnELement) {
    currTurnELement.classList.remove(TURN.CROSS, TURN.CIRCLE);
    currTurnELement.classList.add(currentTurn);
  }

  hideReplayBtn();
}

/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */
(() => {
  initCellElementList();

  initReplayBtn();
})();
