# CS 260 Notes

[My startup](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)
- [VIM Editor Controls](https://www.redhat.com/en/blog/introduction-vi-editor)

## Brainstorming

Sign shop game from Cool Math Games, but its css buttons?
Multiple Solitare as an app? (perhaps a little complex)
choose your own adventure, but competitive! Goal: have most health at the end. You might have a "bob runs into a bear" tile, which is bad if you arent a bear,
but if you are a bear then you are unaffected, so you have to drink the bear potion first.

House building trading game. You have resources and have to trade with other players to try to build your house first, but you don't know what they have.
Filler game on websocket! Cool animations potentially? (see artmouse155 on Scratch - Filler)
Bomb simulator on a website! Each player has to help diffuse the bomb.

Storybook creator!
You basically play mad libs and create a story. Each option has a set of finite options. You play levels where you have to complete scenarios:
[Storyteller](<https://en.wikipedia.org/wiki/Storyteller_(video_game)>)

Multiplayer choose your own adventure!
BUT
you get to choose from three options what happens to a character in a given turn. This character has attributes:
health (damage), strength, magic, intelligence
Each player picks something to happen to the character. Each player wants to maximize a stat, and the highest stat wins

im not your neighbor game - spot the defects

Game where you put your tasks on tiles that are affected by gravity, and then you put them into boxes and drawers with fun animations and physics.

Well O' Quotes: A virtual well that you can spin the handle on and it pulls up a quote. You can throw another quote in the well to inspire someone else.

"Do or do not, there is no try". -Yoda _Sumbitted by user artmouse155_

OR it's an game where you can fish up random emojis?

LearnProPlusPremium: A website about learning new skills. You can upload

## Text Dungeon Showdown

Text Dungeon Showdown! You compete against other players to play a cooperative text adventure game.
-You have cards that have different effects:
Add MAGIC BAG to inventory
Use most recent item in inventory
Encounter a MAGIC POTION (+2✨)? <- The question mark means that the potion might increase magic unless something special happened.

"You approach an archway at the end of the room. Etched in stone above the door reads: (use inspirational quote API to insert a quote here)"

At the end of each encounter, you fight a final enemy whose health is 10 \* (num players). The damage dealth is every stat combined. This gives you an incentive to help other players so you don't all just lose. If you kill the boss, the player with the highest stat wins. If the boss kills you, you all lose.

There's gotta be a sort of randomness at the end so it isn't obvious who will win? Perhaps bosses have special abilities.

## Demo Game Text

> Eldrond had barely finished stepping both feet inside the dungeon when **WHAM!** the gate slammed down behind him.

> "This doesn't look like Kansas anymore!" exclaimed Eldrond.

> Eldrond looked around and found himself in a small musty room that was filled with bugs. He looked ahead and saw an archway, and inscripted above the arch were the following words:

> “It's easy to stand in the crowd but it takes courage to stand alone.” - Ghandi

> Feeling inspired, Eldron began his trek into the unknown.

**Alice's Turn**

> As Elrond walked, his foot suddenly hit something small and hard. He looked down and... it was a book titled "A Summary of Every Book Ever Written".

> "Gadzooks!" exclaimed Elrond. He sat on the floor and began to inspect its pages and before he knew it, he had read the whole thing!

> **+5 📖 Intelligence**

**Bob's Turn**

> Down a dark staircase, Elrond noticed a mysterious object glimmering in a hole in the rock on his left. Curious, He reached his hand in and pulled out...

> A luxirous top hat!

> Elrond tried the item on, noticed it was very fashionable, and satisfied, placed the clothing item back where he found it. Maybe his adventure was short-lived, but he felt that it somehow left a lasting mark on his appearance.

> **+300 💄 Intelligence**

**Seth's Turn**

> After several hours of walking (and a few minutes of skipping) Elrond came across a well that looked so old, it was as if it would crumble to dust if he touched it.

> He noticed the bucket was close to the surface of the well and so he took a look inside. He could see what was inside! It was...

> A mysterious potion of unknown consequence!

> Just barely able to reach it, Elrond grabbed the item and stuffed it into his inventory.

> **Mysterious Potion Obtained**

Exclamations:
Gadzooks!
Great Scott!
Nuggets!
Great Googly Moogly!
I'll be a monkey's uncle!
Jinkies!
Zoinks!
Holy Guacamole!
WHAT???!?!?!?

Books:
A Summary of Every Book Ever Written
101 BYU Student Vacation Ideas (And why the MARB is the best one)
So You're Stuck in a Text Adventure
Platonic Liquids and Other Things Your Math Teachers Don't Tell You About
The Book of Time

> [!NOTE]
> This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
> If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

> [!NOTE]
> Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

Dad jokes API

https://icanhazdadjoke.com

[My Notes](notes.md)

## Github Notes

I learned that Github can be used to store cloud repositories. I learned how to use commands such as "clone", "fetch", "push" and "pull" to make use of my repository.
clone - pull and create repo
fetch - get info about repo without actually pulling
push - push commit
pull - get

## AWS Notes

I learned how to create an AWS server instance, how to register a domain name, and how to link the two together.

I can access the console via secure shell (ssh) using this command:

```
➜  ssh -i [key pair file] ubuntu@[ip address]
```

My domain is [chaseodom.click](http://chaseodom.click)

## Caddy

Caddy is a web service that allows us to expose all of our web services as a single web service
-allows us to easily support https

## HTTP vs HTTPS

Hypertext Transport Protocol (HTTP)
Secure Hypertext Transport Protocol (HTTPS) - requires a "negotiated secure connection" before data is exchanged

## HTML Notes

HTML adds structure _and_ content to a web application

### HTML Struture

- `body`
- `header`
- `footer`
- `main` - main content
- `section`
- `aside`
- `p`aragraphs
- `table`
- `ol/ul` ordered / unordered list element
- `div`isions
- `span` - can be used to mark a person's name for example

![HTML Structure](htmlStructure.jpg)

### HTML Input

- `form` | input container
  `<form action="form.html method="post">`
- `fieldset` labeled input grouping (use like div)
- `input` | Multiple types of user input | `<input type="" />`
- `select` | Selection dropdown:
  `<select><option>1</option></select>`
- `optgroup` Grouped selection drowpdown
  `<optgroup><option>1</option><optgroup/>`
- `option` Selection Option | `<option selected>option2</option>`
- `textarea` multiline text input
  `<textarea></textarea>`
- `label` Individual input label
  `<label for="range">Range: </label>`
- `output` Output of input
  `output for="range">0</output>`
- `meter` Display value with a known range
  `<meter min = "0" max = "100" value = "50"></meter>`

The input element is very versatile! Types of inputs include:

```bash
text
password
email
tel //telephone
url //url address
number
checkbox //inclusive selection
radio //exclusive selection
range //range limited number
date //year, month, day
datetime-local //date and time
month //year, month
week //week of year
color //color
file //local file
submit //button to trigger form submission
```

Here is an example of a checked radio button from the lectures:

```html
<label for="checkbox1">Check me</label>
<input type="checkbox" name="varCheckbox" value="checkbox1" checked />
```

Common attributes include:

- `name` : name of the input. Submitted as the name of an input if the input is used in a form
- `disabled` : disables user interactivity
- `value` : initial value of the input
- `required` : This attribute means a value is required for the form to be valid

### Validating HTML input

There is a `pattern` attribute that can validate input using regular expressions, meaning it won't be accepted if it doesn't follow the regex

- Available on `text, search, url, tel, email, and password`

> [!NOTE]
> Good design gives users feedback early on about data vaildation.

To make a checkbox (`<label type="checkbox">`) already checked, add the `checked` attribute.
