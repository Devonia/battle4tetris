var actualPlayer,actualEnemy = null ;
var player1, player2 = null;
var poolOfWinElement = [];
var ruleBounce = null;
var table = $(".table");
var idPartieActuel;
var plateau = [];
var listsOfCards = [];
var listsOfUltimateCards = [];
var alert = $(".messageError");
var compteurBlock = 0;
var online = false;
var socket = null;
var tour = 1;
var dotHot = [];
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
};
$(document).ready(function(){
    $(".infoGame").popover({
        trigger : "hover focus"
    });
    init();
});

function generateCards(){
    var timer = 250;
    var card1 = {title : "Destructor" , desc : "Détruit tous les jetons présents sur la ligne selectionnée", effect: "destructor", class:"destructor"};
    var card2 = {title : "Savior" , desc : "Ajoute 3 jetons de ta couleur dans la colonne selectionnée", effect: "savior", class:"savior"};
    var card3 = {title : "Believer" , desc : "Ajoute 4 jetons bloquants à des positions aléatoires", effect: "believer", class:"believer"};
    var card4 = {title : "Joker" , desc : "Transforme 3 jetons adverses aléatoires en jetons de ta couleur", effect: "joker", class:"joker"};
    var card5 = {title : "AfterEffect" , desc : "Inflige 5 points de dégats à l'adversaire, mais transforme 2 de tes jetons", effect: "aftereffect", class:"aftereffect"};
    var card6 = {title : "Foresight" , desc : "Inflige 5 points de dégats à l'adversaire, mais dans 3 tours", effect: "foresight", class:"foresight"};
    var card7 = {title : "Blessing light" , desc : "Restaure 10 points de vie", effect: "bl", class:"bl"};
    var card8 = {title : "Renovation" , desc : "Restaure 5 points de vie par tour, pendant 3 tours", effect: "renov", class:"renov"};
    var card9 = {title : "Immolate" , desc : "Inflige 5 points de dégats à l'adversaire, pendant 3 tours", effect: "immolate", class:"immolate"};
    var card10 = {title : "Explosive touch" , desc : "Inflige 5 points de dégats à l'adversaire et lui détruit un jeton", effect: "et", class:"et"};
    var cardUltimate1 = {title : "BlackHole" , desc : "Reforme completement le tableau de jeu aléatoirement", effect: "blackhole", class:"ultimate"};
    var cardUltimate2 = {title : "Atomic explosion" , desc : "Inflige 5 points de dégats à l'adversaire,le brule pendant 3 tours et détruit 2 de ses jetons", effect: "ae", class:"ultimate"};
    var cardUltimate3 = {title : "Holy light" , desc : "Soigne tous vos points de vie ", effect: "holylight", class:"ultimate"};
    listsOfCards[listsOfCards.length] = card1;
    listsOfCards[listsOfCards.length] = card2;
    listsOfCards[listsOfCards.length] = card3;
    listsOfCards[listsOfCards.length] = card4;
    listsOfCards[listsOfCards.length] = card5;
    listsOfCards[listsOfCards.length] = card6;
    listsOfCards[listsOfCards.length] = card7;
    listsOfCards[listsOfCards.length] = card8;
    listsOfCards[listsOfCards.length] = card9;
    listsOfCards[listsOfCards.length] = card10;
    listsOfUltimateCards.push(cardUltimate1);
    listsOfUltimateCards.push(cardUltimate2);
    listsOfUltimateCards.push(cardUltimate3);

    var nbCardSelected = 0;
    $("#modalCards").modal({
        show : true,
        backdrop : "static",
        keyboard : false
    });



    var chooseCards = function(){
        var copyLists;
        if (nbCardSelected === 5) {
            copyLists = [].concat(listsOfUltimateCards);
        }else{
            copyLists = [].concat(listsOfCards);
        }
        var cardRamdom1 = copyLists.splice(Math.floor(Math.random() * copyLists.length),1)[0];
        var cardRamdom2 = copyLists.splice(Math.floor(Math.random() * copyLists.length),1)[0];
        var cardRamdom3 = copyLists.splice(Math.floor(Math.random() * copyLists.length),1)[0];

        var templateCard = $("#templateCard3").clone().html();
        var template1 = templateCard.replace("__title__",cardRamdom1["title"]).replace("__desc__", cardRamdom1["desc"]).replace("__classCard__", cardRamdom1["class"]);
        var template2 = templateCard.replace("__title__",cardRamdom2["title"]).replace("__desc__", cardRamdom2["desc"]).replace("__classCard__", cardRamdom2["class"]);
        var template3 = templateCard.replace("__title__",cardRamdom3["title"]).replace("__desc__", cardRamdom3["desc"]).replace("__classCard__", cardRamdom3["class"]);

        $(".firstCard").empty().append(template1).children(".cardChoose").fadeIn();
        $(".secondCard").empty().append(template2).children(".cardChoose").fadeIn();
        $(".thirdCard").empty().append(template3).children(".cardChoose").fadeIn();

        $(".firstCard").off("click").on("click",function(){
            let template;
            if (nbCardSelected % 2 === 0) {
                template = $("#templateCard").clone().html();
            } else {
                template = $("#templateCard2").clone().html();
            }
            var templateReplaced = template.replace("__title__",cardRamdom1["title"]).replace("__desc__", cardRamdom1["desc"]).replace("__classCard__", cardRamdom1["class"]);
            $(templateReplaced).appendTo(".cardContainer").data("effect",cardRamdom1["effect"]).toggle("slide",{direction : "up"});
            nbCardSelected++;
            $(".compteurCard").text(nbCardSelected);
            if(nbCardSelected < 6){
                chooseCards();
            }else{
                cardsDone();
            }
        });

        $(".secondCard").off("click").on("click",function(){
            let template;
            if (nbCardSelected % 2 === 0) {
                template = $("#templateCard").clone().html();
            } else {
                template = $("#templateCard2").clone().html();
            }
            var templateReplaced = template.replace("__title__",cardRamdom2["title"]).replace("__desc__", cardRamdom2["desc"]).replace("__classCard__", cardRamdom2["class"]);
            $(templateReplaced).appendTo(".cardContainer").data("effect",cardRamdom2["effect"]).toggle("slide",{direction : "up"});
            nbCardSelected++;
            $(".compteurCard").text(nbCardSelected);
            if(nbCardSelected < 6){
                chooseCards();
            }else{
                cardsDone();
            }
        });

        $(".thirdCard").off("click").on("click",function(){
            let template;
            if (nbCardSelected % 2 === 0) {
                template = $("#templateCard").clone().html();
            } else {
                template = $("#templateCard2").clone().html();
            }
            var templateReplaced = template.replace("__title__",cardRamdom3["title"]).replace("__desc__", cardRamdom3["desc"]).replace("__classCard__", cardRamdom3["class"]);
            $(templateReplaced).appendTo(".cardContainer").data("effect",cardRamdom3["effect"]).toggle("slide",{direction : "up"});
            nbCardSelected++;
            $(".compteurCard").text(nbCardSelected);
            if(nbCardSelected < 6){
                chooseCards();
            }else{
                cardsDone();
            }
        });
    };

    $("#modalCards").on("shown.bs.modal",function(e){
        chooseCards();
    });

    var cardsDone = function(){
        $(".thirdCard").off("click");
        $(".secondCard").off("click");
        $(".firstCard").off("click");
        $("#modalCards").css({
            transition : "transform 1s",
            transform : "rotate(360deg) scale(0.5)",
        });

        setTimeout(function(){
            $("#modalCards").css({
                transition : "transform 1s",
                transform : "rotate(360deg) scale(0)",
            });
        },1000);

        setTimeout(function(){
            $("#modalCards").modal("hide");
        },2000);

        $(".card").draggable({
            addClasses : true,
            zIndex : 1000,
            stack : "body",
            revert : "invalid",
            revertDuration : 250,
            drag : function(event,ui){
                if(!ui.helper.hasClass("highlighted")){
                    ui.helper.addClass("highlighted");
                }
            },
            stop : function(event,ui){
                ui.helper.removeClass("highlighted");
            }
        });

        $(".wrapper").droppable({
            accept : ".card",
            drop: function(event,ui){
                var cardUsed = ui.draggable;
                var effect = cardUsed.data("effect");
                cardUsed.removeClass("highlighted");
                cardUsed.animate({
                    boxShadow : "0 -2px 2px 8px rgba(255,255,0,0.5) !important"
                },1000,function(){
                    var allNextCards = cardUsed.nextAll();
                    cardUsed.css("box-shadow", "none !important");
                    cardUsed.hide("explode",{ pieces: 64},1000,function(){
                        allNextCards.each(function(i){
                            $(this).toggleClass("col-md-offset-2");
                        });
                        activateEffect(effect);
                        setTimeout(function(){
                            refillPlateau();
                            removeHighLight();
                            var allElement = table.find(".element");
                            allElement.each(function(i){
                                var elementTested = $(this);
                                var win = checkIfWin(elementTested,getPlayerClassByElement(elementTested));
                                if(win){
                                    setTimeout(function(){
                                        highLightWinCombo(poolOfWinElement);
                                    },1500);
                                    return false;
                                }else{
                                    if(elementTested[0] === allElement.last()[0]){
                                        tour++;
                                        var winOnDot = activateDotHotEffect();
                                        if(!winOnDot){
                                            highLightValidePlay();
                                            changePlayer();
                                        }
                                    }
                                }
                            });
                        },2000);
                    });
                });
            }
        });
    };

    function activateEffect(effect){
        var elementEnemy;
        var playerClass = getPlayerClass(actualPlayer);
        var enemyClass = getPlayerClass(actualEnemy);
        var elementsPlayer = table.find("." + playerClass);
        var elementsEnemy = table.find("." + enemyClass);
        switch (effect) {
            case "destructor":
                var ligne = table.find('tr');
                ligne.addClass("highlightLine");
                ligne.on("click", function (e) {
                    var elements = $(this).find(".element");
                    elements.removeClass("is-player-one is-player-two blocked",{duration : 300});
                    ligne.removeClass("highlightLine").off("click");
                    setTimeout(function(){
                        moveElement(elements);
                    },400);
                });
                break;

            case "savior":
                table.find("td").on("mouseover", function () {
                    var element = $(this).find(".element");
                    table.find(".element[data-position=" + element.data("position") + "]").parent().addClass("highlightColumn");
                });

                table.find("td").on("mouseout", function () {
                    var element = $(this).find(".element");
                    table.find(".element[data-position=" + element.data("position") + "]").parent().removeClass("highlightColumn");
                });

                table.find("td").on("click", function () {
                    table.find("td").off("click").removeClass("highlightColumn").off("mouseout").off("mouseover");
                    var ligneStart = null;
                    var element = $(this).find(".element");
                    var position = element.data("position");
                    var firstElement = null;
                    var elementsColonne = table.find(".element[data-position=" + position + "]");
                    for (var i = 0; i < elementsColonne.length; i++) {
                        if (!$(elementsColonne[i]).is(".is-player-one,.is-player-two,.blocked")) {
                            firstElement = $(elementsColonne[i]);
                        }
                    }

                    if (firstElement === null) {
                        ligneStart = 8;
                    } else {
                        ligneStart = firstElement.data("ligne");
                    }

                    var delay = 0;
                    for (var y = 0; y < 3; y++) {
                        setTimeout(function(ligneStart){
                            var elementConcerned = table.find(".element[data-position=" + position + "][data-ligne=" + ligneStart + "]");
                            elementConcerned.addClass(getPlayerClass(actualPlayer));
                            var currentOffset = elementConcerned.offset().top;
                            var currentWidth = elementConcerned.width();
                            var currentHeight = elementConcerned.height();
                            // element.attr("data-id", objectMarkedPoint["id"]);
                            elementConcerned.css({position : 'absolute', top : 0, width : currentWidth + "px", height : currentHeight + "px"});
                            /** propriete, durée, easing, complete */
                            elementConcerned.animate({
                                top : currentOffset
                            }, 250, function() {
                                elementConcerned.css({position:'initial', width : "100%", height : "100%"});
                                elementConcerned.off("click");
                            });
                        },delay, ligneStart);

                        ligneStart--;
                        delay = delay + 500;
                    }
                });
                break;

            case "joker":
                if (elementsEnemy.length <= 3) {
                    elementsEnemy.toggleClass(playerClass + " " + enemyClass);
                } else {
                    var elementJoker1 = elementsEnemy[Math.floor((Math.random() * elementsEnemy.length))];
                    $(elementJoker1).toggleClass(playerClass + " " + enemyClass);
                    elementsEnemy = table.find("." + playerClass);
                    var elementJoker2 = elementsEnemy[Math.floor((Math.random() * elementsEnemy.length))];
                    $(elementJoker2).toggleClass(playerClass + " " + enemyClass);
                    elementsEnemy = table.find("." + playerClass);
                    var elementJoker3 = elementsEnemy[Math.floor((Math.random() * elementsEnemy.length))];
                    $(elementJoker3).toggleClass(playerClass + " " + enemyClass);
                }
                break;

            case "believer":
                let compteurElement = 0;
                let timer = 0;
                while (compteurElement !== 4) {
                    elementBlock(timer);
                    compteurElement++;
                    timer = timer + 1000;
                }
                break;

            case "bl":
                if(actualPlayer["life"] + 10 >= 40){
                    actualPlayer["life"] = 40;
                }else{
                    actualPlayer["life"] = actualPlayer["life"] + 10
                }
                elementsPlayer = getElementPdvPlayer();
                elementsPlayer.addClass("healingPDV");
                elementsPlayer.text(actualPlayer["life"]);
                elementsPlayer.removeClass("healingPDV", {duration : 350});
                break;

            case "ae":
                var elementsDestroyed = [];
                actualEnemy["life"] = actualEnemy["life"] - 5;
                elementEnemy = getElementPdvEnemy();
                elementEnemy.addClass("losingPDV");
                elementEnemy.text(actualEnemy["life"]);
                elementEnemy.removeClass("losingPDV", {duration : 350});
                dotHot[dotHot.length] = {effect : "ae", target : actualEnemy, endTurn : tour + 5};
                if(elementsEnemy.length <= 2){
                    elementsDestroyed.concat(elementsEnemy);
                    elementsEnemy.toggleClass(enemyClass);
                }else {
                    var element1Enemy = elementsEnemy[Math.floor((Math.random() * elementsEnemy.length))];
                    elementsDestroyed[elementsDestroyed.length] = element1Enemy;
                    $(element1Enemy).toggleClass(enemyClass);
                    elementsEnemy = table.find("." + enemyClass);
                    var element2Enemy = elementsEnemy[Math.floor((Math.random() * elementsEnemy.length))];
                    elementsDestroyed[elementsDestroyed.length] = element2Enemy;
                    $(element2Enemy).toggleClass(enemyClass);
                }
                moveElement(elementsDestroyed);
                break;

            case "holylight":
                actualPlayer["life"] = 40;
                elementsPlayer = getElementPdvPlayer();
                elementsPlayer.addClass("healingPDV");
                elementsPlayer.text(actualPlayer["life"]);
                elementsPlayer.removeClass("healingPDV", {duration : 350});
                break;

            case "immolate":
                dotHot[dotHot.length] = {effect : "immolate", target : actualEnemy, endTurn : tour + 3};
                break;

            case "renov":
                dotHot[dotHot.length] = {effect : "renov", target : actualPlayer, endTurn : tour + 3};
                break;

            case "et":
                actualEnemy["life"] = actualEnemy["life"] - 5;
                elementEnemy = getElementPdvEnemy();
                elementEnemy.addClass("losingPDV");
                elementEnemy.text(actualEnemy["life"]);
                elementEnemy.removeClass("losingPDV", {duration : 350});
                let selectedElement = elementsEnemy[Math.floor((Math.random() * elementsEnemy.length))];
                $(selectedElement).removeClass(enemyClass);
                moveElement(selectedElement);
                break;

            case "aftereffect":
                actualEnemy["life"] = actualEnemy["life"] - 5;
                elementEnemy = getElementPdvEnemy();
                elementEnemy.addClass("losingPDV");
                elementEnemy.text(actualEnemy["life"]);
                elementEnemy.removeClass("losingPDV", {duration : 350});
                if(elementsPlayer.length <= 2){
                    elementsPlayer.toggleClass(playerClass + " " + enemyClass,300);
                }else{
                    var element1 = elementsPlayer[Math.floor((Math.random() * elementsPlayer.length))];
                    $(element1).toggleClass(playerClass + " " + enemyClass,300);
                    elementsPlayer = table.find("." + playerClass);
                    var element2 = elementsPlayer[Math.floor((Math.random() * elementsPlayer.length))];
                    $(element2).toggleClass(playerClass + " " + enemyClass,300);
                    // elementsPlayer = table.find("." + playerClass);
                    // var element3 = elementsPlayer[Math.floor((Math.random() * elementsPlayer.length))];
                    // $(element3).toggleClass(playerClass + " " + enemyClass);
                    // elementsPlayer = table.find("." + playerClass);
                    // var element4 = elementsPlayer[Math.floor((Math.random() * elementsPlayer.length))];
                    // $(element4).toggleClass(playerClass + " " + enemyClass);
                }

                break;

            case "blackhole":
                var possibleClass = ["is-player-one", "is-player-two", "blocked"];
                table.find(".element").each(function(e){
                    var currentElement = $(this);
                    if(currentElement.is(".is-player-one,.is-player-two,.blocked")){
                        var ramdomTransform = possibleClass[Math.floor((Math.random() * possibleClass.length))];
                        currentElement.removeClass("is-player-one is-player-two blocked", 300).addClass(ramdomTransform,300);
                    }
                });
                break;

            case "foresight":
                dotHot[dotHot.length] = {effect : "foresight", target : actualEnemy, endTurn : tour + 3};
                break;
        }
    }
}

