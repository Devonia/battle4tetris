<?php

namespace AppBundle\Controller;

use AppBundle\Entity\MarkedPoint;
use AppBundle\Entity\Partie;
use AppBundle\Entity\Player;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }

    /**
     * @param Request $request
     *
     * @Route("/three", name="three")
     */
    public function threeAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $repoPartie = $em->getRepository("AppBundle:Partie");
        $lastTenParties = $repoPartie->findBy(array("state" => Partie::TERMINE), array("id" => "DESC"), 10);
        $partie = new Partie();
        $partie->setState(Partie::ENCOURS);
        $em->persist($partie);
        $em->flush();

        return $this->render("@App/default/three.html.twig", array(
            "idPartie" => $partie->getId(),
            "lastParties" => $lastTenParties
        ));
    }

    /**
     * @param Request $request
     *
     * @Route("/initPlayer/{P1Name}/{P2Name}/{idPartie}", name="initPlayer", options={"expose"=true})
     */
    public function initPlayer($P1Name, $P2Name, $idPartie){
        $em = $this->getDoctrine()->getManager();
        $partie = $em->getRepository("AppBundle:Partie")->find($idPartie);
        $player1 = new Player($P1Name,$partie, 20);
        $player2 = new Player($P2Name,$partie, 20);
        $em->persist($player1);
        $em->persist($player2);
        $em->flush();
        $coinToss = rand(1,2);
        echo json_encode(array($player1,$player2, $coinToss));
        die();
    }

    /**
     * @param Request $request
     *
     * @Route("/savePlayer/{idPlayer}/{life}", name="savePlayer", options={"expose"=true})
     */
    public function savePlayer($idPlayer, $life){
        $em = $this->getDoctrine()->getManager();
        $repoPlayer =  $em->getRepository("AppBundle:Player");
        $player = $repoPlayer->find($idPlayer);
        $player->setLife($life);
        $em->persist($player);
        $em->flush();
        die();
    }

    /**
     * @param Request $request
     *
     * @Route("/endGame/{idPartie}/{winnerId}}", name="endGame",options={"expose"=true})
     */
    public function endGame($idPartie, $winnerId){
        $em = $this->getDoctrine()->getManager();
        $partieRepo = $em->getRepository("AppBundle:Partie");
        $playerRepo = $em->getRepository("AppBundle:Player");
        $partie = $partieRepo->find($idPartie);
        $player = $playerRepo->find($winnerId);
        $partie->setState(Partie::TERMINE);
        $partie->setWinner($player);
        $em->persist($partie);
        $em->flush();
        die();
    }

    /**
     *
     *  @Route("/checkValideMove/{ligne}/{position}", name="checkIfValideMove", options={"expose"=true})
     *
     */
    public function checkIfValideMove(Request $request,$ligne,$position){
        $em = $this->getDoctrine()->getManager();
        $plateau = $request->request->get("plateau");
        $player = $em->getRepository("AppBundle:Player")->find($request->request->get("idPlayer"));
        if(isset($plateau[$ligne + 1][$position]))
        {
            $nextElementInColonne = $plateau[$ligne + 1][$position];
            if(!empty($nextElementInColonne)){
                $markedPoint = new MarkedPoint($ligne,$position,$player);
                $em->persist($markedPoint);
                $em->flush();
                echo json_encode(array("success" => true));
            }else{
                return new Response("Move non valide", 400);
            }
        }else{
            $markedPoint = new MarkedPoint($ligne,$position,$player);
            $em->persist($markedPoint);
            $em->flush();
            echo json_encode(array("success" => true));
        }

        die();
    }

    /**
     * @Route("/reloadPartie/{idPartie}", name="reloadPartie", options={"expose"=true})
     */
    public function reloadPartie(Request $request, $idPartie){
        $em = $this->getDoctrine()->getManager();
        /** @var Partie $partie */
        $partie = $em->getRepository("AppBundle:Partie")->find($idPartie);
        if($partie !== null){
            $players = $em->getRepository("AppBundle:Player")->findBy(array("partie" => $partie));
            $markedPoint = $em->getRepository("AppBundle:MarkedPoint")->findMarkedFromPlayers($players);
            return new Response(json_encode(array(
                "markedPoints" => $markedPoint,
                "players" => $players
            )),200);
        }else{
            return new Response("Partie non trouvé", 404);
        }
    }
}
