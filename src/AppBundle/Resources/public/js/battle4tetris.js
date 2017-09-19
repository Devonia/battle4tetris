var actualPlayer,actualEnemy = null ;
var player1, player2 = null;
var poolOfWinElement = [];
var ruleBounce = null;
var table = $(".table");
var idPartie = $(".idPartie").val();
var plateau = [];
var alert = $(".messageError");
var eventClick = function () {
    checkIfPossibleAction($(this));
    // if(valideMove === true){
    //
    // }
};
$(document).ready(function(){
    init();
});

function bounce(element, callback){
    var ss = document.styleSheets;
    var offsetTop = element.offset().top;
    // loop through the stylesheets
    if(ruleBounce === null){
        for (var i = 0; i < ss.length; ++i) {
            if(ss[i].cssRules !== null){
                // loop through all the rules
                for (var j = 0; j < ss[i].cssRules.length; ++j) {
                    if(ss[i].cssRules[j].name === "BOUNCE"){
                        ruleBounce = ss[i].cssRules[j];
                    }
                }
            }
        }
    }

    ruleBounce.deleteRule("from");
    ruleBounce.deleteRule("50%");
    ruleBounce.deleteRule("to");

    ruleBounce.appendRule("from {top : "+ offsetTop +"px;}");
    ruleBounce.appendRule("50% {top : "+ (offsetTop - 70)  +"px;}");
    ruleBounce.appendRule("to {top : "+ offsetTop +"px;}");
    element.addClass("bouncing");
    setTimeout(function(){
        element.removeClass("bouncing");
        ruleBounce.deleteRule("from");
        ruleBounce.deleteRule("50%");
        ruleBounce.deleteRule("to");

        ruleBounce.appendRule("from {top : "+ offsetTop +"px;}");
        ruleBounce.appendRule("50% {top : "+ (offsetTop - 35)  +"px;}");
        ruleBounce.appendRule("to {top : "+ offsetTop +"px;}");
        element.addClass("bouncing");
    },350);

    setTimeout(function(e){
        element.removeClass("bouncing");
        element.css({position:'initial', width : "100%", height : "100%"});
    },700);
}

function init(){

    table.find('tbody tr').each(function (i) {
       plateau[i] = [];
       $(this).find("td").each(function(e){
           plateau[i][e] = null;
       });
    });

    $("#modalJoueur").modal({
        show : true,
        backdrop : "static"
    });

    $("#formPlayer").on("submit", function(event){
        event.preventDefault();
        var player1Name = $(".player1").val();
        var player2Name = $(".player2").val();
        $.ajax({
            url : Routing.generate("initPlayer", {P1Name : player1Name, P2Name : player2Name, idPartie : idPartie}),
            dataType : "json",
            method : "POST",
            success : function(data){
                player1 = data[0];
                player2 = data[1];
                actualPlayer = data[2] === 1 ? player1 : player2;
                highLightValidePlay();
                initTable();
                changeDisplayedPlayer();
                initPDVAndName();
                changeAlert("alert-info", "La pièce a désignée " + actualPlayer["name"] + " comme premier joueur.");
                $("#modalJoueur").modal("hide");
            }
        })
    });

    $("#formReload").on("submit",function(event){
        event.preventDefault();
        var idPartie = $("#reloadPartie").val();
        $.ajax({
           url : Routing.generate("reloadPartie", {idPartie : idPartie}),
            dataType : "json",
            method : "POST",
            success : function(data){
                var delay = 200;
                $("#modalJoueur").modal("hide");
                player1 = data["players"][0];
                player2 = data["players"][1];
                if(data["markedPoints"].length % 2){
                    actualPlayer = player2;
                }else{
                    actualPlayer = player1;
                }

                for (var i=0; i < data["markedPoints"].length; i++){
                    var element = table.find(".element[data-ligne='"+data["markedPoints"][i]["ligne"]+"'][data-position='"+data["markedPoints"][i]["position"]+"']");
                    elementSelected(element,data["markedPoints"][i]["player"], delay);
                    delay = delay + 400;
                }

                setTimeout(function(){
                    initPDVAndName();
                    changeDisplayedPlayer();
                    highLightValidePlay();
                    initTable();
                }, delay);
            },
            error : function(JQXHR,textStatut, errorText){

            }
        });
    });

    function initPDVAndName(){
        $(".player1Label").text(player1["name"]);
        $(".player2Label").text(player2["name"]);
        $(".currentPdvPlayer1").text(player1["life"]);
        $(".currentPdvPlayer2").text(player2["life"]);
    }
}

