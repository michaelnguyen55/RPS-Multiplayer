$(document).ready(function() {
	//Connect to Firebase Database
	var config = {
		apiKey: "AIzaSyBdK8wd6KRvGlTXh1bMDP40FinOvCq-Ukg",
		authDomain: "rps-multiplayer-f3d26.firebaseapp.com",
		databaseURL: "https://rps-multiplayer-f3d26.firebaseio.com",
		projectId: "rps-multiplayer-f3d26",
		storageBucket: "",
		messagingSenderId: "135554401721"
	};
	firebase.initializeApp(config);
	var database = firebase.database();

	var game = {

		name: "",
		wins: 0,
		losses: 0,
		ties: 0,
		playerNumber: "",
		choices: ["r.png", "p.png", "s.png"],
		playerChoice: "",
		anonymousNumber: "",
		messageNumber: 0,
		disconnect: false,

		//This function is called on load
		startGame: function() {
			game.getChat();
			$("#leave-game-button").hide();
			
			//Sets event listeners for buttons/choices/window exit
			$(document).on("click", "#start-button", function() {
				game.setPlayer();
			});

			$(document).on("click", ".choices", function() {
				game.getChoice(this);
			});

			$(document).on("click", "#leave-game-button", function() {
				game.leaveGame();
			});

			$(document).on("click", "#send-button", function() {
				game.setChat();
			});

			$(window).on("beforeunload", function() {
				game.removePlayer();
			});

			//Assigns a spectator a randomly generated number for their anonymous name if they don't enter a name
			game.anonymousNumber = Math.floor((Math.random() * 1000000) + 1);

			//If a value from players in the database changes, then gets each players' stats and sets them inside their 
			//respective player number area.
			database.ref("players/").on("value", function(snapshot) {
			
				var playerOneExists = snapshot.child("player-one").exists();
				var playerTwoExists = snapshot.child("player-two").exists();

				//If player one exists, their stats is displayed in the player one area
				if(playerOneExists) {
					$("#wait-one").empty();
					var playerOne = snapshot.val()["player-one"];
					$("#player-one-stats").html(playerOne.name + "<br>wins: " + playerOne.wins + "<br>losses: " + playerOne.losses + "<br>ties: " + playerOne.ties);
				}
				//If player one does not exists, the player one area will say "Waiting for Player 1"
				else {
					$("#turn").empty();
					$("#player-one-stats").empty();
					$("#wait-one").text("Waiting for Player 1");
				};

				//If player two exists, their stats is displayed in the player two area
				if(playerTwoExists) {
					$("#wait-two").empty();
					var playerTwo = snapshot.val()["player-two"];
					$("#player-two-stats").html(playerTwo.name + "<br>wins: " + playerTwo.wins + "<br>losses: " + playerTwo.losses + "<br>ties: " + playerTwo.ties);
				}
				//If player two does not exists, the player two area will say "Waiting for Player 2"
				else {
					$("#turn").empty();
					$("#player-two-stats").empty();
					$("#wait-two").text("Waiting for Player 2");
				};

				//If current person is player one and player one left the game or window, removes ability to click choices for them
				if(playerOneExists && playerTwoExists === false && game.playerNumber !== "") {
					database.ref("players/player-one/playerChoice").set("");
					$(".choices").addClass("no-click");
					$(".choices").removeClass("picked-choice");
					$(".choices").css("opacity", 0.2);
				};

				//If current person is player two and player one left the game or window, removes ability to click choices for them
				if(playerTwoExists && playerOneExists === false && game.playerNumber !== "") {
					database.ref("players/player-two/playerChoice").set("");
					$(".choices").addClass("no-click");
					$(".choices").removeClass("picked-choice");
					$(".choices").css("opacity", 0.2);
				};

				//This is ran only if both players exists
				if(playerOneExists && playerTwoExists) {

					var playerOneChoice = snapshot.child("player-one").child("playerChoice").val()
					var playerTwoChoice = snapshot.child("player-two").child("playerChoice").val()

					//Allows both players to click choices
					if(game.playerNumber !== "" && playerOneChoice === "" && playerTwoChoice === "") {
						game.playerChoice = "";
						$(".choices").removeClass("no-click");
						$(".choices").css("opacity", 1);
					};

					var playerOne = snapshot.val()["player-one"];
					var playerTwo = snapshot.val()["player-two"];
					//Players' names are written in the turn div for whoever has not clicked a choice yet
					if(playerOneChoice === "" && playerTwoChoice === "") {
						$("#turn").text("Waiting for " + playerOne.name + " and " + playerTwo.name + " to choose.");
					}
					else if(playerOneChoice === "") {
						$("#turn").text("Waiting for " + playerOne.name + " to choose.");
					}
					else if(playerTwoChoice === "") {
						$("#turn").text("Waiting for " + playerTwo.name + " to choose.");
					};

					//Compares both players choices and changes wins/losses/ties
					if(playerOneChoice !== "" && playerTwoChoice !== "") {
						$("#left").html($("<img src='assets/images/" + playerOneChoice + ".png'>"));
						$("#right").html($("<img src='assets/images/" + playerTwoChoice + ".png'>"));
						if(game.playerNumber === "one") {
							if ((playerOneChoice === "r") && (playerTwoChoice === "s")) {
								database.ref("outcome/").set({
									winner: playerOne.name
								});
								game.wins++;
							} else if ((playerOneChoice === "r") && (playerTwoChoice === "p")) {
								database.ref("outcome/").set({
									winner: playerTwo.name
								});
								game.losses++;
							} else if ((playerOneChoice === "s") && (playerTwoChoice === "r")) {
								database.ref("outcome/").set({
									winner: playerTwo.name
								});
								game.losses++;
							} else if ((playerOneChoice === "s") && (playerTwoChoice === "p")) {
								database.ref("outcome/").set({
									winner: playerOne.name
								});
								game.wins++;
							} else if ((playerOneChoice === "p") && (playerTwoChoice === "r")) {
								database.ref("outcome/").set({
									winner: playerOne.name
								});
								game.wins++;
							} else if ((playerOneChoice === "p") && (playerTwoChoice === "s")) {
								database.ref("outcome/").set({
									winner: playerTwo.name
								});
								game.losses++;
							} else if (playerOneChoice === playerTwoChoice) {
								database.ref("outcome/").set({
									winner: "tie"
								});
								game.ties++;
							};
						}
						else if(game.playerNumber === "two") {
							if ((playerTwoChoice === "r") && (playerOneChoice === "s")) {
								game.wins++;
							} else if ((playerTwoChoice === "r") && (playerOneChoice === "p")) {
								game.losses++;
							} else if ((playerTwoChoice === "s") && (playerOneChoice === "r")) {
								game.losses++;
							} else if ((playerTwoChoice === "s") && (playerOneChoice === "p")) {
								game.wins++;
							} else if ((playerTwoChoice === "p") && (playerOneChoice === "r")) {
								game.wins++;
							} else if ((playerTwoChoice === "p") && (playerOneChoice === "s")) {
								game.losses++;
							} else if (playerTwoChoice === playerOneChoice) {
								game.ties++;
							};
						};
						
					};

					

				};
				
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});

			//Shows who won in the countdown text
			database.ref("outcome/").on("value", function(childSnapshot) {
				//database.ref().once("value", function(a) {
					//$("#countdown").append("<br>" + a.players["player-one"].name + " chose " + a.players["player-one"].playerChoice + "<br>" + a.players["player-two"].name + " chose " + a.players["player-two"].playerChoice);
				//});

				if(childSnapshot.val().winner === "tie") {
					$("#countdown").prepend("It's a tie!");
				}
				else if(childSnapshot.val().winner !== "" && childSnapshot.val().winner !== null) {
					$("#countdown").prepend(childSnapshot.val().winner + " is the Winner!");
				};

				$("#turn").empty();
				database.ref("outcome/").remove();
				//After 2 seconds allows players to click choices. Player stats are also updated.
				setTimeout(function(){
					if(game.playerChoice !== "") {
						game.endRound();
					};
  					$("#countdown").empty();
  					$("#left").empty();
  					$("#right").empty();
				}, 4000);
			});

		},

		//After entering a name and clicking the start button, this function sets the current player's stats in the database
		setPlayer: function() {
			game.name = $("#name-input").val().trim();
			//If the entered name is not empty this runs, else "Please enter a valid name!"
			if(game.name !== "") {
				$("#enter-valid-name").empty();
				game.playerNumber = "";
				game.playerChoice = "";

				//Puts player in player 1 spot if no one is there
				if($("#wait-one").text() !== "") {
					game.playerNumber = "one";
					$("#current-player").text("Hi " + game.name + "! You are Player 1");
					$("#leave-game-button").show();
				}
				//Puts player in player 2 spot if no one is there
				else if($("#wait-two").text() !== "") {
					game.playerNumber = "two";
					$("#current-player").text("Hi " + game.name + "! You are Player 2");
					$("#leave-game-button").show();
				}
				//If both spots are full, person will not be put anywhere and the game is full text will be shown
				else {
					$("#full-game-text").html("Game is full. Please wait until there is an empty spot available.")
				};

				//If a person was able to join the play-area, their stats will be set in the database
				if(game.playerNumber !== "") {
					game.choicesCSS();

					$("#start-area").hide();
					database.ref("players/player-" + game.playerNumber).set({
						name: game.name,
						wins: game.wins,
						losses: game.losses,
						ties: game.ties,
						playerChoice: ""
					});
				};
			}
			else {
				$("#enter-valid-name").text("Please enter a valid name!");
			};
		},

		//When refreshing or exiting the page, this function removes the current player from the database
		removePlayer: function() {
			//If a person has completed a round before, this will get the chat-box to say they disconnected
			if((game.wins > 0 || game.losses > 0 || game.ties > 0) && game.playerNumber === "") {
				game.disconnect = true;
				game.setChat();
			};
			//If person is a current player, they will be removed from the database and get the chat-box to say they disconnected
			if(game.playerNumber !== "") {
				game.disconnect = true;
				game.setChat();
			};
			database.ref("players/player-" + game.playerNumber).remove();
		},

		//When clicking the Leave Game button, player is removed from the game/play-area but retains their stats, they can join again if they wish to
		leaveGame: function() {
			if(game.playerNumber !== "") {
				database.ref("players/player-" + game.playerNumber).remove();
				$("#current-player").empty()
				$("#start-area").show();
				$("#leave-game-button").hide();
				game.playerNumber = "";
				game.playerChoice = "";
			};
		},

		//Gets the choice that the player clicks
		getChoice: function(currentChoice) {
			if($("#wait-one").text() === "" && $("#wait-one").text() === "" && game.playerNumber !== "") {
				game.playerChoice = $(currentChoice).attr("data-choice");
				//Once player picks a choice, they are not allowed to pick another
				$(".choices").addClass("no-click");
				$(currentChoice).addClass("picked-choice");
				
				//Sets the chosen choice into the database
				database.ref("players/player-" + game.playerNumber + "/playerChoice").set(game.playerChoice);
			}
		},

		//When both players have picked a choice, this function is called
		endRound: function() {
			//Resets ability to click choices
			game.playerChoice = "";
			$(".choices").css("opacity", 1);
			$(".choices").removeClass("picked-choice");
			$(".choices").removeClass("no-click");

			//Changes the player stats to reflect the game's outcomess
			database.ref("players/player-" + game.playerNumber).set({
				name: game.name,
				wins: game.wins,
				losses: game.losses,
				ties: game.ties,
				playerChoice: ""
			});
		},

		//Sets the initial chat messages from the database into the chat box, and adds a new message whenever someone sends one
		getChat: function() {
			database.ref("chat/").on("child_added", function(snapshot) {
				//Removes first message from database and page if the total number of messages reaches 20
				game.messageNumber++;
				if(game.messageNumber > 19) {
					game.messageMumber--;
					database.ref("chat/").once("child_added", function(firstChild) {
						database.ref("chat/" + firstChild.key).remove();
						$("#chat-box").find("div").first().remove();
					});
				};

				var messageDiv = $("<div>");

				//Sets the message's css style to disconnect for people who disconnected
				if(snapshot.val().style === "disconnect") {
					messageDiv.addClass("disconnect");
					$(messageDiv).append(snapshot.val().name + snapshot.val().message);
				}
				else {
					$(messageDiv).append(snapshot.val().name + ": " + snapshot.val().message);
				};
					
				$("#chat-box").append(messageDiv);
				
				//If current user's chat-box scroll is at the bottom, automatically scroll down.
				if($("#chat-box").scrollTop() +  $("#chat-box").innerHeight() + 30 > $("#chat-box")[0].scrollHeight){
					$("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
				};
				
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});
		},

		//After clicking the send button in the chat area, this function saves the sent message in the database
		setChat: function() {
			var message = $("#chat-input").val().trim();

			if(game.disconnect === false) {
				//If a person has entered a name, save it and their message in the database
				if(game.name !== "") {
					database.ref("chat/").push({
						name: game.name,
						message: message,
						style: "none"
					});
				}
				//If a spectator has not entered a name, save their name and message as Anonymous with a pre-generated number in the database instead
				else {
					database.ref("chat/").push({
						name: "Anonymous" + game.anonymousNumber,
						message: message,
						style: "none"
					});
				};
			};

			//If person is a current player or has played before and they have disconnected, 
			//save their name in the database. The message will be their name with " has disconnected"
			if(game.disconnect === true) {
				if(game.name !== "") {
					database.ref("chat/").push({
						name: game.name,
						message: " has disconnected",
						style: "disconnect",
					});
				}
				game.disconnect = false;
			};
		},

		//Adds css on hover for choices
		choicesCSS: function() {
			$("#r").addClass("choices");
			$("#p").addClass("choices");
			$("#s").addClass("choices");

			$("#r").hover(function(){
				$("#p").css("opacity", 0.2);
				$("#s").css("opacity", 0.2);
			}, function() {
				if(game.playerChoice === "") {
					$("#p").css("opacity", 1);
					$("#s").css("opacity", 1);
				};
			});

			$("#p").hover(function(){
				$("#r").css("opacity", 0.2);
				$("#s").css("opacity", 0.2);
			}, function() {
				if(game.playerChoice === "") {
					$("#r").css("opacity", 1);
					$("#s").css("opacity", 1);
				};
			});

			$("#s").hover(function(){
				$("#p").css("opacity", 0.2);
				$("#r").css("opacity", 0.2);
			}, function() {
				if(game.playerChoice === "") {
					$("#p").css("opacity", 1);
					$("#r").css("opacity", 1);
				};
			});
		}

	};

	game.startGame();

});