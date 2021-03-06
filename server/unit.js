module.exports = (function (){
	var DM = require('./DM.js');
	var mover = require('./mover.js');
	//var map = require('./map.js');
	var unit = Object.create(mover, {
		// Redefined Values:
		width: {value: 16/*map.tile_size*/, writable: true}, // TODO: MAGIC NUMBERS!
		height: {value: 16/*map.tile_size*/, writable: true},
		_graphic: {value: "adventurer", writable: true},
		dense: {value: true, writable: true},
		movement: {value: DM.MOVEMENT_FLOOR, writable: true},
		collision_check_priority: {value: DM.COLLISION_PRIORITY_UNIT, writable: true},
		// Redefined Functions:
		constructor: {value: function (x, y, screen){
			// The above comes first because updated_public() is called with the graphic in mover.constructor
			// 'above' code no longer exists. Leaving this here for now in case I need to know that graphic thing later.
			mover.constructor.call(this, x, y, undefined, undefined, screen);
			this.hp = this.base_body;
			this.mp = this.base_aura;
            var model_library = require('./model_library.js');
            if(typeof this.skill_id_primary == 'string' && !this.primary){
                this.primary = model_library.get_model('skill', this.skill_id_primary);
            }
            if(typeof this.skill_id_secondary == 'string' && !this.secondary){
                this.secondary = model_library.get_model('skill', this.skill_id_secondary);
            }
            if(typeof this.skill_id_tertiary == 'string' && !this.tertiary){
                this.tertiary = model_library.get_model('skill', this.skill_id_tertiary);
            }
            if(typeof this.skill_id_quaternary == 'string' && !this.quaternary){
                this.quaternary = model_library.get_model('skill', this.skill_id_quaternary);
            }
			return this;
		}},
		dispose: {value: function (){
			for(var I = this.projectiles.length-1; I >= 0; I--){
				var projectile = this.projectiles[I]
				projectile.dispose()
			}
			mover.dispose.call(this);
		}},
		collide: {value: function (mover){
			if(this.dead){ return};
			if(!this.touch_damage){ return;}
			if(this.faction & mover.faction){ return;}
			if(mover["hurt"]){
				this.attack(mover, this.touch_damage);
			}
		}},
		// Newly Defined Values:
		level: {value: 1, writable: true},
		dead: {value : false, writable: true},
		hp: {value: 0, writable: true},
		mp: {value: 0, writable: true},
		revivable: {value: false, writable: true},
		death_timer: {value: 0, writable: true},
		faction: {value: DM.F_PLAYER, writable: true},
		touch_damage: {value: 0, writable: true},
		base_body: {value: 3, writable: true},
		base_aura: {value: 1, writable: true},
		base_speed: {value: 2, writable: true},
		projectiles: {value: Object.create(DM.list), writable: true},
		front_protection: {value: false, writable: true},
		invulnerable_time: {value: 0, writable: true},
		invincible: {value: false, writable: true},
		body_regen_rate: {value: 2048, writable: true},
		aura_regen_rate: {value: 256, writable: true},
		body_wait_time: {value: -1, writable: true},
		aura_wait_time: {value: -1, writable: true},
		taxonomy: {value: DM.M_HUMAN, writable: true},
		primary: {value: undefined, writable: true},
		shoot_frequency: {value: undefined, writable: true},
		projectile_type: {value: undefined, writable: true},
		boss: {value: false, writable: true},
		// Newly Defined Functions:
		command: {value: function (command){
			if(this.dead){ return;}
			if(command & (DM.NORTH|DM.SOUTH|DM.EAST|DM.WEST)){
				this.move(command, this.speed());
			}
			if(command & DM.PRIMARY){
				if(this.primary){
					this.primary.use(this);
				}
			}
			if(command & DM.SECONDARY){
				if(this.secondary){
					this.secondary.use(this);
				}
			}
			if(command & DM.TERTIARY){
				if(this.tertiary){
					this.tertiary.use(this);
				}
			}
			/*if(command & DM.SECONDARY){
				var M = unit.constructor.call(Object.create(unit), 150, 150, this.screen);
				M.touch_damage = 1;
				M.intelligence_add({
					handle_event: function (mover, event){
						if(mover.dead){ return;}
						switch(event.type){
							case DM.EVENT_TAKE_TURN: {
								var new_dir = mover.direction;
								if(Math.random()*16 < 1){
									switch(Math.floor(Math.random()*10)){
										case 0: new_dir = DM.NORTH; break;
										case 1: new_dir = DM.SOUTH; break;
										case 2: new_dir = DM.EAST; break;
										case 3: new_dir = DM.WEST; break;
									}
								}
								mover.move(new_dir, 2)
								break;
							}
							case DM.EVENT_STOP: {
								switch(Math.floor(Math.random()*4)){
									case 0: mover.direction = DM.NORTH; break;
									case 1: mover.direction = DM.SOUTH; break;
									case 2: mover.direction = DM.EAST; break;
									case 3: mover.direction = DM.WEST; break;
								}
								mover.update_public({"direction": mover.direction})
								break;
							}
						}
					}
				});
			}*/
		}},
		augment: {value: function (identity, value){
			/* Currently augmentable values:
			 * body aura speed
			 *
			 * Non-augmentable values:
			 * touch_damage
			 */
			/*for(var/skill/augmentator in skills){
				if(augmentator.innate){
					value = augmentator.augment(identity, value)
				}
			}*/
			/*for(var/item/gear/augmentator in list(armor,shield,charm)){
				value = augmentator.augment(identity, value)
			}*/
			/*for(var/enchantment/augmentator in enchantments){
				value = augmentator.augment(identity, value)
			}*/
			return value
		}},
		max_body: {value: function (){
			return this.augment("body", this.base_body)
		}},
		max_aura: {value: function (){
			return this.augment("aura", this.base_aura)
		}},
		max_hp: {value: function (){
			var hp_bonus = this.max_body();
			/*if(this.shield){ hp_bonus += this.shield.health_bonus}
			if(this.armor ){ hp_bonus +=  this.armor.health_bonus}
			if(this.charm ){ hp_bonus +=  this.charm.health_bonus}*/
			return hp_bonus
		}},
		max_mp: {value: function (){
			var mp_bonus = this.max_aura();
			/*if(this.shield){ mp_bonus += this.shield.magic_bonus}
			if(this.armor ){ mp_bonus +=  this.armor.magic_bonus}
			if(this.charm ){ mp_bonus +=  this.charm.magic_bonus}*/
			return mp_bonus
		}},
		speed: {value: function (){
			return this.augment("speed", this.base_speed);
		}},
		take_turn: {value: function (){
			mover.take_turn.call(this);
			if(this.dead){
				if(--this.death_timer <= 0){
					this.dispose();
				}
				return;
			}
			if(this.invulnerable_time){
				this.invulnerable(-1);
			}
			/*
			else if(invisibility){
				invisibility = 0
				}
			for(var/enchantment/E in enchantments){
				E.tick(src)
				}
			if(hp < max_body()){
				if(!(game.time % augment("body_regen", body_regen_rate))){
					adjust_hp(1, src)
					}
				}
			*/
			if(this.mp < this.max_aura()){
				if(this.aura_wait_time < 0){
					this.aura_wait_time = this.aura_regen_rate;
				}
				this.aura_wait_time--;
				if(this.aura_wait_time == 0){
					this.adjust_mp(1, this)
				}
			}
			/*
			. = ..()
			}*/
		}},
		/*
		behavior(){
			if(hascall(src, behavior)){
				var/_speed = speed()
				if(_speed >= 1){ // TODO:: Is this a good behavior? When do I ever call behavior with an "event"?
					call(src, behavior)()
					}
				else{
					var/modulos = 1/_speed
					if(!(game.time%modulos)){
						call(src, behavior)()
						}
					}
				}
			}*/
		shoot: {value: function (projectile_model){
			if(!projectile_model){
				var model_library = require('./model_library.js'); // TODO: Factor out the placement of this.
				projectile_model = model_library.get_model('projectile', this.projectile_type);
			}
			if(!projectile_model){
				return;
			}
			projectile_model.constructor.call(Object.create(projectile_model), this, null, this.direction);
		}},
		adjust_hp: {value: function (amount){
			var old_health = this.hp;
			this.hp += amount;
			this.hp = Math.min(this.max_hp(), Math.max(0, this.hp));
			var delta_health = this.hp - old_health;
			var result = delta_health;
			this.change_status("hp");
			if(this.hp <= 0){
				this.die();
			}
			return result;
		}},
		adjust_mp: {value: function (amount){
			var old_magic = this.mp;
			this.mp += amount;
			this.mp = Math.min(this.max_mp(), Math.max(0, this.mp));
			var delta_magic = this.mp - old_magic;
			var result = delta_magic;
			this.change_status("mp");
			return result;
		}},
		attack: {value: function (target, amount, proxy){
			target.hurt(amount, this, proxy)
		}},
		hurt: {value: function (damage, attacker, proxy){
			if(this.dead){
				return;
			}
			if(this.invulnerable()){
				return
			}
            if(proxy){
                var dir_to_attack = this.direction_to(proxy);
                if(!this.graphic_state && this.front_protection){
                    if(dir_to_attack == this.direction){
                        var push_dir = DM.flip(dir_to_attack);
                        var push_time = 3;
                        var push_speed = 3;
                        var pusher = unit.pusher.constructor.call(Object.create(unit.pusher), push_dir, push_time, push_speed);
                        this.intelligence_add(pusher);
                        return
                    }
                }
            }
			/*if(spam_attack_block){
				invulnerable = INVULNERABLE_TIME
			}*/
			//else{
				this.invulnerable(DM.INVULNERABLE_TIME);
			//}
			this.adjust_hp(-damage);
			if(!this.disposed){
				var recoil_dir = (attacker || proxy).direction_to(this);
				var recoil_time = 5;
				var recoil_speed = 5;
				var pusher = unit.pusher.constructor.call(Object.create(unit.pusher), recoil_dir, recoil_time, recoil_speed);
				this.intelligence_add(pusher)
			}
		}},
		die: {value: function (){
			if(this.dead){ return}
			if(this.boss && this.screen.passage){
				this.screen.passage.unlock();
			}
			this.handle_event(this, {type: DM.EVENT_DIED});
			if(this.revivable){
				this.dead = true;
				this.death_timer = 256;
				this.graphic = "tomb";
				this.invulnerable_time = 0;
				this.update_public({
					invulnerable: this.invulnerable_time,
					dead: this.dead
				});
				// TODO: Magic number!
			} else{
				this.dispose();
			}
		}},
		invulnerable: {value: function (amount){
			if(amount){
				if(amount < 0){
					if(this.invulnerable_time > 0){
						this.invulnerable_time = Math.max(this.invulnerable_time + amount, 0);
						if(this.invulnerable_time == 0){
							this.update_public({invulnerable: this.invulnerable_time});
						}
					}
				} else if(this.invulnerable_time){
					this.invulnerable_time = Math.max(this.invulnerable_time, amount);
					this.update_public({invulnerable: this.invulnerable_time});
				} else{
					this.invulnerable_time = amount;
					this.update_public({invulnerable: this.invulnerable_time});
				}
			}
			return this.invulnerable_time;
		}},
		collect_item: {value: function (item){
			item.use(this);
		}},
		change_status: {value: function (/* Accessed via arguments array*/){
			var request_array = arguments;
			var event = {type: DM.EVENT_STATUS_CHANGE};
			for(var I = 0; I < request_array.length; I++){
				switch(request_array[I]){
					case "hp": {
						event.hp = [this.hp, this.max_body(), this.max_hp()];
						break;
					}
					case "mp": {
						event.mp = [this.mp, this.max_aura(), this.max_mp()];
						break;
					}
				}
			}
			this.handle_event(this, event);
		}}
		/*
		adjust_mp(amount){
			var/old_magic = mp
			mp += amount
			mp = min(max_mp(), max(0, mp))
			var/delta_magic = mp - old_magic
			. = delta_magic
			if(. && unit_interface){
				unit_interface.refresh_mp()
				}
			}*/
		/*
		attack(var/unit/target, amount, var/projectile/proxy){
			target.hurt(amount, src, proxy)
			}*/
		/*
		hurt(damage, var/unit/attacker, var/projectile/proxy){
			if(invulnerable){
				return
				}
			var/dir_to_attack = dir_to(src, (proxy? proxy : attacker))
			if(icon_state == rest_state && augment("front_protection", FALSE)){
				if(proxy && dir_to_attack == dir){
					damage = augment("front_damage", damage)
					if(front_protection || !damage){
						var/recoil_dir = turn(dir_to_attack, 180)
						push(recoil_dir, 1,  7)
						push(recoil_dir, 3, 15)
						return
						}
					}
				}
			if(spam_attack_block){
				invulnerable = INVULNERABLE_TIME
				}
			else{
				invulnerable = INVULNERABLE_TIME
				}
			var/old_health = hp
			adjust_hp(-damage)
			. = old_health - hp
			if(hp){
				var/recoil_dir = turn(dir_to_attack, 180)
				//push(recoil_dir, HURT_SPEED, HURT_DISTANCE)
				push(recoil_dir, 1,  7)
				push(recoil_dir, 3, 15)
				push(recoil_dir, 4, 12)
				}
			}*/
		/*
		add_skill(var/skill/_skill){
			if(istext(_skill)){
				_skill = game.skill_library.look_up(_skill)
				}
			for(var/skill/old_skill in skills){
				if(old_skill.name == _skill.name){
					if(unit_interface){
						if(unit_interface.secondary == old_skill){
							unit_interface.secondary = _skill
							}
						if(unit_interface.tertiary == old_skill){
							unit_interface.tertiary = _skill
							}
						if(unit_interface.quaternary == old_skill){
							unit_interface.quaternary = _skill
							}
						}
					skills.Remove(old_skill)
					}
				}
			if(!istype(_skill)){
				return FALSE
				}
			if(!skills){
				skills = new()
				}
			if(skills.len >= MAX_SKILLS){
				return FALSE
				}
			skills.Add(_skill)
			if(unit_interface){
				unit_interface.refresh_hp()
				unit_interface.refresh_mp()
				unit_interface.refresh_skills()
				}
			}*/
		/*
		add_item(var/item/I){
			if(istext(I)){
				I = game.item_library.instantiate(I)
				}
			if(!inventory){
				inventory = new()
				}
			if(inventory.len >= MAX_INVENTORY){
				return FALSE
				}
			. = TRUE
			inventory.Add(I)
			}*/
	});
	unit.pusher = {
		constructor: function (direction, time, speed){
			this.direction = direction;
			this.time = time;
			this.speed = speed;
			return this;
		},
		handle_event: function (mover, event){
			switch(event.type){
				case DM.EVENT_TAKE_TURN: {
					var vel_x = 0;
					var vel_y = 0;
					switch(this.direction){
						case DM.NORTH: {
							vel_y = -this.speed;
							break;
						}
						case DM.SOUTH: {
							vel_y =  this.speed;
							break;
						}
						case DM.EAST: {
							vel_x =  this.speed;
							break;
						}
						case DM.WEST: {
							vel_x = -this.speed;
							break;
						}
					}
					mover.translate(vel_x, vel_y)
					this.time--
					if(this.time <= 0){
						mover.intelligence_remove(this);
					}
					break;
				}
				case DM.EVENT_STOP:
				case DM.EVENT_SCREEN_CROSS: {
					mover.intelligence_remove(this);
					break;
				}
				case DM.EVENT_SCREEN_ENTER: {}
			}
			return true;
		}
	};
	return unit;
})();
