import { chess } from './chess.js'

var wait = false;
var board;
var realTurn = 0;
const WHITE = 0;
const BLACK = 1;
var multi = false;
var chessBoard;

function initializeBoard() {
    const cb = document.getElementById('chessboard');

    board = chessBoard.setBoard();
    setBoard(cb);
    addPieces(cb);
    clickHandler(cb);
    dragHandler(cb);
    gameSelect();
}

function gameSelect() {
    const overlay = document.getElementById('overlay');
    const solo = document.getElementById('solo');
    const duo = document.getElementById('duo');

    solo.addEventListener('click', function () {
        overlay.style.display = 'none';
    });

    duo.addEventListener('click', function () {
        multi = true;
        overlay.style.display = 'none';
    });
}

function clickHandler(cb) {
    cb.addEventListener('click', event => {
        const element = event.target;
        if(element.classList.contains('piece')) {
            var selected = document.querySelector('.selected');
            if(selected && selected != element) {
                move(selected, element);
            }
            else
                element.classList.add('selected');
        }
        if(element.classList.contains('square')) {
            var selected = document.querySelector('.selected');
            if(selected)
                move(selected, element);
        }
    });
}

function dragHandler(cb) {
    cb.addEventListener('dragover', event => {
        event.preventDefault();
    });
    cb.addEventListener('dragstart', dragStart);
    cb.addEventListener('drop', event => {
        const pieceId = event.dataTransfer.getData('text/plain');
        const piece = document.getElementById(pieceId);
        if(!wait)
            move(piece.getElementsByTagName('img')[0], event.target);
    });
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.closest('.square').id)
}
async function move(from, to) {
    const square = to.closest('.square');
    wait = true;
    const move = await makeMove(from.closest('.square').id, square.id);
    if(move !== undefined && move.promotion === '') {
        square.innerHTML = '';
        square.appendChild(from);
        from.classList.remove('selected');
    }
    if(move !== undefined && multi === false) {
        await Promise.resolve(algo());
    }
    wait = false;
}

function algo() {
            const botMove = findMove(realTurn, board, 2, true);
            console.log(botMove);
            applyMove(botMove, board, true, false);
            const from = document.getElementById(botMove.from).getElementsByTagName('img')[0];
            const to = document.getElementById(botMove.to);
            to.innerHTML = '';
            to.appendChild(from);
            realTurn = changeTurn(realTurn);
}

function setBoard(cb) {
    const color = ['light', 'dark'];
    var c = false;
    var id = 0;
    for(let col = 0; col < 8; col++) {
        for(let row = 0; row < 8; row++) {
            const div = document.createElement('div');
            div.classList.add('square', color[c ? 1 : 0]);
            div.id = id++;
            cb.appendChild(div);
            c = !c;
        }
        c = !c;
    }
}
function addPieces(cb) {

    for (let i = 0; i < 64; i++) {
            if (board[i].type !== ' ') {
                const square = cb.children[i];
                const pieceImg = document.createElement('img');
                pieceImg.classList.add('piece');
                pieceImg.draggable = true;
                pieceImg.src = getPieceHTML(board[i].color === 0 ? board[i].type.toUpperCase() : board[i].type);
                square.appendChild(pieceImg);
            }
        }
}

export default function getPieceHTML(piece) {
    
    switch (piece) {
        case 'r':
            return 'img/bR.png'; 
        case 'n':
            return 'img/bN.png'; 
        case 'b':
            return 'img/bB.png';
        case 'q':
            return 'img/bQ.png';
        case 'k':
            return 'img/bK.png';
        case 'p':
            return 'img/bP.png';
        case 'R':
            return 'img/wR.png';
        case 'N':
            return 'img/wN.png';
        case 'B':
            return 'img/wB.png';
        case 'Q':
            return 'img/wQ.png';
        case 'K':
            return 'img/wK.png';
        case 'P':
            return 'img/wP.png';
        default:
            return '';
    }
}
//------------------------------board modification after moves------------
function swap(legalMove, board) {
    board[legalMove.to].type =  board[legalMove.from].type;
    board[legalMove.to].color = board[legalMove.from].color
    board[legalMove.to].flags = board[legalMove.from].flags
}

