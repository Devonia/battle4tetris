<?php
/**
 * Created by PhpStorm.
 * User: frus68313
 * Date: 17/08/2017
 * Time: 09:26
 */

namespace AppBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class MarkedPoint
 * @package AppBundle\Entity
 * @ORM\Entity(repositoryClass="AppBundle\Repository\MarkedPointRepository")
 * @ORM\Table(name="marked_point")
 */
class MarkedPoint implements \JsonSerializable
{
    /**
     *  @ORM\Id
     *  @ORM\Column(type="integer")
     *  @ORM\GeneratedValue(strategy="AUTO")
     **/
    private $id;

    /**
     * @ORM\Column(type="integer")
     */
    private $ligne;

    /**
     * @ORM\Column(type="integer")
     */
    private $position;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Player", inversedBy="points")
     * @ORM\JoinColumn(nullable=true)
     */
    private $player;

    /**
     * @var boolean $blocked
     * @ORM\Column(type="boolean")
     */
    private $blocked;


    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    function __construct($ligne,$position, $player = null, $isBlocked = false)
    {
        $this->ligne = $ligne;
        $this->position = $position;
        $this->player = $player;
        $this->blocked = $isBlocked;
    }


    /**
     * @return mixed
     */
    public function getLigne()
    {
        return $this->ligne;
    }


    /**
     * @return mixed
     */
    public function getPlayer()
    {
        return $this->player;
    }

    /**
     * @return mixed
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @return bool
     */
    public function isBlocked()
    {
        return $this->blocked;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }


    /**
     * @param mixed $ligne
     */
    public function setLigne($ligne)
    {
        $this->ligne = $ligne;
    }


    /**
     * @param mixed $player
     */
    public function setPlayer($player)
    {
        $this->player = $player;
    }

    /**
     * @param bool $blocked
     */
    public function setBlocked($blocked)
    {
        $this->blocked = $blocked;
    }

    /**
     * @param mixed $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
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
            "id" => $this->id,
            "ligne" => $this->ligne,
            "position" => $this->position,
            "player" => $this->player
        );
    }
}