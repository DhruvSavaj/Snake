const board_border = 'black';
const snake_col = 'lightblue';
const snake_border = 'darkblue';

let snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 }
]

let score = 0;
// True if changing direction
let changing_direction = false;
// Horizontal velocity
let food_x;
let food_y;
let dx = 10;
// Vertical velocity
let dy = 0;
let boardWidth = 0;
let boardHeight = 0;
let cellSize = 0;

$(document).ready(function () {
    const snakeboard = document.getElementById("snakeboard");
    // size the canvas to the CSS-rendered size and account for devicePixelRatio for crispness
    const rect = snakeboard.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // set the drawing buffer to physical pixels
    snakeboard.width = Math.floor(rect.width * dpr);
    snakeboard.height = Math.floor(rect.height * dpr);
    // keep the CSS size unchanged
    snakeboard.style.width = rect.width + 'px';
    snakeboard.style.height = rect.height + 'px';
    const snakeboard_ctx = snakeboard.getContext("2d");
    // scale the context so drawing operations use CSS pixels
    snakeboard_ctx.scale(dpr, dpr);

    // logical board size in CSS pixels (used for game logic)
    boardWidth = rect.width;
    boardHeight = rect.height;

    // compute cell size proportional to board size so snake/food scale on large screens
    cellSize = Math.max(8, Math.floor(Math.min(boardWidth, boardHeight) / 40));
    // set initial movement to one cell
    dx = cellSize;
    dy = 0;

    // initialize the snake centered on the board using cellSize multiples
    const startX = Math.floor((boardWidth / 2) / cellSize) * cellSize;
    const startY = Math.floor((boardHeight / 2) / cellSize) * cellSize;
    snake = [];
    for (let i = 0; i < 5; i++) {
        snake.push({ x: startX - i * cellSize, y: startY });
    }
    // Start game
    Main();
    GenFood();

    document.addEventListener("keydown", ChangeDirection);

    function Main() {
        if (HasGameEnded()) {
            $(".modal_text").html("Your score is " + score.toString());
            $("#myModal").addClass("show");
            return;
        }
        changing_direction = false;
        setTimeout(function onTick() {
            ClearBoard();
            DrawFood();
            MoveSnake();
            DrawSnake();
            // Repeat
            Main();
        }, 100)
    }

    function ClearBoard() {
        var grd = snakeboard_ctx.createLinearGradient(0, 0, boardWidth / 2, 0);

        grd.addColorStop(0, '#071028');
        grd.addColorStop(1, '#1f2937');

        snakeboard_ctx.fillStyle = grd;
        snakeboard_ctx.strokeStyle = board_border;
        snakeboard_ctx.fillRect(0, 0, boardWidth, boardHeight);
        snakeboard_ctx.strokeRect(0, 0, boardWidth, boardHeight);
    }

    // Draw the snake on the canvas
    function DrawSnake() {
        snake.forEach(DrawSnakePart)
    }

    function DrawFood() {
        snakeboard_ctx.fillStyle = 'lightgreen';
        snakeboard_ctx.strokeStyle = 'darkgreen';
        snakeboard_ctx.fillRect(food_x, food_y, cellSize, cellSize);
        snakeboard_ctx.strokeRect(food_x, food_y, cellSize, cellSize);
    }

    // Draw one snake part
    function DrawSnakePart(snakePart) {
        snakeboard_ctx.fillStyle = snake_col;
        snakeboard_ctx.strokeStyle = snake_border;
        snakeboard_ctx.fillRect(snakePart.x, snakePart.y, cellSize, cellSize);
        snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, cellSize, cellSize);
    }

    function HasGameEnded() {
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
        }
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x > boardWidth - cellSize;
        const hitToptWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y > boardHeight - cellSize;
        return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
    }

    function RandomFood(min, max) {
        return Math.round((Math.random() * (max - min) + min) / cellSize) * cellSize;
    }

    function GenFood() {
        // generate until we find a cell that doesn't collide with the snake
        let collision;
        do {
            food_x = RandomFood(0, boardWidth - cellSize);
            food_y = RandomFood(0, boardHeight - cellSize);
            collision = snake.some(function (part) {
                return part.x === food_x && part.y === food_y;
            });
        } while (collision);
    }

    function ChangeDirection(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        // Prevent the snake from reversing
        if (changing_direction) return;
        changing_direction = true;
        const keyPressed = event.keyCode;
        // use cellSize-aware comparisons so reversing detection works after scaling
        const goingUp = dy === -cellSize;
        const goingDown = dy === cellSize;
        const goingRight = dx === cellSize;
        const goingLeft = dx === -cellSize;
        if (keyPressed === LEFT_KEY && !goingRight) {
            dx = -cellSize;
            dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            dx = 0;
            dy = -cellSize;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            dx = cellSize;
            dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            dx = 0;
            dy = cellSize;
        }
    }

    function MoveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
        const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
        if (has_eaten_food) {
            score += 5;
            $('#score').text("Score: " + score.toString());
            GenFood();
        } else {
            snake.pop();
        }
    }

    $("#restartBtn").click(function () {
        window.location.reload();
    });
});

