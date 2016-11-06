/**
 * TODOs
 *
 * Logic:
 * - captured piece moves after being captured (wR0 captured by bQ1)
 *
 * Check:
 * - pawn promotion
 *
 * Visaul:
 * - Can still see orange/red outlines after piece has moved off square when board is smaller, "solved" this by fixing board size
 *
*/

var allPieces;
var occupiedSquares;
var enPassantPawn;
var attackedSquares = new Set();

// the two players' colors
var colors = ['w', 'b'];
var colorAbbreviations = {'w' : 'White', 'b' : 'Black'};

// square colors
var dark = '#555';
var light = '#999';
var clicked = "orange";
var highlightedDark = "Green";
var highlightedLight = "lime";

$(document).ready(function() {

	// want element to still take up space on page, so don't use hide
	$('.moves-display').css('visibility', 'hidden');

	var $board = $('#chessboard');
	var delay = 0;

	// TODO: what if height !== width?
	// visual/layout variables
	var height = parseInt($board.css('height'));
	var width = parseInt($board.css('width'));
	var squareSize = height / 10;
	var lineWidth = height / 100;

	var markedSquares = new Set();

	var board = $board[0];
	var ctx = board.getContext('2d');
	var files = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', ''];
	var ranks = ['', '1', '2', '3', '4', '5', '6', '7', '8', ''];

	// game/logic variables

	// display the number of moves
	// TODO: maybe later, algebraic notation can be displayed
	var moveCounter = 0;

	// used for checking 50-move draw rule
	var drawMoveCounter;

	var lastMove = {};	

	var pieceNames = {'B' : 'Bishop', 'N' : 'Knight', 'K' : 'King', 'P' : 'Pawn', 'Q' : 'Queen', 'R' : 'Rook'};
	var pieceAbbreviations = {'Bishop' : 'B', 'Knight' : 'N', 'King' : 'K', 'Pawn' : 'P', 'Queen' : 'Q', 'Rook' : 'R'};
	var pieceCount = {'B': 2, 'N': 2, 'K': 1, 'P': 8, 'Q': 1, 'R': 2};

	// https://en.wikipedia.org/wiki/Chess_symbols_in_Unicode
	var pieceSymbols = {'bB': '♝', 'bN': '♞', 'bK': '♚', 'bP': '♟', 'bQ': '♛', 'bR': '♜', 'wB': '♗', 'wN': '♘', 'wK': '♔', 'wP': '♙', 'wQ': '♕', 'wR': '♖'};

	// // kings and queens have arrays of length 1 for convenience in later methods
	var pieceStartingPositions = {'wB' : [[3, 1], [6, 1]],
									  'wN' : [[2, 1], [7, 1]],
									  'wK' : [[5, 1]],
									  'wP' : [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2]],
									  'wQ' : [[4, 1]],
									  'wR' : [[1, 1], [8, 1]],
									  'bB' : [[3, 8], [6, 8]],
									  'bN' : [[2, 8], [7, 8]],
									  'bK' : [[5, 8]],
									  'bP' : [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7]],
									  'bQ' : [[4, 8]],
									  'bR' : [[1, 8], [8, 8]]
									};


	// remove pieces for testing purposes
	// var pieceCount = {'B': 2, 'N': 2, 'K': 1, 'P': 8, 'Q': 1, 'R': 2};
	// var pieceNames = {'K' : 'King', 'P' : 'Pawn', 'R' : 'Rook'};

	// var pieceStartingPositions = {'wB' : [[3, 1], [6, 1]],
	// 								  'wN' : [[2, 1], [7, 1]],
	// 								  'wK' : [[5, 1]],
	// 								  'wP' : [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2]],
	// 								  'wQ' : [[4, 1]],
	// 								  'wR' : [[1, 1], [8, 1]],
	// 								  'bB' : [[3, 8], [6, 8]],
	// 								  'bN' : [[2, 8], [7, 8]],
	// 								  'bK' : [[5, 8]],
	// 								  'bP' : [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7]],
	// 								  'bQ' : [[4, 8]],
	// 								  'bR' : [[1, 8], [8, 8]]
									// };

	// represent all pieces as entries in arrays for dynamic access (kings could have been single entry)
	allPieces = {'wB' : [], 'wN' : [], 'wK' : [], 'wP' : [], 'wQ' : [], 'wR' : [], 'bB' : [], 'bN' : [], 'bK' : [], 'bP' : [], 'bQ' : [], 'bR' : [] };

	var whiteDown = true;
	var humanTurn;
	var whiteToMove = true;

	var markedSquares = new Set();
	var boardStrings;

	newGame();
	ctx.fillStyle = "#FFF";

	$('.btn').on('click', function() {
		$('.radio-piece').each(function() {
			var selection = $(this).parent().find('input');
			var piece = selection.val();
			if ($('#radio-white').is(':checked') || $('#radio-human').is(':checked')) {
				whiteDown = true;
				$(this).parent().find('label').html(pieceSymbols['w' + piece] + " " + pieceNames[piece]); // TODO: what color should the pieces be if no comp?
			}
			else {
				whiteDown = false;
				$(this).parent().find('label').html(pieceSymbols['b' + piece] + " " + pieceNames[piece]);
			}
		});
		// turn off click events bound to the board before starting a new game
		$board.off('click');
		newGame();
	});

	$(window).on('resize', function() {
		height = parseInt($board.css('height'));
		squareSize = height / 10;
		lineWidth = height / 100;
		drawBoard();
	});

	/**
	 * Starts a new game
	 */

	function newGame() {
		lastMove = {};
		moveCounter = 0;
		drawMoveCounter = 0;
		$('.moves-display').css('visibility', 'visible');
		$('#move-counter').html(moveCounter);
		initializePieces();
		drawBoard();
		boardStrings = [];
		move('w', 'b', $('#radio-human').is(':checked'));
	}

	/**
	 * Initializes all the pieces 
	 */

	function initializePieces() {

		// reset allPieces object
		for (var key in allPieces) {
			allPieces[key] = [];
		}
 		for (var color in colors) {
			for (var pn in pieceNames) {
				var colorAndPiece = colors[color] + pn;
				for (var pc = 0; pc < pieceCount[pn]; pc++) {
					var file = pieceStartingPositions[colorAndPiece][pc][0];
					var rank = pieceStartingPositions[colorAndPiece][pc][1];
					addPiece(colorAndPiece, file, rank, pc, false);
				}
			}
		}
	}

	/**
	 * adds a piece to the allPieces object
	 * @param {String} colorAndPiece - the color and piece of the piece ie: wB = white bishop
	 * @param {number} file - the file of the new piece
	 * @param {number} rank - the rank of the new piece
	 * @param {number} id - the id of the new piece
	 * @param {boolean} hasMoved - whether the piece has moved or not (used to check if castling is allowed)
	 */

	function addPiece(colorAndPiece, file, rank, id, hasMoved) {
		var color = colorAndPiece[0];
		var piece = colorAndPiece[1];
		switch (piece) {
			case 'B':
				allPieces[colorAndPiece].push(new Bishop(color, piece, file, rank, id));
				break;
			case 'N':
				allPieces[colorAndPiece].push(new Knight(color, piece, file, rank, id));
				break;
			case 'K':
				allPieces[colorAndPiece].push(new King(color, piece, file, rank, id, hasMoved));
				break;
			case 'P':
				allPieces[colorAndPiece].push(new Pawn(color, piece, file, rank, id));
				break;
			case 'Q':
				allPieces[colorAndPiece].push(new Queen(color, piece, file, rank, id));
				break;
			case 'R':
				allPieces[colorAndPiece].push(new Rook(color, piece, file, rank, id, hasMoved));
				break;
		}
	}

	/**
	 * Draw the board
	 */

	function drawBoard() {

		// redraw border to overwrite existing text
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, squareSize * 10, squareSize * 10);

		ctx.textAlign = "center";
		ctx.textBaseline = "middle"; 
		ctx.font = "20px serif";

		for (var r = 0; r < 10; r++) {
			for (var f = 0; f < 10; f++) {

				var fileIndex = whiteDown ? f : 9 - f;
				var rankIndex = whiteDown ? 9 - r : r;

				// rank falls off the board, write the file name
				if (r === 0 || r === 9) {
					ctx.fillStyle = "#FFF";
					ctx.fillText(files[fileIndex], (f + 0.5) * squareSize, (r + 0.5) * squareSize);
				}

				// file falls off the board, write the rank name
				else if (f === 0 || f === 9) {
					ctx.fillStyle = "#FFF";
					ctx.fillText(ranks[rankIndex], (f + 0.5) * squareSize, (r + 0.5) * squareSize);
				}

				// draw square
				else {
					if ((f + r) % 2 === 1) {
						ctx.fillStyle = dark;
					}
					else {
						ctx.fillStyle = light;
					}
					ctx.fillRect(f * squareSize, r * squareSize, squareSize, squareSize);
				}
			}
		}
		drawPieces();
	}

	/**
	 * Draws the pieces on the board
	 */

	function drawPieces() {
		occupiedSquares = Array(64); // reset the occupied squares if it is a new game
		for (var pieceType in allPieces) {
			var pieces = allPieces[pieceType];
			for (var i in pieces) {
				var piece = pieces[i];
				var file = piece._file;
				var rank = piece.rank;
				var index = squareToIndex([file, rank]);
				occupiedSquares[index - 1] = pieceType + i;
				var symbol = pieceSymbols[pieceType];
				drawOnSquare(file, rank, symbol, pieceType[0]);
			}
		}
	}

	/**
	 * Generates or listens for a move
	 * @param {String} currentColor - the color of the piece being moved: 'w' or 'b'
	 * @param {String} opponentColor - the color of the opponenet's pieces: 'w' or 'b'
	 * @param {Boolean} noComp - play human vs human
	 */

	function move(currentColor, opponentColor, noComp) {

		if (lastMove['oldSquare']) {
			drawLastMove(lastMove, opponentColor, false);
		}

		var boardString = getBoardString();
		
		boardStrings.push(boardString);

		// used in king.js for getting legal king moves
		attackedSquares = getAttackedSquares(opponentColor);

		var checkingPieces = inCheck(currentColor, opponentColor);

		// if the king is in check, it might be checkmate
		if (checkingPieces.length) {
			if (checkCheckmate(currentColor, opponentColor, checkingPieces)) {
				return;
			}
		}

		if (checkDraw(currentColor)) {
			return;
		}

		$('#turn').html(colorAbbreviations[currentColor] + " to move");

		// if human is moving, allow him/her to move
		if (whiteDown && currentColor === 'w' || !whiteDown && currentColor === 'b' || noComp) {
		
			humanTurn = true;

			inCheck(currentColor, opponentColor);

			var fromTo = [];
			var legalMoves = [];
			var selectedPiece = '';
			$board.on('click', function(e) {

				var x0 = e.offsetX;
				var y0 = e.offsetY;

				if (x0 > squareSize && y0 > squareSize && x0 < 9 * squareSize && y0 < 9 * squareSize) {
					var square = getSquare(x0, y0);
					var index = squareToIndex(square);	

					fromTo.push(index); 		

					// if the two clicked squares represent a valid move, move the piece
					if (legalMoves.indexOf(index) !== -1) {

						var nextMove =  {'piece' : selectedPiece.slice(0, 2), 'id' : selectedPiece[2], 'move' : square};
						movePiece(nextMove);

						if (lastMove['oldSquare']) {
							drawLastMove(lastMove, opponentColor, true);
						}

						lastMove['oldSquare'] = indexToSquare(fromTo[0]);
						lastMove['newSquare'] = indexToSquare(fromTo[1]);
						lastMove['piece'] = selectedPiece;

						fromTo = [];

						// update move counters (for display and draw checking)
						updateMoves(currentColor);						

						// prevent multiple click events being bound to the board.
						$(this).off(e);

						// recolor square when king is out of check
						inCheck(currentColor, opponentColor);

						move(opponentColor, currentColor, noComp);
					}

					// reset the move sequence if it is invalid
					else if (fromTo.length === 2) {
						for (var s in fromTo) {
							redrawSquare(fromTo[s]);
						}
						fromTo = [];
						legalMoves = [];
					}

					// the piece in the first square the user clicked
					else {
						selectedPiece = occupiedSquares[index - 1];
					}

					// if the clicked square has a piece of the correct color in it, get its moves
					if (selectedPiece && selectedPiece[0] === currentColor && fromTo.length === 1) {
						ctx.beginPath();
						var c = getCoordinates(square[0], square[1]);
						ctx.rect(c[0] + lineWidth/2, c[1] + lineWidth/2, squareSize - lineWidth, squareSize - lineWidth);			
						ctx.lineWidth = lineWidth;
						ctx.strokeStyle = clicked;
						ctx.stroke();
						ctx.closePath();
						var pieceName = selectedPiece.slice(0, 2);
						var id = selectedPiece[2]; // only need one digit since id can never be greater than 9 (8 pawns promoted to B/N/R)
						var index = findPieceIndex(pieceName, id);
						
						// if the king is not in check
						if (!checkingPieces.length) {
							legalMoves = allPieces[pieceName][index].moves().map(squareToIndex);
						}

						// the king is in check, restricting the moves of other pieces
						else {
							legalMoves = getLegalMoves(checkingPieces, selectedPiece);
						}
					}	

					// reset move to empty array so that the next click will be the "from" part of the move
					else {
						fromTo = [];
					}
				}
			});
		}

		// if computer is moving, pick a random move
		else {

			humanTurn = false;

			// construct array of possible moves
			var moves = [];
			for (pieceTypes in allPieces) {
				var pieceType = pieceTypes[1];

				// only get moves from the correct color of pieces
				if (pieceTypes[0] === currentColor) {
					var pieceArray = allPieces[pieceTypes];
					for (var piece in pieceArray) {

						var pieceMoves;

						if (!checkingPieces.length) {
							pieceMoves = pieceArray[piece].moves();
						}

						else {
							var selectedPiece = currentColor + pieceArray[piece].abbr + pieceArray[piece].id;
							pieceMoves = getLegalMoves(checkingPieces, selectedPiece).map(indexToSquare);
						}

						for (var i in pieceMoves) {
							var m =  {'piece' : pieceTypes, 'id' : pieceArray[piece].id, 'move' : pieceMoves[i]};
							moves.push(m);
						}
					}
				}
			}
			var numMoves = moves.length;

			if (!numMoves && inCheck(currentColor, opponentColor).length) {
				$('#turn').html("Checkmate! " + colorAbbreviations[opponentColor] + " wins!");
				drawCheckSquare(currentColor, false); // make the square the normal color
				return;			
			}

			var r = Math.floor(Math.random() * numMoves);

			var compMove = moves[r];
			var piece = compMove.piece;
			var pieceObject = allPieces[piece][findPieceIndex(piece, compMove.id)];
			if (lastMove['oldSquare']) {
				drawLastMove(lastMove, opponentColor, true);
			}
			lastMove = {'oldSquare' : [pieceObject.file, pieceObject.rank] , 'newSquare' : compMove.move, 'piece' : piece + compMove.id};
			var pieceType = piece[1];

			// movePiece checks whether a king or rook has moved. This should be done after checking for castling
			movePiece(moves[r]);

			updateMoves(currentColor);

			inCheck(currentColor, opponentColor);

			// setTimeout(function() { movePiece(moves[r]) }, delay);
			move(opponentColor, currentColor, false);
		}
	}

	/**
	 * Moves a piece on the board
	 * @param {object} move - an object consisting of the piece, its id (an int) and the square to move to
	 */

	function movePiece(move) {

		var color = move.piece[0];
		var piece = move.piece;
		var id = move.id;
		var newSquare = move.move
		var newIndex = squareToIndex(newSquare);
		var file = newSquare[0];
		var rank = newSquare[1];

		// pawn moves reset the fifty-move rule counter
		if (piece[1] === 'P') {
			drawMoveCounter = 0;
		}

		if (occupiedSquares[newIndex - 1]) {
			capturePiece(occupiedSquares[newIndex  - 1], newSquare);
		}

		var symbol = pieceSymbols[piece];

		drawOnSquare(file, rank, symbol, color);

		var index = findPieceIndex(piece, id);

		var oldFile = allPieces[piece][index].file;
		var oldRank = allPieces[piece][index].rank;
		var oldSquare = [oldFile, oldRank];
		var oldIndex = squareToIndex(oldSquare);

		if (piece[1] === 'K' && Math.abs(file - oldFile) === 2) {
			castle(newSquare);
		}

		allPieces[piece][index].file = newSquare[0];
		allPieces[piece][index].rank = newSquare[1];

		// the piece is a king or rook, record the fact that it has moved
		if (piece[1] === 'K' || piece[1] === 'R') {
			allPieces[piece][index].hasMoved = true;
		}

		occupiedSquares[oldIndex - 1] = null;
		occupiedSquares[newIndex - 1] = piece + id;

		// capture was en passant
		if (piece[1] === 'P' && enPassantPawn) {

			// need to specify color otherwise consecutive two-square pawn moves trigger a capture (eg: e4 followed by e5 captures the e4 pawn)
			if (color === 'w' && occupiedSquares[newIndex - 9] === enPassantPawn) {
				capturePiece(enPassantPawn, [file, rank - 1]);
				occupiedSquares[newIndex - 9] = null;
			}
			else if (color === 'b' && occupiedSquares[newIndex + 7] === enPassantPawn) {
				capturePiece(enPassantPawn, [file, rank + 1]);
				occupiedSquares[newIndex + 7] = null;
			}
		}

		// if a pawn moves two squares, make it able to be captured en passant
		if (piece[1] === 'P' && Math.abs(rank - oldRank) === 2) {
			enPassantPawn = piece  + id;
		}
		else {
			enPassantPawn = null;
		}

		// the piece is a pawn that has reached the last rank
		if (piece[1] === 'P' && (newSquare[1] === 8 || newSquare[1] === 1)) {
			promote(piece, index, newIndex, newSquare);
		}

		// piece and id are incorrect if there was not a pawn promotion
		// TODO: refactor so that this else isn't necessary
		else {
			occupiedSquares[newIndex - 1] = piece + id;
		}
		drawOverPiece(oldSquare);
	}

	/** Promotes a pawn to a non-king piece (B, N, Q, R)
	 * @param {string} piece - the color and type of the piece
	 * @param {number} pieceIndex - the index of the piece in its corresponding array
	 * @param {number} newIndex - the index of the square the pawn is moving to
	 * @param {number[]} newSquare - the square the pawn is moving to
	 */

	function promote(piece, pieceIndex, newIndex, newSquare) {

		// newIndex is calculated using 1-indexing, it is only used for array accesses in this function
		newIndex--;
		var color = piece[0];
		var file = newSquare[0];
		var rank = newSquare[1];
		if (humanTurn) {
			var pieceName = $('input[name=piece]:checked').val();
		}
		else {
			var pieces = ['B', 'N', 'Q', 'R'];
			var pieceName = pieces[Math.floor(Math.random() * pieces.length)];
		}
		var newPiece = color + pieceName;
		var index = allPieces[newPiece].length > 0 ? allPieces[newPiece][allPieces[newPiece].length - 1].id + 1 : allPieces[newPiece].length;
		var symbol = pieceSymbols[newPiece];
		drawOverPiece(newSquare);
		drawOnSquare(file, rank, symbol, newPiece[0]);
		addPiece(newPiece, file, rank, index, true);
		allPieces[piece].splice(pieceIndex, 1);
		var pieceId = newPiece + index;
		occupiedSquares[newIndex] = pieceId;
		boardStrings = [];
	}

	/**
	 * Moves a rook as part of castling
	 * @param {number[]} kingSquare - the file and rank of the king's move
	 */
	function castle(kingSquare) {

		var kingFile = kingSquare[0];
		var kingRank = kingSquare[1];
		if ((kingFile !== 3 && kingFile !== 7) || (kingRank !== 1 && kingRank !== 8)) return;

		// queenside castling
		if (kingFile === 3) {

			// white
			if (kingRank === 1) {
				var rookMove = {'piece' : 'wR', 'id' : 0, 'move' : [4, 1]};
			}

			// black
			else if (kingRank === 8) {
				var rookMove = {'piece' : 'bR', 'id' : 0, 'move' : [4, 8]};
			}

			movePiece(rookMove);
		}

		// kingside castling
		else if (kingFile === 7) {

			// white
			if (kingRank === 1) {
				var rookMove = {'piece' : 'wR', 'id' : 1, 'move' : [6, 1]};
			}

			// black
			else if (kingRank === 8) {
				var rookMove = {'piece' : 'bR', 'id' : 1, 'move' : [6, 8]};
			}

			movePiece(rookMove);
		}
	}

	/**
	 * Creates a new set of indices corresponding to the squares that a color is attacking
	 * @param {String} color - the color of the pieces for which this is calculated
	 * @return {number[]} attackedSquares - the squares that are being attacked
	 */

	function getAttackedSquares(color) {
		var attackedSquares = new Set();
		for (var pieceType in allPieces) {
			if (pieceType[0] === color) {
				var pieceArray = allPieces[pieceType];
				for (var piece in pieceArray) {
					var pieceMoves = pieceArray[piece].protectedSquares();
					for (var i in pieceMoves) {
						attackedSquares.add(squareToIndex(pieceMoves[i]));
					}
				}
			}	
		}
		return attackedSquares;
	}

	/**
	 * Finds all pieces of a given color that are attacking a given square
	 * @param {String} color - the color of the pieces to return
	 * @param {number} squareIndex - the index of the square for which the attacking pieces are desired
	 * @return {number[]} attackingPieces - the pices that are attacking the square
	 */

	function getAttackingPieces(color, squareIndex) {
		var attackingPieces = [];
		for (var pieceType in allPieces) {
			if (pieceType[0] === color) {
				var pieceArray = allPieces[pieceType];
				for (var piece in pieceArray) {
					var pieceMoves = pieceArray[piece].moves();
					for (var i in pieceMoves) {
						if (squareToIndex(pieceMoves[i]) === squareIndex) {
							attackingPieces.push(color + pieceArray[piece].abbr + pieceArray[piece].id);
						}
					}
				}
			}
		}
		return attackingPieces;
	}

	/**
	 * Checks whether the king of the defending color is in check and returns the pieces
	 * @param {String} color - the color of the king to check whether it is in check
	 * @return {String} attackingPieces - the piece(s) that is/are delivering check
	 */

	function inCheck(defendingColor, attackingColor) {
		var king = allPieces[defendingColor + 'K'][0];
		var kingIndex = squareToIndex([king.file, king.rank]);
		var attackingPieces = getAttackingPieces(attackingColor, kingIndex);
		if (attackingPieces.length) {
			drawCheckSquare(defendingColor, true);
		}

		else {
			drawCheckSquare(defendingColor, false);
		}
		return attackingPieces;
	}

	

	/**
	 * Removes a piece from the board and the game
	 * @param {String} pieceToCapture - the string representation (colorPieceIndex) of the piece being captured
	 * @param {number[]} square - the indices of the square of the piece being captured in the form [file, rank]
	 */

	function capturePiece(pieceToCapture, square) {

		// captures reset the fifty-move rule counter
		drawMoveCounter = 0;
		var piece = pieceToCapture.slice(0, 2);
		var id = pieceToCapture[2];
		var pieceType = allPieces[piece];
		var index = findPieceIndex(piece, id);
		pieceType.splice(index, 1);
		drawOverPiece(square);
		boardStrings = [];
	}

	/**
	 * Checks to see if the game is a draw
	 * @param {string} color - the color for which to check (used in checkStalemate)
	 * @return {boolean} - whether the game is a draw
	 */

	function checkDraw(color) {
		if (!checkMatingMaterial() || checkDrawRep() || checkDraw50() || checkStalemate(color)) {
			return true;
		}
		return false;
	}

	/**
	 * Checks to see if the game is a draw by insufficient mating material.
	 * Material is based on whether a checkmate is possible and not whehter a forced checkmate is possible.
	 * Some examples of winnable games:
	 * 2 N + K vs K
	 * 1B + K vs 1B + K (provided that the bishops have opposite colors)
	 * Some example of drawn games:
	 * 1-8 B + K vs K + 1-8 B (provided that all bishops have the same colors)
	 * 1N + K vs 1N + K
	 * @return {boolean} - whether or not there is enough material to a plater to checkmate
	 */

	function checkMatingMaterial() {

		// no more major pieces or pawns
		if (allPieces['wQ'].length === 0 && allPieces['bQ'].length === 0 &&
			allPieces['wR'].length === 0 && allPieces['bR'].length === 0 &&
			allPieces['wP'].length === 0 && allPieces['bP'].length === 0) {

			for (var i = 0; i < colors.length; i++) {
				var p1 = colors[i];
				var p2 = colors[(i + 1) % 2];

				// one player has no pieces, can the other mate?
				if (!allPieces[p1 + 'B'].length && !allPieces[p1 + 'N'].length) {

					// if the other player has no knights does the other player have at least one pair of bishops with opposite colored squares
					if (!allPieces[p2 + 'N'].length && !differentColorBishops()) {
						$('#turn').html("It's a draw by insufficient mating material!");
						return false;
					}

					// only one of bishop or knight
					if (allPieces[p2 + 'B'].length + allPieces[p2 + 'N'].length < 2) {
						$('#turn').html("It's a draw by insufficient mating material!");
						return false;
					}
				}
			}

			// no knights left, are there different colored bishops?
			if (!allPieces['wN'].length && !allPieces['bN'].length) {
				if (!differentColorBishops()) {
					$('#turn').html("It's a draw by insufficient mating material!");
					return false;
				}
			}

			// no bishops left, does either player have two or more knights?
			else if (!allPieces['wB'].length && !allPieces['bB'].length) {
				return allPieces['wN'].length > 1 || allPieces['bN'].length > 1;
			}
		}
		return true;
	}

	/**
	 * Checks to see if the game is a draw by repetition
	 * @return {boolean} - whether the game is a draw
	 */

	function checkDrawRep() {
		var currBoardString = boardStrings[boardStrings.length - 1];
		var counter = 1;
		for (var i = 0; i < boardStrings.length - 1; i++) {
			if (boardStrings[i] === currBoardString) {
				counter++;
			}
			if (counter === 3) {
				$('#turn').html("It's a draw by repetition!");
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks to see if the game is a draw by the fifty-move rule
	 * @return {boolean} - whether the game is a draw
	 */

	function checkDraw50() {

		// a turn if one move from each player
		if (drawMoveCounter === 50) {
			$('#turn').html("It's a draw by the fifty-move rule!");
			return true;
		}
		return false;
	}

	/**
	 * Checks to see if the game is a draw by stalemate
	 * @param {string} color - the color to check if there are any legal moves
	 * @return {boolean} - whether the game is a draw
	 */

	function checkStalemate(color) {
		for (var pieceType in allPieces) {
			if (pieceType[0] === color) {
				var pieces = allPieces[pieceType];
				for (var i in pieces) {
					if (pieces[i].moves().length) {
						return false;
					}
				}
			}
		}
		$('#turn').html("It's a draw by stalemate!");
		return true;
	}

	/**
	 * Checks to see if a player is in checkmate
	 * @param {string} currentColor - the player who is in check
	 * @param {string} opponentColor - the player who is giving check
	 * @param {String[]} color - the pieces that are giving check
	 * @return {boolean} - whether the player is in checkmate
	 */

	function checkCheckmate(currentColor, opponentColor, checkingPieces) {
		for (var pieceType in allPieces) {
			if (pieceType[0] === currentColor) {
				var pieces = allPieces[pieceType];
				for (var j in pieces) {
					var colorAndType = pieces[j].color + pieces[j].abbr;
					var selectedPiece = colorAndType + pieces[j].id;
					if (getLegalMoves(checkingPieces, selectedPiece).length) {
						return false;
					}
				}
			}
		}
		$('#turn').html("Checkmate! " + colorAbbreviations[opponentColor] + " wins!");
		drawCheckSquare(currentColor, false); // make the square the normal color
		return true;
	}

	/**
	 * Maps the rank and file of a square to x and y co-ordinates corresponding with its offset
	 * @param {number} file - the square's file: 1 - 8
	 * @param {number} rank - the square's rank: 1 - 8
	 * @return {number[]} offset - the offset of the square in the form [x, y]
	 */

	function getCoordinates(file, rank) {
		if (whiteDown) {
			var x = file * squareSize;
			var y = (9 - rank) * squareSize;
		}
		else {
			var x = (9 - file) * squareSize;
			var y = rank * squareSize;
		}
		return [x, y];
	}

	/**
	 * Maps the x and y co-ordinates to a 8x8 grid with 1-indexing
	 * @param {number} x - e.offsetX
	 * @param {number} y - e.offsetY
	 * @return {number[]} square - the indices of the square in the form [file, rank]
	 */

	function getSquare(x, y) {
		var file = Math.floor(x/squareSize);
		var rank = Math.floor(y/squareSize);
		if (whiteDown) {
			var square = [file, 9 - rank];
		}
		else {
			var square = [9 - file, rank];
		}
		return square;
	}

	/**
	 * Highlights the two squares involved in the last move
	 * @param {object} lastMove - the last move that was played (consists of old square, new square and piece that was moved)
	 * @param {String} color - the color of the piece that was moved
	 * @param {boolean} drawOver - whether the move is drawing over a previously highlighted move (true) or is highlighting a move (false)
	 */

	function drawLastMove(lastMove, color, drawOver) {
		// console.log(lastMove);
		// console.log(pieceSymbols);
		var oldFile = lastMove['oldSquare'][0];
		var oldRank = lastMove['oldSquare'][1];
		var newFile = lastMove['newSquare'][0];
		var newRank = lastMove['newSquare'][1];
		var oldSquareCoordinates = getCoordinates(oldFile, oldRank);
		var newSquareCoordinates = getCoordinates(newFile, newRank);

		if ((oldFile + oldRank) % 2 === 0) {
			ctx.fillStyle = drawOver ? dark : highlightedDark;
		}
		else {
			ctx.fillStyle = drawOver ? light : highlightedLight;
		}
		ctx.fillRect(oldSquareCoordinates[0], oldSquareCoordinates[1], squareSize, squareSize);
		if ((newFile + newRank) % 2 === 0) {
			ctx.fillStyle = drawOver ? dark : highlightedDark;
		}
		else {
			ctx.fillStyle = drawOver ? light : highlightedLight;
		}
		ctx.fillRect(newSquareCoordinates[0], newSquareCoordinates[1], squareSize, squareSize);



		// else {
		// 	ctx.fillStyle = highlighted;
		// 	ctx.fillRect(oldSquareCoordinates[0], oldSquareCoordinates[1], squareSize, squareSize);
		// 	ctx.fillRect(newSquareCoordinates[0], newSquareCoordinates[1], squareSize, squareSize);
		// }
		var piece = lastMove.piece.slice(0, 2);
		var id = lastMove.piece[2];

		// TODO: clean up this ternary and if statement

		// write an empty string instead of the piece symbol if the piece is being captured but is not on the square that the new piece is moving to (en passant)
		var symbol = allPieces[piece][findPieceIndex(piece, id)] ? pieceSymbols[piece] : '';

		// pawn that has reached the last rank
		if (piece === 'wP' && newRank === 8 || piece === 'bP' && newRank === 1) {
			symbol = pieceSymbols[occupiedSquares[squareToIndex([newFile, newRank]) - 1].slice(0, 2)];
		}

		drawOnSquare(newFile, newRank, symbol, color)
	}

	/**
	 * Draws on the square at the given co-ordinates
	 * @param {number} file - the square's file: 1 - 8
	 * @param {number} rank - the square's rank: 1 - 8
	 * @param {String} symbol - what to draw on the square
	 * @param {String} color - the piece's color: w or b
	 */

	function drawOnSquare(file, rank, symbol, color) {
		if (color === 'w') {
			ctx.fillStyle = "#FFF";
		}
		else {
			ctx.fillStyle = "#000";
		}
		var coordinates = getCoordinates(file, rank);
		ctx.font = squareSize + "px serif";
		ctx.fillText(symbol, coordinates[0] + (0.5 * squareSize), coordinates[1] + (0.5 * squareSize));
	}

	/**
	 * Draws a square and accounts for issues that may arrise by using floating-point values
	 * @param {number[]} coordinates - the top left corner of the rectangle
	 * @param {number} squareSize - the height and width of the square
	 */

	function drawSquare(coordinates, squareSize) {

		var drawLocationF = coordinates[0];
		var drawLocationR = coordinates[1];
		var drawSizeF = squareSize;
		var drawSizeR = squareSize;

		// floating point values cause sub pixel rendering which causes red to linger even after square is drawn over

		// round the floating point values to integers and make sure they don't exceed the square size
		if (Math.round(drawLocationF + drawSizeF) < Math.round(drawLocationF) + Math.round(drawSizeF)) {
			drawSizeF--;
		}

		// round the floating point values to integers and make sure they aren't smaller the square size
		else if (Math.round(drawLocationF + drawSizeF) > Math.round(drawLocationF) + Math.round(drawSizeF)) {
			drawSizeF++;
		}

		// round the floating point values to integers and make sure they don't exceed the square size
		if (Math.round(drawLocationR + drawSizeR) < Math.round(drawLocationR) + Math.round(drawSizeR)) {
			drawSizeR--;
		}

		// round the floating point values to integers and make sure they aren't smaller the square size
		else if (Math.round(drawLocationR + drawSizeR) > Math.round(drawLocationR) + Math.round(drawSizeR)) {
			drawSizeR++;
		}

		ctx.fillRect(Math.round(drawLocationF), Math.round(drawLocationR), Math.round(drawSizeF), Math.round(drawSizeR));
	}

	/**
	 * Marks the square if the king is in check
	 * @param {String} color - the color of the king in check: 'w' or 'b'
	 * @param {boolean} inCheck - whether the king is in check
	 */

	function drawCheckSquare(color, inCheck) {
		var king = color + 'K';
		var file = allPieces[king][0].file;
		var rank = allPieces[king][0].rank;
		var symbol = pieceSymbols[king];
		var coordinates = getCoordinates(file, rank);
		if (inCheck) {
			ctx.fillStyle = "#FF0000";
		}
		else {
			if ((file + rank) % 2 === 0) {
				ctx.fillStyle = dark;
			}
			else {
				ctx.fillStyle = light;
			}
		}

		drawSquare(coordinates, squareSize);

		drawOnSquare(file, rank, symbol, color);
	}

	/**
	 * Draws over a piece at the square at the given co-ordinates
	 * @param {number} file - the square's file: 1 - 8
	 * @param {number} rank - the square's rank: 1 - 8
	 */

	function drawOverPiece(square) {
		var file = square[0];
		var rank = square[1];
		var coordinates = getCoordinates(file, rank);
		if ((file + rank) % 2 === 0) {
			ctx.fillStyle = dark;
		}
		else {
			ctx.fillStyle = light;
		}
		ctx.fillRect(coordinates[0], coordinates[1], squareSize, squareSize);
	}

	/**
	 * Redraws a square and (if occupied) its piece at the given index
	 * @param {number} index - the square's index: 1 - 63
	 */

	function redrawSquare(index) {
		var square = indexToSquare(index);
		drawOverPiece(square);
		unmarkSquare(square[0], square[1]);
		var piece = occupiedSquares[index - 1];
		
		// if redrawn square had a piece on it, redraw it
		if (piece) {
			var color = piece[0];
			drawOnSquare(square[0], square[1], pieceSymbols[piece.slice(0, 2)], color);
		}	
	}

	/**
	 * Draws on the square at the given co-ordinates
	 * @param {number} file - the square's file: 1 - 8
	 * @param {number} rank - the square's rank: 1 - 8
	 */

	function unmarkSquare(file, rank) {
		ctx.beginPath();
		if ((rank + file) % 2 === 0) {
			ctx.strokeStyle = dark;
		}
		else {
			ctx.strokeStyle = light;
		}
		var c = getCoordinates(file, rank);
		ctx.rect(c[0] + lineWidth/2, c[1] + lineWidth/2, squareSize - lineWidth, squareSize - lineWidth);			
		ctx.lineWidth = lineWidth;
		ctx.stroke();
		ctx.closePath();
	}

	/**
	 * Keeps track of how many moves have been played. Displays the move count
	 * @param {String} color - the color of the pieces of the player whose turn it is
	 */

	function updateMoves(color) {
		if (color === 'w') {
			moveCounter++;
			$('#move-counter').html(moveCounter);
			drawMoveCounter++;
		}
	}
});