function victory(){
    return actualEnemy["life"] <= 0;
}

function initTable(){
    $(".element:not('.is-player-one,.is-player-two')").on('click',eventClick);
}

function disableTable(){
    table.find('.element').off('click');
    $.ajax({
        url : Routing.generate("endGame", {idPartie : idPartie}),
        method : "POST"
    });
}

function elementSelected(element,player, delay){
    setTimeout(function(){
        var currentOffset = element.offset().top;
        var currentWidth = element.width();
        var currentHeight = element.height();
        element.addClass(getPlayerClass(player));
        element.css({position : 'absolute', top : 0, width : currentWidth + "px", height : currentHeight + "px"});
        element.animate({
            top : currentOffset
        }, 250, function(){
            bounce(element);
        });
        plateau[element.data("ligne")][element.data("position")] = "not_empty";
        element.off("click");
    },delay);
}

function changeDisplayedPlayer(){
    $(".actualPlayer").text(actualPlayer["name"]);
}

function changePlayer(){
    if(actualPlayer["id"] === player1["id"]){
        actualPlayer = player2;
    }else{
        actualPlayer = player1;
    }
    changeEnemy(actualPlayer);
    changeDisplayedPlayer();
}

function changeEnemy(player){
    if(player === player1){
        actualEnemy = player2;
    }else{
        actualEnemy = player1;
    }
}

function checkIfPossibleAction(element){
    $("#loading").toggleClass("hidden");
    $.ajax({
        url : Routing.generate("checkIfValideMove", {ligne : element.data("ligne"), position : element.data("position")}),
        method : "POST",
        dataType : "json",
        data : { plateau : plateau, idPlayer : actualPlayer['id'] },
        async : true,
        success : function(response){
            if(response["success"] === true){
                elementSelected(element,actualPlayer,0);
                alert.addClass("hidden");
                if(checkIfWin(element, getPlayerClass(actualPlayer)) === true){
                    removeHighLight();
                    highLightWinCombo(poolOfWinElement);
                }else{
                    changePlayer();
                    highLightValidePlay();
                }
            }else{
                console.log("WTF o_O?");
            }
        },
        error : function () {
            changeAlert("alert-danger", actualPlayer["name"] + " souhaite réaliser une action impossible." +
                "Veuillez sélectionner un rond valide.");
        },
        complete: function(){
            $("#loading").toggleClass("hidden");
        }
    });

    // var position = element.data("position");
    // var searchedLigne = element.data("ligne") + 1;
    // var searchedElement = table.find(".element[data-ligne='"+searchedLigne+"'][data-position='"+position+"']");
    // if(searchedElement.length !== 0){
    //     return !!(searchedElement.hasClass("is-player-one") || searchedElement.hasClass("is-player-two"));
    // }else{
    //     return true;
    // }
}

function getPlayerClass(player){
    if(player["id"] === player1["id"]){
        return "is-player-one";
    }else{
        return "is-player-two";
    }
}

function getPlayerClassByElement(element){
    if(element.hasClass("is-player-one")){
        return "is-player-one";
    }else if(element.hasClass("is-player-two")){
        return "is-player-two";
    }else{
        return "ignored";
    }
}

function getPlayerByClass(classe){
    if(classe === "is-player-one"){
        return player1;
    }else{
        return player2;
    }
}

