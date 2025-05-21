<script setup lang="js">
  import { onMounted } from "vue";
  import * as PIXI from "pixi.js";
  import { MaskedFrame } from "@pixi/ui";

  const colors = {
    bg: 0x66c1da,
    text: 0xffffff,
    defaultStroke: 0x82c822,
    hoverStroke: 0xd49800,
    pressedStroke: 0xd42c12,
    disabledStroke: 0x474747,
    levelBG: 0xf5e3a9,
    border: 0xffffff,
    avatarborder: 0x2b1f46,
  };
  onMounted(() => {
    const app = new PIXI.Application({
      background: "#1099bb",
      resizeTo: window,
    });

    document.getElementById("pixi-userblock-container").appendChild(app.view);
    PIXI.Assets.load("/images/avatar_mask.png");
    PIXI.Assets.load("/images/avatar-05.png");
    PIXI.Assets.load("/images/layout/user.json").then(() => {
      // create an array of textures from an image path
      const explosionTextures = [];
      let i;

      for (i = 0; i < 39; i++) {
        const texture = PIXI.Texture.from(`user_block ${i + 10000}`);

        explosionTextures.push(texture);
      }
      console.log(explosionTextures);
      // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
      const anim = new PIXI.AnimatedSprite(explosionTextures);
      const avatar = new MaskedFrame({
        // create a masked frame component, it will add a frame around the target image
        target: PIXI.Sprite.from("/images/avatar-05.png"), // set help character image
        mask: "/images/avatar_mask.png", // set mask texture, to generate the mask shape
        borderWidth: 1, // set border width
        borderColor: colors.avatarborder, // set border color
      });
      avatar.scale.set(0.17, 0.17);
      avatar.x = 10.8;
      avatar.y = 10.2;
      /*
       * An AnimatedSprite inherits all the properties of a PIXI sprite
       * so you can change its position, its anchor, mask it, etc
       */
      anim.x = 0;
      anim.y = 0;
      anim.scale.set(0.4, 0.4);
      const styletext = new PIXI.TextStyle({
        fontFamily: "Bronzier",
        fontSize: "38px",
        fill: ["#ffffff", "#FCD13D"],
        dropShadow: true,
        dropShadowBlur: 1,
        dropShadowColor: "#000000",
        dropShadowDistance: 3,
        align: "center",
      });

      const styletext2 = new PIXI.TextStyle({
        fontFamily: "Bronzier",
        fontSize: "32px",
        fill: ["#EED9FF", "#DFB7FF"],
        dropShadow: true,
        dropShadowBlur: 2,
        dropShadowColor: "#000000",
        dropShadowDistance: 1,
        align: "center",
      });

      const cont = app.stage.addChild(new PIXI.Sprite());
      cont.addChild(anim);
      cont.addChild(avatar);

      //   const nameuser = this.cont.addChild(
      //     new PIXI.Text("USER NAME", styletext)
      //   );
      //   const nameuser = new PIXI.Text("USER NAME", styletext);
      const nameuser = cont.addChild(new PIXI.Text("USER NAME", styletext));
      nameuser.x = 150 - nameuser.width / 2;
      nameuser.y = 14;

      nameuser.scale.set(0.4, 0.4);

      //   const moneyuser = this.cont.addChild(
      //     new PIXI.Text("99999.55", styletext2)
      //   );
      //   const moneyuser = new PIXI.Text("99999.55", styletext2);
      const moneyuser = cont.addChild(new PIXI.Text("99999", styletext2));
      moneyuser.x = 115 - moneyuser.width / 2;
      moneyuser.y = 31;
      moneyuser.scale.set(0.4, 0.4);
      //    cont.addChild(nameuser, moneyuser);
      //   app.stage.addChild(cont);
      //   anim.scale = 0.7;
      //   //   anim.anchor.set(0.5, 0.5);
      //   anim.heigth = 20;
      //   anim.width = 240;
      //   anim.anchor.set(0.5);
      anim.animationSpeed = 1;
      anim.animationDelay = 2;
      //   anim.onLoop = function () {
      //     // looped!
      //     setTimeout(function () {
      //       console.log("Wait 3 seconds and I appear just once");
      //     }, 3000);
      //   };
      anim.loop = false; // CRITICAL: Animation plays once, then fires onComplete
      const delayBetweenLoops = 4500; // Delay in milliseconds (e.g., 1.5 seconds)
      let delayTimeoutId = null; // To store the timeout ID for potential cleanup
      anim.onComplete = () => {
        // console.log(
        //   "Animation completed. Starting delay of",
        //   delayBetweenLoops,
        //   "ms"
        // );

        // Clear any existing timeout if onComplete was somehow triggered again rapidly
        if (delayTimeoutId) {
          clearTimeout(delayTimeoutId);
        }

        delayTimeoutId = setTimeout(() => {
          if (!anim.destroyed) {
            // Check if sprite still exists
            anim.gotoAndPlay(0); // Restart animation from the first frame
          }
        }, delayBetweenLoops); // Cast for Node.js setTimeout type if needed
      };
      // Delay of 2 seconds
      anim.play();
      //   Animate the rotation
      //   app.ticker.add(() => {
      //     anim.loop += 3;
      //   });
    });
  });
</script>

<template>
  <div id="pixi-userblock-container"></div>
</template>

<style scoped></style>
