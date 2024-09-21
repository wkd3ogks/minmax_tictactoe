const renderBoard = document.querySelectorAll('td');

const $gamePlayHistory = document.querySelector('.main__controller__history');
const $historyForwardButton = document.querySelector('.main__controller__menu__forward');
const $historyBackwardButton = document.querySelector('.main__controller__menu__backward');

const $aiButton = document.querySelector('.main__header__ai-btn');
const $aiIcon = document.querySelector('.main__header__ai-btn path');
const $restartGameButton = document.querySelector('.main__controller__menu__restart-button');

const $renderState = document.querySelector('.main__playground__result');
const $restartBlock = document.querySelector('.main__playground__restart');

const $renderPlayer = document.querySelector('.main__status__player');
const $renderPredict = document.querySelector('.main__status__predict');

const INF = 3000
const WIN = 1000
const DRAW = 100
const PENDING = 0

const BOARD_SIZE = 9;
const CENTER_POSITION = 4;

let turn = 1;

let playerXBoard = 0b000000000;
let playerOBoard = 0b000000000;
let historyStack = [];
let rollbackHistoryStack = [];
let aiPlayState = undefined;

const selectAudio = new Audio('./select.mp3');
selectAudio.preload = 'auto';

const winStates = [
    0b111000000,
    0b000111000,
    0b000000111,
    0b100100100,
    0b010010010,
    0b001001001,
    0b100010001,
    0b001010100,
];

/* 부가 기능 관리 */

$restartGameButton.addEventListener('click', () => {
    restartGame();
});

$restartBlock.addEventListener('click', () => {
    restartGame();
});

$renderState.addEventListener('click', () => {
    restartGame();
});

$historyBackwardButton.addEventListener('click', () => {
    if(historyStack.length <= 0) {
        return;
    }

    rollbackHistoryStack.push(historyStack.pop());
    turn = historyStack.length + 1;
    if(historyStack.length == 0) {
        combinedBoard = playerXBoard | playerOBoard;
        for(let i = 0; i < BOARD_SIZE; i++) {
            if( combinedBoard & (1 << (8 - i)) ) {
                renderBoard[i].querySelector('.o').style.display = 'none';
                renderBoard[i].querySelector('.x').style.display = 'none';
            }
        }
        playerXBoard = 0b000000000;
        playerOBoard = 0b000000000;
    } else {
        playerOBoard = historyStack[historyStack.length - 1][0];
        playerXBoard = historyStack[historyStack.length - 1][1];
        for(let i = 0; i < BOARD_SIZE; i++) {
            if( playerOBoard & (1 << (8 - i)) ) {
                renderBoard[i].querySelector('.o').style.display = 'block';
            } else {
                renderBoard[i].querySelector('.o').style.display = 'none';
            }

            if( playerXBoard & (1 << (8 - i)) ) {
                renderBoard[i].querySelector('.x').style.display = 'block';
            } else {
                renderBoard[i].querySelector('.x').style.display = 'none';
            }
        }
    }
});

$historyForwardButton.addEventListener('click', () => {
    if(rollbackHistoryStack.length <= 0) {
        return;
    }
    historyStack.push(rollbackHistoryStack.pop());
    turn = historyStack.length + 1;

    playerOBoard = historyStack[historyStack.length - 1][0];
    playerXBoard = historyStack[historyStack.length - 1][1];
    for(let i = 0; i < BOARD_SIZE; i++) {
        if( playerOBoard & (1 << (8 - i)) ) {
            renderBoard[i].querySelector('.o').style.display = 'block';
        } else {
            renderBoard[i].querySelector('.o').style.display = 'none';
        }

        if( playerXBoard & (1 << (8 - i)) ) {
            renderBoard[i].querySelector('.x').style.display = 'block';
        } else {
            renderBoard[i].querySelector('.x').style.display = 'none';
        }
    }
})