function checkIfWin(element, classe){
    var position = element.data("position");
    var actualLigne = element.data("ligne");
    var playerClass = classe;
    if(playerClass !== "ignored"){
        var verticalWin = checkVerticalWin();
        pushWinElement(element);
        if(!verticalWin){
            emptyPool();
            pushWinElement(element);
        }else{
            return true;
        }
        var horizontalWin = checkHorizontalWin();
        if(!horizontalWin){
            emptyPool();
            pushWinElement(element);
        }else{
            return true;
        }
        var diagonalRightWin = checkDiagonalRightWin();
        if(!diagonalRightWin){
            emptyPool();
            pushWinElement(element);
        }else{
            return true;
        }
        var diagonalLeftWin = checkDiagonalLeftWin();
        if(!diagonalLeftWin){
            emptyPool();
        }else{
            return true;
        }
    }

    return false;

    function checkVerticalWin(){
        var count = 0;
        for (var i = 1; i < 4; i++){
            var searchedLigne = actualLigne + i;
            var searchedElement = table.find(".element[data-ligne='"+searchedLigne+"'][data-position='"+position+"']");
            if(searchedElement.hasClass(playerClass)){
                count++;
                pushWinElement(searchedElement);
            }
        }

        return count === 3;
    }

    function checkHorizontalWin(){
        var count = 0;
        var nextElement = element.parent().next().children();
        var previousElement = element.parent().prev().children();
        while(nextElement.length !== 0 <= 9 && nextElement.hasClass(playerClass)){
            count++;
            pushWinElement(nextElement);
            nextElement = nextElement.parent().next().children();

        }

        while(previousElement.length !== 0 && previousElement.hasClass(playerClass)){
            count++;
            pushWinElement(previousElement);
            previousElement = previousElement.parent().prev().children();
        }

        return count >= 3;
    }

    function checkDiagonalRightWin(){
        var count = 0;
        var nextElement = element.parent().next().children();
        var searchedNextElement = table.find(".element[data-ligne='"+(nextElement.data('ligne') - 1)+"'][data-position='"+nextElement.data('position')+"']");
        var previousElement = element.parent().prev().children();
        var searchedPreviousElement = table.find(".element[data-ligne='"+(previousElement.data('ligne') + 1)+"'][data-position='"+previousElement.data('position')+"']");
        while(searchedNextElement.length !== 0 <= 9 && searchedNextElement.hasClass(playerClass)){
            count++;
            pushWinElement(searchedNextElement);
            nextElement = searchedNextElement.parent().next().children();
            searchedNextElement = table.find(".element[data-ligne='"+(nextElement.data('ligne') - 1)+"'][data-position='"+nextElement.data('position')+"']");
        }

        while(searchedPreviousElement.length !== 0 && searchedPreviousElement.hasClass(playerClass)){
            count++;
            pushWinElement(searchedPreviousElement);
            previousElement = searchedPreviousElement.parent().prev().children();
            searchedPreviousElement = table.find(".element[data-ligne='"+(previousElement.data('ligne') + 1)+"'][data-position='"+previousElement.data('position')+"']");
        }

        return count >= 3;
    }

    function checkDiagonalLeftWin(){
        var count = 0;
        var nextElement = element.parent().prev().children();
        var searchedNextElement = table.find(".element[data-ligne='"+(nextElement.data('ligne') - 1)+"'][data-position='"+nextElement.data('position')+"']");
        var previousElement = element.parent().next().children();
        var searchedPreviousElement = table.find(".element[data-ligne='"+(previousElement.data('ligne') + 1)+"'][data-position='"+previousElement.data('position')+"']");
        while(searchedNextElement.length !== 0 <= 9 && searchedNextElement.hasClass(playerClass)){
            count++;
            pushWinElement(searchedNextElement);
            nextElement = searchedNextElement.parent().prev().children();
            searchedNextElement = table.find(".element[data-ligne='"+(nextElement.data('ligne') - 1)+"'][data-position='"+nextElement.data('position')+"']");
        }

        while(searchedPreviousElement.length !== 0 && searchedPreviousElement.hasClass(playerClass)){
            count++;
            pushWinElement(searchedPreviousElement);
            previousElement = searchedPreviousElement.parent().next().children();
            searchedPreviousElement = table.find(".element[data-ligne='"+(previousElement.data('ligne') + 1)+"'][data-position='"+previousElement.data('position')+"']");
        }

        return count >= 3;
    }
}

function changeAlert(classe, message){
    alert.removeClass().addClass(classe + " alert");
    alert.text(message);
}

function highLightValidePlay(){
    removeHighLight();
    setTimeout(searchHighLight, 250);

    function searchHighLight(){
        table.find(".element").each(function(e){
            var element = $(this);
            if(!element.hasClass("is-player-one") && !element.hasClass("is-player-two") ){
                var ligne = element.data('ligne');
                var position = element.data('position');
                var comparedElement = table.find(".element[data-ligne='"+(ligne + 1)+"'][data-position='"+position+"']");
                if(comparedElement.length === 0 || comparedElement.hasClass("is-player-one") || comparedElement.hasClass("is-player-two")){
                    element.addClass('highlighted');
                }
            }
        });
    }
}

function pushWinElement(element){
    poolOfWinElement.push(element);
}

function emptyPool(){
    poolOfWinElement = [];
}

