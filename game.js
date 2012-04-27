var count = 0;

function square(type) {
    var self = this;
    self.id = count++;
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

$(document).ready(function () {
    var viewmodel = { rows: [] };

    for (var id in board) {
        var row = { squares: [] };
        var boxes = board[id];
        for (var bid in boxes) {
            row.squares.push(boxes[bid]);
        }
        viewmodel.rows.push(row);
    }

    var draggableOptions = {
        revert: true,
        start: function () {
            dragSource = $(this).parent();
        }
    };
    ko.applyBindings(viewmodel);

    $(".dragon").draggable(draggableOptions);

    var dropFunction = function (event, ui) {
        var dragon = ui.draggable;
        var target = $(this);
        var dragonCopy = dragon.clone().css({ "left": '', "opacity": '', "top": '' }).draggable(draggableOptions);
        var targetCopy = target.clone().css({ "left": '', "opacity": '', "top": '' }).droppable({ drop: dropFunction });

        if (target.hasClass("monster")) {
            targetCopy.removeClass("monster").addClass("empty").text("empty");
        }
        
        dragon.before(targetCopy).remove();
        target.before(dragonCopy).remove();
    }

    var dragSource = null;
    $(".empty").droppable({ drop: dropFunction });
    $(".monster").droppable({ drop: dropFunction });
});


