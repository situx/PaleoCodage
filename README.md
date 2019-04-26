# PaleoCodage
A paleographic description system for the creation of cuneiform characters.

### Why a digital machine-readable paleographic description?

Shapes of cuneiform characters could previously to PaleoCodage not be digitally described in terms of
* Position
* Wedge size
* Relations to each other
in order for a computer to reconstruct a cuneiform character.

For a scholar, this provides a method to describe a cuneiform shape in a digital way and to share this machine-readable representation for example in linked open data dictionaries. The computer can figure out sign variants and partial signs based on the encoding alone, leading to a better understanding for scholars.


## Implementation
This repository hosts the JavaScript implementation of PaleoCodage,
a system to describe the shape of cuneiform characters.
The system is described in detail in the following short paper publication:
<a href="https://dh2019.adho.org/short-papers/">Paleo Codage - A machine-readable way to describe cuneiform characters paleographically</a>

At the Github Pages version, a user is able to define the shape of a cuneiform character using the PaleoCodage operators:

### Wedge Types:
<ul>
<li><b>a</b> <button id="vertical" onClick="showCharacter('a')">Vertical Stroke (a)</button><button id="D" onClick="showCharacter('A')">Big (A)</button>
<button id="sa" onClick="showCharacter('sa')">Small (sa)</button></li>
<li><b>b</b> <button id="horizontal" onClick="showCharacter('b')">Horizontal Stroke (b)</button>
<button id="D" onClick="showCharacter('B')">Big (B)</button><button id="sb" onClick="showCharacter('sb')">Small (sb)</button></li>
<li><b>c</b> <button id="diagonal1" onClick="showCharacter('c')">Diagonal Stroke1 (c)</button>
<button id="C" onClick="showCharacter('C')">Big (C)</button><button id="sc" onClick="showCharacter('sc')">Small (sc)</button></li>
<li><b>d</b> <button id="diagonal2" onClick="showCharacter('d')">Diagonal Stroke2 (d)</button>
<button id="D" onClick="showCharacter('D')">Big (D)</button><button id="sd" onClick="showCharacter('sd')">Small (sd)</button></li>
<li><b>e</b> <button id="diagonal3" onClick="showCharacter('e')">Diagonal Stroke3 (e)</button>
<button id="E" onClick="showCharacter('E')">Big (E)</button><button id="se" onClick="showCharacter('se')">Small (se)</button></li>
<li><b>f</b> <button id="diagonal4" onClick="showCharacter('f')">Diagonal Stroke4 (f)</button>
<button id="F" onClick="showCharacter('F')">Big (F)</button><button id="sf" onClick="showCharacter('sf')">Small (sf)</button></li>
<li><b>w</b> <button id="wedge" onClick="showCharacter('w')">Winkelhaken (w)</button><button id="F" onClick="showCharacter('W')">Big (W)</button></li><li><b>-</b> right of the current stroke passing through other strokes</li>
<li><b>_</b> right of the current stroke NOT passing through other strokes</li>
<li><b>:</b> under the current stroke passing through other strokes</li>
<li><b>;</b> under the current stroke NOT passing through other strokes</li>
<li><b>/</b> half the distance of <b>:</b> under the current stroke passing through other strokes </li>
<li><b>.</b> diagonal right under the current stroke</li>
<li><b>,</b> diagonal left above the current stroke</li>
<li><b>s</b> smaller version of the stroke (e.g. sb, sc)</li>
<li><b>!</b> mirrored version of the stroke (e.g. !a, !A, !sa)</li>
<li><b>Whitespace</b> Enough distance to start a new character</li>
</ul>

### Results
PaleoCodage encodings can produce a variety of results as can be shown below.

#### Image Representations
The results of the description can be saved as a PNG image or as SVG and can therefore be used to share cuneiform character representations without much effort.

#### OpenType Font
In addition, an export as an OpenType font is possible. This is useful for various reasons
* The font can be used in any program to represent cuneiform characters
* The font can encode cuneiform characters which have not yet been added to Unicode
* The font can encode ligatures which can be used to describe cuneiform sign variants

##### Ligature Example
In the <a href="https://en.wikipedia.org/wiki/Cuneiform_(Unicode)">Unicode Definition</a> of cuneiform characters, signs included in Borgers sign list have been collected and encoded. However, this definition is a semantic one, as the meaning of one sign e.g. E has been taken to describe the respective character.
In fact the sign E might be represented in a multitude of sign variants throughout time or even within the same period of time.
Using PaleoCodage, a unique description for each cuneiform sign can be created and subsequently assigned an ID.
For example we could define:
* E
* E_v1
* E_v2
each representing E, but with a different PaleoCodage description i.e. shape.
Next, the defined IDs can be added to the OpenType font as ligatures.
A ligature, when type, would let the font replace e.g. E_v1 with the respective sign variant encoded in the private unicode section of the font or in any other non-alphabetic part of the font.
An example of such ligature substitutions is given by https://symbolset.com which replaces text with emoji.
The concept is the same, only here we would replace modified transliterations with cuneiform characters.
http://pomax.github.io/CFF-glyphlet-fonts/ provides some more insights into ligatures.
