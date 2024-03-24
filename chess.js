

var chess = function () {
    const board = new Array(64);

    var flag = {
        moved: false,
        enpassant: 0
    }

    var square = {
        id: 0,
        color: -1,
        type: '',
        flags: { ...flag }
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
        ' ',' ','p',' ','p',' ',' ',' ',// 32 33 34 35 36 37 38 39
        ' ',' ',' ',' ',' ',' ',' ',' ',// 40 41 42 43 44 45 46 47
        'P','P','P','P','P','P','P','P',// 48 49 50 51 52 53 54 55
        'R',' ',' ',' ','K',' ',' ','R',// 56 57 58 59 60 61 62 63
    ];

    var turn = WHITE;

    function setUpBoard() {
        for(let i = 0; i < 64; i++) {
            var tempsquare = structuredClone(square);
            tempsquare.id = i;
            if(defaultPos[i] != ' ') {
                tempsquare.color = defaultPos[i] === defaultPos[i].toLowerCase() ? BLACK : WHITE;
                tempsquare.type = defaultPos[i].toLowerCase();
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

    function clearSquare(currboard, square) {
        currboard[square].type = '';
        currboard[square].color = -1;
        currboard[square].flags = { ...flag};
    }

    function getMoveByToId(legalMoves, toId) {
        return legalMoves.find(function(move) {
            return move.to === toId;
        });
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
        if((!fictionnal && from.color !== turn) || from.color === to.color) {
            return false;
        }
        const legalMoves = legalpiece[from.type](from, currboard);
        const legalMove = getMoveByToId(legalMoves, to.id);
        if(!legalMove|| (!fictionnal && checked(legalMove, false)))
            return false;
        return legalMove;
    }

    function swap(legalMove, currBoard) {
        currBoard[legalMove.to].type =  currBoard[legalMove.from].type;
        currBoard[legalMove.to].color = currBoard[legalMove.from].color
        currBoard[legalMove.to].flags = currBoard[legalMove.from].flags
    }

    function applyMove(legalMove, currBoard) {
        if(legalMove.castle) {
            var dir = legalMove.from - legalMove.to > 0 ? 1 : -1;
            var rook = dir === 1 ? legalMove.from - 4 : legalMove.from + 3;
            swap({from: rook, to: legalMove.to + dir, castle:false, enpassant:false}, currBoard);
            clearSquare(currBoard, rook);
            if(board === currBoard)
                updateCastle(rook, legalMove.to + dir);
        }
        if(legalMove.applyPassant) {
            clearSquare(currBoard, legalMove.applyPassant);
            if(board === currBoard)
                updatePassant(legalMove.applyPassant);
        }
        swap(legalMove, currBoard);
        clearSquare(currBoard, legalMove.from);
        updateFlags(currBoard, legalMove);
    }
    
    function move(from, to) {
        const legalMove = isLegal(board[from], board[to], board, false);
        if(legalMove) {
            applyMove(legalMove, board);
            turn = (turn === WHITE) ? BLACK : WHITE;
            return true;
        }
        return false;
    }

    function clearEnpassant(currBoard) {
        currBoard.forEach(square => {
            square.flags.enpassant = 0;
        });
    }

    function updateFlags(currboard, legalMove) {
        if(currboard[legalMove.to].flags.moved === false)
            currboard[legalMove.to].flags.moved = true;
        clearEnpassant(currboard);
        if(legalMove.enpassant) {
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

    function checked(legalMove, current) {
        var tempBoard = structuredClone(board);
        if(!current) {
            applyMove(legalMove, tempBoard);
        }
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

    function setupMoves(from, to, castle = false, enpassant = false, applyPassant = 0) {
        return {
            from: from,
            to: to,
            castle: castle,
            enpassant: enpassant,
            applyPassant: applyPassant
        };
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
                    listLegalMoves.push(setupMoves(from.id, id, false, ((dx === 0 && dy === 2) || (dx === 0 && dy === -2) ? true: false)));
                }
                else if(id === (dy > 0 && dx !== 0 ? from.flags.enpassant + 8 : from.flags.enpassant - 8))
                    listLegalMoves.push(setupMoves(from.id, id, false, false, from.flags.enpassant));
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
                    listLegalMoves.push(setupMoves(from.id, id));
                } else {
                    if (currBoard[id].color !== from.color) {
                        listLegalMoves.push(setupMoves(from.id, id));
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
                    listLegalMoves.push(setupMoves(from.id, id));
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
                        listLegalMoves.push(setupMoves(from.id, id));
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

        // castle
        if(from.color === turn) {
            castle(from ,currBoard, c, r, listLegalMoves);
        }
        //normal moves
        for (const [dx, dy] of directions) {
            const x = c + dx;
            const y = r + dy;
    
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const id = translateIndex([x, y], true);
                if (currBoard[id].type === '' || currBoard[id].color !== from.color) {
                    listLegalMoves.push(setupMoves(from.id, id));
                }
            }
        }

        return listLegalMoves;
    }

    function castle(from, currBoard, c, r, listLegalMoves) {
        if(from.flags.moved === false && !checked(setupMoves(from.id, from.id), true)) {
            let x = c;
            let id = translateIndex([++x, r], true);
            
            while((x >= 0 && x < 8) && currBoard[id].type === '') {
                if(checked(setupMoves(from.id, id), false))
                    break ;

                id = translateIndex([++x, r], true);
            }
            if(x - c === 3 && currBoard[id].type === 'r' && !currBoard[id].flags.moved && currBoard[id].color === from.color)
                listLegalMoves.push(setupMoves(from.id, id - 1, true));
            x = c;
            id = translateIndex([--x, r], true);
            while((x >= 0 && x < 8) && currBoard[id].type === '') {
                if(checked(setupMoves(from.id, id), false))
                    break ;
                id = translateIndex([--x, r], true);
            }
            if(x - c === -4 && currBoard[id].type === 'r' && !currBoard[id].flags.moved && currBoard[id].color === from.color)
                listLegalMoves.push(setupMoves(from.id, id + 2, true));
        }
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
                        listLegalMoves.push(setupMoves(from.id, id));
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
        board: defaultPos,
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

function updateCastle(from, to) {
    const fromDiv = document.getElementById(from);
    const toDiv = document.getElementById(to);
    toDiv.appendChild(fromDiv.getElementsByTagName('img')[0])
    fromDiv.innerHTML = '';
}

function updatePassant(id) {
    document.getElementById(id).innerHTML = '';
}

export {chess};