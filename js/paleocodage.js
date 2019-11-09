var simplification={">(180)a":"!a","<(180)a":"!a",">(180)b":"!b","<(180)b":"!b",">(45)a":"f",">(90)a":"!b","s:":":s",":!":"!:","//":":","::::":";"}
var operatorToLocalRot={"a":0,"A":0,"b":90,"B":90,"c":45,"C":45,"d":135,"D":135,"e":225,"E":225,"f":315,"F":315,"w":270,"W":270,"x":0,"X":0,"y":-90,"Y":-90}
var operatorToPositioning={"a":[0,0],"A":[0,0],"b":[0.3,-0.35],"B":[0.4,-0.4],"c":[0.2,-0.65],"C":[0.2,-0.5],"d":[0.2,-0.05],"D":[0.2,-0.3],"e":[0.8,-0.05],"E":[0.4,-0.3],"f":[0.8,-0.65],"F":[0.4,-0.5],"w":[-0.6,-0.4],"W":[-0.55,-0.38],"x":[0.5,0.5],"X":[0.5,0.5],"y":[0.5,0.5],"Y":[0.5,0.5]}
var operatorToScaling={"a":1,"A":1,"b":1,"B":1,"c":1,"C":1,"d":1,"D":1,"e":1,"E":1,"f":1,"F":1,"w":2,"W":2,"x":0,"X":0,"y":0,"Y":0}
var curposx=30;
var curposy=30;
var curposxot=30;
var curposyot=30;
var currenthead=[{"type":"M","points":{"x":-5,"y":10}},{"type":"L","points":{"x":5,"y":10}},{"type":"L","points":{"x":0,"y":20}},{"type":"L","points":{"x":-5,"y":10}}]
var currentwinkelhaken=[{"type":"M","points":{"x":-5,"y":10}},{"type":"L","points":{"x":5,"y":10}},{"type":"L","points":{"x":0,"y":20}},{"type":"L","points":{"x":-5,"y":10}}]
var currentstroke=[{"type":"M","points":{"x":0,"y":0}},{"type":"L","points":{"x":0,"y":strokelength-wedgelength}}]
var startposy=0;
var startposx=0;
var curlybrace=false;
var charNameToPaleoCode={}
var paleoCodeToCharName={}
var heads=[]
var lines=[]
var strokelength=30;
var wedgelength=10;
var headdraw=[];
var multiplier=1.5;
var roundbracket=0
var bracket=false
var globalCenterPoint;
var rotationconstant=15
var opentypescale=15
var bracketpositions=[]
var factorbracketpositions=[]
var charnamebuffer=""
var factorbuffer=""
var smallermultiplier=0.5
var rotmultiplier=5;
var recursiverotation=false;
var rotpoints;
var rotpoints2;
var maxybbox=-1;
var maxyglobalbbox;
var maxxbbox=-1;
var maxxglobalbbox;
var minybbox=1000000;
var minyglobalbbox;
var minxbbox=1000000;
var minxglobalbbox;
var paleocodes=[]
var paleoCodeToOpenTypePath={}
var scalemultiplier=1
var scalemultiplierForStrokeLength=1
var smaller=false;
var lastoperator;
var strokeColor="#000000"
var fillColor="#000000"
var lineLength=strokelength-wedgelength
var mirror=false;
var halfangle=false;
var opentypestrokeWidth=5
var ot=false;
var scaleop=1;
var smallop=1;
var headresizing=false;
var headscaleop=1;
var headscaleop=1;
var horizontalspaceop=0;
var verticalspaceop=0;
var font;
var rot=0;
//var mirror=false;
var ctx2width=170
var ctx2height=80
var ctx3=new opentype.Path();
var ctx2 = new C2S(ctx2width,ctx2height);
var doNotDraw = false;
var wedgearray=[];

/**
 * Converts the content of the canvas into an PNG-type image
 */
function to_image(){
                var canvas = document.getElementById("myCanvas");
                document.getElementById("canvasImg").src = canvas.toDataURL();
                Canvas2Image.saveAsPNG(canvas);
                document.getElementById("canvasImg").style.visibility = 'hidden';
}

/**
 * Creates a OT glyph
 * @param {string} charname - The glyph name
 * @param {string} unicode - Unicode codepoint
 * @param {string} path - OT path
 * @returns {opentype.Glyph} OT glyph JSON object
 */
function createOpenTypeGlyph(charname,unicode,path){
	console.log(unicode)
	path.stroke=strokeColor
	path.fill=fillColor
	if(charname.includes("_v")){
	    return new opentype.Glyph({
        name: charname,
        advanceWidth: 650,
        path: path
    });
	}else{
	    return new opentype.Glyph({
        name: charname,
        unicode: unicode.replace("U+","0x"),
        advanceWidth: 650,
        path: path
    });
	}

}

/**
 * Loads the SVG path out of a given SVG file and loads the coordinates into the currentwinkelhaken array.
 * @async
 * @param {String} svgname - The filename of the Winkelhaken SVG-file.
 */
function loadWinkelhakenSVG(svgname){
	console.log("Loading svg: "+"svg/winkelhaken/"+svgname+".svg");
	$.ajax({
            url: "svg/winkelhaken/"+svgname+".svg",
            async: false,
			dataType: "xml",
            success: function (data){
                console.log("load svg")
				console.log(data)				
				currentwinkelhaken=getCoordinatesFromSVGPath($($(data).find("path")[0]).attr("d"))
				console.log(currentwinkelhaken)
            }
        });
}

/**
 * Loads the SVG path out of a given SVG file and loads the coordinates into the currenthead array.
 * @async
 * @param {String} svgname - The filename of the head SVG-file.
 */
function loadHeadSVG(svgname){
	console.log("Loading svg: "+"svg/head/"+svgname+".svg");
	$.ajax({
            url: "svg/head/"+svgname+".svg",
            async: false,
			dataType: "xml",
            success: function (data){
                console.log("load svg")			
				console.log(data)
				console.log($(data).find("path")[0])
				currenthead=getCoordinatesFromSVGPath($($(data).find("path")[0]).attr("d"))
				console.log(currenthead)
            }
        });
}


/**
 * Changes the "x" & "y" coordinates of a Point Object according to rotating it around a given center.
 * @param {{"x":number, "y":number}} center - The centerpoint that the line shall be rotated around.
 * @param {{"x":number, "y":number}} edge - The coordinate that shall get rotated.
 * @param {number} angle - Tha angle in grades defining how much shall the line be rotated.
 * @returns {{"x":number, "y":number}} RotatedPoint
 */

function rotateLineClockWise(center, edge, angle) {
    xRot = center["x"] + Math.cos(toRadians(angle)) * (edge["x"] - center["x"]) - Math.sin(toRadians(angle)) * (edge["y"] - center["y"]);
    yRot = center["y"] + Math.sin(toRadians(angle)) * (edge["x"] - center["x"]) + Math.cos(toRadians(angle)) * (edge["y"] - center["y"]);
    return {"x":xRot,"y":yRot}
}