$aiButton.addEventListener('click', () => {
    if (aiPlayState == undefined) {
        $aiIcon.style.fill = '#A04747';
        aiPlayState = getCurrentPlayer(turn);
        miniMaxDecision();
        selectAudio.play();
    }
})

const getCurrentPlayer = (turn) => {
    if(turn % 2 == 0) return 'o'
    return 'x'
}


/* 게임 로직 */
const evaluateGameState = (turn) => {
    // 현재 턴이 9인데 승자가 없으면 무승부다.
    const selectedBoard = getCurrentPlayer(turn) == 'o' ? playerOBoard : playerXBoard;

    for(const winState of winStates) {
        if((selectedBoard & winState) == winState) {
            return WIN;
        }
    }
    return turn >= 9 ? DRAW : PENDING;
}

const restartGame = () => {
    // init everything
    turn = 1;
    combinedBoard = playerXBoard | playerOBoard;
    for(let i = 0; i < BOARD_SIZE; i++) {
        if( combinedBoard & (1 << (8 - i)) ) {
            renderBoard[i].querySelector('.o').style.display = 'none';
            renderBoard[i].querySelector('.x').style.display = 'none';
        }
    }
    playerXBoard = 0b000000000;
    playerOBoard = 0b000000000;
    historyStack = [];
    rollbackHistoryStack = [];
    aiPlayState = undefined;
    $aiIcon.style.fill = '#3C3D37';

    $restartBlock.style.display = 'none';
    $renderState.classList.remove('popup-animaition');
    $renderPlayer.innerHTML = 'Player: ' + getCurrentPlayer(turn).toUpperCase();

    $renderPredict.innerHTML = 'Predict: Wait' ;
}

const updateHistory = (playerOBoard, playerXBoard) => {
    historyStack.push([playerOBoard, playerXBoard]);
    rollbackHistoryStack = [];
};

const renderGameResult = (message) => {
    $renderState.innerHTML = message;
    $renderState.classList.add('popup-animaition');
    $restartBlock.style.display = 'block';
}

const play = (renderPosition, BoardPosition) => {
    const currentPlayer = getCurrentPlayer(turn);
    if(currentPlayer == 'o') {
        playerOBoard = playerOBoard | ( 1 << BoardPosition)
    } else {
        playerXBoard = playerXBoard | ( 1 << BoardPosition)
    }
    const $mark = renderBoard[renderPosition].querySelector('.' + currentPlayer);
    $mark.style.display = 'block';
    updateHistory(playerOBoard, playerXBoard);
    const currentPoint = evaluateGameState(turn);
    if (currentPoint == WIN) {
        renderGameResult(currentPlayer.toUpperCase() + ' 승리');
        return;
    } 
    if(currentPoint == DRAW) {
        renderGameResult('무승부');
        return;
    }
    turn++;
};

const renderPrediction = () => {
    const predictState = maxPlay(turn, playerOBoard, playerXBoard, -Infinity, Infinity);
    if(Math.abs(predictState[0]) == INF || predictState[0] == DRAW) {
        $renderPredict.innerHTML = 'Predict: Draw';
    } else {
        const currentPlayer = getCurrentPlayer(turn);
        if(predictState[0] < 0)
            $renderPredict.innerHTML = 'Predict: ' + getCurrentPlayer(turn + 1).toUpperCase() + ' Win';
        else 
            $renderPredict.innerHTML = 'Predict: ' + currentPlayer.toUpperCase() + ' Win';
    }
}

const initGame = () => {
    for(let i = 0; i < BOARD_SIZE; i++) {
        renderBoard[i].addEventListener('click', ()=> {
            const selectedBit = 8 - i
            const combinedBoard = playerOBoard | playerXBoard
            if(aiPlayState == getCurrentPlayer(turn)) return;
            if (!( combinedBoard & ( 1 << selectedBit) )) {
                selectAudio.play();
                play(i, selectedBit);
                $renderPlayer.innerHTML = 'Player: ' + getCurrentPlayer(turn).toUpperCase();
                if(aiPlayState) {
                    miniMaxDecision();
                } 
                renderPrediction();
            }
        });
    }
} 

