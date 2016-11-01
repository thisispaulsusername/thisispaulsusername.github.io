class Queen extends Piece {

	/**
	 * Get the Queen's moves
	 * @param {String[]} occupiedSquares - the squares that are currently occupied, array entries are piece names (eg wP3)
	 * @return {number[][]} moves - the moves of the Queen as an array of co-ordinates (also an array)
	 */

	moves() {
		var moves = [];
		var file = this._file;
		var rank = this._rank;

		moves = this.moveOneWay(file, rank, -1, 0, moves, false);
		moves = this.moveOneWay(file, rank, +1, 0, moves, false);
		moves = this.moveOneWay(file, rank, 0, -1, moves, false);
		moves = this.moveOneWay(file, rank, 0, +1, moves, false);
		moves = this.moveOneWay(file, rank, -1, -1, moves, false);
		moves = this.moveOneWay(file, rank, -1, +1, moves, false);
		moves = this.moveOneWay(file, rank, +1, -1, moves, false);
		moves = this.moveOneWay(file, rank, +1, +1, moves, false);

		return moves;
	}

	/**
	 * Get the squares that the Queen protects
	 * @param {String[]} occupiedSquares - the squares that are currently occupied, array entries are piece names (eg wP3)
	 * @return {number[][]} protectedSquares - the squares that the Queen protects as an array of co-ordinates (also an array)
	 */

	protectedSquares() {
		var protectedSquares = [];
		var file = this._file;
		var rank = this._rank;

		protectedSquares = this.moveOneWay(file, rank, -1, 0, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, +1, 0, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, 0, -1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, 0, +1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, -1, -1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, -1, +1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, +1, -1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, +1, +1, protectedSquares, true);

		return protectedSquares;
	}
}
