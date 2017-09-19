<?php
/**
 * Created by PhpStorm.
 * User: frus68313
 * Date: 19/09/2017
 * Time: 10:53
 */

namespace AppBundle\Repository;


use AppBundle\Entity\Player;
use Doctrine\ORM\EntityRepository;

class MarkedPointRepository extends EntityRepository
{
    public function findMarkedFromPlayers($players){
        $queryBuilder = $this->createQueryBuilder("mp")
            ->select("mp")
            ->where("mp.player IN (:players)")
            ->setParameter("players", $players)
            ->orderBy("mp.ligne", "DESC");

        $query = $queryBuilder->getQuery();

        return $query->getResult();
    }
}