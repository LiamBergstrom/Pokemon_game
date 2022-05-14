const battleBackgroundImage = new Image();

battleBackgroundImage.src = "./images/battleBackground.png";
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

let draggle;
let emby;
let renderedSprites;
let queue;

let battleAnimationId;

function initBattle() {
  document.querySelector("#user_interface").style.display = "block";
  document.querySelector("#queue").style.display = "none";
  document.querySelector("#enemy_health").style.width = "100%";
  document.querySelector("#ally_health").style.width = "100%";
  document.querySelector("#attack_buttons").replaceChildren();

  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];
  queue = [];

  emby.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attack_buttons").append(button);
  });

  //Eventlistener for buttons
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites,
      });

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });

        queue.push(() => {
          // fade back to black
          gsap.to("#overlappingDiv", {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector("#user_interface").style.display = "none";

              gsap.to("#overlappingDiv", {
                opacity: 0,
              });

              battle.initiated = false;
            },
          });
        });

        return;
      }

      // draggle attackerar
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites,
        });

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });

          queue.push(() => {
            // fade back to black
            gsap.to("#overlappingDiv", {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector("#user_interface").style.display =
                  "none";

                gsap.to("#overlappingDiv", {
                  opacity: 0,
                });

                battle.initiated = false;
              },
            });
          });

          return;
        }
      });
    });

    button.addEventListener("mouseenter", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector("#attack_type").innerHTML = selectedAttack.type;
      document.querySelector("#attack_type").style.color = selectedAttack.color;
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

animate();
// initBattle();
// animateBattle();

document.querySelector("#queue").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else e.currentTarget.style.display = "none";
});
