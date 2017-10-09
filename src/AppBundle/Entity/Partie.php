<?php
/**
 * Created by PhpStorm.
 * User: frus68313
 * Date: 17/08/2017
 * Time: 09:23
 */

namespace AppBundle\Entity;

use Doctrine\Common\Cache\ArrayCache;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="partie")
 **/
class Partie implements \JsonSerializable
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

    /**
     * @var ArrayCollection $points
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\MarkedPoint", mappedBy="partie")
     */
    private $points;


    function __construct()
    {
        $this->players = new ArrayCollection();
        $this->points = new ArrayCollection();
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
     * @return ArrayCollection
     */
    public function getPoints()
    {
        return $this->points;
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

    /**
     * @param ArrayCollection $points
     */
    public function setPoints($points)
    {
        $this->points = $points;
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        return array(
            "id" => $this->id
        );
    }
}