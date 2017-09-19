<?php
/**
 * Created by PhpStorm.
 * User: frus68313
 * Date: 17/08/2017
 * Time: 09:23
 */

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="partie")
 **/
class Partie
{

    const ENCOURS = "EN COURS";
    const TERMINE = "TERMINE";
    /**
     * @ORM\Column(type="guid")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="UUID")
     */
    private $id;

    /**
     *  @ORM\Column(type="string")
     */
    private $state;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Player")
     */
    private $winner;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\Player", mappedBy="partie")
     */
    private $players;


    function __construct()
    {
        $this->players = new ArrayCollection();
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getState()
    {
        return $this->state;
    }

    /**
     * @param mixed $state
     */
    public function setState($state)
    {
        $this->state = $state;
    }

    /**
     * @return mixed
     */
    public function getWinner()
    {
        return $this->winner;
    }

    /**
     * @param mixed $winner
     */
    public function setWinner($winner)
    {
        $this->winner = $winner;
    }

    /**
     * @return mixed
     */
    public function getPlayers()
    {
        return $this->players;
    }

    /**
     * @param mixed $players
     */
    public function setPlayers($players)
    {
        $this->players = $players;
    }
}