/**
 * Changes the "x" & "y" coordinates of all Point-Objects within a Point-Object-Array according to rotating it around a given center.
 * @param {Array.<Points>} points - The pointarray to be rotated.
 * @param {{"x":number, "y":number}} angle - Tha angle in grades defining how much shall the line be rotated.
 * @param {{"x":number, "y":number}} center - The centerpoint that the line shall be rotated around.
 * @returns {Array.<Points>} RotatedPointArray
 */
function rotateHead(points,angle,center){
	var result=[]
	if(!center){
		center=getCenterHead(points)
	}
	for(point in points){
		//result.push(rotateLineClockWise(center, points[point], angle))
		arr=geometric.pointRotate([points[point]["x"],points[point]["y"]], angle, [center["x"],center["y"]])
		result.push({"x":arr[0],"y":arr[1]})
	}
	return result;
}

/**
 * Changes the "x" & "y" coordinates of all Point-Objects within a Point-Object-Array according to rotating it around a given center.
 * @param {Array.<Points>} points - The pointarray to be rotated.
 * @param {{"x":number, "y":number}} angle - Tha angle in grades defining how much shall the line be rotated.
 * @param {{"x":number, "y":number}} center - The centerpoint that the line shall be rotated around.
 * @returns {Array.<Points>} result - RotatedPointArray
 */
function rotateWedge(points,angle,center){
	var result=[]
	var lastcalc=0;
	//console.log(points)
	var nonewcenter=false;
	if(center){
		nonewcenter=true;
	}
	for(i=1;i<points.length;i++){
		begin=points[i-1]
		end=points[i]
		if(!nonewcenter){
			center=getCenter(begin,end)
		}
		if(i==1){
			result.push(rotateLineClockWise(center,begin,angle))
		}
		result.push(rotateLineClockWise(center,end,angle))
	}
	return result;
}

function rotateWedgeSVG(points,angle,center){
	var svgresult=[]
	console.log(points)
	var nonewcenter=false;
	if(center){
		nonewcenter=true;
	}
	for(i=0;i<points.length;i++){
		begin=points[i-1]
		end=points[i]
		if(!nonewcenter){
			center=getCenter(begin["points"],end["points"])
		}
		svgresult.push({"type":end["type"],"points":rotateLineClockWise(center,end["points"],angle)})
	}
	return svgresult;
}


function getCenterOfWedge(points){
	var minx=1000000,minxpoint,maxx=-10000,maxxpoint, miny=999999,minypoint, maxy=-999999,maxypoint;
	for(point in points){
		if(points[point]["x"]<minx){
			minx=points[point]["x"]
		}
		if(points[point]["x"]>maxx){
			maxx=points[point]["x"]
		}
		if(points[point]["y"]<miny){
			miny=points[point]["y"]
		}
		if(points[point]["y"]>maxy){
			maxy=points[point]["y"]
		}
	}
	//console.log("getCenterOfWedge " + " minx " + minx + " miny " + miny + " maxx " + maxx + " maxy " + maxy);
	return getCenter({"x":minx,"y":miny},{"x":maxx, "y":maxy})

}

/**
 * Calculates intersections between cuneiform heads and lines and writes them on the canvas using the fill color
 *  @param {canvas} canvas - The canvas to draw on
 */
function getIntersections(canvas){	
	for(head in heads){
		for(line in lines){
			var intersection=turf.lineIntersect(heads[head], lines[line]);
			canvas.moveTo(intersection[0][0],intersection[0][1]);
			canvas.lineTo(intersection[1][0],intersection[1][1]);
			canvas.strokeColor=fillColor;
			canvas.stroke();
		}
	}
}

/**
 * Converts degree to radian 
 * @param {degrees} degrees - The value of degrees to convert into radians.
 */
function toRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

/**
 * Calculates the center between two given points.
 * @param {{"x":number, "y":number}} origin - The first point.
 * @param {{"x":number, "y":number}} endPoint - The second point.
 * @returns {{"x":number, "y":number}} CenterPoint - The coordinates of the center.
 */
function getCenter(origin,endPoint) {
    return {"x":(origin["x"] + endPoint["x"]) / 2, "y":(origin["y"] + endPoint["y"]) / 2};
}

/**
 * Changes the color of all  drawn SVG objects within the canvas and the OT font list.
 * @param {string} color - a html color code
 * @param {string} input - the current paleocode
 */
function changeColors(colors,input){
	//changeStrokeColor(colors.split(";")[0],input);
	//changeFillColor(colors.split(";")[1],input);
	document.getElementById("strokeColor").value=colors.split(";")[0]
	document.getElementById("fillColor").value=colors.split(";")[1]
	var paths = document.querySelectorAll("path");
	for (i = 0; i < paths.length; ++i) {
		paths[i].setAttribute('fill', colors.split(";")[1]);
		paths[i].setAttribute('stroke', colors.split(";")[1]);
	}
}

/**
 * Changes the stroke color of all canvas and redraws all SVGs
 * @param {string} color - a html color code
 * @param {string} input - the current paleocode
 * */
function changeStrokeColor(color,input){
	strokeColor=color; 
	console.log(color)
	strokeParser(input,false,false)
	var paths = document.querySelectorAll("path");
	for (i = 0; i < paths.length; ++i) {
		paths[i].setAttribute('stroke', strokeColor);
	}
}

/**
 * Changes the fill color of all canvas and redraws all SVGs
 * @param {string} color - a html color code
 * @param {string} input - the current paleocode
 * */
function changeFillColor(color,input){
	fillColor=color; 
	console.log(color)
	strokeParser(input,false,false)
	var paths = document.querySelectorAll("path");
	for (i = 0; i < paths.length; ++i) {
		paths[i].setAttribute('fill', fillColor);
	}
}

function convertToSubstitution(str,n,alphabetToFontCode){
	var ret=[]
	for(var i = 0, len = str.length; i < len; i += n) {
		ret.push(alphabetToFontCode[str.substr(i, n)])
	}
	return ret;
  }

function buildSubstitution() {
    var substitutions={}
    console.log("Charnamelist: "+charnamelist)
    for (var i = 0; i < charnamelist.length; i++) {
        substitutions[convertToSubstitutionString(charnamelist[i].replace(" ","").toLowerCase(),1)]=charnamelist[i].replace(" ","").toLowerCase()
    }
    console.log(substitutions)
    return substitutions;
  }
  
	var paleocodelist=[]
	var charnamelist=[]
	 var alphabetToFontCode={}
/**
 * Builds SVG images and the OT font
 * @param {string} list - ID of the character list.
 */
