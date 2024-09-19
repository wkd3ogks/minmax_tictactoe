const renderBoard = document.querySelectorAll('td');

const $gamePlayHistory = document.querySelector('.main__information__history');
const $HistoryForwardButton = document.querySelector('.main__information__menu__forward');
const $HistoryBackwardButton = document.querySelector('.main__information__menu__backward');

const $aiButton = document.querySelector('.main__header__ai-btn');
const $aiIcon = document.querySelector('.main__header__ai-btn path');
const $restartGameButton = document.querySelector('.main__information__menu__restart-button');

const $renderState = document.querySelector('.main__playground__result');
const $restartBlock = document.querySelector('.main__playground__restart');

const INF = 3000
const WIN = 1000
const DRAW = 100
const PENDING = 0

// X가 먼저 시작한다.
let turn = 1;
let isComputerFirst = false;

let playerXBoard = 0b000000000;
let playerOBoard = 0b000000000;
let historyStack = [];
let rollbackHistoryStack = [];
let aiPlayState = undefined;

const selectAudio = new Audio('./select.mp3');

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

$HistoryBackwardButton.addEventListener('click', () => {
    if(historyStack.length <= 0) {
        return;
    }

    rollbackHistoryStack.push(historyStack.pop());
    turn = historyStack.length + 1;
    if(historyStack.length == 0) {
        combinedBoard = playerXBoard | playerOBoard;
        for(let i = 0; i < 9; i++) {
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
        for(let i = 0; i < 9; i++) {
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

$HistoryForwardButton.addEventListener('click', () => {
    if(rollbackHistoryStack.length <= 0) {
        return;
    }
    historyStack.push(rollbackHistoryStack.pop());
    turn = historyStack.length + 1;

    playerOBoard = historyStack[historyStack.length - 1][0];
    playerXBoard = historyStack[historyStack.length - 1][1];
    for(let i = 0; i < 9; i++) {
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
        minMaxDecision();
        selectAudio.play();
    }
})

const getCurrentPlayer = (turn) => {
    if(turn % 2 == 0) return 'o'
    return 'x'
}

/* 게임 로직 */
// 이기면 1000점, 무승부시 100점, 승부가 나지 않았으면 0점

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
    for(let i = 0; i < 9; i++) {
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
}

const updateHistory = (playerOBoard, playerXBoard) => {
    historyStack.push([playerOBoard, playerXBoard]);
    rollbackHistoryStack = [];
    console.log(historyStack);
};

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
        $renderState.innerHTML = currentPlayer.toUpperCase() + ' 승리';
        $renderState.classList.add('popup-animaition');
        $restartBlock.style.display = 'block';
        console.log(currentPlayer, " Win!");
        return;
    } else if(currentPoint == DRAW) {
        $renderState.innerHTML = '무승부';
        $renderState.classList.add('popup-animaition');
        $restartBlock.style.display = 'block';
        console.log("DRAW!");
        return;
    }
    turn++;
};

const initGame = () => {
    for(let i = 0; i < 9; i++) {
        renderBoard[i].addEventListener('click', ()=> {
            const selectedBit = 8 - i
            const combinedBoard = playerOBoard | playerXBoard
            if(aiPlayState == getCurrentPlayer(turn)) return;
            if (!( combinedBoard & ( 1 << selectedBit) )) {
                selectAudio.play();
                play(i, selectedBit);
                if(aiPlayState) {
                    minMaxDecision();
                }
            }
        });
    }
} 

/* 승리 예측 */

/* 힌트 기능 */

/* 게임 진행 통계 */
// 로컬 스토리지 사용해서 저장하자.

/* 인공지능 로직(알파 베타 프루닝 추가 필요)  */
const evaluateBoard = (turn, board) => {
    for(const winState of winStates) {
        if((board & winState) == winState) {
            return WIN;
        }
    }
    return turn >= 10 ? DRAW : PENDING;
};

const minPlay = (turn, playerOBoard, playerXBoard, alpha, beta) => {
    /* leaf node 확인 */
    const currentPlayer = getCurrentPlayer(turn);
    let playerBoard = currentPlayer == 'o' ? playerOBoard : playerXBoard;
    const currentGameState = evaluateBoard(turn, playerBoard);

    if(currentGameState == WIN) return [ -currentGameState , -1 ];
    if(currentGameState == DRAW) return [ currentGameState, -1 ];

    /* leaf node가 아닌 경우 */
    let minPlayPoint = INF, maxPlayPoint = undefined;
    let selectedBit = -1;

    const combinedBoard = playerOBoard | playerXBoard;

    for(let i = 0; i < 9; i++) {
        // 이미 둔 경우 제외
        if ( combinedBoard & (1 << (8 - i)) ) continue;

        if(currentPlayer == 'o') {
            maxPlayPoint = maxPlay(turn + 1, (playerBoard | (1 << (8 - i))), playerXBoard, alpha, beta)[0];
        } else {
            maxPlayPoint = maxPlay(turn + 1, playerOBoard, (playerBoard | (1 << (8 - i))), alpha, beta)[0];
        }
        if(minPlayPoint > maxPlayPoint) {
            minPlayPoint = maxPlayPoint;
            selectedBit = 8 - i;
        }
    }
    return [ minPlayPoint, selectedBit ];
}

const maxPlay = (turn, playerOBoard, playerXBoard, alpha, beta) => {
    // 첫 수는 무조건 가운데에 둔다.
    if(turn == 1) {
        return [WIN, 4];
    }

    /* leaf node 확인 */
    const currentPlayer = getCurrentPlayer(turn);
    let playerBoard = currentPlayer == 'o' ? playerOBoard : playerXBoard;
    const currentGameState = evaluateBoard(turn, playerBoard);

    if(currentGameState != PENDING) return [ currentGameState, -1 ];

    /* leaf node가 아닌 경우 */
    let maxPlayPoint = -INF, minPlayPoint = undefined;
    let selectedBit = -1;

    const combinedBoard = playerOBoard | playerXBoard;
    for(let i = 0; i < 9; i++) {
        // 이미 둔 경우 제외
        if ( combinedBoard & (1 << (8 - i)) ) continue;

        if(currentPlayer == 'o') {
            minPlayPoint = minPlay(turn + 1, (playerBoard | (1 << (8 - i))), playerXBoard, alpha, beta)[0];
        } else {
            minPlayPoint = minPlay(turn + 1, playerOBoard, (playerBoard | (1 << (8 - i))), alpha, beta)[0];
        }
        if (maxPlayPoint < minPlayPoint) {
            maxPlayPoint = minPlayPoint;
            selectedBit = 8 - i;
        }
    }
    return [ maxPlayPoint, selectedBit ];
}

const minMaxDecision = () => {
    const BoardPosition = maxPlay(turn, playerOBoard, playerXBoard, 0, 0)[1];
    play(Math.abs(8 - BoardPosition), BoardPosition);
}

initGame();