function moveElement(element){
    var elementTargeted;
    var elementMoving;
    var indexLigne;
    if(element instanceof Array || (element.jquery && element.length > 1)){
        $(element).each(function(e){
            var currentElement = $(this);
            var position = currentElement.data("position");
            var ligneStart = currentElement.data("ligne") - 1;
            for(var i = ligneStart; i >= 0; i--){
                indexLigne = i+1;
                do{
                    var elementTested = table.find(".element[data-ligne="+indexLigne+"][data-position='"+position+"']");
                    if(!elementTested.is(".is-player-one,.is-player-two,.blocked")){
                        elementTargeted = elementTested;
                    }
                    indexLigne++;
                }while(indexLigne <= 8);
                elementMoving = table.find(".element[data-ligne='"+i+"'][data-position='"+position+"']");
                if(elementMoving.is(".is-player-one,.is-player-two,.blocked")){
                    var offsetTopNextPosition = elementTargeted.offset().top;
                    elementMoving.css({
                        position: 'absolute',
                        top: elementMoving.offset().top,
                        width: elementMoving.width() + "px",
                        height: elementMoving.height() + "px"
                    });
                    elementMoving.animate({
                        top: offsetTopNextPosition
                    }, {
                        duration : 500,
                        complete : function(elementMoving,elementTargeted){
                            elementMoving.css({position: 'initial', width: "100%", height: "100%"});
                            elementTargeted.addClass(elementMoving.attr("class"));
                            elementMoving.removeClass("is-player-one is-player-two blocked");
                        }(elementMoving,elementTargeted)
                    });
                }
            }
        });
    }else{
        var currentElement = $(element);
        var position = currentElement.data("position");
        var ligneStart = currentElement.data("ligne") - 1;
        for(var i = ligneStart; i >= 0; i--){
            indexLigne = i+1;
            do{
                var elementTested = table.find(".element[data-ligne="+indexLigne+"][data-position='"+position+"']");
                if(!elementTested.is(".is-player-one,.is-player-two,.blocked")){
                    elementTargeted = elementTested;
                }
                indexLigne++;
            }while(indexLigne <= 8);
            elementMoving = table.find(".element[data-ligne='"+i+"'][data-position='"+position+"']");
            if(elementMoving.is(".is-player-one,.is-player-two,.blocked")){
                var offsetTopNextPosition = elementTargeted.offset().top;
                elementMoving.css({
                    position: 'absolute',
                    top: elementMoving.offset().top,
                    width: elementMoving.width() + "px",
                    height: elementMoving.height() + "px"
                });
                elementMoving.animate({
                    top: offsetTopNextPosition
                }, {
                    duration : 500,
                    complete : function (elementMoving,elementTargeted) {
                        elementMoving.css({position: 'initial', width: "100%", height: "100%"});
                        elementTargeted.addClass(elementMoving.attr("class"));
                        elementMoving.removeClass("is-player-one is-player-two blocked");
                    }(elementMoving,elementTargeted)
                });
            }
        }
    }
}

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
            generateCards();
        });
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
                changeEnemy(actualPlayer);
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
                    tour++;
                    var winOnDot = activateDotHotEffect();
                    if(!winOnDot){
                        changePlayer();
                        highLightValidePlay();
                        table.unblock();
                    }
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

