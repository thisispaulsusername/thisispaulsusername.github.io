class King extends Piece {
	
	// TODO:
	// castling: king cannot castle while in check, cannot castle through check
	// check if the piece is in check
	// check if castling will put the piece in check
	// restrict move if move would place the king in check

	/*
	 * Creates a king of the given color at the given location
	 * @param {string} color - The color of the king: white || black
	 * @param {number} file - file rank of the king: 1 - 8
	 * @param {number} rank - the rank of the king: 1 - 8
	 * @param {boolean} hasMoved - whether or not the king has moved (used for checking if castling is possible)
	 */

	constructor(color, file, rank, id, hasMoved) {
		super(color, file, rank, id)
		this._hasMoved = hasMoved;
	}

	/**
	 * Get the King's moves
	 * @return {number[][]} moves - the moves of the King as an array of co-ordinates (also an array)
	 */

 	moves(occupiedSquares) {
 		var color = this._color;
 		var file = this._file;
 		var rank = this._rank;
 		var hasMoved = this._hasMoved;
 		var possibleMoves = [ [file - 1, rank + 1], [file, rank + 1], [file + 1, rank + 1], 
 							  [file - 1, rank],                       [file + 1, rank], 
 							  [file - 1, rank - 1], [file, rank - 1], [file + 1, rank - 1] ];

		var moves = possibleMoves.filter(function(square){
			return square[0] > 0 && square[0] < 9 && square[1] > 0 && square[1] < 9 && 
			(!occupiedSquares[squareToIndex([square[0], square[1]]) - 1] || occupiedSquares[squareToIndex([square[0], square[1]]) - 1][0] !== color);			
		});

		// queenside castling
		if (!hasMoved && allPieces[color+'R'][0] && !allPieces[color+'R'][0].hasMoved && !occupiedSquares[squareToIndex([file - 1, rank]) - 1] && !occupiedSquares[squareToIndex([file - 2, rank]) - 1]) {
			moves.push([file - 2, rank]);
		}

		// kingside castling
		if (!hasMoved && allPieces[color+'R'][1] && !allPieces[color+'R'][1].hasMoved && !occupiedSquares[squareToIndex([file + 1, rank]) - 1] && !occupiedSquares[squareToIndex([file + 2, rank]) - 1]) {
			moves.push([file + 2, rank]);
		}

		return moves;
 	}

 	/**
 	 * Get whether the king has moved
 	 */

 	get hasMoved() {
		return this._hasMoved;
	}

 	/**
 	 * Keep track of whether the king has moved
 	 */

 	set hasMoved(hasMoved) {
		this._hasMoved = hasMoved;
	}
}
