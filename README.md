# SUMO ARENA: ULTIMATE SHOWDOWN

A frantic, real-time game where you control a sumo wrestler and
fight to be the last one in the ring. Push, dodge, and outmaneuver your
opponents to become the ultimate champion! This game was created to provide
a fun, engaging, and competitive experience for up to four players using only
standard web technologies, with a special focus on performance and seamless
real-time interaction.
Contains a Single-Player and a Multiplayer version.

<pre>
                            .          .    .     .%%      .                  
                                                --::%*#.                      
                                  .             ::-*%--%%.                   . 
                                    .   ..     .-:----%-                      
                                          .    .------=---:-+---.    .   .    
                              ..                 .-=====------------::--.     
                                      .       -:--=====-----=======-------:.  
                            .      .       . --=======-==-:::--==-=====-----. 
                                    .      ::--===-==-=---------===..---====.  
                                    .    .:---=====--=========-------====-     
                                  .   .-----====-  -==-------=-=====:.         
                              ...  .-----===-     #=-:------==*-==#           
                            .----------===+.      ---:::::::::-==+.       .   
                            :=----=--....     . .   :--::::::--==+.:::         
                                          ..-:::::-..+=:====-=+..    .::::-..  
                                    .   ----------. .  ......    ..  --::::::- 
                                      ------------    .   ..   .---+---:----- 
                              .        .-----==----=. . -.   :..  ++++-==---== 
                                  .   .------=.  .+++*   ..  ..*+++++-===--== 
                                .       *-----=.  -++-++******++--+-++#*==--== 
                              .     ..   -----=  .-++++++++++++++++++++===-=== 
                                        .----=. ++++++++++++*+++++++--======. 
                            .             =---.   .=#-++++++++++=--=.  =-===. .
                                          .---.         ...-:..        ===--   
                            .             .----      .     ..        . -=--.   
                                .      .-------.           .           ==--.   
                                    .---+.       .      .         .  .==----. 
                                                      .                  .=--:
                            @@...=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#%@@@@@
</pre>

---

## ✨ Features

- **Real-time Multiplayer:** Engage in epic, simultaneous, real-time combat against 2 to 4 players. There are no turns - everyone can act at the same time.
- **Single-Player:** Engage in glorious combat against 2 to 4 ai-players. There are no turns - everyone can act at the same time.
- **DOM-Based Graphics:** Experience a jank-free 60 FPS gameplay rendered entirely using **DOM elements**, sidestepping the use of the canvas element while maintaining smooth, responsive animation.
- **Player Hosting System:** One player acts as the host, with full control over the game session. The host can manage players, select maps, and start the game. If the host leaves, the game ends.
- **Keyboard Controls:** Use your keyboard to control your sumo wrestler with smooth, responsive, and lag-free input.
- **Dynamic UI:** See all other players and their scores updated in real-time. The game timer keeps track of each round's duration.
- **In-game Menu:** Pause, resume, or quit the game at any time with an intuitive menu. A message is broadcast to all players when a host takes action.
- **Sound Effects:** Enhance your experience with custom sound effects for key game events, such as starting a round or pushing an opponent out of the ring.
- **Settings Menu:** Adjust in-game volume for sound effects and background music to your liking.
- **Winning Conditions:** The last player remaining in the ring is declared the winner!
- **Unused Feature:** A session browser has been implemented but is currently unused; only one game can run at a time. This feature is a foundation for future development.

---

## 💻 Technologies Used

- **Frontend:**
  - **TypeScript:** Provides a robust, type-safe environment for building a complex and maintainable game client.
  - **HTML & CSS:** Used exclusively for all rendering and visual elements, leveraging the power of the DOM.
- **Backend:**
  - **Node.js:** A fast and scalable JavaScript runtime for the game server.
  - **Socket.IO:** Powers the real-time, low-latency communication between the client and server, ensuring smooth and responsive multiplayer gameplay.

---

## 🎮 How to Play Multiplayer

1.  **Launch the Server:** The server must first be hosted either locally or online.
2.  **Join the Game:** Players navigate to the server's URL in their web browser.
3.  **Choose a Name:** Each player selects a unique name to join the game lobby.
4.  **Host Actions:** Once all players are in the lobby, the host can start the game, change maps, or kick players. The host can also add test players for easy solo testing.
5.  **Let the Battle Begin!** Use your mouse and keyboard to control your sumo wrestler. The objective is simple: push all other players out of the circular ring to be the last one standing!

---

## 🎮 How to Play Single-Player

1.  **Launch the Server:** Only the local server must run.
2.  **Join the Game:** Navigate to the server's URL in the web browser.
3.  **Choose a Name:** You should select a unique name to engage the Single-Player game.
4.  **Let the Battle Begin!** Use your mouse and keyboard to control your sumo wrestler. The objective is simple: push all other players out of the circular ring to be the last one standing!

---

## 🔧 Performance and Optimization

To ensure a smooth gaming experience, special care was taken to prevent "jank" and maintain a constant 60 FPS. The game relies on **`requestAnimationFrame`** for rendering, ensuring animations are synchronized with the browser's refresh rate. For optimization we made sure to
keep the rendering clean, by removing unused and duplicate resources, thus keeping memory usage low and as efficient as possible.

## 🛠️ Installation

Follow these steps to set up the servers and run the game online.

1.  **Install Dependencies:** In your terminal, navigate to the project's root directory and run `npm install` to install the required packages.
2.  **Set up ngrok:** You'll need to have ngrok installed and configured to create a public URL for your server.
3.  **Prepare and Activate Tunneling:**
    - First get your ngrok authtoken by typing `ngrok config edit`. Copy your local authtoken.
      The authtoken looks something like this inside the config file, copy this value:
    ```
    agent:
        authtoken: 2snWKN0XE6huPJl9SNlm7jxb7oG_2FznLcVgmFUTd5W4v2y9E
    ```
    - Open `ngrok.yml` in root directory and change the authtoken in there to yours and save.
    - Once swapped, run `ngrok start --config ngrok.yml --all` to start the tunneling service.
4.  **Update Frontend:**

    - Copy the ngrok-provided backend URL and use it to replace the local socket address in your frontend's network folder `const URL = "http://localhost:3000";` <- swap this to ngrok tunneled backend URL.
    - Allow access to the frontend by configuring vite.config.js by modifying the .env file
      in root, changing `VITE_NGROK_URL=<your frontend tunneled URL here>`, keep in mind not to include the protocol (`https://` part of the URL) in the `VITE_NGROK_URL`.

5.  **Start the servers:**

- In root folder, have two terminals open and in one run the following command to start the frontend server:

```
npm run dev
```

- In the same location, but the other terminal, run the following command to start the backend server:

```
npm run server
```

- If you want to play Multiplayer, both servers must run.
- If you want to play Single-Player, only the frontend server must run.

6.  **Share the URL:**

- Distribute the final tunneled frontend URL to other players so they can join and play.
- The host can play on their localhost machine if they want.

## **Extra**:

- You can omit setting up ngrok tunneling if you want to test locally, by having the default
  socket URL value inside frontend/network/socket.ts `const URL = "http://localhost:3000";`.
  Then after having installed dependencies, run the frontend in one terminal and backend in the other and open http://localhost:5173/ and you can test the game locally.

- If you want to play Single-Player, it is not necessary to run the backend server ("npm run server"). Only the frontend ("npm run dev") is necessary.

- The Single-Player has 3 difficulty levels. In level 1 the AI is not as aggressive and the ring is not as slippery. In level 3 it is the opposite.

- Singleplayer is currently disabled due to insufficient functionality, it breaks multiplayer(this project was a collaboration)
