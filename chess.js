var chess = function () {
    var board = new Array(64);

    var flag = {
        moved: false
    }

    var square = {
        id: 0,
        color: -1,
        type: '',
        flags: flag
    };

    var pieces = {
        pawn: 'p',
        knight: 'n',
        bishop: 'b',
        rook: 'r',
        queen: 'q',
        king: 'k'
    };

    const WHITE = 0;
    const BLACK = 1;

    var defaultPos = [
        'r','n','b','q','k','b','n','r',// 00 01 02 03 04 05 06 07
        'p','p','p','p','p','p','p','p',// 08 09 10 11 12 13 14 15
        ' ',' ',' ',' ',' ',' ',' ',' ',// 16 17 18 19 20 21 22 23
        ' ',' ',' ',' ',' ',' ',' ',' ',// 24 25 26 27 28 29 30 31
        ' ',' ',' ',' ',' ',' ',' ',' ',// 32 33 34 35 36 37 38 39
        ' ',' ',' ',' ',' ',' ',' ',' ',// 40 41 42 43 44 45 46 47
        'p','p','p','p','p','p','p','p',// 48 49 50 51 52 53 54 55
        'r','n','b','q','k','b','n','r',// 56 57 58 59 60 61 62 63
    ];

    var turn = WHITE;

    function setUpBoard() {
        var color = BLACK;
        for(let i = 0; i < 64; i++) {
            if(i == 32)
                color = WHITE;
        var tempsquare = deepCopy(square);;
        tempsquare.id = i;
        if(defaultPos[i] != ' ') {
            tempsquare.color = color;
            tempsquare.type = defaultPos[i];
        }
        board[i] = tempsquare;
    }
}
function boardToAscii () {
    var string = '';
    board.forEach(element => {
        if(element.id % 8 == 0)
        string += '\n';
    string += element.type + ' ';
});
}
function clearSquare(square) {
    square.type = '';
    square.color = -1;
    square.flags = { ...flag};
}

function isLegal(from, to, currboard, fictionnal) {
        var legalpiece = {
            'p': pawn,
            'n': knight,
            'b': bishop,
            'r': rook,
            'q': queen,
            'k': king
        }
        //1. if selected piece not turn 2. if same color 3.piece legal move 4. is checked
        if((!fictionnal && from.color !== turn) || from.color === to.color || !legalpiece[from.type](from, currboard).includes(to.id) || (!fictionnal && checked(from, to, false))) {
            return false;
        }
        return true;
    }

    function applyMove(from, to, currBoard) {
        currBoard[to].type = currBoard[from].type;
        currBoard[to].color = currBoard[from].color
        currBoard[to].flags = currBoard[from].flags
        clearSquare(currBoard[from]);
        updateFlags(currBoard[to]);
    }
    
    function move(from, to) {
        if(isLegal(board[from], board[to], board, false)) {
            applyMove(from, to, board);
            turn = (turn === WHITE) ? BLACK : WHITE;
            return true;
        }
        return false;
    }

    function updateFlags(to) {
        if(to.flags.moved === false)
            to.flags.moved = true;
    }

    function checked(from, to, current) {
        const tempBoard = deepCopy(board);
        
        if(!current)
            applyMove(from.id, to.id, tempBoard);
        var king = tempBoard.find(function(obj) {
            return obj.type === 'k' && obj.color === turn;
        });
        for(let i = 0; i < 64; i++) {
            if(tempBoard[i].color === turn || tempBoard[i].type === '')
                continue ;
            if(isLegal(tempBoard[i], king, tempBoard, true))
                return true
        }
        return false;
    }
    //-----------pieces movement-------------
    function pawn(from, currBoard) {
        const listLegalMoves = [];
        const [c, r] = translateIndex(from.id, false);

        var directions = [
            [0, 1],
            [0, 2],
            [1, 1],
            [-1, 1]
        ];
        if(from.color === WHITE)
            directions = directions.map(([dx, dy]) => [-dx, -dy]);
        for (const [dx, dy] of directions) {
            const x = c + dx;
            const y = r + dy;
            if((dy === 2 || dy === -2 )&& from.flags.moved === true)//if two square but already moved
                continue ;
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if(dx === 0 && currBoard[id].type !== '') {//if obstacle in front skip
                    continue ;
                }
                if ((dx === 0 && currBoard[id].type === '') || (currBoard[id].color !== from.color && currBoard[id].type !== '')) {
                    listLegalMoves.push(id);
                }
            }
        }

        return listLegalMoves;
    }

    function rook(from, currBoard) {
        const listLegalMoves = [];
        const [c, r] = translateIndex(from.id, false);
    
        const directions = [
            [-1, 0], // Left
            [1, 0],  // Right
            [0, 1],  // Down
            [0, -1]  // Up
        ];
    
        for (const [dx, dy] of directions) {
            let x = c + dx;
            let y = r + dy;
    
            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if (currBoard[id].type === '') {
                    listLegalMoves.push(id);
                } else {
                    if (currBoard[id].color !== from.color) {
                        listLegalMoves.push(id);
                    }
                    break;
                }
                x += dx;
                y += dy;
            }
        }
    
        return listLegalMoves;
    }

    function knight(from, currBoard) {
        var listLegalMoves = [];
        const [c, r] = translateIndex(from.id, false);

        const directions = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2], [1, 2],
            [2, -1], [2, 1]
        ];

        for (const [dx, dy] of directions) {
            const x = c + dx;
            const y = r + dy;
    
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if (currBoard[id].type === '' || currBoard[id].color !== from.color) {
                    listLegalMoves.push(id);
                }
            }
        }

        return listLegalMoves;
    }

    function bishop(from, currBoard) {
        var listLegalMoves = [];
        const [c, r] = translateIndex(from.id, false);

        const directions = [
            [-1, -1],   //nw
            [-1, 1],    //sw
            [1, -1],    //ne
            [1, 1],     //se
        ];

        for (const [dx, dy] of directions) {
            let x = c + dx;
            let y = r + dy;
    
            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if (currBoard[id].type === '') {
                    listLegalMoves.push(id);
                } else {
                    if (currBoard[id].color !== from.color) {
                        listLegalMoves.push(id);
                    }
                    break;
                }
                x += dx;
                y += dy;
            }
        }
        return listLegalMoves;
    }

    function king(from, currBoard) {
        var listLegalMoves = [];
        const [c, r] = translateIndex(from.id, false);
        
        const directions = [
            [0, 1], [0, -1],
            [1, 0], [-1, 0],
            [1, 1], [-1, 1],
            [1, -1], [-1, -1],
        ];

        //castle
        if(ok)
            listLegalMoves = castle(from ,currBoard, c, r, listLegalMoves);
        //normal moves
        for (const [dx, dy] of directions) {
            const x = c + dx;
            const y = r + dy;
    
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if (currBoard[id].type === '' || currBoard[id].color !== from.color) {
                    listLegalMoves.push(id);
                }
            }
        }

        return listLegalMoves;
    }

    function castle(from, currBoard, c, r) {
        var listLegalMoves = [];
        if(from.flags.moved === false && !checked(from, from, true)) {
            let x = c;
            let id = translateIndex([++x, r], true)
            while((x >= 0 && x < 8) && currBoard[id].type === '') {
                if(checked(from, currBoard[id], false))
                    break ;
                id = translateIndex([++x, r], true);
            }
            if(x - c === 2 && currBoard[id].type === 'r' && !currBoard[id].flags.moved && currBoard[id].color === from.color)
                listLegalMoves.push(id);
            x = c;
            id = translateIndex([--x, r], true);
            while((x >= 0 && x < 8) && currBoard[id].type === '') {
                if(checked(from, currBoard[id], false))
                    break ;
                id = translateIndex([--x, r], true);
            }
            if(x - c === 3 && currBoard[id].type === 'r' && !currBoard[id].flags.moved && currBoard[id].color === from.color)
                listLegalMoves.push(id);
        }
        return listLegalMoves
    }

    function queen(from, currBoard) {
        var listLegalMoves = [];
        const [c, r] = translateIndex(from.id, false);

        const directions = [
            [0, 1], [0, -1],
            [1, 0], [-1, 0],
            [1, 1], [-1, 1],
            [1, -1], [-1, -1],
        ];

        for (const [dx, dy] of directions) {
            let x = c + dx;
            let y = r + dy;
    
            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if (currBoard[id].type === '') {
                    listLegalMoves.push(id);
                } else {
                    if (currBoard[id].color !== from.color) {
                        listLegalMoves.push(id);
                    }
                    break;
                }
                x += dx;
                y += dy;
            }
        }

        return listLegalMoves;
    }

    setUpBoard();
    return {
        board: board,
        square: square,
        pieces: pieces,
        print: boardToAscii,
        move: move,
    };
}

function translateIndex(id, toIndex) {
    if(toIndex) {
        return id[1] * 8 + id[0];
    }
    const column = id % 8;
    const row = Math.floor(id / 8);
    return [column, row];
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export {chess};