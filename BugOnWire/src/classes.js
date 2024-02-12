"use strict";

class Rectangle {
    constructor(x, y, w, h) {
        Object.assign(this, { x, y, w, h });
    }
    draw(ctx, color = 'black') {
         fillRect(ctx, this.x, this.y, this.w, this.h, color);
        
    }
    drawImg(ctx, img) {
        
        fillImage(ctx, this.x, this.y, this.w, this.h, img);
   }
    static areColliding(rect1, rect2) {
        // AABB Collision Test
        return rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y;
    }
}

class Entity extends Rectangle {
    constructor(x, y, w, h) {
        super(x, y, w, h);

        this.acceleration = {
            x: 0,
            y: 0,
        };
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.imageUrl=null
    }

    update() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Player extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.lane=1;
        this.isGrounded = false;
        this.gameOver=false;
        this.imageUrl=null;
    }

    drawImg(ctx, img) {
        
        fillImage(ctx, this.x, this.y, this.w, this.h, img);
   }
}