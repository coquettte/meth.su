var bj = {
  // (A) PROPERTIES
  // (A1) HTML REFERENCES
  hdstand : null,  // dealer stand
  hdpoints : null, // dealer points
  hdhand : null,   // dealer hand
  hpstand : null,  // player stand
  hppoints : null, // player points
  hphand : null,   // player hand
  hpcon : null,    // player controls

  // (A2) GAME FLAGS
  deck : [],      // current deck of cards
  dealer : [],    // dealer's current hand
  player : [],    // player's current hand
  dpoints : 0,    // dealer's current points
  ppoints : 0,    // player's current points
  safety : 17,    // computer will stand on or past this point
  dstand : false, // dealer has stood
  pstand : false, // player has stood
  turn : 0,       // who's turn now? 0 for player, 1 for dealer (computer)

  // (B) INITIALIZE GAME
  init : () => {
    // (B1) GET HTML ELEMENTS
    bj.hdstand = document.getElementById("deal-stand");
    bj.hdpoints = document.getElementById("deal-points");
    bj.hdhand = document.getElementById("deal-cards");
    bj.hpstand = document.getElementById("play-stand");
    bj.hppoints = document.getElementById("play-points");
    bj.hphand = document.getElementById("play-cards");
    bj.hpcon = document.getElementById("play-control");

    // (B2) ATTACH ONCLICK EVENTS
    document.getElementById("playc-start").onclick = bj.start;
    document.getElementById("playc-hit").onclick = bj.hit;
    document.getElementById("playc-stand").onclick = bj.stand;
  },

  // (C) START NEW GAME
  start : () => {
    // (C1) RESET POINTS, HANDS, DECK, TURN, AND HTML
    bj.deck = [];  bj.dealer = [];  bj.player = [];
    bj.dpoints = 0;  bj.ppoints = 0;
    bj.dstand = false;  bj.pstand = false;
    bj.hdpoints.innerHTML = "?"; bj.hppoints.innerHTML = 0;
    bj.hdhand.innerHTML = ""; bj.hphand.innerHTML = "";
    bj.hdstand.classList.remove("stood");
    bj.hpstand.classList.remove("stood");
    bj.hpcon.classList.add("started");

    // (C2) RESHUFFLE DECK
    // S: SHAPE (0 = HEART, 1 = DIAMOND, 2 = CLUB, 3 = SPADE)
    // N: NUMBER (1 = ACE, 2 TO 10 = AS-IT-IS, 11 = JACK, 12 = QUEEN, 13 = KING)
    for (let i=0; i<4; i++) { for (let j=1; j<14; j++) {
      bj.deck.push({s : i, n : j});
    }}
    // CREDITS: https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
    for (let i=bj.deck.length - 1; i>0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = bj.deck[i];
      bj.deck[i] = bj.deck[j];
      bj.deck[j] = temp;
    }

    // (C3) DRAW FIRST 4 CARDS
    bj.turn = 0; bj.draw(); bj.turn = 1; bj.draw();
    bj.turn = 0; bj.draw(); bj.turn = 1; bj.draw();

    // (C4) LUCKY 21 ON FIRST DRAW?
    bj.turn = 0; bj.points();
    bj.turn = 1; bj.points();
    var winner = bj.check();
    if (winner==null) { bj.turn = 0; }
  },

  // (D) DRAW A CARD FROM THE DECK
  dsymbols : ["&hearts;", "&diams;", "&clubs;", "&spades;"], // HTML symbols for cards
  dnum : { 1 : "A", 11 : "J", 12 : "Q", 13 : "K" }, // Card numbers
  draw : () => {
    // (D1) TAKE LAST CARD FROM DECK + CREATE HTML
    var card = bj.deck.pop(),
        cardh = document.createElement("div"),
        cardv = (bj.dnum[card.n] ? bj.dnum[card.n] : card.n) + bj.dsymbols[card.s];
    cardh.className = "bj-card";
    cardh.innerHTML = cardv ;

    // (D2) DEALER'S CARD
    // NOTE : HIDE FIRST DEALER CARD
    if (bj.turn) {
      if (bj.dealer.length==0) {
        cardh.id = "deal-first";
        cardh.innerHTML = `<div class="back">?</div><div class="front">${cardv}</div>`;
      }
      bj.dealer.push(card);
      bj.hdhand.appendChild(cardh);
    }

    // (D3) PLAYER'S CARD
    else {
      bj.player.push(card);
      bj.hphand.appendChild(cardh);
    }
  },

  // (E) CALCULATE AND UPDATE POINTS
  points : () => {
    // (E1) RUN THROUGH CARDS
    // TAKE CARDS 1-10 AT FACE VALUE + J, Q, K AT 10 POINTS.
    // DON'T CALCULATE ACES YET, THEY CAN EITHER BE 1 OR 11.
    var aces = 0, points = 0;
    for (let i of (bj.turn ? bj.dealer : bj.player)) {
      if (i.n == 1) { aces++; }
      else if (i.n>=11 && i.n<=13) { points += 10; }
      else { points += i.n; }
    }

    // (E2) CALCULATIONS FOR ACES
    // NOTE: FOR MULTIPLE ACES, WE CALCULATE ALL POSSIBLE POINTS AND TAKE HIGHEST.
    if (aces!=0) {
      var minmax = [];
      for (let elevens=0; elevens<=aces; elevens++) {
        let calc = points + (elevens * 11) + (aces-elevens * 1);
        minmax.push(calc);
      }
      points = minmax[0];
      for (let i of minmax) {
        if (i > points && i <= 21) { points = i; }
      }
    }

    // (E3) UPDATE POINTS
    if (bj.turn) { bj.dpoints = points; }
    else {
      bj.ppoints = points;
      bj.hppoints.innerHTML = points;
    }
  },

  // (F) CHECK FOR WINNERS (AND LOSERS)
  check : () => {
    // (F1) FLAGS
    // WINNER - 0 FOR PLAYER, 1 FOR DEALER, 2 FOR A TIE
    var winner = null, message = "";

    // (F2) BLACKJACK - WIN ON FIRST ROUND
    if (bj.player.length==2 && bj.dealer.length==2) {
      // TIE
      if (bj.ppoints==21 && bj.dpoints==21) {
        winner = 2; message = "It's a tie with Blackjacks";
      }
      // PLAYER WINS
      if (winner==null && bj.ppoints==21) {
        winner = 0; message = "Player wins with a Blackjack!";
      }
      // DEALER WINS
      if (winner==null && bj.dpoints==21) {
        winner = 1; message = "Dealer wins with a Blackjack!";
      }
    }

    // (F3) WHO GONE BUST?
    if (winner == null) {
      // PLAYER GONE BUST
      if (bj.ppoints>21) {
        winner = 1; message = "Player has gone bust - Dealer wins!";
      }
      // DEALER GONE BUST
      if (bj.dpoints>21) {
        winner = 0; message = "Dealer has gone bust - Player wins!";
      }
    }

    // (F4) POINTS CHECK - WHEN BOTH PLAYERS STAND
    if (winner == null && bj.dstand && bj.pstand) {
      // DEALER HAS MORE POINTS
      if (bj.dpoints > bj.ppoints) {
        winner = 1; message = "Dealer wins with " + bj.dpoints + " points!";
      }
      // PLAYER HAS MORE POINTS
      else if (bj.dpoints < bj.ppoints) {
        winner = 0; message = "Player wins with " + bj.ppoints + " points!";
      }
      // TIE
      else {
        winner = 2; message = "It's a tie.";
      }
    }

    // (F5) DO WE HAVE A WINNER?
    if (winner != null) {
      // SHOW DEALER HAND AND SCORE
      bj.hdpoints.innerHTML = bj.dpoints;
      document.getElementById("deal-first").classList.add("show");

      // RESET INTERFACE
      bj.hpcon.classList.remove("started");

      // WINNER IS...
      setTimeout(function() {
        alert(message);
      }, 100);

    }
    return winner;
  },

  // (G) HIT A NEW CARD
  hit : () => {
    // (G1) DRAW A NEW CARD
    bj.draw(); bj.points();

     // (G2) AUTO-STAND ON 21 POINTS
    if (bj.turn==0 && bj.ppoints==21 && !bj.pstand) {
      bj.pstand = true; bj.hpstand.classList.add("stood");
    }
    if (bj.turn==1 && bj.dpoints==21 && !bj.dstand) {
      bj.dstand = true; bj.hdstand.classList.add("stood");
    }

    // (G3) CONTINUE GAME IF NO WINNER
    var winner = bj.check();
    if (winner==null) { bj.next(); }
  },

  // (H) STAND
  stand : () => {
    // (H1) SET STAND STATUS
    if (bj.turn) {
      bj.dstand = true; bj.hdstand.classList.add("stood");
    } else {
      bj.pstand = true; bj.hpstand.classList.add("stood");
    }

    // (H2) END GAME OR KEEP GOING?
    var winner = (bj.pstand && bj.dstand) ? bj.check() : null ;
    if (winner==null) { bj.next(); }
  },

  // (I) WHO'S NEXT?
  next : () => {
    // (I1) UP NEXT...
    bj.turn = bj.turn==0 ? 1 : 0 ;

    // (I2) DEALER IS NEXT
    if (bj.turn==1) {
      if (bj.dstand) { bj.turn = 0; } // SKIP DEALER TURN IF STOOD
      else { bj.ai(); }
    }

    // (I2) PLAYER IS NEXT
    else {
      if (bj.pstand) { bj.turn = 1; bj.ai(); } // SKIP PLAYER TURN IF STOOD
    }
  },

  // (J) "SMART" COMPUTER MOVE
  ai : () => { if (bj.turn) {
    // (J1) STAND ON SAFETY LIMIT
    if (bj.dpoints >= bj.safety) { bj.stand(); }

    // (J2) ELSE DRAW ANOTHER CARD
    else { bj.hit(); }
  }}
};
window.addEventListener("DOMContentLoaded", bj.init);