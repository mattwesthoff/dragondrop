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

function ddGame(board, tickInterval) {
    var self = this;
    self.board = board;
    self.tickInterval = tickInterval;

    self.draggableOptions = { revert: true };

    self.handleDrop = function (event, ui) {
        var dragon = ui.draggable;
        var target = $(this);
        self.swap(dragon, target);
    };

    self.swap = function (source, target) {
        var sourceCopy = source.clone().css({ "left": '', "opacity": '', "top": '' }).draggable(self.draggableOptions);
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
            $(this).text("ticked!");
        });
    };
    
    self.tick = function () {
        $(".grid").trigger("tick");
        setTimeout(self.tick, self.tickInterval);
    }

    self.run = function () {
        setTimeout(self.tick, self.tickInterval);
    }
}

$(document).ready(function () {

    var game = new ddGame(board, 1000);
    game.init();
    game.run();
    
});