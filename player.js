function Player() {
return {
		x: 220,
		y: 370,
		width: 40,
		height: 32,
		rateOfFire: 250,
		active: true,
		charging: false,
		shielded: false,
		draw: function() {
			this.sprite.draw(canvas, this.x, this.y);
			// Draw player shield transparent
			canvas.globalAlpha = 0.2;
			if(this.shielded) {
				this.shieldSprite.draw(canvas, this.x-5, this.y-10);
			}
			canvas.globalAlpha = 1;
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
							speed: 7,
							x: bulletPosition.x,
							y: bulletPosition.y
							}))}, this.rateOfFire);
			return false;
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
			}
		}
};
}