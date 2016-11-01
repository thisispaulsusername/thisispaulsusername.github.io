class Bishop extends Piece {

	/**
	 * Get the Bishop's moves
	 * @param {String[]} occupiedSquares - the squares that are currently occupied, array entries are piece names (eg wP3)
	 * @return {number[][]} moves - the moves of the Bishop as an array of co-ordinates (also an array)
	 */

	moves() {
		var moves = [];

		var file = this._file;
		var rank = this._rank;

		moves = this.moveOneWay(file, rank, -1, -1, moves, false);
		moves = this.moveOneWay(file, rank, -1, +1, moves, false);
		moves = this.moveOneWay(file, rank, +1, -1, moves, false);
		moves = this.moveOneWay(file, rank, +1, +1, moves, false);

		return moves;
	}

	/**
	 * Get the squares that the Bishop protects
	 * @param {String[]} occupiedSquares - the squares that are currently occupied, array entries are piece names (eg wP3)
	 * @return {number[][]} protectedSquares - the squares that the Bishop protects as an array of co-ordinates (also an array)
	 */

	protectedSquares() {
		var protectedSquares = [];

		var file = this._file;
		var rank = this._rank;

		protectedSquares = this.moveOneWay(file, rank, -1, -1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, -1, +1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, +1, -1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, +1, +1, protectedSquares, true);

		return protectedSquares;
	}
}
