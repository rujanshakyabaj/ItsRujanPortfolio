(() => {
    "use strict";

    // Constants
    const CANVAS_WIDTH = 3840;
    const CANVAS_HEIGHT = 2160;
    const COLORS = {
        BACKGROUND: 'cornflowerblue',
        FLOOR: '#black',
        PLAYER: 'green',
        SPIKES: '#686573',
    };
    const FPS = 60;
    const FLOOR_HEIGHT = 700;
    const PLAYER_START_X = 300;
    const PLAYER_SIZE = 90;
    const GRAVITY = 0.5;
    const PLAYER_JUMP_VELOCITY = 20;
    const SPIKES_VELOCITY = 8;

    // Globals
    let floor;
    let floor1;
    let floor2;
    let player;
    let spikes = [];
    let spawnSpikeID;
    let updateID;
    let flooroffset = 500;
    let score = 0;
    let highscore = 0;
    var PlayerImage = new Image();
    PlayerImage.src = './tutorial/images/larve.png'; // Replace with the path to your image
    var SpikeImage = new Image();
    SpikeImage.src = './tutorial/images/bird.png'; // Replace with the path to your image
    var bugAudio = new Audio('./tutorial/audio/BugOnWire.mp3');
    bugAudio.volume = 0.5;
    var deathAudio = new Audio('./tutorial/audio/moyemoye.mp3');
    deathAudio.volume = 0.5;
    var switchAudio = new Audio('./tutorial/audio/switch.wav');
    var jumpAudio = new Audio('./tutorial/audio/funjump.mp3');



    // Spawns a moving spike off-screen every few seconds
    const spawnSpike = () => {
        spawnSpikeID = setTimeout(spawnSpike, randomRangeInt(1000, 2000))
        // Create spike
        const width = 150;
        const height = 180;
        let spike = new Entity(CANVAS_WIDTH + randomRangeInt(3000, 5000), CANVAS_HEIGHT - FLOOR_HEIGHT - height, width, height);
        let spike1 = new Entity(CANVAS_WIDTH + randomRangeInt(1000, 5000), CANVAS_HEIGHT - FLOOR_HEIGHT - height - flooroffset, width, height);
        let spike2 = new Entity(CANVAS_WIDTH + randomRangeInt(1000, 6000), CANVAS_HEIGHT - FLOOR_HEIGHT - height - 2 * flooroffset, width, height);



        // Init spike velocity

        spike.velocity.x = -SPIKES_VELOCITY;
        spike1.velocity.x = -SPIKES_VELOCITY;
        spike2.velocity.x = -SPIKES_VELOCITY;

        // if(score>10){
        //     spike.velocity.x = -SPIKES_VELOCITY-100;
        // spike1.velocity.x = -SPIKES_VELOCITY-100;
        // spike2.velocity.x = -SPIKES_VELOCITY-100;
        // }
        // Add to spikes list
        spikes.push(spike);
        spikes.push(spike1);
        spikes.push(spike2);

    };

    const update = () => {
        bugAudio.play();
        updateID = setTimeout(update, 1 / FPS);
        score = score + 0.01;
        // Update player
        player.update();

        // Don't let player go below the floor
        if (player.lane == 1) {
            if (player.y > CANVAS_HEIGHT - FLOOR_HEIGHT - player.h) {
                player.y = CANVAS_HEIGHT - FLOOR_HEIGHT - player.h;
                player.isGrounded = true;
            }
        }

        if (player.lane == 2) {
            if (player.y > CANVAS_HEIGHT - FLOOR_HEIGHT - player.h - flooroffset) {
                player.y = CANVAS_HEIGHT - FLOOR_HEIGHT - player.h - flooroffset;
                player.isGrounded = true;
            }
        }
        if (player.lane == 3) {
            if (player.y > CANVAS_HEIGHT - FLOOR_HEIGHT - player.h - 2 * flooroffset) {
                player.y = CANVAS_HEIGHT - FLOOR_HEIGHT - player.h - 2 * flooroffset;
                player.isGrounded = true;
            }
        }

        // Spikes
        spikes.forEach(spike => {
            // Update spikes
            spike.update();

            // Check collision
            if (Rectangle.areColliding(player, spike)) {
                // Game over
                if (score > highscore) {
                    highscore = score;
                }
                player.gameOver = true;
                stop();


            }
        });
        // Remove offscreen spikes
        spikes = spikes.filter(spike => spike.x > -spike.w);
    };

    // Resets game parameters back to the start
    const reset = () => {
        // Reset player
        player.y = CANVAS_HEIGHT - FLOOR_HEIGHT - PLAYER_SIZE;
        player.velocity.y = 0;

        // Clear spikes
        spikes = [];
        score = 0;
        player.gameOver = false;

        // Start the updates again
        update();
        spawnSpike();
    };

    // Tries to reset game
    const tryReset = (e) => {
        if (e.code === 'Enter') {
            // Remove event listener for self
            deathAudio.pause();
            deathAudio.currentTime = 0;
            document.removeEventListener('keydown', tryReset);
            // Reset game
            reset();
        }
    };

    // Stops game updates and waits for a reset
    const stop = () => {
        bugAudio.pause();
        bugAudio.currentTime = 0;
        deathAudio.play();
        clearTimeout(updateID);
        clearTimeout(spawnSpikeID);


        // Add event listener for reset
        document.addEventListener('keydown', tryReset);
    };

    const draw = (ctx) => {

        requestAnimationFrame(() => draw(ctx));
        // Draw background
        var backgroundImage = new Image();
        backgroundImage.src = './tutorial/images/background.png'; // Replace with the path to your image
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw floor
        floor.draw(ctx, COLORS.FLOOR);
        floor1.draw(ctx, COLORS.FLOOR);
        floor2.draw(ctx, COLORS.FLOOR);


        // Draw spikes
        spikes.forEach(spike => spike.drawImg(ctx, SpikeImage));

        // Draw player
        // player.draw(ctx, COLORS.PLAYER);
        player.drawImg(ctx, PlayerImage)


        ctx.font = "500 50px Comic Sans MS";
        ctx.fillText("Your Score: " + parseInt(score), CANVAS_WIDTH / 20, CANVAS_HEIGHT / 20);

        ctx.font = "500 50px Comic Sans MS";
        ctx.fillText("High Score: " + parseInt(highscore), CANVAS_WIDTH / 20, CANVAS_HEIGHT / 20 + 100);
        if (player.gameOver === true) {
            ctx.font = "500 400px Comic Sans MS";
            ctx.fillText("Game Over", CANVAS_WIDTH / 2 - 1000, CANVAS_HEIGHT / 2 - 200);
            ctx.font = "500 100px Comic Sans MS";
            ctx.fillText("Press Enter to Restart", CANVAS_WIDTH / 2 - 600, CANVAS_HEIGHT / 2);
        }
    };

    const init = () => {
        // Get canvas from DOM
        const canvas = document.querySelector("canvas");


        // Set resolution
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // Get canvas context
        const ctx = canvas.getContext('2d');

        // Init game objects
        floor = new Rectangle(0, CANVAS_HEIGHT - FLOOR_HEIGHT, CANVAS_WIDTH, 5);
        floor1 = new Rectangle(0, CANVAS_HEIGHT - FLOOR_HEIGHT - flooroffset, CANVAS_WIDTH, 5);
        floor2 = new Rectangle(0, CANVAS_HEIGHT - FLOOR_HEIGHT - (2 * flooroffset), CANVAS_WIDTH, 5);

        player = new Player(PLAYER_START_X, CANVAS_HEIGHT - FLOOR_HEIGHT - PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
        player.acceleration.y = GRAVITY;
        player.gameOver = false;

        // Events
        document.addEventListener('keydown', e => {
            if (player.isGrounded && (e.code === 'Space')) {
                jumpAudio.play();
                player.velocity.y = -PLAYER_JUMP_VELOCITY;
                player.isGrounded = false;
            }
        });
        document.addEventListener('keydown', e => {
            if (player.lane < 3) {
                if (e.code === 'ArrowUp') {
                    player.lane++;
                    switchAudio.play();

                }
            }
            if (player.lane > 1)
                if (e.code === 'ArrowDown') {
                    player.lane--;
                    switchAudio.play();

                }
        });

        // Start loops
        update();
        draw(ctx);
        spawnSpike();
    };

    window.onload = () => {
        // Preload anything - fonts, images, sounds, etc...

        init();
    };
})();