function createOpenFont(list){
    var svglist=[]
	var codepointlist=[]
	var counterr=0
	$('#glyphs').html("")
	$('#'+list).find('.codebutton').each(function(i, obj) {
        paleocodelist.push($(this).text())
		console.log(paleoCodeToOpenTypePath)
		ctx3=new opentype.Path();
        ctx3.stroke=strokeColor
		ctx3.fill=fillColor
        ctx3.strokeWidth=2
		strokeParser($(this).text(),true,false)
		var svghtml=ctx2.getSerializedSvg(true)
		var elem=$('.svgcontainer').eq(counterr)
		var gottstein=$('.gottstein').eq(counterr)
		gottstein.html(paleoCodeToGottstein($(this).text()))
        elem.html(svghtml)
		svghtml=svghtml.substring(svghtml.indexOf('d="')+3,svghtml.indexOf('"',svghtml.indexOf('d="')+3))
		svghtml=svghtml.replace(/\.5/g,'')
		console.log(svghtml)
		svglist.push(ctx3)
		counterr++;

	});
	$('#'+list).find('.codepoint').each(function(i, obj) {
		codepointlist.push($(this).text())
	});
	$('#'+list).find('.transliteration').each(function(i, obj) {
		charnamelist.push($(this).text()+"_cunei")
	});
    for(code in paleocodelist){
        charNameToPaleoCode[charnamelist[code]]=paleocodelist[code]
		paleoCodeToCharName[paleocodelist[code]]=charnamelist[code]
    }
	console.log(svglist)
	console.log(codepointlist)
	console.log(charnamelist)
	var glyphs=[]
	var coun=0
	      glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x21",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x23",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	  	glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x24",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	      glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x28",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
      glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x29",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	  	glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x2c",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x2d",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	  	glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x2e",""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
	var first=0x30, last= 0x3A;
    for (var i=first; i<last; i++) {
      glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x"+i.toString(16),""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
    }
	var first = 0x3F, last = 0x5E;
    for (var i=first; i<last; i++) {
		console.log(String.fromCharCode(i))
      glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x"+i.toString(16),""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
    }
    var first=0x61, last= 0x7E;
    for (var i=first; i<last; i++) {
      glyphs.push(createOpenTypeGlyph(String.fromCharCode(i),"0x"+i.toString(16),""));
      alphabetToFontCode[String.fromCharCode(i)]=coun++
    }
	for(svg in svglist){
	    if(svg<charnamelist.length && svg<=codepointlist.length && svg<svglist.length){
			gly=createOpenTypeGlyph(charnamelist[svg],codepointlist[svg],svglist[svg])
			gly.path.fill=fillColor;
			gly.path.stroke=strokeColor;
            glyphs.push(gly)
            alphabetToFontCode[charnamelist[svg]]=coun++
			//console.log(gly)
            //opentype.gsub.add(charnamelist[svg])
        }
	}
    //glyphs.push(createOpenTypeGlyph([0],codepointlist[0],svglist[0]))
	//console.log(glyphs)
    font = new opentype.Font({familyName: 'OpenTypeSans', styleName: 'Medium', unitsPerEm: 1000, ascender: 800, descender: -200, glyphs: glyphs});
    console.log(font.toTables());
    var newsignlist={}
    for(sign in signlist){
        if(!(signlist[sign] in signlist)){
            newsignlist[signlist[sign]]=[]
        }
        newsignlist[signlist[sign]].push(sign)
    }
    console.log(newsignlist)
    for(svg in charnamelist){
        var sub=convertToSubstitution(charnamelist[svg].replace("_cunei","").replace(/ /g, ""),1,alphabetToFontCode)
        var sub2=convertToSubstitution(charnamelist[svg].toLowerCase().replace("_cunei","").replace(/ /g, ""),1,alphabetToFontCode)
        console.log(Array.from(charnamelist[svg]))
		console.log({ "sub": [""].concat(Array.from(charnamelist[svg])), "by": charnamelist[svg] })
		console.log(svg)
		console.log(font.substitution)
		var arrayres=charnamelist[svg].replace("_cunei","")
		for(elem in arrayres){
			arrayres[elem]=arrayres[elem]+"_cunei"
		}
        if(charnamelist[svg].includes("_v")){
        		//font.substitution.addLigature("salt",{ "sub": sub, "by": alphabetToFontCode[charnamelist[svg]] })
                //font.substitution.addLigature("salt",{ "sub": sub2, "by": alphabetToFontCode[charnamelist[svg]] })
        }
        font.substitution.addLigature("liga",{ "sub": sub, "by": alphabetToFontCode[charnamelist[svg]] })
		font.substitution.addLigature("liga",{ "sub": sub2, "by": alphabetToFontCode[charnamelist[svg]] })
        console.log(codepointlist[svg])
        if(svg in codepointlist && codepointlist[svg].includes("&")){
            var splitted=codepointlist[svg].split("&")
            for(spl in splitted){
                var unicodechar=String.fromCodePoint(splitted[spl].trim().replace("U+","0x"))
                if(unicodechar in newsignlist){
                    font.substitution.addLigature("liga",{ "sub": convertToSubstitution(newsignlist[unicodechar][0],1,alphabetToFontCode), "by": alphabetToFontCode[charnamelist[svg]] })   
                    console.log(newsignlist[unicodechar])
                }      
            }
        }else if(svg in codepointlist && !(isNaN(codepointlist[svg]))){
            var unicodechar=String.fromCodePoint(codepointlist[svg].replace("U+","0x"))
            if(unicodechar in newsignlist){
                font.substitution.addLigature("liga",{ "sub": convertToSubstitution(newsignlist[unicodechar][0],1,alphabetToFontCode), "by": alphabetToFontCode[charnamelist[svg]] })                
                console.log(newsignlist[unicodechar])
        }           
           
        }

        //font.substitution.addLigature({ "sub": sub, "by": charnamelist[svg] })
    }
    console.log(font.substitution)
    var buffer = font.toArrayBuffer();
    var font2 = opentype.parse(buffer);

    document.getElementById('fontFamilyName').innerHTML = font2.names.fontFamily.en;
     for (var i = 0; i < font2.glyphs.length; i++) {
                if(i>77){ 
        var glyph = font2.glyphs.get(i);
        var ctxx = createGlyphCanvas(glyph, 150);
        var x = 50;
        var y = 120;
        var fontSize = 72;
		//console.log(strokeColor+" - "+fillColor)
		//console.log(ctxx)
        glyph.draw(ctxx, x, y, fontSize);
        glyph.drawPoints(ctxx, x, y, fontSize);
        glyph.drawMetrics(ctxx, x, y, fontSize);
                }
    }
        //document.getElementById('jsonFont').innerHTML=stringify(font)
    clearCanvas();
	substringgraph();
	loadHeadSVG("defaulthead");
}

    function createGlyphCanvas(glyph, size) {
        var canvasId, html, glyphsDiv, wrap, canvas, ctxxx;
        canvasId = 'c' + glyph.index;
        html = '<div class="wrapper" style="width:' + size + 'px"><canvas id="' + canvasId + '" width="' + size + '" height="' + size + '"></canvas><span>'+glyph.name+"[" + glyph.index+"]" + '</span></div>';
        glyphsDiv = document.getElementById('glyphs');
        wrap = document.createElement('div');
        wrap.innerHTML = html;
        glyphsDiv.appendChild(wrap);
        canvas = document.getElementById(canvasId);
        ctxxx = canvas.getContext('2d');
		ctxxx.strokeStyle=strokeColor;
		ctxxx.fillStyle=fillColor;
        return ctxxx;
    }

/**
 * Creates an SVG file out of the current canvas input.
 */
function to_svg(){
	svg=ctx2.getSerializedSvg(true)
	saveTextAsFile(svg,".svg","graphic")
	paleoCodageToSVG($('#canvasinput').val());
}

