var chess = function () {
    var board = new Array(64);
    var square = {
        id: 0,
        color: undefined,
        type: '',
    };
    var pieces = {
        pawn: 'p',
        knight: 'n',
        bishop: 'b',
        rook: 'r',
        queen: 'q',
        king: 'k'
    };
    var colors = {
        white: 0,
        black: 1
    };
    var col = 8;
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
    var piecesOffset = {
        bPawn: col,
        wPawn: -8,
        bishop: 9, //%
    }
    function setUpBoard() {
        var color = colors.black;
        for(let i = 0; i < 64; i++) {
            if(i == 32)
                color = colors.white;
            var tempsquare = { ...square };
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
        square.color = undefined;
    }
    function isOffBoard(id) {
        if(id > 63 || id < 0)
            return true;
        return false;
    }

    function isLegal(from, to) {
        var legalpiece = {
            'p': pawn,
            'n': knight,
            'b': bishop,
            'r': rook,
            'q': queen,
            'k': king
        }
        if(from.color === to.color || legalpiece[from.type](from).contains(to))
            return false;

        return true;
    }

    function move(from, to) {

        if(isLegal(board[from], board[to])) {
            board[to].type = board[from].type;
            board[to].color = board[from].color
            clearSquare(board[from]);
            return true;
        }
        return false;
    }

    function pawn(from) {
        var listLegalMoves = [];
        var count = 0;
        
        if() {
            if() {

            }
        }
        return listLegalMoves;
    }

    function rook(from) {
        var listLegalMoves = [];


        return listLegalMoves;
    }

    function knight(from) {
        var listLegalMoves = [];


        return listLegalMoves;
    }

    function bishop(from) {
        var listLegalMoves = [];


        return listLegalMoves;
    }

    function king(from) {
        var listLegalMoves = [];


        return listLegalMoves;
    }

    function queen(from) {
        var listLegalMoves = [];


        return listLegalMoves;
    }
    setUpBoard();
    return {
        board: board,
        square: square,
        pieces: pieces,
        colors: colors,
        print: boardToAscii,
        move: move,
    };
}

export {chess};