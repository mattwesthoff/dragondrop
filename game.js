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
        self.swap(dragon, target, true);
    };

    self.swap = function (source, target, draggableSource) {
        var sourceCopy = source.clone().css({ "left": '', "opacity": '', "top": '' });
        if (draggableSource) { sourceCopy.draggable(self.draggableOptions); }
        var targetCopy = target.clone().css({ "left": '', "opacity": '', "top": '' }).droppable({ drop: self.handleDrop });

        if (target.hasClass("monster")) {
            targetCopy.removeClass("monster").addClass("empty").text("empty");
        }

        var targetx = target.attr("gridx");
        var targety = target.attr("gridy");
        targetCopy.attr("gridx", source.attr("gridx"));
        targetCopy.attr("gridy", source.attr("gridy"));
        sourceCopy.attr("gridx", targetx);
        sourceCopy.attr("gridy", targety);

        source.before(targetCopy).remove();
        target.before(sourceCopy).remove();
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
    }

    self.isPassable = function (x, y) {
        var guy = self.getGuy(x, y);
        if (guy === null) {
            return false;
        }
        return guy.isEmpty();
    };

    self.random = function (upto) {
        return Math.floor(Math.random() * upto)
    }

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

        $(".monster").live('tick', function (event) {
            var monsterNode = $(this);
            var x = parseInt(monsterNode.attr("gridx"));
            var y = parseInt(monsterNode.attr("gridy"));
            
            var monster = self.getGuy(x, y);
            var possiblemoves = [];
            if (self.isPassable(x, y - 1)) {
                possiblemoves.push({ 'x': x, 'y': y - 1 });
            }
            if (self.isPassable(x, y + 1)) {
                possiblemoves.push({ 'x': x, 'y': y + 1 });
            }
            if (self.isPassable(x - 1, y)) {
                possiblemoves.push({ 'x': x - 1, 'y': y });
            }
            if (self.isPassable(x + 1, y)) {
                possiblemoves.push({ 'x': x + 1, 'y': y });
            }
            if (possiblemoves.length !== 0) {
                var move = possiblemoves[self.random(possiblemoves.length)];

                var target = self.getNode(move.x, move.y);
                console.log("monster " + x + "," + y + " moving to empty " + move.x + "," + move.y);
                self.swap(monsterNode, target);
            }
        });
    };
    
    self.tick = function () {
        $(".grid").trigger("tick");
        setTimeout(self.tick, self.tickInterval);
    }

    self.run = function (tickInterval) {
        self.tickInterval = tickInterval;
        setTimeout(self.tick, self.tickInterval);
    }
}

$(document).ready(function () {

    var game = new ddGame(board);
    game.init();

    //2 seconds per tick
    game.run(2000);
});