async function makeMove(from, to) {
    const legalMove = chessBoard.isLegal(board[from], board[to], board, false, false, realTurn);
    if(legalMove) {
        await applyMove(legalMove, board, true);
        realTurn = changeTurn(realTurn);
        return legalMove;
    }
    return undefined;
}

async function applyMove(legalMove, board, isReal, player=true) {
    if(legalMove.castle) {
        var dir = legalMove.from - legalMove.to > 0 ? 1 : -1;
        var rook = dir === 1 ? legalMove.from - 4 : legalMove.from + 3;
        swap({from: rook, to: legalMove.to + dir, castle:false, enpassant:false}, board);
        clearSquare(board, rook);
        if(isReal)
            updateCastle(rook, legalMove.to + dir);
    }

    if(legalMove.enpassant) {
        clearSquare(board, legalMove.enpassant);
        if(isReal)
            updatePassant(legalMove.enpassant);
    }

    if (legalMove.promotion !== '') {
        if(player) {
            legalMove.promotion = await handlePromotion(legalMove.to, board[legalMove.from].color);
        }
        if(isReal)
            updatePromotion(legalMove.from, legalMove.to, board[legalMove.from].color, legalMove.promotion);
        board[legalMove.from].type = legalMove.promotion;
    }
    swap(legalMove, board);
    clearSquare(board, legalMove.from);
    updateFlags(board, legalMove);
}

function updateCastle(from, to) {
    const fromDiv = document.getElementById(from);
    const toDiv = document.getElementById(to);
    toDiv.appendChild(fromDiv.getElementsByTagName('img')[0])
    fromDiv.innerHTML = '';
}

function updatePassant(id) {
    document.getElementById(id).innerHTML = '';
}

async function handlePromotion(to, color) {
    try {
        const chosenPiece = await getPromotion(to, color);
        return chosenPiece;
    } catch (error) {
        console.error('Error during promotion:', error);
    }
}

function getPromotion(to, color) {
    return new Promise((resolve, reject) => {
        const pieces = color === 0 ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
        const menu = document.getElementById('promotion-menu');
        const squareTo = document.getElementById(to);
        menu.innerHTML = '';
        const computedStyles = window.getComputedStyle(document.getElementsByClassName('square')[0]);
        const h = parseFloat(computedStyles.getPropertyValue('height')); // Parse float value
        const w = parseFloat(computedStyles.getPropertyValue('width')); // Parse float value
        menu.style.height = `${h * 4}px`; // Set height with correct unit
        pieces.forEach(piece => {
            const div = document.createElement('div');
            div.classList.add('promotion-option');
            div.style.height = `${h}px`; // Set height with correct unit
            div.style.width = `${w}px`; // Set width with correct unit
            div.setAttribute('data-piece', piece.toLowerCase()); // Fixed syntax for toLowerCase()
            const img = document.createElement('img');
            img.src = getPieceHTML(piece);
            div.appendChild(img);
            menu.appendChild(div);
        });
        menu.style.display = 'grid';
        // Position menu

        const squareRect = squareTo.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const top = color === 0 ? squareRect.top : squareRect.top - (h + 3.2) * 3;
        menu.style.top = `${top}px`;
        menu.style.left = `${squareRect.left}px`;

        // Click listener
        menu.addEventListener('click', event => {
                menu.style.display = 'none'; // Fixed syntax for display property
                resolve(event.target.closest('.promotion-option').getAttribute('data-piece'));
        }, { once: true });
    });
}

function updatePromotion(from, to, color, piece) {
    const toDiv = document.getElementById(to);
    document.getElementById(from).innerHTML = '';
    if(color === 0)
        piece = piece.toUpperCase();
    toDiv.getElementsByTagName('img')[0].src = getPieceHTML(piece);
}

function clearSquare(currboard, square) {
    currboard[square].type = '';
    currboard[square].color = -1;
    currboard[square].flags = {moved: false, enpassant: 0};
}