/**
 * Creates the TTL representation.
 */
function createTTL(){
	ttlstring="@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n@prefix lemon: <http://lemon-model.net/lemon#> .\n@prefix paleo: <http://www.github.com/situx/PaleoCodage#> .\n@prefix iso: <http://www.isocat.org/datcat/> .\n\n";
	baseuri="http://www.github.com/situx/PaleoCodage#"
	baseuriprefix="paleo:"
	svglist=[]
	codepointlist=[]
	charnamelist=[]
	borgerlist=[]
	gottsteinlist=[]
	var codes=[]
	$('.codebutton').each(function(i, obj) {
		codes.push($(this).text());
	});
	$('.codepoint').each(function(i, obj) {
		codepointlist.push($(this).text())
	});
	$('.svgcontainer').each(function(i, obj) {
		svglist.push($(this).prop('outerHTML').replace(/\"/g,"'"))
	});
	$('.borger').each(function(i, obj) {
		borgerlist.push($(this).text())
	});
	$('.gottstein').each(function(i, obj) {
		gottsteinlist.push($(this).text())
	});
	ttlstring+="lemon:Character rdf:type owl:Class . \n"
	ttlstring+="paleo:Code rdf:type owl:Class . \n"
	ttlstring+="paleo:hasPaleoCode rdf:type owl:ObjectProperty . \n"
	ttlstring+="paleo:asSVG rdf:type owl:DatatypeProperty . \n"
	ttlstring+="paleo:codeValue rdf:type owl:DatatypeProperty . \n"
	ttlstring+="paleo:gottsteinCode rdf:type owl:DatatypeProperty . \n"
	ttlstring+="iso:transliteration rdf:type owl:DatatypeProperty . \n"
	ttlstring+="paleo:borgerNumber rdf:type owl:DatatypeProperty . \n"
	ttlstring+="paleo:hasUnicodeCodePoint rdf:type owl:DatatypeProperty . \n"
	$('.transliteration').each(function(i, obj) {
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+" rdf:type "+"lemon:Character . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+"_code rdf:type "+"paleo:Code . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+" "+baseuriprefix+"hasPaleoCode "+baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+"_code . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+"_code "+baseuriprefix+"codeValue \""+codes[i].replace(/\"/g,"'")+"\"^^"+baseuriprefix+"paleoCodeLiteral . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+" "+baseuriprefix+"hasUnicodeCodePoint \""+codepointlist[i]+"\"^^xsd:string . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+" iso:transliteration \""+$(this).text().replace(/\"/g,"'")+"\"^^xsd:string . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+" paleo:borgerNumber \""+borgerlist[i]+"\"^^xsd:string . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+"_code "+baseuriprefix+"asSVG \""+svglist[i]+"\"^^xsd:string . \n"
		ttlstring+=baseuriprefix+encodeURIComponent($(this).text()).replace("(","").replace(")","")+"_code "+baseuriprefix+"gottsteinCode \""+gottsteinlist[i]+"\"^^xsd:string . \n"
		charnamelist.push($(this).text())
	});
	console.log(ttlstring)
	console.log(codepointlist)
	console.log(charnamelist)
	saveTextAsFile(ttlstring,".ttl","paleocodes")
}

/**
 * Counts the ammount of characters of a given type within a string.
 * @param {string} checkstr - String input.
 * @param {string} c - Character to get counted.
 * @returns {number} result - Ammount of characters that have been searched.
 */
function countChars(checkstr,c) { 
  var result = 0, i = 0;
  for(i;i<checkstr.length;i++)if(checkstr[i]==c)result++;
  return result;
}

function paleoCodeToGottstein(paleocode){
	gottstein="";
	var acount=(countChars(paleocode,"a")+countChars(paleocode,"A"))
	var bcount=(countChars(paleocode,"b")+countChars(paleocode,"B"))
	var ccount=(countChars(paleocode,"c")+countChars(paleocode,"C")+countChars(paleocode,"d")+countChars(paleocode,"D")+countChars(paleocode,"w")+countChars(paleocode,"W"))
	var dcount=(countChars(paleocode,"e")+countChars(paleocode,"E")+countChars(paleocode,"f")+countChars(paleocode,"F"))
	console.log(acount+" "+bcount+" "+ccount+" "+dcount)
	if(acount>0)
		gottstein+="a"+acount
	if(bcount>0)
		gottstein+="b"+bcount
	if(ccount>0)
		gottstein+="c"+ccount
	if(dcount>0)
		gottstein+="d"+dcount
	return gottstein;
}

function createFont(){
	svglist=[]
	codepointlist=[]
	charnamelist=[]
	paleocodes=[]
	$('.codebutton').each(function(i, obj) {
		paleo=paleoCodageToSVG($(this).text());
		paleocodes.push($(this).text());
		console.log(convertOutline({"outline":paleo}))
		svglist.push(paleo)
	});
	$('.codepoint').each(function(i, obj) {
		codepointlist.push($(this).text())
	});
	$('.transliteration').each(function(i, obj) {
		charnamelist.push($(this).text())
	});
	console.log(svglist)
	console.log(codepointlist)
	console.log(charnamelist)
}

function saveTextAsFile(tosave,fileext,filename)
{
    var a = document.createElement('a');
    a.style = "display: none";  
    var blob= new Blob([tosave], {type:'text/plain'});
    var url = window.URL.createObjectURL(blob);
    var filename = filename+fileext;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 1000);
}


function scalePointArray(pointarray,scalemultiplier,start,starty){
	for(p in pointarray){
		pointarray[p]["x"]*=scalemultiplier
		pointarray[p]["y"]*=scalemultiplier
		pointarray[p]["x"]+=start
		pointarray[p]["y"]+=starty
	}
	return pointarray;
}

/**
 * Gets the index position of a head/winkelhaken point array fixpoint - the point with the highest "y" value.
 * @param {Array.<Points>} pointarray - The object array that the fixpoint shall be drawn from.
 * @returns {number} index - The number indicating the fixpoint's index position.
 */
function findFixpoint(pointarray) {
    var max = -99999999999
	var index = 0
	for (point in pointarray){
		if (pointarray[point]["y"]>max){
			max = pointarray[point]["y"];
			index = point;
		}
	}
	return parseInt(index);
}     

/**
 * Simplifies the imput according to the formulated paleocode unifying rules. The rules are listed within the documentation.
 * @param {string} input - The input string as it was entered by the user.
 * @returns {string} input - The simplified string.
 */
function simplifyInput(input){
	for(pat in simplification){
		if(input.includes(pat)){
			input=input.replace(pat,simplification[pat])
		}
	}
	/*for(code in paleoCodeToCharName){
		if(input.includes(code)){
			input=input.replace(pat,"["+paleoCodeToCharName[code]+"]")
		}
	}*/
	return input;
}
var similar={}
function substringgraph(){
console.log("substringgraph")
    for(js in paleocodelist){
            for(js2 in paleocodelist){
                if(paleocodelist[js2]!=paleocodelist[js] && paleocodelist[js2].includes(paleocodelist[js])){
                        //console.log("[ "+js+" ] is in [ "+js2+" ]");
						if(similar[paleocodelist[js]]==undefined){
							similar[paleocodelist[js]]=[]
						}
						similar[paleocodelist[js]][paleocodelist[js]]={"charname":charnamelist[js2].replace("_cunei",""),"code":paleocodelist[js2]}
                }else if(paleocodelist[js2]!=paleocodelist[js] && paleocodelist[js].includes(paleocodelist[js2])){
						if(similar[paleocodelist[js2]]==undefined){
							similar[paleocodelist[js2]]=[]
						}
						similar[paleocodelist[js2]][paleocodelist[js]]={"charname":charnamelist[js].replace("_cunei",""),"code":paleocodelist[js]}
				}
            }
    }
	console.log(similar);
}

function paleoCodageToOpenTypePath(paleoCode){
        //ot=true;
        ctx3=new opentype.Path();
        ctx3.stroke=strokeColor
		ctx3.fill=fillColor
        ctx3.strokeWidth=2
        strokeParser(paleoCode,true,false)
        //ot=false;
		console.log(paleoCode)
		console.log(ctx3)
        return ctx3;
}

function paleoCodageToSVG(paleoCode,index){
	//console.log(paleoCode)
	strokeParser(paleoCode,false,false)
	
    //console.log(ctx2.getSerializedSvg())
	//ctx2.scale(10,10);
	console.log("PaleoCode: "+paleoCode)
	svghtml=ctx2.getSerializedSvg(true);
	console.log(svghtml)
    if(!isNaN(index)){
        console.log(index+" - "+svghtml)
        //$('.svg :nth-child('+index+')' ).html(svghtml)
        //var parser = new DOMParser();
        //var dom = parser.parseFromString(svghtml, "text/xml");
        console.log("Index: "+index)
        var elem=$('.svgcontainer').eq(index)
		var gottstein=$('.gottstein').eq(index)
		gottstein.html(paleoCodeToGottstein(paleoCode))
       // var container=elem.createChild('div')
        //container.innerHTML=svghtml
        elem.html(svghtml)
		elem.children().find(">:first-child").attr("width",(maxxglobalbbox-minxglobalbbox));
		elem.children().find(">:first-child").attr("height",(maxyglobalbbox-minyglobalbbox));
        //$(dom).appendTo('.svg:nth-child('+index+')')
        //document.getElementById('svg').appendChild(dom.documentElement);
	}
	//console.log(svghtml)
	//console.log(svghtml.indexOf('d="')+" - "+svghtml.indexOf('"',svghtml.indexOf('d="')+3))
	svghtml=svghtml.substring(svghtml.indexOf('d="')+3,svghtml.indexOf('"',svghtml.indexOf('d="')+3))
	svghtml=svghtml.replace(/\.5/g,'')
	return svghtml
	//console.log(svghtml)
}
var recursiverotation=false;
//var canvasSVGContext = new CanvasSVG.Deferred();
//canvasSVGContext.wrapCanvas(document.getElementById("myCanvas"));
function strokeParser(input,svgonly,recursive,rotationcheck){
    var ctx = document.getElementById("myCanvas").getContext("2d");
    console.log("Input: "+input)
	$('#similar').html("")
	//console.log(JSON.stringify(currenthead))
	if(!recursive){
		heads=[]
		lines=[]
        clearCanvas(true);
        smaller=false;
        mirror=false;
        bracket=false;
		recursiverotation=false;
        halfangle=false;
		rot=0;
        bracketpositions=[]
        factorbracketpositions=[]
		factorbuffer=""
        scaleop=1;
        verticalspaceop=1;
        horizontalspaceop=1;
		maxxglobalbbox=0
		minxglobalbbox=1000000
		maxyglobalbbox=0
		minyglobalbbox=1000000
		curposy=10;
        curposx=30;
		curposyot=10;
        curposxot=30;
		startposx=30;
		startposy=10;
    }else{
		startposx=curposx;
		startposy=curposy;
		recursiverotation=rotationcheck;	
	}
    for (var i = 0; i < input.length; i++) {	
		var isuppercase=(input.charAt(i) == input.charAt(i).toUpperCase())
		var winkelhaken=(input.charAt(i)=="w" || input.charAt(i)=="W")
		//console.log(winkelhaken)
        switch(input.charAt(i)){
                case "a":
				case "A":
				case "b":
				case "B":
                case "c":
				case "C":
				case "d":
				case "D":
				case "e":
				case "E":
				case "f":
				case "F":
				case "w":
				case "W":
                    if(bracket==0){
                        horizontalspaceop=0;
                        verticalspaceop=0;
						scalemultiplier=1
						scalemultiplierForStrokeLength=1
						//console.log(curposx+" - "+curposy)
						console.log("Draw HTML")
                        if(!svgonly)
                            drawWedgeGeneric(curposx,curposy,ctx,true,isuppercase,curlybrace,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)],winkelhaken,false);
						if(!recursiverotation && !doNotDraw){
                            //console.log(curposx+" - "+curposy)
							console.log("Draw SVG")
							drawWedgeGeneric(curposx,curposy,ctx2,true,isuppercase,curlybrace,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)],winkelhaken,!svgonly);
							/* curposx+=(2*scalemultiplier)*(horizontalspaceop==0?1:horizontalspaceop);
						curposxot+=(2*opentypescale)*(horizontalspaceop==0?1:horizontalspaceop)
						curposy=startposy*scalemultiplier;
						curposyot=startposy*(scalemultiplier*opentypescale)
*/
							//if(svgonly){
								scalemultiplier=opentypescale
								scalemultiplierForStrokeLength=scalemultiplier
								//mirror=!mirror
							//}
							ot=true; //mirror=!mirror;
							console.log("Draw OT")
							drawWedgeGeneric(curposxot,curposyot,ctx3,true,isuppercase,recursive||curlybrace,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)],winkelhaken,false);
                            //if(svgonly){
                                scalemultiplier=1
								scalemultiplierForStrokeLength=scalemultiplier
                            //}
							ot=false;
                            if(!recursive){mirror=false;rot=0;}//else{mirror=!mirror;}
                        }
                    }
                    break;
				case "x":
				case "X":
					if(bracket==0){
						drawSeal(curposx,curposy,ctx,true,isuppercase,false,false,true,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
						drawSeal(curposx,curposy,ctx2,true,isuppercase,false,false,true,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
						//drawSeal(curposxot,curposyot,ctx3,true,isuppercase,false,false,true,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
					}
					break;
				case "y":
				case "Y":
					if(bracket==0){
						drawSeal(curposx,curposy,ctx,true,isuppercase,false,true,false,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
						drawSeal(curposx,curposy,ctx2,true,isuppercase,false,true,false,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
						//drawSeal(curposxot,curposyot,ctx3,true,isuppercase,false,true,false,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
					}
					break;
                case "s":
                    if(bracket==0){
                        smaller=true;
                    }
                        break;
                case "-":
                    if(bracket==0){
                        scaleop=1;
                        curposx+=(10*scalemultiplier)*(horizontalspaceop==0?1:horizontalspaceop);
						curposxot+=(10*opentypescale)*(horizontalspaceop==0?1:horizontalspaceop)
						curposy=startposy*scalemultiplier;
						curposyot=startposy*(scalemultiplier*opentypescale)
                    }
                        break;
                case "#":
                    if(bracket==0){
                        curposx+=5*scalemultiplier;
                        curposy=10*scalemultiplier;
						curposyot=(10*opentypescale)
						curposxot+=(5*opentypescale)
                    }
                        break;
                case ":": 
                        if(bracket==0){
                            scaleop=1;
                            curposy+=(7*scalemultiplier)*(verticalspaceop==0?1:verticalspaceop);
							curposyot+=(7*opentypescale)*(verticalspaceop==0?1:verticalspaceop);
                        }
                        break;
                case "!": //mirror character
                        if(bracket==0){
                            mirror=true;
                        }
                        break;
                case "'":
                    if(bracket==0){
                        scaleop=1;
                        curposy=10*scalemultiplier;
						curposyot=10*opentypescale
                    }
                        break;
				case "\"": 
                    if(bracket==0){
                        curposy=0*scalemultiplier;
                        curposyot=0*scalemultiplier;
                    }
                        break;
				case "~": 
                    if(bracket==0){
                        scaleop=1;
                        curposx-=10*scalemultiplier;
                        curposy=10*scalemultiplier;
                        curposyot=(10*opentypescale)
						curposxot+=(10*opentypescale)
                    }
                        break;
                case "/": 
                    if(bracket==0){
                        scaleop=1;
                        curposy+=3.5*scalemultiplier;
                        curposyot+=(3.5*opentypescale)
                    }
                    break;
                case "|":
                    if(bracket==0){
                        halfangle=true;
                    }
                        break;
                case ";":
                    if(bracket==0){
                        scaleop=1;
                        curposy+=strokelength;
                        curposyot+=(strokelength*opentypescale)
                    }
                        break;
                case ".": 
                    if(bracket==0){
                        scaleop=1;
                        curposy+=7*scalemultiplier;
                        curposx+=7*scalemultiplier;
                        curposyot+=(7*scalemultiplier*opentypescale)
						curposxot+=(7*scalemultiplier*opentypescale)
                    }
                        break;
				case "<":
                    if(bracket==0){
				        rot-=rotationconstant;
                    }
                        break;
				case ">": 
						if(bracket==0){
                            rot+=rotationconstant;
                        }
                        break;
/*                case "\": 
                    if(bracket==0){    
                        scaleop=1;
                        curposy-=3.5*scalemultiplier;
                    }
                        break; */
                case ",": 
                        if(bracket==0){    
                            curposy-=7*scalemultiplier;
                            curposx-=7*scalemultiplier;
							curposyot-=7*opentypescale;
                            curposxot-=7*opentypescale;
                        }
                        break;
                case "_": 
                    if(bracket==0){
                        scaleop=1;
                        curposx+=strokelength;
                        curposy=startposy*scalemultiplier;
						curposyot=startposy*opentypescale;
						curposxot+=strokelength*opentypescale;
                    }
                        break;
                case " ": 
                    if(bracket==0){
                        scaleop=1;
                        curposx+=1.5*strokelength*scalemultiplier;
						curposxot+=(1.5*strokelength*scalemultiplier*opentypescale)
						curposy=startposy*scalemultiplier;
						curposyot=startposy*(scalemultiplier*opentypescale)
                    }
                        break;
				case "h": 	
					if(bracket==0){
                        if (smallop>0){
							smallop-=0.2;
						}
						if (smallop<0){
							smallop=0;
						}
						headresizing=true;
                    }
					break;
				case "H": 
					if(bracket==0){
                        smallop+=0.2;
						headresizing=true;
                    }
					break;
				case "l": 
					if(bracket==0){
                        if (scaleop>0){
							scaleop-=0.2;
						}
						if (scaleop<0){
							scaleop=0;
						}
                    }
					break;
				case "L":
					if(bracket==0){
                        scaleop+=0.25
                    }
					break;

                case "{":
                    curlybrace=true;
                break;
                case "}":
                    curlybrace=false;
                break;
                case "(":
					lastoperator=input.charAt(i-1)
					factorbracketpositions.push({start:i,end:-1})
                    roundbracket=true;
                    break;
                case ")":
					console.log(lastoperator)
					console.log(rot)
					var value=parseInt(factorbuffer);
					console.log(value)
					rot=0
					switch(lastoperator){
						case ">":
							rot+=value
							break;
						case "<":
							rot-=value
							break;
                        case "*":
                            scaleop=1;
                            scaleop+=value/100;
                            break;
                        case ":":
                            verticalspaceop=0;
                            verticalspaceop+=value;
                            console.log(verticalspaceop)
                            console.log((7*scalemultiplier)*verticalspaceop)
                            curposy+=(7*scalemultiplier)*verticalspaceop;
                            curposyot+=(7*scalemultiplier)*verticalspaceop*opentypescale
                            break;
                        case "-":
                            horizontalspaceop=0;
                            horizontalspaceop+=value;
                            console.log(horizontalspaceop)
                            console.log((10*scalemultiplier)*horizontalspaceop)
                            curposx+=(10*scalemultiplier)*horizontalspaceop;
                            curposy=startposy*scalemultiplier;
                            curposxot+=(10*scalemultiplier)*horizontalspaceop*opentypescale;
                            curposyot=startposy*opentypescale;
                            break;                        
                    }
					console.log(rot)
					factorbracketpositions[factorbracketpositions.length-1]["end"]=i+1;
                    roundbracket=false;
					factorbuffer=""
                    break;
/*                case "*":
                    if(bracket==0){
                        scaleop+=0.25
                    }
                        break; */
		case "0":
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			factorbuffer+=input.charAt(i)
			break;
                case "[":
                    charnamebuffer=""
                    bracket=true;
                    bracketpositions.push({start:i,end:-1})
                    break;
                 case "]":
				 	charnamebuffer+="_cunei";
					bracket=false;
                    if(charnamebuffer in charNameToPaleoCode){
						if(rot!=0){
                            	//curposy=startposy;
								//curposx=startposx;
							maxxbbox=0
							minxbbox=1000000
							maxybbox=0
							minybbox=1000000
							globalCenterPoint=false
							doNotDraw=true;
							wedgearray=[];
							strokeParser(charNameToPaleoCode[charnamebuffer],svgonly,true,false) // Stroke parser muss merken
							doNotDraw=false;
							globalCenterPoint=getCenter({"x":minxbbox, "y":minybbox}, {"x":maxxbbox, "y":maxybbox});
							console.log(globalCenterPoint)
                            console.log(minxbbox+" "+minybbox+" "+maxxbbox+" "+maxybbox)
								/* DRAW CENTER POINT
								ctx.moveTo(globalCenterPoint["x"],globalCenterPoint["y"])
								ctx.lineTo(globalCenterPoint["x"]+5,globalCenterPoint["y"]+5)
								ctx.stroke(); */
							var rotwedgeresult=rotateWedgeSVG(wedgearray, rot, globalCenterPoint);
							console.log("rotwegderesult Array");
							console.log(rotwedgeresult);
							drawHead(rotwedgeresult, ctx);
							ctx.fillStyle = fillColor;
							ctx.fill();
							ctx.strokeStyle=strokeColor
							ctx.stroke();
							//drawHead(rotwedgeresult, ctx2);
						}else{
							strokeParser(charNameToPaleoCode[charnamebuffer],svgonly,true)
						}
					}

                    bracketpositions[bracketpositions.length-1]["end"]=i+1;
					smaller=false;
					mirror=false;
                    rot=0;
					halfangle=false;
					startposx=10;
					startposy=10;
					curposy=10;
					curposyot=10;
                    break;
                default: 
        }
        if(bracket>0 && input.charAt(i)!="["){
            charnamebuffer+=input.charAt(i)
        }
    }
	if(input=="" || !(input in similar)){
		var output="Similar[0]: "		
		$('#similarspan').html(trimstr(output,100))
	}else if(input in similar){
			var output="Similar["+Object.keys(similar[input]).length+"]: "
			for(simchar in similar[input]){
				output+="<a href=#"+similar[input][simchar]["charname"]+">"+similar[input][simchar]["charname"]+"</a>,"
			}
			$('#similarspan').html(trimstr(output,500))
	}
	paleoCodeToOpenTypePath[input]=ctx3;
}

function trimstr(coords,length){
	return coords.length > length ? coords.replace("undefined,","").substring(0, length - 3) + "(...))" : coords;	
}

function drawHead(points,canvas,savehead){
	for(drawit in points){
		maxyglobalbbox=Math.max(points[drawit]["points"]["y"],maxyglobalbbox)
		maxxglobalbbox=Math.max(points[drawit]["points"]["x"],maxxglobalbbox)
		minxglobalbbox=Math.min(points[drawit]["points"]["x"],minxglobalbbox)
		minyglobalbbox=Math.min(points[drawit]["points"]["y"],minyglobalbbox)
		if(points[drawit]["type"]=="M"){
			canvas.moveTo(points[drawit]["points"]["x"], points[drawit]["points"]["y"]);
		}else{
			canvas.lineTo(points[drawit]["points"]["x"], points[drawit]["points"]["y"]);
		}
	}	
	if(savehead){
		heads.push(points)
	}
}

function getCoordinatesFromSVGPath(svgpath){
	var svgpathresult=[]
	points=svgpath.split(" ")
	var newresult=null
	for(point in points){
		points[point]=points[point].trim();
		if(points[point].startsWith("Z")){
			continue;
		}
		if(points[point].startsWith("M") || points[point].startsWith("L")){
			if(newresult!=null){
				svgpathresult.push(newresult)
			}
			newresult={type:points[point].substring(0,1),points:{"x":points[point].substring(1)}}
		}else{
			newresult["points"]["y"]=points[point]
		}
		console.log(points[point])
		console.log(points[point].split(" "))
	}
	svgpathresult.push(newresult)
	console.log(svgpathresult)
	return svgpathresult;
}

function drawWedgeGeneric(start,starty,canvas,strokeparse,big,keepconfig,localrot,localmov,localscale,winkelhaken,uselastresult){
        if(strokeparse==false)
            curposx+=10
		pointarray=[]
		referencearray=[]
		if(rot!=0 && !doNotDraw){
			localrot=parseInt(localrot)+parseInt(rot);
		}
		if(mirror || ot){
			localrot+=180
			localrot=parseInt(localrot)%360
			start+=lineLength+wedgelength
		}
		if(!uselastresult || ot){
			if(big){
                if(ot){
                    length=multiplier*(opentypescale*strokelength*localscale);
                }else{
				length=multiplier*scalemultiplierForStrokeLength*strokelength*localscale;                    
                }
				if(localmov){
					start+=localmov[0]*length
					starty+=localmov[1]*length
				}
			}else if(smaller){
                if(ot){
                    length=0.5*(opentypescale*strokelength*localscale);
                }else{
                    length=0.5*scalemultiplierForStrokeLength*strokelength*localscale;                    
                }

				if(localmov){
					start+=localmov[0]*length
					starty+=localmov[1]*length
				}
			}else{
                if(ot){
               		length=opentypescale*(strokelength*localscale);
                }else{
					length=scalemultiplierForStrokeLength*strokelength*localscale;                    
                }

				if(localmov){
					start+=localmov[0]*length
					starty+=localmov[1]*length
				}
			}
				pointarray=[]
				referencearray=[]
				var fixpointindex = 0
				//console.log("currenthead:");
				//console.log(currenthead);
				if(winkelhaken){
					for(point in currentwinkelhaken){
						pointarray.push({"x":currentwinkelhaken[point]["points"]["x"],"y":currentwinkelhaken[point]["points"]["y"]})
						referencearray.push({"x":currentwinkelhaken[point]["points"]["x"],"y":currentwinkelhaken[point]["points"]["y"]})
                        console.log("pointarray for loop insertung currWH points into pointarray: ");
						console.log(pointarray)
					}
				}else{
					for(point in currenthead){
						pointarray.push({"x":currenthead[point]["points"]["x"],"y":currenthead[point]["points"]["y"]})
						referencearray.push({"x":currenthead[point]["points"]["x"],"y":currenthead[point]["points"]["y"]})
						console.log("pointarray for loop inserting currheadpoints into pointarray: ");
						console.log(pointarray);
					}
				}
				fixpointindex = findFixpoint(pointarray)
				//console.log("fixpointindex: " + fixpointindex);
				//console.log("pointarray after loading headpoints:");
				//console.log(pointarray);
				referencearray=scalePointArray(referencearray,scalemultiplier,start,starty)
				pointarray=scalePointArray(pointarray,scalemultiplier,start,starty)
				if (headresizing){
					//console.log("pointarray after general scaling:");
					//console.log(pointarray);
					for (point in pointarray) {
						pointarray[point]["x"]*=smallop
						pointarray[point]["y"]*=smallop
					}
					//console.log("pointarray after Headresizing:");
					//console.log(pointarray);
						
					if(winkelhaken){
						offset = ({"x":pointarray[fixpointindex]["x"]-referencearray[fixpointindex]["x"],"y":pointarray[fixpointindex]["y"]-referencearray[fixpointindex]["y"]})
					}else{
						offset = ({"x":pointarray[fixpointindex]["x"]-referencearray[fixpointindex]["x"],"y":pointarray[fixpointindex]["y"]-referencearray[fixpointindex]["y"]})
					}
					//console.log("calculated offset:");
					//console.log(offset);
					
					for (point in pointarray) {
						pointarray[point]["x"]-=offset["x"]
						pointarray[point]["y"]-=offset["y"]
					}
					//console.log("pointarray after run with offset:");
					//console.log(pointarray);
				}
				headresizing=false;
				
				//referencearray=scalePointArray(referencearray,scalemultiplier,start,starty)
				referencearray.push({"x":start, "y":starty+lineLength*scalemultiplier})
				referencearray.push({"x":start, "y":starty+lineLength*scalemultiplier+length})
				var centerreferencewedge=getCenterOfWedge(referencearray)
				//pointarray=scalePointArray(pointarray,scalemultiplier,start,starty)
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier})
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier+length*scaleop})
				var centerwholewedge=centerreferencewedge
				referencearray.length=0;
								
				if(ot){
					rotpoints=rotateHead(pointarray,localrot,centerwholewedge)
				}else{
					rotpoints=rotateHead(pointarray,localrot*-1,centerwholewedge)
				}
				
				headdraw=[]
				if(winkelhaken){
					for(rott in rotpoints){
						if(rott<currentwinkelhaken.length){
							//rotpoints[rott]["x"]*=smallop
							//rotpoints[rott]["y"]*=smallop
							headdraw.push({"type":currentwinkelhaken[rott]["type"],"points":rotpoints[rott]})
						}
					}
				}else{
					for(rott in rotpoints){
						if(rott<currenthead.length){
							//rotpoints[rott]["x"]*=smallop
							//rotpoints[rott]["y"]*=smallop
							headdraw.push({"type":currenthead[rott]["type"],"points":rotpoints[rott]})
						}
					}
				}
		}
		//console.log(headdraw)
		if (!doNotDraw){
			drawHead(headdraw,canvas,uselastresult||ot)
		}else {
			wedgearray=wedgearray.concat(headdraw);
			for(drawit in headdraw){
				maxybbox=Math.max(headdraw[drawit]["points"]["y"],maxybbox)
				maxxbbox=Math.max(headdraw[drawit]["points"]["x"],maxxbbox)
				minxbbox=Math.min(headdraw[drawit]["points"]["x"],minxbbox)
				minybbox=Math.min(headdraw[drawit]["points"]["y"],minybbox)
			}
		}
		//canvas.closePath()
		if(!winkelhaken){
			if(!ot){
				if(!uselastresult){
					var insert=[pointarray[pointarray.length-2],pointarray[pointarray.length-1]]
					rotpoints2=rotateWedge(insert,localrot*-1,centerwholewedge)
					lines.push(rotpoints2)
				}								
				if (doNotDraw){
					wedgearray.push({"type":"M","points":{"x":rotpoints2[0]["x"],"y":rotpoints2[0]["y"]}})
					wedgearray.push({"type":"L","points":{"x":rotpoints2[1]["x"],"y":rotpoints2[1]["y"]}})
					maxxbbox=Math.max(rotpoints2[0]["x"],rotpoints2[1]["x"],maxxbbox)
					minxbbox=Math.min(rotpoints2[0]["x"],rotpoints2[1]["x"],minxbbox)
					maxybbox=Math.max(rotpoints2[0]["y"],rotpoints2[1]["y"],maxybbox)
					minybbox=Math.min(rotpoints2[0]["y"],rotpoints2[1]["y"],minybbox)
				}else {
					maxxglobalbbox=Math.max(rotpoints2[0]["x"],rotpoints2[1]["x"],maxxglobalbbox)
					minxglobalbbox=Math.min(rotpoints2[0]["x"],rotpoints2[1]["x"],minxglobalbbox)
					maxyglobalbbox=Math.max(rotpoints2[0]["y"],rotpoints2[1]["y"],maxyglobalbbox)
					minyglobalbbox=Math.min(rotpoints2[0]["y"],rotpoints2[1]["y"],minyglobalbbox)
					canvas.fillStyle = fillColor;
					canvas.fill();
					canvas.strokeStyle=strokeColor
					canvas.stroke();
					canvas.moveTo(rotpoints2[0]["x"],rotpoints2[0]["y"]);
					canvas.lineTo(rotpoints2[1]["x"],rotpoints2[1]["y"]); 
					canvas.strokeStyle=strokeColor
					canvas.stroke();
				}
			} 
			else {
				console.log("DRAW OT STROKE")
                console.log("Length: "+length)
                console.log("LineLength: "+lineLength)
                console.log("LineLengthScaled: "+lineLength*opentypescale)
                console.log("LineLengthTotal: "+((lineLength*opentypescale)+length))
                rotpoints2=rotateWedge([
				{"x":start-opentypestrokeWidth*2, "y":starty+(lineLength*opentypescale)},
				{"x":start-opentypestrokeWidth*2, "y":starty+(lineLength*opentypescale)+length},
				{"x":start+opentypestrokeWidth*2, "y":starty+(lineLength*opentypescale)+length},
				{"x":start+opentypestrokeWidth*2, "y":starty+(lineLength*opentypescale)},	
				{"x":start-opentypestrokeWidth*2, "y":starty+(lineLength*opentypescale)}				
				],localrot,centerwholewedge)			
				//console.log(rotpoints)		
			    canvas.moveTo(rotpoints2[0]["x"],rotpoints2[0]["y"]);
                canvas.lineTo(rotpoints2[1]["x"],rotpoints2[1]["y"]);
                canvas.lineTo(rotpoints2[2]["x"],rotpoints2[2]["y"]);
                canvas.lineTo(rotpoints2[3]["x"],rotpoints2[3]["y"]);
                canvas.lineTo(rotpoints2[4]["x"],rotpoints2[4]["y"]);
				canvas.stroke=strokeColor
			}
		}else{
			if(!ot && !doNotDraw){
				canvas.fillStyle = fillColor;
                canvas.fill();
				canvas.strokeStyle=strokeColor
				canvas.stroke();
			}
		}
}

