var Sweeper = function(_rows, _columns, _mines) {
    this.rows = 0;
    this.columns = 0;
    this.mines = 0;
    this.board = [[]];
    this.active = true;

    this.init = function (_r, _c, _m) {
        this.board = [];

        this.rows = _r;
        this.columns = _c;
        this.mines = _m;

        for (var y = 0; y < this.rows; y++) {
            this.board[y] = [];
            for (var x = 0; x < this.columns; x++) {
                this.board[y][x] = this.createSquare();
            }
        }

        this.setBoard();
    }

    this.setBoard = function () {
        //get all board squares into a single list, reset them, then pull randomly from the collection to add mines
        var collection = [];

        for (var y = 0; y < this.rows; y++) {
            this.board[y] = [];
            for (var x = 0; x < this.columns; x++) {
                this.board[y][x] = this.createSquare();
                collection.push(this.board[y][x]);
            }
        }

        for (var i = this.mines; i > 0; i--) {
            var index = Math.floor(Math.random() * collection.length);
            var removedList = collection.splice(index, 1);
            if (removedList && removedList.length > 0) {
                removedList[0].mine = true;
            }
        }

        this.updateValues();

    };

    this.updateValues = function () {
        var self = this;

        //count mines touching each square and update
        this.each(function(s, w, h) {
            if (s.mine) {
                return;
            }

            var count = 0;
            count += self.square(w - 1, h) && self.square(w - 1, h).mine ? 1 : 0;
            count += self.square(w + 1, h) && self.square(w + 1, h).mine ? 1 : 0;
            count += self.square(w, h - 1) && self.square(w, h - 1).mine ? 1 : 0;
            count += self.square(w, h + 1) && self.square(w, h + 1).mine ? 1 : 0;

            count += self.square(w + 1, h + 1) && self.square(w + 1, h + 1).mine ? 1 : 0;
            count += self.square(w - 1, h - 1) && self.square(w - 1, h - 1).mine ? 1 : 0;
            count += self.square(w + 1, h - 1) && self.square(w + 1, h - 1).mine ? 1 : 0;
            count += self.square(w - 1, h + 1) && self.square(w - 1, h + 1).mine ? 1 : 0;

            s.value = count;
        });
    };

    this.each = function(predicate) {
        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                predicate(this.board[y][x], y, x);
            }
        }
    };

    this.open = function (r, c) {

        if (!this.active) {
            return;
        }

        var s = this.square(r, c);

        if (!s) {
            return;
        }
        
        if (s.open) {
            //already opened
            return;
        }

        s.open = true;

        if (s.mine) {
            //boom!
            this.active = false;
            return;
        }

        //if this is a zero, open all touching squares recursively
        //since open checks validity, just try each direction
        if (s.value == 0) {
            this.open(r - 1, c);
            this.open(r + 1, c);
            this.open(r, c - 1);
            this.open(r, c + 1);

            this.open(r + 1, c + 1);
            this.open(r - 1, c - 1);
            this.open(r + 1, c - 1);
            this.open(r - 1, c + 1);
        }

    };
	
	this.flag = function (r, c) {
		if (!this.active) {
            return;
        }

        var s = this.square(r, c);

        if (!s) {
            return;
        }
        
        if (s.open) {
            //already opened
            return;
        }
		
		s.flagged = true;
	}
	
	this.mark = function (r, c) {
		if (!this.active) {
            return;
        }

        var s = this.square(r, c);

        if (!s) {
            return;
        }
        
        if (s.open) {
            //already opened
            return;
        }
		
		s.marked = true;
	}

    this.reset = function() {
        this.active = true;
        this.setBoard();
    };

    this.getBoard = function() {
        // return an array of available information, empty string for unknown squares? or use internal enum types

        var b = [];

        for (var w = 0; w < this.rows; w++) {
            b[w] = [];
            for (var h = 0; h < this.columns; h++) {
                if (this.board[w][h].open) {
					if(this.board[w][h].mine) {
						b[w][h] = 'X';
					} else {
						b[w][h] = this.board[w][h].value;
					}
                } else {
					if(this.board[w][h].flagged) {
						b[w][h] = 'F';
					} else if(this.board[w][h].marked) {
						b[w][h] = '?';
					} else {
						b[w][h] = '';
					}
                }
            }
        }

        return b;
    }

    this.square = function(r, c) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.columns) {
            return this.board[r][c];
        }
        return null;
    };

    this.createSquare = function() {
        return {
            open: false,
            flagged: false,
			marked: false,
            mine: false,
            value: 0
        };
    }
	
	this.clear = function() {
        for (var h = 0; h < this.height; h++) {
            for (var w = 0; w < this.width; w++) {
                this.board[w][h].open = true;
            }
        }
    };

    /* debug */

    this.log = function () {
        var row = -1;
        var rowString = '';
        this.each(function (s, r, c) {
            if (row == -1 || row != r) {
               
                if (rowString) {
                    console.log(String.fromCharCode(row + 65) + ':' + rowString);
                }
                rowString = '';
                row = r;
            }

            if (s.mine) {
                rowString += ' X';
            } else {
                rowString += ' ' + s.value;
            }
        });
        if (rowString) {
            console.log(String.fromCharCode(row + 65) + ':' + rowString);
        }
    };

    this.init(_rows, _columns, _mines);
}