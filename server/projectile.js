module.exports = (function (){
	var DM = require('./DM.js');
	var mover = require('./mover.js');
	var projectile = Object.create(mover, {
		// Redefined Values:
		collision_check_priority: {
			value: DM.COLLISION_PRIORITY_PROJECTILE,
			writable: true
		},
		movement: {
			value: DM.MOVEMENT_FLOOR | DM.MOVEMENT_WATER,
			writable: true
		},
		faction: {
			value: undefined,
			writable: true
		},
		// Redefined Functions:
		constructor: {value: function (owner, skill, direction){
			mover.constructor.call(this, undefined, undefined, undefined, undefined, owner.screen);
			this.vel = {x:0, y:0};
			//var center_loc = function (target, center){
            this.direction = direction || (owner && owner.direction) || DM.SOUTH;
			this.center(owner);
			//}
			if(owner){
				this.owner = owner
				if(!this.faction){
					this.faction = this.owner.faction
				}
				//this.owner.projectiles.add(src)
				if(this.projecting){
					this.project()
				}
			}/*
			if(_skill){
				if(_skill.potency >= 1){
					potency = _skill.potency
				}
			}*/
			return this;
		}},
		behavior_name: {value: "behavior", writable: true},
		behavior: {value: function (mover, event){
			if(mover != this){ return false;}
			switch(event.type){
				case DM.EVENT_TAKE_TURN: {
					if(this.max_range){
						if(this.current_range >= this.max_range){
							if(this.terminal_explosion){
								this.explode()
							}
							else{
								this.dispose()
							}
						}
						this.current_range += Math.max(Math.abs(this.vel.x), Math.abs(this.vel.y))
					}
					if(this.max_time){
						if(this.current_time  >= this.max_time ){
							if(this.terminal_explosion){
								this.explode()
							}
							else{
								this.dispose()
							}
						}
						this.current_time++
					}
					var old_dir = this.direction;
					if(     this.vel.x > 0){ this.move(DM.EAST , Math.abs(this.vel.x));}
					else if(this.vel.x < 0){ this.move(DM.WEST , Math.abs(this.vel.x));}
					if(     this.vel.y > 0){ this.move(DM.NORTH, Math.abs(this.vel.y));}
					else if(this.vel.y < 0){ this.move(DM.SOUTH, Math.abs(this.vel.y));}
					this.direction = old_dir;
					var update_data = {
						"x": this.x,
						"y": this.y,
						"direction": this.direction
					};
					this.update_public(update_data);
					break;
				}
				case DM.EVENT_SCREEN_CROSS: 
				case DM.EVENT_STOP: {
					if(this.explosive){
						this.explode();
					} else{
						this.dispose();
					}
					break;
				}
			}
		}},
		collide: {value: function (mover){
			if(this.faction & mover.faction){ return;}
			if(mover["hurt"]){
				this.attack(mover);
			}
		}},
		// Newly Defined Values:
		owner: {
			value: undefined,
			writable: true
		},
		speed: {
			value: 1,
			writable: true
		},
		potency: {
			value: 0,
			writable: true
		},
		projecting: {
			value: true,
			writable: true
		},
		persistent: {
			value: false,
			writable: true
		},
		explosive: {
			value: false,
			writable: true
		},
		terminal_explosion: {
			value: false,
			writable: true
		},
		max_range: {
			value: DM.MAGIC_NUMBER/2,
			writable: true
		},
		max_time: {
			value: undefined,
			writable: true
		},
		current_range: {
			value: 0,
			writable: true
		},
		current_time: {
			value: 0,
			writable: true
		},
		interaction_properties: {
			value: 0,
			writable: true
		},
		// Newly Defined Functions:
		center: {value: function (center_mover){
			this.x = center_mover.x + (center_mover.width  - this.width )/2;
			this.y = center_mover.y + (center_mover.height - this.height)/2;
			if(this.projecting){
				switch(this.direction){
					case undefined:
					case null:
					case false:
					break;
					case DM.NORTH:
						this.y = center_mover.y;
					break;
					case DM.SOUTH:
						this.y = center_mover.y + center_mover.height - this.height;
					break;
					case DM.EAST:
						this.x = center_mover.x + center_mover.width - this.width;
					break;
					case DM.WEST:
						this.x = center_mover.x;
					break;
				}
			}
		}},
		project: {value: function (dir){
			if(!dir){ dir = this.owner.direction}
			this.direction = dir
			if(this.direction&DM.NORTH){ this.vel.y =  this.speed}
			if(this.direction&DM.SOUTH){ this.vel.y = -this.speed}
			if(this.direction&DM.EAST ){ this.vel.x =  this.speed}
			if(this.direction&DM.WEST ){ this.vel.x = -this.speed}
		}},
		explode: {value: function (){
			this.dispose()
		}},
		attack: {value: function (mover){
			if(this.potency){
				mover.hurt(this.potency, this.owner, this)
			}
			if(!this.persistent){
				if(this.explosive){
					this.explode();
				} else{
					this.dispose();
				}
			}
		}},
		collect_item: {value: function (item){
			if(this.owner && (typeof this.owner.collect_item === 'function')){
				item.use(this.owner);
			}
		}}
	});
	/*
		layer = MOB_LAYER+1
		Del(){
			if(owner && owner.projectiles){
				owner.projectiles.Remove(src)
			}
			. = ..()
		}
		*/
	return projectile;
})();