# Tic-Tac-Toe with Minimax Algorithm

<div align="center">
  
![image](https://github.com/user-attachments/assets/58abe888-6394-47d1-bc0c-23347adaea50)

</div>

## Description
이 프로젝트는 틱택토 게임에 비트마스킹과 Minimax 알고리즘을 적용하여, AI가 최선의 수를 선택해 플레이할 수 있도록 구현했습니다. 비트마스킹을 통해 게임의 상태를 효율적으로 관리하고, Minimax 알고리즘을 사용하여 가능한 모든 수를 탐색하여 최적의 결정을 내립니다.

## Tech Stack
- HTML, CSS
- JavaScript

## Execution
[틱택토 게임 플레이](https://wkd3ogks.github.io/tictactoe/)

## Usage
- 사용자는 X 또는 O로 플레이할 수 있습니다.
- 상단의 로봇 아이콘을 클릭하면 해당 턴부터 AI가 플레이합니다.
- 하단의 화살표 버튼으로 이전 수로 되돌릴 수 있습니다.

## Features
- 비트마스킹: 각 플레이어의 보드를 비트 연산으로 관리하여 빠르고 효율적인 상태 업데이트 및 승리 조건 확인을 구현했습니다.
- Minimax 알고리즘: 게임 상태를 모두 탐색하고 최적의 수를 결정하는 알고리즘으로, 알파-베타 가지치기 기법을 적용해 성능을 최적화했습니다.

## Future Improvements
틱택토 AI를 만들기 전에 Minimax 알고리즘을 활용하여 오목 인공지능을 만들었습니다. 열린 3을 수비하고 4를 만들어 공격하는 등 사람과 유사한 전략을 구사했지만, 탐색 깊이 4에서도 시간이 너무 오래 걸리는 문제가 있었습니다. 또한 평가 함수의 정밀도를 높이고 싶었지만 오목에 대한 이해가 부족했던 점이 아쉬웠습니다. 향후에는 Minimax가 아닌 Monte Carlo Tree Search(MCTS) 또는 딥러닝 기반 알고리즘 등을 적용해 오목 AI를 개선해 보고 싶습니다.