function victory(target){
    return target["life"] <= 0;
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
                        elementBlock(0);
                    }
                }
            });
        },delay);
    }
}

function elementBlock(timer){
    setTimeout(function(){
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
                plateau[ramdomizedBlocked.data("ligne")][ramdomizedBlocked.data("position")] = {"id" : data["markedPoint"]["id"], "state" :"blocked" };
                ramdomizedBlocked.off("click");
            }
        });

        compteurBlock = 0;
    },timer);
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
    table.block({
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
                            tour++;
                            var winOnDot = activateDotHotEffect();
                            if(!winOnDot){
                                changePlayer();
                                highLightValidePlay();
                                table.unblock();
                            }
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
            table.unblock();
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

function getElementPdvPlayer(){
    if(actualPlayer === player1){
        return $(".currentPdvPlayer1");
    }else{
        return $(".currentPdvPlayer2");
    }
}


function getElementPdvEnemy(){
    if(actualEnemy === player1){
        return $(".currentPdvPlayer1");
    }else{
        return $(".currentPdvPlayer2");
    }
}

function getElementPdvByTarget(target){
    if(target === player1){
        return $(".currentPdvPlayer1");
    }else{
        return $(".currentPdvPlayer2");
    }
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
                    changeEnemy(playerDoingDamage);
                    var pdvElement = getElementPdvEnemy();
                    pdvElement.addClass("losingPDV");
                    var value = parseInt(pdvElement.text());
                    pdvElement.text(value - listOfElements.length);
                    actualEnemy["life"] = actualEnemy["life"] - listOfElements.length;
                    pdvElement.removeClass("losingPDV", {duration : 350});
                }
            });
        }else{
            changeEnemy(playerDoingDamage);
            var pdvElement = getElementPdvEnemy();
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
        if(victory(actualEnemy)){
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
                    tour++;
                    refillPlateau();
                    var winOnDot = activateDotHotEffect();
                    if(!winOnDot){
                        highLightValidePlay();
                        changePlayer();
                        table.unblock();
                    }
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
            },
            complete : function(){
                $("#loading").toggleClass("hidden");
            }
        });
    }
}

