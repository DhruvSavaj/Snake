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

$(document).ready(function () {
    const snakeboard = document.getElementById("snakeboard");
    snakeboard.width = screen.width - 10;
    snakeboard.height = screen.height - 200;
    const snakeboard_ctx = snakeboard.getContext("2d");
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
        //  Select the colour to fill the drawing
        // linear-gradient(to left, #FFAF7B, #D76D77, #3A1C71)
        var grd = snakeboard_ctx.createLinearGradient(0, 0, (screen.width - 100) / 2, 0);
        grd.addColorStop(0, '#3A1C71');
        grd.addColorStop(1, '#D76D77');

        snakeboard_ctx.fillStyle = grd;
        snakeboard_ctx.strokestyle = board_border;
        snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
        snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
    }

    // Draw the snake on the canvas
    function DrawSnake() {
        snake.forEach(DrawSnakePart)
    }

    function DrawFood() {
        snakeboard_ctx.fillStyle = 'lightgreen';
        snakeboard_ctx.strokestyle = 'darkgreen';
        snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
        snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
    }

    // Draw one snake part
    function DrawSnakePart(snakePart) {
        snakeboard_ctx.fillStyle = snake_col;
        snakeboard_ctx.strokestyle = snake_border;
        snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
        snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    }

    function HasGameEnded() {
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
        }
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x > snakeboard.width - 10;
        const hitToptWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y > snakeboard.height - 10;
        return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
    }

    function RandomFood(min, max) {
        return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    }

    function GenFood() {
        food_x = RandomFood(0, snakeboard.width - 10);
        food_y = RandomFood(0, snakeboard.height - 10);
        // if the new food location is where the snake currently is, generate a new food location
        snake.forEach(function has_snake_eaten_food(part) {
            const has_eaten = part.x == food_x && part.y == food_y;
            if (has_eaten) GenFood();
        });
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
        const goingUp = dy === -10;
        const goingDown = dy === 10;
        const goingRight = dx === 10;
        const goingLeft = dx === -10;
        if (keyPressed === LEFT_KEY && !goingRight) {
            dx = -10;
            dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            dx = 0;
            dy = -10;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            dx = 10;
            dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            dx = 0;
            dy = 10;
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

