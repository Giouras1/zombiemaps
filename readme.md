# ZombiesMaps

## Party multiplayer

Run `node server.mjs` from the project directory, then open `http://localhost:4173` in a browser. Friends can use the same server address on your network (or a publicly hosted HTTPS reverse proxy). All players must connect to the same server; opening `index.html` directly or using static-only hosting cannot create or join parties.

Enter a party name and choose **Create Party**. Share the six-character code shown in **Your Party Code**. Up to three friends can enter that code under **Join a Party Code**. The party leader chooses the playlist and starts the match; teammates join the same map automatically. The leader simulates the shared enemies and objectives, while teammates can move, shoot, and interact with standard world objects. Map travel, Cargo driving, and exfil/Beacon activation are leader-controlled. Parties are temporary and close when the leader leaves or the server restarts.

Run `node tests/party.test.mjs` and `node tests/outbreak.test.cjs` to check party behavior and game regressions.
