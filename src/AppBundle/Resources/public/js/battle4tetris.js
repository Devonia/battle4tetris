var actualPlayer,actualEnemy = null ;
var player1, player2 = null;
var poolOfWinElement = [];
var ruleBounce = null;
var table = $(".table");
var idPartieActuel;
var plateau = [];
var alert = $(".messageError");
var compteurBlock = 0;
var online = false;
var socket = null;
var eventClick = function () {
    if(online){
        socket.emit("ifMyTurn", (boolean) => {
            if(boolean){
                checkIfPossibleAction($(this));
            }else{
                changeAlert("alert-danger", "Veuillez attendre la fin du tour de votre adversaire!");
            }
        });
    }else{
        checkIfPossibleAction($(this));
    }
    // if(valideMove === true){
    //
    // }
};
$(document).ready(function(){
    var card1 = {title : "Destructor" , desc : "Détruit tous les éléments présents sur la ligne selectionnée", effect: "destructor"};
    var card2 = {title : "Savior" , desc : "Ajoute 3 jetons de ta couleur dans la colonne selectionnée", effect: "savior"};
    var card3 = {title : "Believer" , desc : "Ajoute 4 éléments bloquants à des positions aléatoires", effect: "believer"};
    var card4 = {title : "Joker" , desc : "Transforme 2 éléments adverses aléatoires en élement de ta couleur", effect: "joker"};
    var card5 = {title : "AfterEffect" , desc : "Inflige 10 points de dégats à l'adversaire, mais transforme 2 de tes éléments en élements adverses", effect: "aftereffect"};
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

function launchBackground(){
    var body = $("body");
    body.addClass("interstellar", 400,"linear");
    setTimeout(function(){
        body.removeClass("interstellar", 500,"linear", function(){
            body.addClass("constantBackground", 400, "linear");
            $(".game").toggle("fade");
        })
    },5000);
}

function init(){
    $("#modalJoueur").modal({
        show : true,
        backdrop : "static"
    });

    $("#formPlayer").on("submit", function(event){
        event.preventDefault();
        var player1Name = $(".player1").val();
        var player2Name = $(".player2").val();
        $.ajax({
            url : Routing.generate("initPlayer", {P1Name : player1Name, P2Name : player2Name}),
            dataType : "json",
            method : "POST",
            success : function(data){
                launchBackground();
                initPlateau();
                setIdPartie(data[0]['id']);
                player1 = data[1];
                player2 = data[2];
                actualPlayer = data[3] === 1 ? player1 : player2;
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
        var compteurNonBloquantElement = 0;
        var idPartie = $("#reloadPartie").val();
        $.ajax({
           url : Routing.generate("reloadPartie", {idPartie : idPartie}),
            dataType : "json",
            method : "POST",
            success : function(data){
                launchBackground();
                initPlateau();
                setIdPartie(idPartie);
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
                    if(data["markedPoints"][i]["blocked"] === false){
                        compteurNonBloquantElement++;
                    }
                    var element = table.find(".element[data-ligne='"+data["markedPoints"][i]["ligne"]+"'][data-position='"+data["markedPoints"][i]["position"]+"']");
                    elementSelected(element,data["markedPoints"][i]["player"], delay,data["markedPoints"][i], true);
                    delay = delay + 400;
                }

                compteurBlock = compteurNonBloquantElement % 3;
                setTimeout(function(){
                    initPDVAndName();
                    changeDisplayedPlayer();
                    highLightValidePlay();
                    initTable();
                    refillPlateau();
                }, delay);
            },
            error : function(JQXHR,textStatut, errorText){

            }
        });
    });

    $("#formOnline").on("submit",function(e){
        e.preventDefault();
        socket = io.connect('http://172.16.6.98:8090',{query: 'namePlayer='+ $(".playerName").val() +''});
        $(".submitOnline").toggleClass("hidden");
        $(".waitOnline").toggleClass("hidden");
        $(".alertWaitingOnline").toggleClass("hidden");
        socket.on("initGame", (data, players) => {
            $(".alertWaitingOnline").html("Adversaire trouvé! Début dans <strong class='countDown'>5</strong>");
            var intervalCounter = setInterval(function(){
                $(".countDown").text(parseInt($(".countDown").text()) - 1);
            },1000);
            setTimeout(function(){
                launchBackground();
                clearInterval(intervalCounter);
                online = true;
                initPlateau();
                setIdPartie(data["data"][0]['id']);
                player1 = data["data"][1];
                player1["serial"] =  players["players"][0]["idSocket"];
                player2 = data["data"][2];
                player2["serial"] = players["players"][1]["idSocket"];
                actualPlayer = data["data"][3] === 1 ? player1 : player2;
                highLightValidePlay();
                initTable();
                changeDisplayedPlayer();
                initPDVAndName();
                changeAlert("alert-info", "La pièce a désignée " + actualPlayer["name"] + " comme premier joueur.");
                $("#modalJoueur").modal("hide");
                socket.emit("actualPlayer", actualPlayer["serial"]);
            },5000);
        });

        socket.on("responseSuccess", (ligne,position,response) => {
            var searchedElement = table.find(".element[data-ligne='"+ligne+"'][data-position='"+position+"']");
            response = JSON.parse(response);
            removeHighLight();
            elementSelected(searchedElement,actualPlayer,0, response["markedPoint"], false);
            alert.addClass("hidden");
            if(checkIfWin(searchedElement, getPlayerClass(actualPlayer)) === true){
                removeHighLight();
                setTimeout(function(){
                    highLightWinCombo(poolOfWinElement);
                },1500);
            }else{
                setTimeout(function(){
                    changePlayer();
                    highLightValidePlay();
                    table.find("tbody").unblock();
                },1500);
            }
        });

        socket.on("blockElement", (ramdomizedBlocked, markedPoint) => {
            elementBlockOnline(ramdomizedBlocked["ligne"],ramdomizedBlocked["position"],markedPoint);
            removeHighLight();
        });
    });

    function initPDVAndName(){
        $(".player1Label").text(player1["name"]);
        $(".player2Label").text(player2["name"]);
        $(".currentPdvPlayer1").text(player1["life"]);
        $(".currentPdvPlayer2").text(player2["life"]);
    }

    function setIdPartie($id){
        idPartieActuel = $id;
        $("#idPartie").val($id);
    }
}

function initPlateau(){
    var plateauOnline = [];
    table.find('tbody tr').each(function (i) {
        plateauOnline[i] = [];
        plateau[i] = [];
        $(this).find("td").each(function(e){
            if(!online){
                plateau[i][e] = null;
            }else{
                plateauOnline[i][e] = {id : null, state : null};
            }
        });
    });

    if(online){
        socket.emit("initPlateau", JSON.stringify(plateauOnline));
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
        url : Routing.generate("endGame", {idPartie : idPartieActuel}),
        method : "POST"
    });
}

function elementSelected(element,player, delay, objectMarkedPoint, noCompteur){
    if(objectMarkedPoint["blocked"] === true){
        setTimeout(function(){
            plateau[element.data("ligne")][element.data("position")] =  {"id" : objectMarkedPoint["id"], "state" :"blocked" };
            var currentOffset = element.offset().top;
            var currentWidth = element.width();
            var currentHeight = element.height();
            element.addClass("blocked");
            element.attr("data-id", objectMarkedPoint["id"]);
            element.css({position : 'absolute', top : 0, width : currentWidth + "px", height : currentHeight + "px"});
            /** propriete, durée, easing, complete */
            element.animate({
                top : currentOffset
            }, 250, function(){
                bounce(element);
                element.off("click");
            });
        },delay);
    }else{
        setTimeout(function(){
            element.addClass(getPlayerClass(player));
            plateau[element.data("ligne")][element.data("position")] = {"id" : objectMarkedPoint["id"], "state" : element.attr("class").match(/is-player[\w-]*\b/)};
            if(noCompteur === false){
                compteurBlock++;
            }
            var currentOffset = element.offset().top;
            var currentWidth = element.width();
            var currentHeight = element.height();
            element.attr("data-id", objectMarkedPoint["id"]);
            element.css({position : 'absolute', top : 0, width : currentWidth + "px", height : currentHeight + "px"});
            /** propriete, durée, easing, complete */
            element.animate({
                top : currentOffset
            }, 250, function(){
                bounce(element);
                element.off("click");
                if(compteurBlock >= 3){
                    if(!online){
                        elementBlock();
                    }
                }
            });
        },delay);
    }
}

function elementBlock(){
    var listOfPotentielElement = searchHighLight();
    var ramdomizedBlocked = listOfPotentielElement[Math.floor((Math.random() * listOfPotentielElement.length))];
    $.ajax({
        url: Routing.generate("createBlockElement", {
            ligne: ramdomizedBlocked.data("ligne"),
            position: ramdomizedBlocked.data("position")
        }),
        method: "POST",
        dataType: "json",
        data : {partieID: idPartieActuel},
        async: true,
        success : function(data){
            ramdomizedBlocked.attr("data-id", data["markedPoint"]["id"]);
            var currentRamdomizedOffset = ramdomizedBlocked.offset().top;
            var currentRamdomizedWidth = ramdomizedBlocked.width();
            var currentRamdomizedHeight = ramdomizedBlocked.height();
            ramdomizedBlocked.addClass("blocked");
            ramdomizedBlocked.css({position : 'absolute', top : 0, width : currentRamdomizedWidth + "px", height : currentRamdomizedHeight + "px"});
            ramdomizedBlocked.animate({
                top : currentRamdomizedOffset
            }, 250, function(){
                bounce(ramdomizedBlocked);
            });
            ramdomizedBlocked.off("click");
            plateau[ramdomizedBlocked.data("ligne")][ramdomizedBlocked.data("position")] = {"id" : data["markedPoint"]["id"], "state" :"blocked" };
        }
    });
    compteurBlock = 0;
}

function elementBlockOnline(ligne,position, markedPoint){
    var element = table.find(".element[data-ligne='"+ligne+"'][data-position='"+position+"']");
    var currentRamdomizedOffset = element.offset().top;
    var currentRamdomizedWidth = element.width();
    var currentRamdomizedHeight = element.height();
    element.addClass("blocked");
    element.css({position : 'absolute', top : 0, width : currentRamdomizedWidth + "px", height : currentRamdomizedHeight + "px"});
    element.animate({
        top : currentRamdomizedOffset
    }, 250, function(){
        bounce(element);
    });
    element.off("click");
    plateau[ligne][position] = {"id" : markedPoint["id"], "state" :"blocked" };
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
    if(online){
        socket.emit("actualPlayer", actualPlayer["serial"]);
    }
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
    table.find("tbody").block({
        message : null,
        css : {
            backgroundColor : "#FEFEFE"
        },
        overlayCSS : {
            backgroundColor : "#FEFEFE",
            opacity : 0,
            cursor : "default"
        }
    });
    $.ajax({
        url : Routing.generate("checkIfValideMove", {ligne : element.data("ligne"), position : element.data("position")}),
        method : "POST",
        dataType : "json",
        data : { plateau : plateau, idPlayer : actualPlayer['id'], partieID : idPartieActuel },
        async : true,
        success : function(response){
            if(response["success"] === true){
                if(online){
                    socket.emit("successPlay",element.data("ligne"),element.data("position"), response);
                }else{
                    removeHighLight();
                    elementSelected(element,actualPlayer,0, response["markedPoint"], false);
                    alert.addClass("hidden");
                    if(checkIfWin(element, getPlayerClass(actualPlayer)) === true){
                        removeHighLight();
                        setTimeout(function(){
                            highLightWinCombo(poolOfWinElement);
                        },1500);
                    }else{
                        setTimeout(function(){
                            changePlayer();
                            highLightValidePlay();
                            table.find("tbody").unblock();
                        },1500);
                    }
                }
            }else{
                console.log("WTF o_O?");
            }
        },
        error : function () {
            changeAlert("alert-danger", actualPlayer["name"] + " souhaite réaliser une action impossible." +
                "Veuillez sélectionner un rond valide.");
            table.find("tbody").unblock();
        },
        complete: function(){
            $("#loading").toggleClass("hidden");
        }
    });
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
    var listOfHighlightableElement = searchHighLight();
    setTimeout(function(){
        for(var i = 0; i < listOfHighlightableElement.length;i++){
            listOfHighlightableElement[i].addClass('highlighted');
        }
    },250);
}

function searchHighLight(){
    var tabElementValide = [];
    table.find(".element").each(function(e){
        var element = $(this);
        if(!element.hasClass("is-player-one") && !element.hasClass("is-player-two") && !element.hasClass("blocked") ){
            var ligne = element.data('ligne');
            var position = element.data('position');
            var comparedElement = table.find(".element[data-ligne='"+(ligne + 1)+"'][data-position='"+position+"']");
            if(comparedElement.length === 0 || comparedElement.hasClass("is-player-one") || comparedElement.hasClass("is-player-two") || comparedElement.hasClass("blocked")){
                tabElementValide.push(element);
            }
        }
    });
    return tabElementValide;
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
        var playerDoingDamage;
        for(var i=0; i < listOfElements.length; i++){
            playerDoingDamage = getPlayerByClass(getPlayerClassByElement(listOfElements[i]));
            timeOutDissapear(listOfElements[i]);
            timer = timer + 250;
        }

        if(!online){
            $.ajax({
                url : Routing.generate("savePlayer", {idPlayer : actualEnemy["id"], damage : listOfElements.length}),
                method : "POST",
                success : function(data){
                    var pdvElement = null;
                    changeEnemy(playerDoingDamage);
                    if(actualEnemy === player1){
                        pdvElement = $(".currentPdvPlayer1");
                    }else{
                        pdvElement = $(".currentPdvPlayer2");
                    }
                    pdvElement.addClass("losingPDV");
                    var value = parseInt(pdvElement.text());
                    pdvElement.text(value - listOfElements.length);
                    actualEnemy["life"] = actualEnemy["life"] - listOfElements.length;
                    pdvElement.removeClass("losingPDV", {duration : 350});
                }
            });
        }else{
            var pdvElement = null;
            changeEnemy(playerDoingDamage);
            if(actualEnemy === player1){
                pdvElement = $(".currentPdvPlayer1");
            }else{
                pdvElement = $(".currentPdvPlayer2");
            }
            pdvElement.addClass("losingPDV");
            var value = parseInt(pdvElement.text());
            pdvElement.text(value - listOfElements.length);
            actualEnemy["life"] = actualEnemy["life"] - listOfElements.length;
            pdvElement.removeClass("losingPDV", {duration : 350});
        }

        function timeOutDissapear(element){
            setTimeout(function(e){
                element.removeClass("is-player-one is-player-two",{duration : 350});
                // dealDamage(element);
            },timer);
        }
    }

    // function dealDamage(element){
    //
    // }

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
                    if (nextElement.hasClass('is-player-one') || nextElement.hasClass('is-player-two') || nextElement.hasClass("blocked")) {
                        if ((!element.hasClass('is-player-one') && !element.hasClass('is-player-two')) && !element.hasClass("blocked") || element.hasClass("willMove")) {
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
                                nextElement.removeClass("is-player-one is-player-two blocked");

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
                    refillPlateau();
                    table.find("tbody").unblock();
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

function refillPlateau(){
    $("#loading").toggleClass("hidden");
    var oldPlateau = $.extend(true,{},plateau);

    table.find(".element").each(function(){
        if($(this).hasClass('is-player-one') || $(this).hasClass('is-player-two')){
            plateau[$(this).data("ligne")][$(this).data("position")] =
                {"id" : $(this).data("id"), "state" : $(this).attr("class").match(/is-player[\w-]*\b/)};
        }else if($(this).hasClass("blocked")){
            plateau[$(this).data("ligne")][$(this).data("position")] = {"id" : $(this).data("id"), "state" : "blocked"};
        }else{
            plateau[$(this).data("ligne")][$(this).data("position")] = {"id" : $(this).data("id"), "state" : null};
        }
    });

    if(online){
        socket.emit("initPlateau", JSON.stringify(plateau));
        $("#loading").toggleClass("hidden");
    }else{
        $.ajax({
            url : Routing.generate("updateMarkedPoints"),
            method : "POST",
            data : {idPlayer1 : player1["id"], idPlayer2 : player2["id"], oldPlateau : oldPlateau, plateau : plateau},
            success : function(data){
                console.log(data);
            },
            complete : function(){
                $("#loading").toggleClass("hidden");
            }
        });
    }
}

