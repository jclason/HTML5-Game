var CANVAS_WIDTH = 720;
var CANVAS_HEIGHT = 480;

// Create
var canvasElement = $("<canvas id ='gameCanvas' width='" + CANVAS_WIDTH + 
					  "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
var player = Player();
canvasElement.appendTo('body');

var playerBullets = [];
var enemies = [];
var sky = new Image();
sky.src = "images/scrollingbg.png";
var skyy = 0, skydy = 0.5;
var FPS = 30;
var gameLoop;
var playerScore = 0;
var tiltMoveX = 0;
var tiltMoveY = 0;
var gameOverImg = new Image();
gameOverImg.src = "images/gameover.png";
var tapToShoot = 0;
var highScoreFlag = 0;
var oldScore = 0;

var startGameLoop = function() {
	if(player) {
		if(!player.active) {
			// If the game is over, reset it
			playerScore = 0;
			player.x = 220;
			player.y = 370;
			player.active = true;
			enemies.forEach(function(enemy) {
				enemy.active = false;
			});
			playerBullets.forEach(function(bullet) {
				bullet.active = false;
			});
			document.getElementById("shipPic").src = "images/player.png";
		}
	}
	// Start the game loop
	gameLoop = setInterval(function() {
		update();
		draw();
		}, 1000/FPS);
	
}
startGameLoop();


// Clamp definition, keeps items on screen
Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

function update() {
	//*** Controls Section ***
	// Firing
	if (keydown.space || (tapToShoot === 1)) {
		if(!player.charging){
			player.charging = true;
			player.shoot();
			tapToShoot = 0;
		}
	}
	
	// Pausing, currently can't unpause
	if(keydown.shift) {
		if(gameLoop) {
			canvas.font = '48px';
			canvas.fillStyle = "Red";
			canvas.fillText("PAUSED", 200, 200);
			clearInterval(gameLoop);
			gameLoop = 0;
		}
		else startGameLoop();
	}
	
	if (keydown.left  || keydown.a || (tiltMoveX < 0)) {
		player.x -= 5;
		if(keydown.left  || keydown.a)
			player.sprite = player.leftsprite;
		tiltMoveX = 0;
	}
	else player.sprite = player.straightsprite;
	
	if (keydown.right || keydown.d || (tiltMoveX > 0)) {
		player.x += 5;
		if(keydown.right || keydown.d)
			player.sprite = player.rightsprite;
		tiltMoveX = 0;
	}
	else if (!keydown.left && !keydown.a) player.sprite = player.straightsprite;
	
	if (keydown.up || keydown.w || (tiltMoveY < 0)) {
		player.y -= 5;
		tiltMoveY = 0;
	}

	if (keydown.down || keydown.s || (tiltMoveY > 0)) {
		player.y += 5;
		tiltMoveY= 0;
	}
	//***********************
	
	// Keep the player from moving out of bounds
	player.x = player.x.clamp(0, CANVAS_WIDTH - player.width - 20);
	player.y = player.y.clamp(50, CANVAS_HEIGHT - player.height*2);
	
	// Update our location in the background image
	if ((skyy + skydy) < (430 - skydy)){ 
		skyy += skydy; 
	}
	else {
		skyy = 0;
	}
	
	// Move all player bullets
	playerBullets.forEach(function(bullet) {
		bullet.update();
	});

	// Check for finished bullets
	playerBullets = playerBullets.filter(function(bullet) {
		return bullet.active;
	});
	
	// Move enemies
	enemies.forEach(function(enemy) {
		enemy.update();
	});

	// Check for dead enemies
	enemies = enemies.filter(function(enemy) {
		return enemy.active;
	});

	// Check for collisions between player and enemy
	// And for enemies and player bullets
	handleCollisions();
	
	// This function isn't currently in use
	var resetiOS = function(event){
				canvasElement.get(0).removeEventListener('touchstart', resetiOS);
				canvasElement.get(0).addEventListener('touchstart', function(event){event.preventDefault(); tapToShoot = 1; });
				startGameLoop();
				canvasElement.get(0).onclick = function(){
				canvasElement.get(0).onclick = function(event) { tapToShoot = 1; event.preventDefault();};
				startGameLoop();
			};
	}
	// Player death, game over
	if(!player.active) {
		canvasElement.get(0).onmouseup = 0;
		player.sprite = player.deathsprite;
		document.getElementById("shipPic").src = "images/explosion.png";
		// Reset game after 4 seconds of game over screen
		setTimeout(startGameLoop, 4000);
		
		try {
				// Save the player score to local storage
				oldScore = localStorage.getItem("highScore");
				if(oldScore) {
					if(playerScore > oldScore) {
						// New high score!
						localStorage.setItem("highScore", playerScore);
					}
				} 
				else {
					// No previous scores, new high score
					localStorage.setItem("highScore", playerScore);
				}
			}
			catch (e) {
				// If the local cache is full, throw an error
				if (e == QUOTA_EXCEEDED_ERR) {
					alert('Quota exceeded!'); //data wasn't successfully saved due to quota exceed so throw an error
				}
			}
			
			// Stop the game
			clearInterval(gameLoop);
	}
	
	// Add new enemies based on a random roll
	var enemySeed = Math.random();
	if(enemySeed < 0.05) {
		enemies.push(Enemy());
	}
	if (enemySeed < .005 && playerScore > 50) {
		enemies.push(Enemy(0, 'B'));
	}
	if (enemySeed < .003 && playerScore > 100) {
		enemies.push(Enemy(0, 'C'));
	}
}

function draw() {
	// Clear the screen
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	// Draw our background
	canvas.drawImage(sky, 0, skyy, 720, 480, 0, 0, 720, 480);
	
	// Give everything a nice drop shadow
	canvas.shadowOffsetX = 1;
	canvas.shadowOffsetY = 1;
	canvas.shadowBlur = 10;
	canvas.shadowColor = "#000000";
	
	player.draw();
	
	playerBullets.forEach(function(bullet) {
		bullet.draw();
	});
	
	enemies.forEach(function(enemy) {
		enemy.draw();
	});
	
	// Draw the player score
	canvas.fillStyle = "red";
	canvas.font = 'bold 30px quartz MS';
	canvas.fillText("Score: " + playerScore, 25, 30);
	
	// Draw our game over image if the player is dead
	if(!player.active) {
		if(playerScore > oldScore) {
			canvas.fillText(playerScore + "  is a new high score!", ((CANVAS_WIDTH-gameOverImg.width)/2+110), 
										((CANVAS_HEIGHT-gameOverImg.height)/2)+50);
			canvas.fillText("Previous best was " + oldScore, ((CANVAS_WIDTH-gameOverImg.width)/2+110), 
										((CANVAS_HEIGHT-gameOverImg.height)/2)+175);	
		}
		else {
			canvas.fillText("Your high score is " + oldScore + ". Try again!", ((CANVAS_WIDTH-gameOverImg.width)/2+25), 
										((CANVAS_HEIGHT-gameOverImg.height)/2)+50);
		}
		canvas.drawImage(gameOverImg, ((CANVAS_WIDTH-gameOverImg.width)/2), 
										((CANVAS_HEIGHT-gameOverImg.height)/2));
	}
}



// Attempt to use iOS rotation data to move
if (window.DeviceMotionEvent) {
	window.addEventListener('deviceorientation', deviceOrientationHandler, false);
}

function deviceOrientationHandler(eventData) {

	if(eventData.gamma > 0) {
		tiltMoveX += 5;
	} else if (eventData.gamma < 0) {
			tiltMoveX -= 5;
	}
	if(eventData.beta > 0) {
		tiltMoveY += 5;
	} else if (eventData.beta < 0) {
			tiltMoveY -= 5;
	}
}
// Allows firing on iOS devices
canvasElement.get(0).onclick = function(event) { tapToShoot = 1; event.preventDefault();};
canvasElement.get(0).addEventListener('touchstart', function(event){event.preventDefault(); tapToShoot = 1; });

function Bullet(I) {

	I.active = true;
	I.xVelocity = 0;
	I.yVelocity = -I.speed;
	I.width = 5;
	I.height = 5;
	I.color = "#000";
	I.sprite = Sprite("playerFireball.png");
	
	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH &&
			I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.draw = function() {
		if(I.active)
			this.sprite.draw(canvas, this.x, this.y);
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.active = I.active && I.inBounds();
	};

	return I;
}

function Enemy(I, type) {
	I = I || {};
	I.type = type;
	I.active = true;
	I.age = Math.floor(Math.random() * 128);

	I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
	I.y = 0;
	I.xVelocity = 0
	I.yVelocity = 2;

	I.width = 45;
	I.height = 32;
	I.sprite = Sprite("enemy.png");
	I.deathsprite = Sprite("explosion.png");
	
	if((I.type === 'B') || (I.type === 'C')) {
		var pickSide = Math.random();
		if(pickSide < .5) {
			if(I.type === 'B') {
				// Enemy B Side Plane Heading Left
				I.sprite = Sprite("greenEnemyLeft.png");
				I.x = CANVAS_WIDTH-I.width;
				I.xVelocity = -8;
				I.y = player.y;
			}
			else if(I.type === 'C') {
				// Enemy C Bomber Heading Left
				I.sprite = Sprite("Wily.png");
				I.x = CANVAS_WIDTH-I.width;
				I.xVelocity = -2;
			}
		}
		else {
			if(I.type === 'B') {
				// Enemy B Side Plane Heading Right
				I.sprite = Sprite("greenEnemy.png");
				I.x = 0;
				I.xVelocity = 8 + (playerScore / 600);
				I.y = player.y;
			}
			else if(I.type === 'C') {
				// Enemy C Bomber Heading Right
				I.sprite = Sprite("Wily.png");
				I.x = 0;
				I.xVelocity = 2;
				I.width = 65;
			}
		}
		I.yVelocity = 0;
	}
	else if (I.type === 'P') {
			// Enemy C's projectiles
			I.xVelocity = 0;
			I.sprite = Sprite("enemyFireball.png");
			I.width = 10;
			I.height = 20;
	}
	else if (I.type === 'S') {
			// Shield power up
			I.width = 20;
			I.height = 20;
			I.sprite = Sprite("shield.png");
			I.deathsprite = I.sprite;
	}
	
	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH &&
			I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.draw = function() {
		this.sprite.draw(canvas, this.x, this.y);
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;
		
		if(!this.type)
			I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

		I.age++;
		
		// C Type enemies have a chance to drop bombs
		if(this.type === 'C') {
			var fireChance = Math.random();
			if(fireChance < .015) {
				// Drop a bomb towards the player
				var projectile = Enemy(0, 'P');
				projectile.x = this.x;
				projectile.y = this.y + this.height;
				enemies.push(projectile);
			}
		}
		
		I.active = I.active && I.inBounds();
	};

	I.spawnShieldPowerUp = function() {
		// Spawn shield power up
		var newPowerUp = Enemy(0, 'S');
		newPowerUp.x = I.x;
		newPowerUp.y = I.y;
		enemies.push(newPowerUp);
	}
	
	I.explode = function() {
		this.active = false;
		I.sprite = I.deathsprite;
		var powerUpChance = Math.random();
		
		// Add to the player score based on enemy type
		// Each type has a different chance to spawn power ups
		if(!type) {
			playerScore += 5;
			if(powerUpChance < .01) {
				I.spawnShieldPowerUp();
			}
		}
		else {
			switch(type) {
				
				case 'C': 
					playerScore += 30;
					if(powerUpChance < .1) {
						I.spawnShieldPowerUp();
					}
					break;
					
				case 'B': 
					playerScore += 20;
					if(powerUpChance < .05) {
						I.spawnShieldPowerUp();
					}
					break;

				case 'S':
					// Add a shield to the player
					player.addPowerUp('S');
					break;
			}
		
		}
	};
	
	
	return I;
}; 

function collides(a, b) {
	return a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y;
}

function handleCollisions() {
	playerBullets.forEach(function(bullet) {
		enemies.forEach(function(enemy) {
			// Don't check for missiles or powerups, they can't be destroyed
			if(enemy.type !== 'P' && enemy.type !== 'S') {
				if (collides(bullet, enemy)) {
					enemy.explode();
					bullet.active = false;
				}
			}
		});
	});

	enemies.forEach(function(enemy) {
		if (collides(enemy, player)) {
			enemy.explode();
			if(enemy.type !== 'S') {
				if(!player.shielded) {
					player.explode();
				}
				else {
					player.shielded = false;
				}
			}
		}
	});
}