<<<<<<< HEAD
# Flipple Support Ticket Log
=======
# flipple support ticket log
>>>>>>> 70ebdac (Release Flipple v0.3.1 Visual and audio fixes)

A mostly unserious but potentially useful record of confusing moments, bugs, and player questions.

## case #1 - the maddox problem

**header:** the maddox problem  
**reported by:** __rex__  
<<<<<<< HEAD
**symptom:** player saw a Flipple³ history row with green-looking bars next to `0/5` and asked, “how did i get 0/5 green?”
=======
**symptom:** player saw a flipple³ history row with green-looking bars next to `0/5` and asked, “how did i get 0/5 green?”
>>>>>>> 70ebdac (Release Flipple v0.3.1 Visual and audio fixes)

**cause:** the colored history bars show the player’s guessed pattern. They are not correctness colors. The score on the right is the actual number of exact matches.

**resolution:** added an in-game Help popup explaining that the right-side score is what matters, and that the colors in the history are just guess history.

**status:** documented and probably still funny.
<<<<<<< HEAD
=======


## case #2 - the soundtrack seam

**header:** the soundtrack seam  
**reported by:** __developer sanity pass__  
**symptom:** quick theme or mode changes occasionally sounded like the music briefly stumbled before landing on the matching timestamp.

**cause:** the next track could start playback before its timestamp was fully prepared, which made the crossfade feel slightly jumpy on some browsers.

**resolution:** preload the soundtrack set after the first user gesture and prepare the next track timestamp before starting the crossfade.

**status:** tuned in v0.3.1.
>>>>>>> 70ebdac (Release Flipple v0.3.1 Visual and audio fixes)
