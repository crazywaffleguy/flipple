# flipple support ticket log

A mostly unserious but potentially useful record of confusing moments, bugs, and player questions.

## case #1 - the maddox problem

**header:** the maddox problem  
**reported by:** __rex__  
**symptom:** player saw a flipple³ history row with green-looking bars next to `0/5` and asked, “how did i get 0/5 green?”

**cause:** the colored history bars show the player’s guessed pattern. They are not correctness colors. The score on the right is the actual number of exact matches.

**resolution:** added an in-game Help popup explaining that the right-side score is what matters, and that the colors in the history are just guess history.

**status:** documented and probably still funny.


## case #2 - the soundtrack seam

**header:** the soundtrack seam  
**reported by:** __developer sanity pass__  
**symptom:** quick theme or mode changes occasionally sounded like the music briefly stumbled before landing on the matching timestamp.

**cause:** the next track could start playback before its timestamp was fully prepared, which made the crossfade feel slightly jumpy on some browsers.

**resolution:** preload the soundtrack set after the first user gesture and prepare the next track timestamp before starting the crossfade.

**status:** tuned in v0.3.1.


## case #3 - the ice level pass

**header:** the ice level pass  
**reported by:** soundtrack/aesthetic direction  
**symptom:** flipple³ shared the same warm green/brown base palette as normal mode even though the cubed soundtrack felt glitchier, colder, and more mystical.

**cause:** cubed mode had mode-specific audio but not a mode-specific color palette.

**resolution:** added colder blue-leaning cubed theme palettes and replaced the soundtrack files with no-intro loop-ready exports.

**status:** tuned in v0.3.2.