function activateDotHotEffect(){
    dotHot.forEach(function(e){
        var target = e["target"];
        var pdvElement = getElementPdvByTarget(target);
        var indexOfEffect = dotHot.indexOf(e);
        switch (e["effect"]) {
            case "immolate":
                if (tour < e["endTurn"]) {
                    target["life"] = target["life"] - 5;
                    pdvElement.addClass("losingPDV");
                    pdvElement.text(target["life"]);
                    pdvElement.removeClass("losingPDV", {duration : 350});
                }else{
                    dotHot.splice(indexOfEffect,indexOfEffect);
                }
               break;
            case "foresight":
                if(tour === e["endTurn"]){
                    target["life"] = target["life"] - 5;
                    pdvElement.addClass("losingPDV");
                    pdvElement.text(target["life"]);
                    pdvElement.removeClass("losingPDV", {duration : 350});
                    dotHot.splice(indexOfEffect,indexOfEffect);
                }
                break;
            case "renov":
                if(tour < e["endTurn"]){
                    target["life"] = target["life"] + 5;
                    pdvElement.addClass("healingPDV");
                    pdvElement.text(target["life"]);
                    pdvElement.removeClass("healingPDV", {duration : 350});
                }else{
                    dotHot.splice(indexOfEffect,indexOfEffect);
                }
                break;

            case "ae":
                if(tour < e["endTurn"]){
                    target["life"] = target["life"] - 2;
                    pdvElement.addClass("losingPDV");
                    pdvElement.text(target["life"]);
                    pdvElement.removeClass("losingPDV", {duration : 350});
                }else{
                    dotHot.splice(indexOfEffect,indexOfEffect);
                }
                break;
       }

       if(victory(target)){
            return true;
       }
    });

    return false;
}