function drawSeal(start,starty,canvas,strokeparse,big,keepconfig,half,filled,localrot,localmov,localscale){
	var seallength=wedgelength
	if(mirror){
		localrot+=180
		localrot=localrot%360
		start+=lineLength+wedgelength
	}
	if(rot!=0){
		localrot+=rot;
	}
	console.log(start+" - "+starty)
	if(localmov){
		start+=localmov[0]*seallength
		starty+=localmov[1]*seallength
	}
	if(smaller){
		seallength/=2;
	}
	if(big){
		seallength*=1.5;
	}
	console.log(start+" - "+starty)
	if(half){
		canvas.arc(start, starty, seallength, toRadians(localrot), toRadians(localrot)+Math.PI, false);
		var startcirc = Math.cos(toRadians(localrot)) * seallength;
		var endcirc = Math.cos(toRadians(localrot)+Math.PI) * seallength;
		canvas.moveTo(start+startcirc,starty+startcirc);
        canvas.lineTo(start+endcirc,starty+endcirc);
        canvas.lineTo(start,starty);
		canvas.stroke();
	}else{
		canvas.arc(start,starty,seallength,0,2*Math.PI,false);
		canvas.strokeStyle = strokeColor;
		canvas.stroke();
	}
	if(filled){
		canvas.fillStyle = fillColor;
		canvas.fill();
	}
    canvas.strokeStyle = strokeColor;
    canvas.stroke();
}

function clearCanvas(strokeParser){
    var c=document.getElementById("myCanvas");
    c.width = c.width;
	ctx2.clearRect(0,0,ctx2width,ctx2height);
	//document.getElementById("canvas").width=document.getElementById("canvas").width
    if(!strokeParser)
        document.getElementById('canvasinput').value=""
}

function showCharacter(character){
		console.log(document.getElementById('A_button').textContent)
        strokeParser(character,false,false)
        document.getElementById('canvasinput').value=character
}