function highLightWinCombo(listOfElements){
    table.find(".element").each(function(e) {
        if(!inArray($(this)[0], listOfElements)){
            $(this).addClass("blured");
        }
    });

    for(var i=0; i < listOfElements.length; i++){
        listOfElements[i].addClass('highlighted');
    }
    setTimeout(removeHighLight, 3000);
    setTimeout(dissapearElement, 3000);
    setTimeout(moveOthersElements, 6000);
    setTimeout(removeBlured, 5000);

    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i][0] === needle) return true;
        }
        return false;
    }

    function dissapearElement(){
        var timer = 250;
        for(var i=0; i < listOfElements.length; i++){
            timeOutDissapear(listOfElements[i]);
            timer = timer + 250;
        }

        function timeOutDissapear(element){
            setTimeout(function(e){
                element.removeClass("is-player-one is-player-two",{duration : 350});
                dealDamage(element);
            },timer);
        }
    }

    function dealDamage(element){
        var playerDoingDamage = getPlayerByClass(getPlayerClassByElement(element));
        var pdvElement = null;
        changeEnemy(playerDoingDamage);
        if(actualEnemy === player1){
            pdvElement = $(".currentPdvPlayer1");
        }else{
            pdvElement = $(".currentPdvPlayer2");
        }
        pdvElement.addClass("losingPDV");
        var value = parseInt(pdvElement.text());
        pdvElement.text(value - 1);
        actualEnemy["life"]--;
        $.ajax({
            url : Routing.generate("savePlayer", {idPlayer : actualEnemy["id"], life : actualEnemy["life"]}),
            method : "POST"
        });
        pdvElement.removeClass("losingPDV", {duration : 350});
    }

    function moveOthersElements(){
        for(var i=0; i < listOfElements.length; i++){
            var destroyedElement = listOfElements[i];
            var positionOfElement = destroyedElement.data('position');
            var listOfMovingElement = table.find('.element[data-position = "' + positionOfElement + '"]').get().reverse();
            $(listOfMovingElement).each(function(e){
                var element = $(this);
                var ligneNextElement = element.data('ligne') - 1;
                var lignePreviousElement = element.data("ligne") + 1;
                var previousElement = table.find(".element[data-ligne='"+lignePreviousElement+"'][data-position='"+positionOfElement+"']");
                var nextElement = table.find(".element[data-ligne='"+ligneNextElement+"'][data-position='"+positionOfElement+"']");
                if(nextElement.length !== 0) {
                    var currentOffset = nextElement.offset().top;
                    var currentWidth = nextElement.width();
                    var currentHeight = nextElement.height();
                    if (nextElement.hasClass('is-player-one') || nextElement.hasClass('is-player-two')) {
                        if ((!element.hasClass('is-player-one') && !element.hasClass('is-player-two')) || element.hasClass("willMove")) {
                            nextElement.addClass("willMove");
                            var offsetTopNextPosition = element.offset().top;
                            nextElement.css({
                                position: 'absolute',
                                top: currentOffset,
                                width: currentWidth + "px",
                                height: currentHeight + "px"
                            });
                            nextElement.animate({
                                top: offsetTopNextPosition
                            }, 300, function () {
                                nextElement.css({position: 'initial', width: "100%", height: "100%"});
                                element.addClass(nextElement.attr("class"));
                                nextElement.removeClass("is-player-one is-player-two");

                            });
                        }
                    }
                }
            });
        }

        setTimeout(removeWillMoveClass, 1000);
        if(victory()){
            changeAlert("alert-success",actualPlayer["name"] + " a gagné!");
            disableTable();
        }else{
            setTimeout(reaffectClick, 1000);
            setTimeout(reCheckIfWin, 1500);
        }

        function reaffectClick(){
            table.find(".element").each(function(e){
                $(this).off("click");
                if(!$(this).hasClass("is-player-one") && !$(this).hasClass("is-player-two")){
                    $(this).on("click", eventClick);
                }
            });
        }

        function removeWillMoveClass(){
            table.find(".willMove").each(function(){
                $(this).removeClass("willMove");
            });
        }

        function reCheckIfWin(){
            emptyPool();
            allElement = table.find(".element");
            allElement.each(function(){
                var element = $(this);
                var win = checkIfWin(element, getPlayerClassByElement(element));
                if(win){
                    highLightWinCombo(poolOfWinElement);
                    return false;
                }

                if($(this)[0] === allElement.last()[0]){
                    highLightValidePlay();
                    changePlayer();
                }
            });
        }
    }
}

function removeHighLight(){
    table.find(".highlighted").each(function(e){
        $(this).removeClass("highlighted");
    });
}

function removeBlured(){
    table.find(".blured").each(function(e){
        $(this).removeClass("blured");
    });
}

