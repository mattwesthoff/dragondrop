function square(type) {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.type = type;
    self.isDragon = function () { return self.type === 'dragon'; };
    self.isWall = function () { return self.type === 'wall'; };
    self.isEmpty = function () { return self.type === 'empty'; };
    self.isMonster = function () { return self.type === 'monster'; };
    self.isDraggable = function () { return self.isDragon(); };
}

var board = [
        [ new square("wall"), new square("dragon"), new square("monster"), new square("empty") ],
        [ new square("wall"), new square("wall"), new square("empty"), new square("empty") ],
        [ new square("dragon"), new square("empty"), new square("monster"), new square("empty") ],
        [ new square("empty"), new square("empty"), new square("wall"), new square("empty") ],
        [ new square("empty"), new square("wall"), new square("empty"), new square("monster") ]
];

function ddGame(board) {
    var self = this;
    self.board = board;
    self.draggableOptions = { revert: true };

    self.handleDrop = function (event, ui) {
        var dragon = ui.draggable;
        var target = $(this);
        dragon =  self.swap(dragon, target, true);
        self.dragonAttack(dragon);
    };

    self.swap = function (source, target) {
        var sourceCopy = source.clone().css({ "left": '', "opacity": '', "top": '' });
        
        var targetCopy = target.clone().css({ "left": '', "opacity": '', "top": '' }).droppable({ drop: self.handleDrop });

        if (source.hasClass("ui-draggable")) {
            sourceCopy.draggable(self.draggableOptions);
        }

        if (source.hasClass("ui-droppable")) {
            sourceCopy.droppable({ drop: self.handleDrop });
        }

        if (target.hasClass("monster")) {
            self.eatMonster(targetCopy);
        }

        var targetx = target.attr("gridx");
        var targety = target.attr("gridy");
        var sourcex = source.attr("gridx");
        var sourcey = source.attr("gridy");

        var targetGuy = self.getGuy(targetx, targety);
        var sourceGuy = self.getGuy(sourcex, sourcey);
        self.board[targety][targetx] = sourceGuy;
        self.board[sourcey][sourcex] = targetGuy;

        targetCopy.attr("gridx", sourcex);
        targetCopy.attr("gridy", sourcey);
        sourceCopy.attr("gridx", targetx);
        sourceCopy.attr("gridy", targety);

        source.before(targetCopy).remove();
        target.before(sourceCopy).remove();

        return sourceCopy;
    };
    
    self.getGuy = function (x, y) {
        if (x < 0 || y < 0) {
            return null;
        }

        if (y >= self.board.length || x >= self.board[0].length) {
            return null;
        }
        return self.board[y][x];
    };

    self.getNode = function (x, y) {
        var node = $("div[gridx='" + x + "'][gridy='" + y + "']");
        if (node.length) {
            if (node.length > 1) {
                alert("whahahh");
            }
        }
        return node;
    };

    self.isPassable = function (x, y) {
        var guy = self.getGuy(x, y);
        if (guy === null) {
            return false;
        }
        return guy.isEmpty();
    };

    self.random = function (upto) {
        return Math.floor(Math.random() * upto)
    };

    self.init = function () {
        var viewmodel = { rows: [] };

        for (var y in self.board) {
            var row = { squares: [] };
            var boxes = self.board[y];
            for (var x in boxes) {
                var box = boxes[x];
                box.x = x;
                box.y = y;
                row.squares.push(box);
            }
            viewmodel.rows.push(row);
        }

        ko.applyBindings(viewmodel);

        $(".dragon").draggable(self.draggableOptions);
        $(".empty").droppable({ drop: self.handleDrop });
        $(".monster").droppable({ drop: self.handleDrop});
    };
    
    self.tick = function () {
        $(".grid").trigger("tick");
 
        $(".monster").each(function (index) {
            self.moveMonster($(this));
        });

        $(".dragon").each(function (index) {
            self.dragonAttack($(this));
        });
        setTimeout(self.tick, self.tickInterval);
    };

    self.run = function (tickInterval) {
        self.tickInterval = tickInterval;
        setTimeout(self.tick, self.tickInterval);
    };

    self.getCoords = function (node) {
        var x = parseInt(node.attr("gridx"));
        var y = parseInt(node.attr("gridy"));

        return { 'x': x, 'y': y };
    };

    self.getPossibleDirections = function (loc, testFunc) {
        var possiblities = [];
        var testDir = function(x, y) {
            if (testFunc(x, y)) {
                possiblities.push({ 'x': x, 'y': y });
            }
        };
        
        testDir(loc.x, loc.y - 1);
        testDir(loc.x, loc.y + 1);
        testDir(loc.x + 1, loc.y);
        testDir(loc.x - 1, loc.y);

        return possiblities;
    };

    self.eatMonster = function (monsterNode) {
        monsterNode.removeClass("monster").addClass("empty").text("empty");
        var monsterLoc = self.getCoords(monsterNode);
        var corpse = new square("empty");
        corpse.x = monsterLoc.x;
        corpse.y = monsterLoc.y;
        self.board[monsterLoc.y][monsterLoc.x] = corpse;

    };

    self.dragonAttack = function (dragonNode) {
        //if dragon next to monster, they both wait, with a new class, then the turn after the minion dies
        var loc = self.getCoords(dragonNode);
        
        var adjMonsterLocs = self.getPossibleDirections(loc, function (x, y) {
            var guy = self.getGuy(x, y);
            if (guy) { return guy.isMonster(); }
            return false;
        });
        for (var i in adjMonsterLocs) {
            var monLoc = adjMonsterLocs[i];
            console.log("dragon attacking monster(" + monLoc.x + "," + monLoc.y + ")");
            var monster = self.getNode(monLoc.x, monLoc.y);
            if (monster.hasClass("eating")) {
                self.eatMonster(monster);
            }
            else {
                monster.addClass("eating");
            }
        }
    };

    self.moveMonster = function (monsterNode) {
        var loc = self.getCoords(monsterNode);
        var monster = self.getGuy(loc.x, loc.y);

        if (monsterNode.hasClass("eating")) {
            return;
        }

        var possibleMoves = self.getPossibleDirections(loc, self.isPassable);
        if (possibleMoves.length !== 0) {
            var move = possibleMoves[self.random(possibleMoves.length)];
            var target = self.getNode(move.x, move.y);
            self.swap(monsterNode, target, false, true);
        }
    };
}

$(document).ready(function () {

    var game = new ddGame(board);
    game.init();

    //2 seconds per tick
    game.run(2000);
});