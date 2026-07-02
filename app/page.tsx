"use client";
// @ts-nocheck

import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";

export default function Home() {
  const [game, setGame] = useState(null);
  const [gameFen, setGameFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [statusMessage, setStatusMessage] = useState("Your turn! Click a piece to move.");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState("white");
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => {
    setGame(new Chess());
  }, []);

  const makeAiMove = useCallback(async (currentFen) => {
    setIsAiThinking(true);
    setStatusMessage("The Monster is calculating...");

    try {
      const response = await fetch('http://127.0.0.1:8000/api/move',  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: currentFen }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      if (data.move) {
        const newGame = new Chess(currentFen);
        newGame.move({
          from: data.move.substring(0, 2),
          to: data.move.substring(2, 4),
          promotion: "q",
        });

        setGame(newGame);
        setGameFen(newGame.fen());
        setStatusMessage("Your turn!");
      } else {
        setStatusMessage("The Monster couldn't find a move or game is over.");
      }
    } catch (error) {
      console.error("Error calling AI backend:", error);
      setStatusMessage("Failed to connect to the Monster Brain API.");
    } finally {
      setIsAiThinking(false);
    }
  }, []);

  function handleSquareClick(square) {
    if (!game || isAiThinking || game.isGameOver()) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === playerColor.charAt(0)) {
        setSelectedSquare(square);
      }
      return;
    }

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (move === null) {
        const piece = game.get(square);
        if (piece && piece.color === playerColor.charAt(0)) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
        return;
      }

      setGame(newGame);
      setGameFen(newGame.fen());
      setSelectedSquare(null);

      if (newGame.isGameOver()) {
        if (newGame.isCheckmate()) setStatusMessage("Checkmate! You win!");
        else if (newGame.isDraw()) setStatusMessage("Game over. Draw.");
        return;
      }

      makeAiMove(newGame.fen());
    } catch (e) {
      setSelectedSquare(null);
    }
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setGameFen(newGame.fen());
    setIsAiThinking(false);
    setSelectedSquare(null);
    setStatusMessage("New game. Your turn!");
  }

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // THE FIX: Using the official high-def Wikimedia SVG images for exact accuracy
  const pieceImages = {
    w: {
      p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
      r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
      n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
      b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
      q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
      k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
    },
    b: {
      p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
      r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
      n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
      b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
      q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
      k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#2c2c2c] text-[#c3c3c2] p-6 font-sans">
      
      <div className="z-10 w-full max-w-4xl text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1 drop-shadow-md">
          CLASSIC AI
        </h1>
        <p className="text-[#a1a1a1] text-sm uppercase tracking-widest">PyTorch Neural Engine</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-4xl">
        
        {/* THE BOARD */}
        <div className="w-full max-w-[500px] aspect-square bg-[#B58863] rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.6)] border-[2px] border-[#4a4a4a] grid grid-cols-8 grid-rows-8 overflow-hidden">
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const square = `${file}${rank}`;
              const isDark = (rIdx + fIdx) % 2 === 1;
              const isSelected = selectedSquare === square;
              const piece = game ? game.get(square) : null;
              
              // Exact colors from your reference image (Cream & Light Brown)
              let bgColor = isDark ? "bg-[#B58863]" : "bg-[#F0D9B5]";
              
              if (isSelected) {
                bgColor = isDark ? "bg-[#aba143]" : "bg-[#e8de64]"; // Yellow highlight tint
              }

              return (
                <button
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center select-none ${bgColor} transition-colors duration-75`}
                  style={{ aspectRatio: "1/1" }}
                >
                  {/* Renders the actual image file instead of text */}
                  {piece && (
                    <img 
                      src={pieceImages[piece.color][piece.type]} 
                      alt={`${piece.color} ${piece.type}`}
                      className={`w-[85%] h-[85%] drop-shadow-sm pointer-events-none ${isSelected ? 'scale-[1.05]' : ''}`}
                    />
                  )}
                  
                  {/* Coordinates */}
                  {fIdx === 0 && <span className={`absolute top-[2px] left-[4px] text-[10px] font-semibold ${isDark ? 'text-[#F0D9B5]' : 'text-[#B58863]'}`}>{rank}</span>}
                  {rIdx === 7 && <span className={`absolute bottom-[2px] right-[4px] text-[10px] font-semibold ${isDark ? 'text-[#F0D9B5]' : 'text-[#B58863]'}`}>{file}</span>}
                </button>
              );
            })
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="flex flex-col bg-[#383838] p-5 rounded-md shadow-2xl border border-[#4a4a4a] w-full max-w-[320px] min-h-[300px] justify-between">
          
          <div>
            <div className={`flex items-center gap-3 mb-6 bg-[#2c2c2c] p-4 rounded border ${isAiThinking ? 'border-yellow-500/50' : 'border-[#4a4a4a]'}`}>
              <div className={`w-3 h-3 rounded-full ${isAiThinking ? "bg-yellow-400 animate-pulse" : "bg-[#B58863]"}`}></div>
              <span className={`text-sm font-semibold ${isAiThinking ? 'text-yellow-400' : 'text-white'}`}>
                {statusMessage}
              </span>
            </div>

            <div className="mb-6">
              <label className="text-[11px] text-[#a1a1a1] uppercase font-bold tracking-wider block mb-2">Team Selection</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPlayerColor("white"); resetGame(); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-sm transition ${
                    playerColor === "white" 
                      ? "bg-[#F0D9B5] text-black shadow-md" 
                      : "bg-[#2c2c2c] text-[#a1a1a1] hover:bg-[#4a4a4a]"
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => { setPlayerColor("black"); resetGame(); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-sm transition ${
                    playerColor === "black" 
                      ? "bg-[#B58863] text-white shadow-md" 
                      : "bg-[#2c2c2c] text-[#a1a1a1] hover:bg-[#4a4a4a]"
                  }`}
                >
                  Black
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full bg-[#8c9c7c] hover:bg-[#a1b38e] text-white font-extrabold text-lg py-3.5 px-4 rounded shadow-lg transition active:scale-[0.98]"
          >
            Reset Board
          </button>
        </div>

      </div>
    </main>
  );
}