/* 인공지능 로직  */
const evaluateBoard = (turn, board) => {
    for(const winState of winStates) {
        if((board & winState) == winState) {
            return WIN;
        }
    }
    return turn >= 9 ? DRAW : PENDING;
};

const minPlay = (turn, playerOBoard, playerXBoard, alpha, beta) => {
    
    const currentPlayer = getCurrentPlayer(turn);
    let playerBoard = currentPlayer == 'o' ? playerOBoard : playerXBoard;

    /* leaf node가 아닌 경우 */
    let minPlayPoint = INF, maxPlayPoint = undefined;
    let selectedBit = -1;

    const combinedBoard = playerOBoard | playerXBoard;

    for(let i = 0; i < BOARD_SIZE; i++) {
        // 이미 둔 경우 제외
        if ( combinedBoard & (1 << (8 - i)) ) continue;

        const currentGameState = evaluateBoard(turn, (playerBoard | (1 << (8 - i))));
        if(currentGameState == WIN) return [ -currentGameState , 8 - i ];
        if(currentGameState == DRAW) return [ currentGameState, 8 - i ];

        if(currentPlayer == 'o') {
            maxPlayPoint = maxPlay(turn + 1, (playerBoard | (1 << (8 - i))), playerXBoard, alpha, beta)[0];
        } else {
            maxPlayPoint = maxPlay(turn + 1, playerOBoard, (playerBoard | (1 << (8 - i))), alpha, beta)[0];
        }
        if(minPlayPoint > maxPlayPoint) {
            minPlayPoint = maxPlayPoint;
            selectedBit = 8 - i;
        }
        if (alpha >= minPlayPoint) return [ minPlayPoint, selectedBit ];
        if (beta > minPlayPoint) beta = minPlayPoint;
    }
    return [ minPlayPoint, selectedBit ];
}

const maxPlay = (turn, playerOBoard, playerXBoard, alpha, beta) => {
    // 첫 수는 무조건 가운데에 둔다.
    if(turn == 1) {
        return [ WIN, CENTER_POSITION ];
    }

    const currentPlayer = getCurrentPlayer(turn);
    let playerBoard = currentPlayer == 'o' ? playerOBoard : playerXBoard;

    let maxPlayPoint = -INF, minPlayPoint = undefined;
    let selectedBit = -1;

    const combinedBoard = playerOBoard | playerXBoard;
    for(let i = 0; i < BOARD_SIZE; i++) {
        // 이미 둔 경우 제외
        if ( combinedBoard & (1 << (8 - i)) ) continue;

        /* leaf node 확인 */
        currentGameState = evaluateBoard(turn, (playerBoard | (1 << (8 - i))));
        if(currentGameState != PENDING) return [ currentGameState, 8 - i];

        if(currentPlayer == 'o') {
            minPlayPoint = minPlay(turn + 1, (playerBoard | (1 << (8 - i))), playerXBoard, alpha, beta)[0];
        } else {
            minPlayPoint = minPlay(turn + 1, playerOBoard, (playerBoard | (1 << (8 - i))), alpha, beta)[0];
        }
        if (maxPlayPoint < minPlayPoint) {
            maxPlayPoint = minPlayPoint;
            selectedBit = 8 - i;
        }
        if (beta <= maxPlayPoint) {
            return [ maxPlayPoint, selectedBit ];
        }
        if (alpha < maxPlayPoint) alpha = maxPlayPoint;
    }
    return [ maxPlayPoint, selectedBit ];
}

const miniMaxDecision = () => {
    const nextPlayInfo = maxPlay(turn, playerOBoard, playerXBoard, -Infinity, Infinity);   
    if(nextPlayInfo[1] == -1) return;
    play(Math.abs(8 - nextPlayInfo[1]), nextPlayInfo[1]);
    return nextPlayInfo[0];
}

initGame();
