function Player() {
return {
		x: 220,
		y: 370,
		width: 40,
		height: 32,
		rateOfFire: 250,
		multishot: false,
		active: true,
		charging: false,
		shielded: false,
		multiTime: 0,
		draw: function() {
			this.sprite.draw(canvas, this.x, this.y);
			// Draw player shield transparent
			if(this.shielded) {
				canvas.globalAlpha = 0.2;
				this.shieldSprite.draw(canvas, this.x-5, this.y-10);
				canvas.globalAlpha = 1;
			}
		},
		midpoint: function() {
			return {
				x: this.x + this.width/2,
				y: this.y + this.height/2
			};
		},
		shoot: function() {
			var bulletPosition = this.midpoint();

			setTimeout(function() { 
							player.charging = false;
							playerBullets.push(Bullet({
							speed: 9,
							x: bulletPosition.x,
							y: bulletPosition.y
							}))

							if(player.multishot) {
								var bullet2 = Bullet({
											speed: 9,
											x: bulletPosition.x,
											y: bulletPosition.y
											});
								var bullet3 = Bullet({
											speed: 9,
											x: bulletPosition.x,
											y: bulletPosition.y
											});
								bullet2.xVelocity = -5;
								bullet3.xVelocity = 5;
								playerBullets.push(bullet2);
								playerBullets.push(bullet3);
							}
						}, this.rateOfFire);
		},
		
		sprite: Sprite("player.png"),
		leftsprite: Sprite("shipLeft.png"),
		rightsprite: Sprite("shipRight.png"),
		straightsprite: Sprite("player.png"),
		deathsprite: Sprite("explosion.png"),
		shieldSprite: Sprite("playerShield.png"),
		
		explode: function() {
			this.active = false;
		},
		addPowerUp: function(type) {
			switch(type) {
				case 'S':
					this.shielded = true;
					break;
				case 'M':
					this.multishot = true;
					setTimeout(function(){ player.multishot = false; }, 15000);
					break;
			}
		}
};
}