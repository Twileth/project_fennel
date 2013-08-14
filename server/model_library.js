module.exports = (function (){
	var DM = require('./DM.js');
	var unit = require('./unit.js');
	var projectile = require('./projectile.js');
	var item = require('./item.js');
	// TODO: Refactor placement of unit behaviors.
	unit.behavior_normal = function (mover, event){
		if(mover.dead){ return;}
		switch(event.type){
		case DM.EVENT_TAKE_TURN:
			var new_dir = mover.direction;
			if(Math.random()*16 < 1){
				switch(Math.floor(Math.random()*10)){
				case 0: new_dir = DM.NORTH; break;
				case 1: new_dir = DM.SOUTH; break;
				case 2: new_dir = DM.EAST; break;
				case 3: new_dir = DM.WEST; break;
				}
			} else if(this.shoot_frequency && this.projectile_type){
				if(Math.random()*this.shoot_frequency > this.shoot_frequency-1){
					this.shoot();
				}
			}
			mover.move(new_dir, mover.speed())
		break;
		case DM.EVENT_STOP:
			switch(Math.floor(Math.random()*4)){
			case 0: mover.direction = DM.NORTH; break;
			case 1: mover.direction = DM.SOUTH; break;
			case 2: mover.direction = DM.EAST; break;
			case 3: mover.direction = DM.WEST; break;
			}
		break;
		case DM.DIED:
			if(Math.random() < DM.ITEM_DROP_PROBABILITY){
				var item_model_id = DM.pick(DM.ITEM_ARRAY);
				var item_model = model_library.get_model('item', item_model_id);
				var centered_x = mover.x + Math.floor((mover.width -item_model.width )/2);
				var centered_y = mover.y + Math.floor((mover.height-item_model.height)/2);
				var I = item_model.constructor.call(Object.create(item_model), centered_x, centered_y, undefined, undefined, this.screen);
			}
		break;
		}
	};
	unit.behavior_pause = function (mover, event){
		if(mover.dead){ return;}
		switch(event.type){
		case DM.EVENT_TAKE_TURN:
			if(this.storage_pausing){
				this.storage_pausing--;
				return;
			} else if(Math.random()*128 > 127){
				this.storage_pausing = DM.INVULNERABLE_TIME*3;
			}
		break;
		}
		this.behavior_normal(mover, event);
	};
	//
	var model_library = {
		get_model: function (category, model_id){
			if(this[category]){
				return this[category][model_id];
			}
		},
		item: {
			cherry: Object.create(item, {
				_graphic_state: {value: 'cherry'},
				potency: {value: 1},
				use: {value: function (mover){
					var healed = mover.adjust_hp(this.potency);
					if(healed){
						this.dispose();
					}
				}}
			}),
			plum: Object.create(item, {
				_graphic_state: {value: 'plum'},
				potency: {value: 5},
				use: {value: function (mover){
					var healed = mover.adjust_hp(this.potency);
					if(healed){
						this.dispose();
					}
				}}
			}),
			bottle: Object.create(item, {
				_graphic_state: {value: 'bottle'},
				use: {value: function (mover){
					if(!(typeof mover.adjust_mp === 'function') || !(typeof mover.max_mp === 'function')){
						return;
					}
					var healed = mover.adjust_mp(mover.max_mp());
					if(healed){
						this.dispose();
					}
				}}
			}),
			shield: Object.create(item, {
				_graphic_state: {value: 'shield'},
				potency: {value: DM.INVULNERABLE_TIME_SHIELD},
				use: {value: function (mover){
					if(!(typeof mover.invulnerable === 'function')){ return;}
					mover.invulnerable(this.potency);
					this.dispose();
				}}
			}),
			coin_silver: Object.create(item, {
				_graphic_state: {value: 'coin_silver'},
				potency: {value: 1},
				use: {value: function (mover){
					this.dispose();
				}}
			}),
			coin_gold: Object.create(item, {
				_graphic_state: {value: 'coin_gold'},
				potency: {value: 2},
				use: {value: function (mover){
					this.dispose();
				}}
			}),
			coin_diamond: Object.create(item, {
				_graphic_state: {value: 'coin_diamond'},
				potency: {value: 4},
				use: {value: function (mover){
					this.dispose();
				}}
			})
		},
		theme: {
			plains: {
				graphic: 'plains',
				song: '',
				infantry: ['bug1'],
				cavalry: ['bug2'],
				officer: [['bug3']],
				boss: ['spider1']
			},
			cave: {
				graphic: 'cave',
				song: '',
				infantry: ['','bat1','eyeball1','eyeball1'],
				cavalry: ['','eyeball1','eyeball2','spider1'],
				officer: ['','eyeball2','spider1','spider1'],
				boss: ['spider1']
			}
		},
		unit: {
			bug1: Object.create(unit, {
				_graphic: {value: 'bug1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 1},
				behavior_name: {value: "behavior_normal"}
			}),
			bug2: Object.create(unit, {
				_graphic: {value: 'bug2', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 2},
				behavior_name: {value: "behavior_normal"}
			}),
			bug3: Object.create(unit, {
				_graphic: {value: 'bug3', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 1},
				base_body: {value: 3},
				behavior_name: {value: "behavior_normal"},
			}),
			bat1: Object.create(unit, {
				_graphic: {value: 'bat1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 2},
				base_body: {value: 1},
				height: {value: 8},
				behavior_name: {value: "behavior_pause"}
			}),
			eyeball1: Object.create(unit, {
				_graphic: {value: 'eyeball1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 2},
				movement: {value: DM.MOVEMENT_ALL},
				behavior_name: {value: "behavior_normal"},
			}),
			eyeball2: Object.create(unit, {
				_graphic: {value: 'eyeball2', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 1},
				base_body: {value: 4},
				movement: {value: DM.MOVEMENT_ALL},
				behavior_name: {value: "behavior_normal"},
			}),
			spider1: Object.create(unit, {
				_graphic: {value: 'spider', writable: true},
				_graphic_state: {value: 'level1', writable: true},
				faction: {value: DM.F_ENEMY},
				width: {value: 32},
				height: {value: 32},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 5},
				movement: {value: DM.MOVEMENT_ALL},
				behavior_name: {value: "behavior_normal"},
				projectile_type: {value: 'silk'},
				shoot_frequency: {value: 64},
				shoot: {value: function (){
					this.direction = DM.flip(this.direction);
					unit.shoot.call(this);
					this.direction = DM.flip(this.direction);
				}}
			})
		},
		projectile: {
			fist: Object.create(projectile, {
				_graphic: {value: 'fist', writable: true},
				width: {value: 8},
				height: {value: 8},
				max_range: {value: 16},
				speed: {value: 4},
				potency: {value: 1},
				movement: {value: DM.MOVEMENT_ALL},
				constructor: {value: function (user, skill, direction){
					projectile.constructor.call(this, user, skill, direction);
					user.intelligence_add(this);
					return this;
				}},
				dispose: {value: function (){
					if(this.owner && this.owner._graphic_state == 'attack'){
						this.owner.graphic_state = null;
					}
					projectile.dispose.call(this);
				}},
				handle_event: {value: function (controlled_mover, event){
					if(controlled_mover == this){
						return projectile.handle_event.call(this, controlled_mover, event);
					}
					switch(event.type){
					case DM.EVENT_TAKE_TURN:
						if(controlled_mover._graphic_state != 'attack'){
							controlled_mover.graphic_state = 'attack';
						}
						return false;
					}
					return true;
				}}
			}),
			silk: Object.create(projectile, {
				_graphic: {value: 'silk', writable: true},
				width: {value: 8},
				height: {value: 8},
				max_range: {value: 64},
				speed: {value: 1},
				potency: {value: 0},
				explosive: {value: true},
				terminal_explosion: {value: true},
				movement: {value: DM.MOVEMENT_FLOOR},
				explode: {value: function (){
					var web_model = model_library.get_model('projectile', 'web');
					var web = web_model.constructor.call(Object.create(web_model), this.owner, null, null);
					web.x = this.x + (this.width -web.width )/2;
					web.y = this.y + (this.height-web.height)/2;
					this.dispose();
				}}
			}),
			web: Object.create(projectile, {
				_graphic: {value: 'web', writable: true},
				width: {value: 32},
				height: {value: 32},
				speed: {value: 0},
				projecting: {value: 0},
				potency: {value: 0},
				max_time: {value: 256},
				collision_check_priority: {value: DM.COLLISION_PRIORITY_UNIT},
				attack: {value: function (mover){
					if(mover.invulnerable_time || mover.invincible){ return}
					if(this.faction & mover.faction){ return;}
					mover.intelligence_add(Object.create(model_library.get_model('intelligence', 'freeze'), {
						time_left: {value: 74, writable: true}
					}));
					var target_coordinate = {
						x: this.x,
						y: this.y,
						width: this.width,
						height: this.height
					}
					this.owner.direction = this.owner.direction_to(target_coordinate);
					this.owner.intelligence_add({
						target: target_coordinate,
						time: 96,
						handle_event: function (controlled, event){
							if(event.type === DM.EVENT_TAKE_TURN){
								if(Math.random()*9 > 8){
									controlled.direction = controlled.direction_to(this.target);
								}
								controlled.move(controlled.direction, controlled.speed()*2)
								if(this.time-- <= 0){
									controlled.intelligence_remove(this);
								}
								return false;
							}
							if(event.type === DM.EVENT_INTELLIGENCE_ADDED){
								return false;
							}
							return true;
						}
					})
					this.dispose();
				}}
			})
		},
		intelligence: {
			freeze: {
				time_left: DM.TRANSITION_INVULNERABILITY_TIME,
				constructor: function (time){
					if(time){
						this.time_left = time;
					}
					return this;
				},
				handle_event: function (mover, event){
					if(event.type === DM.EVENT_TAKE_TURN){
						if(--this.time_left > 0){
							return false;
						} else{
							mover.intelligence_remove(this);
						}
					}
					return true;
				}
			}
		}
	};
	return model_library;
})();