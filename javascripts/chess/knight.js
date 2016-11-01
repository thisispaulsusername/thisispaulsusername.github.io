class Knight extends Piece {

	/**
	 * Get the Knight's moves
	 * @return {number[][]} moves - the moves of the Knight as an array of co-ordinates (also an array)
	 */

 	moves() {
 		var color = this._color
 		var file = this._file;
 		var rank = this._rank;
 		var possibleMoves = [ [file - 1, rank + 2], [file + 1, rank + 2], 
 							  [file - 2, rank + 1], [file + 2, rank + 1],                       
 							  [file - 2, rank - 1], [file + 2, rank - 1], 
 							  [file - 1, rank - 2], [file + 1, rank - 2] ];

		var moves = possibleMoves.filter(function(square) {
			return square[0] > 0 && square[0] < 9 && square[1] > 0 && square[1] < 9 && 
			(!occupiedSquares[squareToIndex([square[0], square[1]]) - 1] || occupiedSquares[squareToIndex([square[0], square[1]]) - 1][0] !== color);
		});

		return moves;
 	}

 	/**
	 * Get the squares that the Knight protects
	 * @return {number[][]} protectedSquares - the squares that the Knight protects as an array of co-ordinates (also an array)
	 */

 	protectedSquares() {
 		var color = this._color
 		var file = this._file;
 		var rank = this._rank;
 		var possibleMoves = [ [file - 1, rank + 2], [file + 1, rank + 2], 
 							  [file - 2, rank + 1], [file + 2, rank + 1],                       
 							  [file - 2, rank - 1], [file + 2, rank - 1], 
 							  [file - 1, rank - 2], [file + 1, rank - 2] ];

		var protectedSquares = possibleMoves.filter(function(square) {
			return square[0] > 0 && square[0] < 9 && square[1] > 0 && square[1] < 9;
		});

		return protectedSquares;
 	}
}