function updateFlags(currboard, legalMove) {
    if(currboard[legalMove.to].flags.moved === false)
        currboard[legalMove.to].flags.moved = true;
    clearEnpassant(currboard);
    if(currboard[legalMove.to].type === 'p' && Math.abs(legalMove.from - legalMove.to) === 16) {
        const dir = [1, -1];
        for(const d of dir) {
            var id = legalMove.to + d
            if(Math.floor(id / 8) !== Math.floor(legalMove.to / 8))
                continue ;
            if(currboard[id].type === 'p' && currboard[id].color !== currboard[legalMove.to].color)
                currboard[id].flags.enpassant = legalMove.to;

        }
    }
}

function clearEnpassant(currBoard) {
    currBoard.forEach(square => {
        square.flags.enpassant = 0;
    });
}

function changeTurn(turn) {
    return turn === 1 ? 0 : 1;
}

document.addEventListener('DOMContentLoaded', function () {
    chessBoard = chess();
    initializeBoard();
});

//-----------------------algo----------

const pieceValue = {
    'p': 10,
    'b': 30,
    'n': 30,
    'r': 50,
    'q': 90,
    'k': 900
};


const reverseArray = function(array) {
    return array.slice().reverse();
};
const pawnEvalWhite =
[
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,
    1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0,
    0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5,
    0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0,
    0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5,
    0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5,
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0
];

const pawnEvalBlack = reverseArray(pawnEvalWhite);

const knightEval =
[
    -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0,
    -4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0,
    -3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0,
    -3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0,
    -3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0,
    -3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0,
    -4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0,
    -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0
];

const bishopEvalWhite = [
    -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0,
    -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
    -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0,
    -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0,
    -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0,
    -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
    -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0,
    -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0
];

const bishopEvalBlack = reverseArray(bishopEvalWhite);

const rookEvalWhite = [
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0
];

const rookEvalBlack = reverseArray(rookEvalWhite);

const evalQueen = [
    -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0,
    -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
    -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
    -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
    0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
    -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
    -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0,
    -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0
];

const kingEvalWhite = [
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
    -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0,
    -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0,
    2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0,
    2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0
];

const kingEvalBlack = reverseArray(kingEvalWhite);

const pieceAdjust = {
    'wp': pawnEvalWhite,
    'wb': bishopEvalWhite,
    'wn': knightEval,
    'wr': rookEvalWhite,
    'wq': evalQueen,
    'wk': kingEvalWhite,
    'bp': pawnEvalBlack,
    'bb': bishopEvalBlack,
    'bn': knightEval,
    'br': rookEvalBlack,
    'bq': evalQueen,
    'bk': kingEvalBlack
}

function calculatePoints(fboard) {
    var value = 0;
    for(const square of fboard) {
        if(square.type !== '') {
            // const colorPiece = square.color === WHITE ? 'w' + square.type : 'b' + square.type;
            value += square.color === WHITE ? pieceValue[square.type] + pieceAdjust['w' + square.type][square.id] : -(pieceValue[square.type] + pieceAdjust['b' + square.type][square.id]);
        }
    }
    return value;
}
function findMove(turn, board, depth, isMaxPlayer) {
    const listValidMove = chessBoard.list(board, turn);
    var bestMove = 9999;
    var bestMoveFound;
    for(const move of listValidMove) {
        var fBoard = structuredClone(board);
        applyMove(move, fBoard, false, false);
        var value = minimax(depth - 1, fBoard, -10000, 10000, !isMaxPlayer, changeTurn(turn))
        if(value <= bestMove) {
            bestMove = value;
            bestMoveFound = move;
        }
    }
    return bestMoveFound;
}

function minimax(depth, fBoard, alpha, beta, isMaxPlayer, turn) {
    if (depth === 0) {
        console.log(calculatePoints(fBoard));
        return calculatePoints(fBoard);
    }
    var listValidMove = chessBoard.list(fBoard, turn);
    var vBoard;
    if (isMaxPlayer) {
        var bestMove = -9999;
        for(const move of listValidMove) {
            vBoard = structuredClone(fBoard);
            applyMove(move, vBoard, false, false);
            bestMove = Math.max(bestMove, minimax(depth - 1, vBoard, alpha, beta, !isMaxPlayer, changeTurn(turn)));
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (const move of listValidMove) {
            vBoard = structuredClone(fBoard);
            applyMove(move, vBoard, false, false);
            bestMove = Math.max(bestMove, minimax(depth - 1, vBoard, alpha, beta, !isMaxPlayer, changeTurn(turn)));
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};
