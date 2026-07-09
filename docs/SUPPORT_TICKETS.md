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


## case #4 - blank board after v0.3.2

**header:** blank board / buttons do nothing  
**symptom:** the page could load with only the play box, submit button, streak, help icon, title, and footer labels. Mode/theme clicks could partially wake the UI, but help, share, practice, and audio controls did not behave correctly.

**cause:** a stale hover animation listener referenced a function that was no longer defined. That JavaScript error happened before startup finished, so the board never rendered and the remaining controls never attached their listeners.

**resolution:** removed the experimental hover animation listener, replaced the top-right controls with simpler stable static icons, and validated the script with `node --check`.

**status:** fixed in the v0.3.2 UI/audio hotfix.

## case #5 - Vercel package JSON parse failure

**header:** production deploy failed before build  
**symptom:** Vercel reported `/vercel/path0/package.json: Expected double-quoted property name in JSON at position 23`.

**cause:** the deployed copy of `package.json` was malformed during the merge/drag-in process.

**resolution:** rewrote `package.json` as strict valid JSON and checked it with `python3 -m json.tool`.

**status:** fixed in the v0.3.2 UI/audio hotfix.


## case #6 - the haunted save file

**header:** blank board survived the first hotfix  
**symptom:** after the site was deployed successfully, the game could still reopen to a blank play box with only the submit button, streak, help icon, and footer labels. Pressing submit added empty `0/5` rows instead of real guesses.

**cause:** the browser had a corrupted local daily result saved from the broken build. The app trusted that saved result, restored an empty `pattern: []`, and then kept playing from that invalid empty board.

**resolution:** added validation for saved daily results, pattern arrays, and submit state. Corrupted saved results for the current day are now discarded automatically and replaced with a fresh board.

**status:** fixed in the v0.3.2 startup/save hotfix.


## case #7 - the crooked speaker x

**header:** the crooked speaker x  
**symptom:** the muted speaker icon worked, but the `x` looked visually off-center. The settings icon also still looked too much like a messy gear in some stale builds.

**cause:** the speaker mark coordinates were sitting too high inside the SVG, and older rendered settings markup could survive unless the button contents were force-replaced.

**resolution:** centered the muted `x`, tightened its stroke, and made the Settings button force-render the ASCII-style `[*]` control.

**status:** included in the v0.3.2 startup/save hotfix patch.


## case #6 - duplicate soundtrack layers

**header:** duplicate soundtrack layers  
**reported by:** mobile safari testing  
**symptom:** switching themes or modes could occasionally leave two soundtrack versions playing over each other.

**cause:** a pending crossfade could finish after a newer soundtrack switch had already started, which let an outdated audio object survive too long.

**resolution:** added a transition token so only the newest soundtrack change is allowed to complete. mobile-like browsers now pause music when the page is hidden.

**status:** patched in v0.3.2.
