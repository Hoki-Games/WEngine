//this is just me goofing around
//i'll develop more "gameplay" later, when i'm done with WebGL

const newGameBtn = document.getElementById('newGameBtn');
const continueBtn = document.getElementById('continueBtn');
const optionsBtn = document.getElementById('optionsBtn');
const secretBtn = document.getElementById('secretBtn');
const nh = document.getElementById('nh');
const bozo = document.getElementById('bozo');
const bruh = document.getElementById('bruh');
const cat = document.getElementById('cat')

const canvas = document.getElementById('canvas');
canvas.width = 700;
canvas.height = 650;
canvas.style = "border:1px solid #000000;";
const ctx = canvas.getContext('2d');

//don't mind this cringe

function delay(ms) {
   return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
   });
}

newGameBtn.addEventListener('click', () => {
   delay(1000)
      .then(() => {
         ctx.font = "30px Arial";
         ctx.fillText(">new game starts", 50, 50);
   })
   .then(() => {
      delay(1000)
      .then(() => {
         ctx.font = "30px Arial";
         ctx.fillText(">cutscene", 50, 100);
      })
      .then(() => {
         delay(1000)
         .then(() => {
            ctx.font = "30px Arial";
            ctx.fillText(">game works", 50, 150);
         })
         .then(() => {
            delay(1000)
            .then(() => {
               ctx.font = "30px Arial";
               ctx.fillText(">epic", 50, 200);
            })
         })
      })
   })

})

continueBtn.addEventListener('click', () => {
   delay(1000)
      .then(() => {
      ctx.font = "30px Arial";
      ctx.fillText(">finds the save", 50, 50);
   })
   .then(() => {
      delay(1000)
      .then(() => {
         ctx.font = "30px Arial";
         ctx.fillText(">the game continues", 50, 100);
      })
      .then(() => {
         delay(1000)
         .then(() => {
            ctx.font = "30px Arial";
            ctx.fillText(">???", 50, 150);
         })
         .then(() => {
            delay(1000)
            .then(() => {
               ctx.font = "30px Arial";
               ctx.fillText(">great", 50, 200);
            })
         })
      })
   })

})

optionsBtn.addEventListener('click', () => {
   delay(1000)
      .then(() => {
      ctx.font = "30px Arial";
      ctx.fillText(">draws interface above the menu", 50, 50);
   })
   .then(() => {
      delay(1000)
      .then(() => {
         ctx.font = "30px Arial";
         ctx.fillText(">has cool buttons to press", 50, 100);
      })
      .then(() => {
         delay(1000)
         .then(() => {
            ctx.font = "30px Arial";
            ctx.fillText(">saves are going to the config or some shit", 50, 150);
         })
         .then(() => {
            delay(1000)
            .then(() => {
               ctx.font = "30px Arial";
               ctx.fillText(">cringe", 50, 200);
            })
         })
      })
   })

})

secretBtn.addEventListener('click', () => {
   delay(1000)
      .then(() => {
         ctx.drawImage(cat, 10, 10, 300, 300)
   })
   .then(() => {
      delay(1000)
      .then(() => {
         ctx.drawImage(nh, 350, 10, 300, 300)
      })
      .then(() => {
         delay(1000)
         .then(() => {
            ctx.drawImage(bozo, 10, 350, 300, 300)
         })
         .then(() => {
            delay(1000)
            .then(() => {
               ctx.drawImage(bruh, 350, 350, 300, 300)
            })
         })
      })
   })

})