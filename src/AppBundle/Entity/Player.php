<?php
/**
 * Created by PhpStorm.
 * User: frus68313
 * Date: 17/08/2017
 * Time: 09:38
 */

namespace AppBundle\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
/**
* @ORM\Entity()
* @ORM\Table(name="player")
 **/
class Player implements \JsonSerializable
{
    /**
     *  @ORM\Id
     *  @ORM\Column(type="integer")
     *  @ORM\GeneratedValue(strategy="AUTO")
     **/
    private $id;

    /**
     * @ORM\Column(type="string")
     */
    private $name;

    /**
     * @ORM\Column(type="integer")
     */
    private $life;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Partie", inversedBy="players")
     */
    private $partie;

    /**
     * @ORM\OneToMany(targetEntity="AppBundle\Entity\MarkedPoint", mappedBy="player")
     */
    private $points;


    function __construct($playerName, $partie, $life)
    {
        $this->name = $playerName;
        $this->partie = $partie;
        $this->life = $life;
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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return mixed
     */
    public function getPartie()
    {
        return $this->partie;
    }

    /**
     * @return mixed
     */
    public function getPoints()
    {
        return $this->points;
    }

    /**
     * @return mixed
     */
    public function getLife()
    {
        return $this->life;
    }

    /**
     * @param mixed $life
     */
    public function setLife($life)
    {
        $this->life = $life;
    }

    /**
     * @param mixed $partie
     */
    public function setPartie($partie)
    {
        $this->partie = $partie;
    }

    /**
     * @param mixed $points
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
            "id" => $this->id,
            "name" => $this->name,
            "life" => $this->life
        );
    }
}