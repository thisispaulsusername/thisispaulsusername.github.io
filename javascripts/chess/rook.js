class Rook extends Piece {

	/*
	 * Creates a rook of the given color at the given location
	 * @param {string} color - The color of the rook: white || black
	 * @param {number} file - file rank of the rook: 1 - 8
	 * @param {number} rank - the rank of the rook: 1 - 8
	 * @param {boolean} hasMoved - whether or not the rook has moved (used for checking if castling is possible)
	 */

	constructor(color, file, rank, id, hasMoved) {
		super(color, file, rank, id)
		this._hasMoved = hasMoved;
	}

	hasMoved() {
		return this._hasMoved;
	}

	/**
	 * Get the Rook's moves
	 * @param {String[]} occupiedSquares - the squares that are currently occupied, array entries are piece names (eg wP3)
	 * @return {number[][]} moves - the moves of the Rook as an array of co-ordinates (also an array)
	 */

	moves() {
		var moves = [];
		var file = this._file;
		var rank = this._rank;

		moves = this.moveOneWay(file, rank, -1, 0, moves, false);
		moves = this.moveOneWay(file, rank, +1, 0, moves, false);
		moves = this.moveOneWay(file, rank, 0, -1, moves, false);
		moves = this.moveOneWay(file, rank, 0, +1, moves, false);

		return moves;
	}

	/**
	 * Get the squares that the Rook protects
	 * @param {String[]} occupiedSquares - the squares that are currently occupied, array entries are piece names (eg wP3)
	 * @return {number[][]} protectedSquares - the squares that the Rook protects as an array of co-ordinates (also an array)
	 */

	protectedSquares() {
		var protectedSquares = [];
		var file = this._file;
		var rank = this._rank;

		protectedSquares = this.moveOneWay(file, rank, -1, 0, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, +1, 0, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, 0, -1, protectedSquares, true);
		protectedSquares = this.moveOneWay(file, rank, 0, +1, protectedSquares, true);

		return protectedSquares;
	}

	/**
 	 * Get whether the rook has moved
 	 */

 	get hasMoved() {
		return this._hasMoved;
	}

 	/**
 	 * Keep track of whether the rook has moved
 	 */

 	set hasMoved(hasMoved) {
		this._hasMoved = hasMoved;
	}
}
