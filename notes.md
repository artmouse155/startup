# CS 260 Notes

[My startup](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)
- [VIM Editor Controls](https://www.redhat.com/en/blog/introduction-vi-editor)
- [Burning Text](https://cooltext.com/Logo-Design-Burning)

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

# HTML Notes

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

You can have multiple classes assigned to the same element using spaces:

```html
<div class="box box1"></div>
```

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

### HTML media elements

Five main ones: `img`, `audio`, `video`, `svg`, and `canvas`.
`svg` and `canvas` are editable

#### Images

`img` elements contain `alt`ernate text and a `src` (source)

EXAMPLE:

```html
<img
  alt="mountain landscape"
  src="https://images.pexels.com/photos/164170/pexels-photo-164170.jpeg"
/>
```

<img alt="mountain landscape" src="https://images.pexels.com/photos/164170/pexels-photo-164170.jpeg" />

#### Audio

`audio` elements can have the `controls` attribute to let users control audio. Like images, they have a `src`. `loop` will loop, and `autoplay` (discouraged) will play the audio right when it is loaded.

#### Video

`video` elements are similar to `audio` elements in that they have `src`, `loop`, `autoplay` and `controls` tags. They also have a `width` tag.

Sometimes when you request an external video, you need `crossorigin="anonymous"`

#### Scalable Vector Graphic (SVG)

Scalable vector graphics renders graphics inline with HTML.

Example:

```html
<svg
  viewBox="0 0 300 200"
  xmlns="http://www.w3.org/2000/svg"
  stroke="red"
  fill="red"
  style="border: 1px solid #000000"
>
  <circle cx="150" cy="100" r="50" />
</svg>
```

which renders this:

<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" stroke="red" fill="red" style="border: 1px solid #000000">
  <circle cx="150" cy="100" r="50" />
</svg>

## Simon HTML

We always want to call our top level page index.html

> A submit button inside of a form element will cause the action to happen

## Deployment

Before adding any services, we can just use `deployFiles.sh` and run it like so:

```bash
./deployFiles.sh -k <yourpemkey> -h <yourdomain> -s simon
```

We can add `class` attributes to `div` elements

Deployment successful as of 5:27 PM 1/24/25
To access my pemkey, i can do `./../../CreameryBrownie.pem`

### Extra HTML tidbits

Set a standard viewport size:
`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
Add a wepage title:
`<title>Simon HTML</title>`
Add a webpage icon:
`<link rel="icon" href="favicon.ico" />`

Using `<menu>` instead of `ul` when users are interacting with it!

Startup Deployment successful as of 7:17 PM 1/24/25

# CSS Notes

CSS is made up of many defining rulesets / `rules`.
`property` corresponds to a `value`; whole thing is called a `declaration`.
<img src="https://raw.githubusercontent.com/webprogramming260/.github/main/profile/css/introduction/cssDefinitions.jpg">

- The **DOM Tree** represents the Document Object Model, or the heiarchy of data
- The way in which CSS takes priority is according to the DOM; Lower levels will override higher levels

![Overriding from lower level declarations](image-1.png)

![The Box Model](image.png)

Example CSS:

```css
body {
  color: red;
}

header {
  color: blue;
}

footer {
  color: green;
}
```

## Selectors

You can do multiple like this:

```css
td,
th {
  border: solid 1px black;
}
```

### Combinators

When we want CSS to apply to a specific combination of elements; for example, all `h2`s which are descendants of `section`s

```css
section h2 {
  color: blue;
}
```

| Combinator       | Meaning                    | Example        | Description                                |
| ---------------- | -------------------------- | -------------- | ------------------------------------------ |
| Descendant       | A list of descendants      | `body section` | Any section that is a descendant of a body |
| Child            | A list of direct children  | `section > p`  | Any p that is a direct child of a section  |
| General sibling  | A list of siblings         | `div ~ p`      | Any p that has a div sibling               |
| Adjacent sibling | A list of adjacent sibling | `div + p`      | Any p that has an adjacent div sibling     |

### Class Selectors

Do class selectors with a dot.
HTML:

```html
<p class="introduction">Introduction</p>
```

CSS:

```css
.summary {
  font-weight: bold;
}
```

We can also combine it with the element tag to select all paragraphs with a class summary.

```css
p.summary {
  font-weight: bold;
}
```

### Attribute Selectors

We can also create CSS code on the basis of attribute selectors, which can select all sorts of attributes.

```css
[href="https://example.org"]
{
  color: blue;
}
```

## Pseudo Selectors

```css
section:hover {
  border-left: solid 1em purple;
}
```

## SVG Paths

#### Paths - For moving HTML elements

https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

Five line commands
| Command | Meaning | Example | Description |
| ------- | ------- | ------- | ----------- |
| `M` | Move (x y) | `M 10 20` or `m dx dy` | The first command. Move to an X and Y position. |
| `L` | Line (new x, new y) | `L 5 15` or `l dx dy` | Draw a line from the current position. |
| `H` | Horizontal line (x) | `H 20` or `h dx` | Draw a horizontal line. |
| `V` | Vertical line (v) | `V 20` or `v dy` |

All commands come in _two variants_.

- An **uppercase letter** means absolute coordinates
- A **lowercase letter** means relative coordinates

##### Curves!

You can also make cubic and quatradic bezier curves! You do this with `C / c` and `Q / q`
You can make shorthand bezier curves with `S / s` and arcs with `A`.

- These create ellipses!

## Animation

I couldn't get my CSS animation to work! I fixed it by making it "animation-duration" instead of "animaition-duration".

### Elements of a CSS Animation

Animations need to have a name and a duration. Here is an example:

```css
p {
  animation-name: grow;
  animation-duration: 5s;
}

@keyframes grow {
  from {
    font-size: 20px;
  }
  90% {
    font-size: 45px;
  }
  to {
    font-size: 40px;
  }
}
```

We use `animation-name`, `animation-duration`, and `@keyframes`.

https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations

Really cool slide in effect from aboe:

```css
@keyframes slide-in {
  from {
    translate: 150vw 0;
    scale: 200% 1;
  }

  to {
    translate: 0 0;
    scale: 100% 1;
  }
}
```

You can use `animation-fill-mode: forwards;` to make an animation "stick".

You can change the easing using easing such as "ease-out"

You can transform using

```css
p {
  transform: translateX(0%);
}
```

## Responsive Design

How we reconfigure for multiple devices!
The `display` property is powerful at changing how elements are organized on a screen.

This line of code tells the phone not to scale a page on mobile:

Example Code

```css
.none {
  display: none;
}

.block {
  display: block;
}

.inline {
  display: inline;
}

.flex {
  display: flex;
  flex-direction: row;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

![Funky Items](mage-2.png)

```html
<meta name="viewport" content="width=device-width,initial-scale=1" />
```

A `float` css property allows for content which is `inline` to wrap around it; Ex. image surrounded by text

We can run certain code based on whether or not we are in portrait mode or landscape mode.

```css
@media (orientation: portrait) {
  aside {
    display: none;
  }
}
```

## CSS Grid

Grid items can be in a freeform grid with the CSS grid display property: `display: grid;`
Here is an example:

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 300px;
  grid-gap: 1em;
}
```

TEST

```diff
+ I like green
eh
- I like red
```

![alt text](image-3.png)

## Flexbox

![alt text](image-4.png)

# React Part 1 Notes

## Javascript

Javascript is a pretty awesome language!

- most used in the world
- weakly typed language
- runs on any browser

We can print to output with `console.log()`

javascript example:

```js
function join(a, b) {
  return a + b;
}

console.log(join("Hello", "World!"));
```

Comments:

```js
// Line comment

/*
Block comment
*/
```

### Javascript in HTML

We can plug Javascript into HTML by

1. importing the script using `<script></script>` and
2. using the `onclick` attribute for an element.

We can include the following javascript in `index.js:`

```js
function sayHello() {
  alert("Hello");
}
```

...and then include it and run it.

```html
<!-- external script -->
<head>
  <script src="index.js"></script>
</head>
<body>
  <button onclick="sayHello()">Say Hello</button>
  <button onclick="sayGoodbye()">Say Goodbye</button>

  <!-- internal script block -->
  <script>
    function sayGoodbye() {
      alert("Goodbye");
    }
  </script>

  <!-- inline attribute handler -->
  <script>
    let i = 1;
  </script>
  <button onclick="alert(`i = ${i++}`)">counter</button>
</body>
```

### Node.js

Node.js is typically just called Node. It is an application that lets you run javascript outside of the browser!
Both Node.js and Google use the V8 engine.

We can excute Node.js by running the `node` command in the terminal.
Check version: `node -v`
Run one line: `node -e "console.log(1+1)"`
Run interpretive mode: `node`
Run a file: `node index.js`

#### Loading Node packages

Node Package Manager (NPM) is a program that

- can access a wide library of packages on the internet
- manages libraries for your JS projects

To create an empty npm folder run:

```bash
npm init -yes
```

The `-yes` is optional, but allows you to set all the default settings

#### Routing

Routing elements are controlled by `BrowserRouter`

```jsx
    <BrowserRouter>
      <!-- The previous component elements go here -->
    </BrowserRouter>
```

Going between links to different pages:

```jsx
<a className="nav-link" href="play.html">Play</a>

// to

<NavLink className='nav-link' to='play'>Play</NavLink>
```

Routed component:

```jsx
 <main>App components go here</main>

 // to

<Routes>
  <Route path='/' element={<Login />} exact />
  <Route path='/play' element={<Play />} />
  <Route path='/scores' element={<Scores />} />
  <Route path='/about' element={<About />} />
  <Route path='*' element={<NotFound />} />
</Routes>
```

11:55 PM: Simon and Startup both have been deployed!

# React Part 2 Notes

## Basic Console

We can write a message to write to console using `console.log.`

```js
console.log(`Hello World`);
```

And the style can even be changed!

```js
console.log("%c Yeet", "color: blue"); //Prints "Yeet" in blue
```

We can use **time** and **timeEnd** to look at time.

```js
console.time("demo");
for (let i = 0; i < 1000000; i++)\
{
  // Do something
}
console.timeEnd('demo'); // Prints 'demo: 12.74 ms'
```

We can also use `console.count(a)`, which prints how many times `count` with that specific parameter was called.s

## Functions

- Functions can be defined inside of other functions.
- Functions can also be assigned to variables.
- Functions can also have a default value.

Here's an example of a regular function and an inline function.

```js
// Standard:
function add(a, b) {
  return a + b;
}

const add_func = function (a, b) {
  // Note we can make it const
  return a + b;
};
```

## Arrow functions

Functions are **first class functions**
Arrows (`=>`) are another way we can define functions.

- curly braces are optional!
- `return` statements are optional

Examples:

```js
() => 3; // Function that returns 3

() => {
  3; // Returns 3
};

() => {
  return 3; // Also returns 3!
};
```

Arrow functions inherit the `this` pointer, creating something called `closure.`

```js
function make_closure(init_val) {
  let closure_val = init_val;
  return () => {
    return `closure${++closure_val}`;
  };
}

const closure = make_closure(0);

console.log(closure()); // Return 1 (incremented before returning)

console.log(closure()); // Return 2
```

## Express

# More HTML

POST is update, PUT is create.
We can leverage HTTP and the idea of nouns with the verbs in the HTTP request to help make sense for the user.

## Express functions

```js
const app = express();

app.get("/store/:id/:time", (req, res) => {
  res.send(`${(store, req.params.id, req.params.time)}`);
});
```
