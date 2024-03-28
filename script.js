import { chess } from './chess.js'

var wait = false;
var board;
var realTurn = 0;
const WHITE = 0;
const BLACK = 1;
var multi = false;

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
    const move = await makeMove(from.closest('.square').id, square.id)
    if(move !== undefined && move.promotion === '') {
        square.innerHTML = '';
        square.appendChild(from);
        from.classList.remove('selected');
        await Promise.resolve(algo());
    }

    wait = false;
}

function algo() {
        if(multi === false) {
            const listValidMove = chessBoard.list(board, realTurn);
            const botMove = findMove(listValidMove);
            console.log(botMove);
            applyMove(botMove, board, false);
            const from = document.getElementById(botMove.from).getElementsByTagName('img')[0];
            const to = document.getElementById(botMove.to);
            to.innerHTML = '';
            to.appendChild(from);
            realTurn = realTurn === 1 ? 0 : 1;
        }
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
        await applyMove(legalMove, board);
        realTurn = (realTurn === WHITE) ? BLACK : WHITE;
        return legalMove;
    }
    return undefined;
}

async function applyMove(legalMove, board, player=true) {
    if(legalMove.castle) {
        var dir = legalMove.from - legalMove.to > 0 ? 1 : -1;
        var rook = dir === 1 ? legalMove.from - 4 : legalMove.from + 3;
        updateCastle(rook, legalMove.to + dir);
        swap({from: rook, to: legalMove.to + dir, castle:false, enpassant:false}, board);
        clearSquare(board, rook);
    }

    if(legalMove.enpassant) {
        clearSquare(board, legalMove.enpassant);
        updatePassant(legalMove.enpassant);
    }

    if (legalMove.promotion !== '') {
        if(player) {
            legalMove.promotion = await handlePromotion(legalMove.to, board[legalMove.from].color);
        }
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

var chessBoard;
document.addEventListener('DOMContentLoaded', function () {
    chessBoard = chess();
    initializeBoard();
    // chessBoard.move(0, 1);
    // chessBoard.print();
});

//-----------------------algo----------

function getRandomNumber(min, max) {
    // Generate a random floating-point number between 0 and 1
    const randomFraction = Math.random();
  
    // Scale the random number to fit within the specified range
    const randomNumber = min + randomFraction * (max - min);
  
    // Return the random number
    return randomNumber;
  }

function findMove(legalsMoves) {
    const num = Math.floor(getRandomNumber(0, legalsMoves.length));
    return legalsMoves[num];
}
