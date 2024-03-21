import { chess } from '/chess.js'

function initializeBoard() {
    const cb = document.getElementById('chessboard');

    setBoard(cb);
    addPieces();
    clickHandler(cb);
    dragHandler(cb);
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
        move(piece.getElementsByTagName('img')[0], event.target);
    });
}

function dragStart(event) {
    // event.preventDefault();
    // const emptyImg = new Image();
    // emptyImg.src = event.target.src;
    // event.dataTransfer.setDragImage(emptyImg, 0, 0);
    // console.log(event);
    event.dataTransfer.setData('text/plain', event.target.closest('.square').id)
}
function move(from, to) {
    const square = to.closest('.square');
    if(!chessBoard.move(from.closest('.square').id, square.id))
        return console.log('illegal');
    square.innerHTML = '';
    square.appendChild(from);
    from.classList.remove('selected');
    chessBoard.print();
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
function addPieces() {
    const cb = document.getElementById('chessboard');
    const piecesLayout = [
        'rnbqkbnr',
        'pppppppp',
        '        ',
        '        ',
        '        ',
        '        ',
        'PPPPPPPP',
        'RNBQKBNR'
    ];

    for (let col = 0; col < 8; col++) {
        const rowData = piecesLayout[col];
        for (let row = 0; row < 8; row++) {
            const piece = rowData[row];
            if (piece !== ' ') {
                const square = cb.children[col * 8 + row];
                const pieceImg = document.createElement('img'); // img
                pieceImg.classList.add('piece');
                pieceImg.draggable = true;
                pieceImg.src = getPieceHTML(piece);
                square.appendChild(pieceImg);
            }
        }
    }
}

function getPieceHTML(piece) {
    
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

var chessBoard = chess();
document.addEventListener('DOMContentLoaded', function () {
    initializeBoard();
    // chessBoard.move(0, 1);
    // chessBoard.print();
});