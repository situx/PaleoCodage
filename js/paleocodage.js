

function to_image(){
                var canvas = document.getElementById("myCanvas");
                document.getElementById("canvasImg").src = canvas.toDataURL();
                Canvas2Image.saveAsPNG(canvas);
                document.getElementById("canvasImg").style.visibility = 'hidden';
}

function createOpenTypeGlyph(charname,unicode,path){
	//console.log(path)
	path.stroke=strokeColor
	path.fill=fillColor
    return new opentype.Glyph({
        name: charname,
        unicode: unicode.replace("0x",""),
        advanceWidth: 650,
        path: path
    });
}

function rotateLineClockWise(center, edge, angle) {
    xRot = center["x"] + Math.cos(toRadians(angle)) * (edge["x"] - center["x"]) - Math.sin(toRadians(angle)) * (edge["y"] - center["y"]);
    yRot = center["y"] + Math.sin(toRadians(angle)) * (edge["x"] - center["x"]) + Math.cos(toRadians(angle)) * (edge["y"] - center["y"]);
    return {"x":xRot,"y":yRot}
}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {"x":nx, "y":ny};
}

function rotateHead(points,angle,center){
	var result=[]
	if(!center){
		center=getCenterHead(points)
	}
	for(point in points){
		result.push(rotateLineClockWise(center, points[point], angle))
	}
	return result;
}

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


function getCenterOfWedge(points){
	var minx=1000000,minxpoint,maxx=-10000,maxxpoint;
	for(point in points){
		if(points[point]["x"]<minx){
			minx=points[point]["x"]
			minxpoint=points[point]
		}
		if(points[point]["x"]>maxx){
			maxx=points[point]["x"]
			maxxpoint=points[point]
		}
	}
	return getCenter(minxpoint,maxxpoint)
}

function rotateWedgeEndPoint(begin,end,angle){
	var center=getCenter(begin,end)
	return [rotateLineClockWise(center,end,angle)]
}

function toRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function getCenterHead(origins) {
	cx=(origins[0]["x"]+origins[1]["x"]+origins[2]["x"])/3
	cy=(origins[0]["y"]+origins[1]["y"]+origins[2]["y"])/3
    return {"x":cx, "y":cy};
}

function getCenter(origin,endPoint) {
    return {"x":(origin["x"] + endPoint["x"]) / 2, "y":(origin["y"] + endPoint["y"]) / 2};
}


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

function changeStrokeColor(color,input){
	strokeColor=color; 
	console.log(color)
	strokeParser(input,false,false)
	var paths = document.querySelectorAll("path");
	for (i = 0; i < paths.length; ++i) {
		paths[i].setAttribute('stroke', strokeColor);
	}
}

function changeFillColor(color,input){
	fillColor=color; 
	console.log(color)
	strokeParser(input,false,false)
	var paths = document.querySelectorAll("path");
	for (i = 0; i < paths.length; ++i) {
		paths[i].setAttribute('fill', fillColor);
	}
}

  function convertToSubstitution(str,n){
        var ret=[]
        for(var i = 0, len = str.length; i < len; i += n) {
                ret.push(str.substr(i, n))
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

function createOpenFont(){
    var svglist=[]
	var codepointlist=[]
	var charnamelist=[]
	var paleocodelist=[]
	var counterr=0
	$('#glyphs').html("")
	$('.codebutton').each(function(i, obj) {
        paleocodelist.push($(this).text())
		var paleo=paleoCodageToSVG($(this).text(),counterr);
		var paleo=paleoCodageToOpenTypePath($(this).text())
		counterr++;
		//console.log(convertOutlineToType2({"outline":paleo}))
		//console.log(i+" - "+$('.svg:nth-child('+i+')'))
		console.log(paleo)
		//$('.svg:nth-child('+i+')' ).html(paleo)
		svglist.push(paleo)
	});
	$('.codepoint').each(function(i, obj) {
		codepointlist.push($(this).text())
	});
	$('.transliteration').each(function(i, obj) {
		charnamelist.push($(this).text())
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
	for(svg in svglist){
	    if(svg<charnamelist.length && svg<=codepointlist.length && svg<svglist.length){
			gly=createOpenTypeGlyph(charnamelist[svg],codepointlist[svg],svglist[svg])
			gly.path.fill=fillColor;
			gly.path.stroke=strokeColor;
            glyphs.push(gly)
			//console.log(gly)
            //opentype.gsub.add(charnamelist[svg])
        }
        console.log(coun++)
	}
    //glyphs.push(createOpenTypeGlyph([0],codepointlist[0],svglist[0]))
	//console.log(glyphs)
    font = new opentype.Font({familyName: 'OpenTypeSans', styleName: 'Medium', unitsPerEm: 1000, ascender: 800, descender: -200, glyphs: glyphs});
    console.log(font.toTables());
    for(svg in charnamelist){
        var sub=convertToSubstitution(charnamelist[svg].replace(" ","").toLowerCase())
        console.log(sub)
        //font.substitution.addLigature({ "sub": convertToSubstitution(charnamelist[svg].replace(" ","").toLowerCase()), "by": charnamelist[svg] })
    }
    console.log(font.substitution)
    var buffer = font.toArrayBuffer();
    var font2 = opentype.parse(buffer);

    document.getElementById('fontFamilyName').innerHTML = font2.names.fontFamily.en;
     for (var i = 0; i < font2.glyphs.length; i++) {
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
        //document.getElementById('jsonFont').innerHTML=stringify(font)
    clearCanvas();
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

function to_svg(){
	svg=ctx2.getSerializedSvg(true)
	saveTextAsFile(svg,".svg","graphic")
	paleoCodageToSVG($('#canvasinput').val());
}

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
	$('.codebutton').each(function(i, obj) {
		paleo=paleoCodageToSVG($(this).text());
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

var simplification={">(180)a":"!a","<(180)a":"!a",">(180)b":"!b","<(180)b":"!b",">(45)a":"f",">(90)a":"!b","s:":":s",":!":"!:","::::":";"}
var operatorToLocalRot={"a":0,"A":0,"b":90,"B":90,"c":45,"C":45,"d":135,"D":135,"e":225,"E":225,"f":315,"F":315,"w":90,"W":90,"x":0,"X":0,"y":-90,"Y":-90}
var operatorToPositioning={"a":[0,0],"A":[0,0],"b":[-0.3,0.3],"B":[-0.2,0.3],"c":[0,-0.3],"C":[0,-0.3],"d":[0,0.7],"D":[0,0.7],"e":[1,0.7],"E":[1,0.7],"f":[1,-0.3],"F":[1,-0.3],"w":[0,0.2],"W":[0,0.2],"x":[0.5,0.5],"X":[0.5,0.5],"y":[0.5,0.5],"Y":[0.5,0.5]}
var operatorToScaling={"a":1,"A":1,"b":1,"B":1,"c":1,"C":1,"d":1,"D":1,"e":1,"E":1,"f":1,"F":1,"w":2,"W":2,"x":0,"X":0,"y":0,"Y":0}
var curposx=30;
var curposy=30;
var currenthead=[{"type":"M","points":{"x":-5,"y":10}},{"type":"L","points":{"x":5,"y":10}},{"type":"L","points":{"x":0,"y":20}},{"type":"L","points":{"x":-5,"y":10}}]
var currentstroke=[{"type":"M","points":{"x":0,"y":0}},{"type":"L","points":{"x":0,"y":strokelength-wedgelength}}]
var startposy=0;
var startposx=0;
var charNameToPaleoCode={}
var paleoCodeToCharName={}
var strokelength=30;
var wedgelength=10;
var headdraw=[];
var multiplier=1.5;
var roundbracket=0
var bracket=false
var globalCenterPoint;
var rotationconstant=15
var bracketpositions=[]
var factorbracketpositions=[]
var charnamebuffer=""
var factorbuffer=""
var smallermultiplier=0.5
var rotmultiplier=5;
var rotpoints;
var rotpoints2;
var maxybbox=-1;
var maxypointbbox;
var maxxbbox=-1;
var maxxpointbbox;
var minybbox=1000000;
var minypointbbox;
var minxbbox=1000000;
var minxpointbbox;
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
var horizontalspaceop=0;
var verticalspaceop=0;
var font;
var rot=0;
var mirror=false;
var ctx2width=170
var ctx2height=80
var ctx3=new opentype.Path();
var ctx2 = new C2S(ctx2width,ctx2height);


function scalePointArray(pointarray,scalemultiplier,start,starty){
	for(p in pointarray){
		pointarray[p]["x"]*=scalemultiplier
		pointarray[p]["y"]*=scalemultiplier
		pointarray[p]["x"]+=start
		pointarray[p]["y"]+=starty
	}
	return pointarray;
}

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

function paleoCodageToOpenTypePath(paleoCode){
        //ot=true;
        ctx3=new opentype.Path();
        ctx3.stroke=strokeColor
		ctx3.fill=fillColor
        ctx3.strokeWidth=2
        strokeParser(paleoCode,true,false)
        //ot=false;
        return ctx3;
}

function paleoCodageToSVG(paleoCode,index){
	//console.log(paleoCode)
	strokeParser(paleoCode,false,false)
    //console.log(ctx2.getSerializedSvg())
	//ctx2.scale(10,10);
	console.log("PaleoCode: "+paleoCode)
	svghtml=ctx2.getSerializedSvg(true);
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
	//console.log(JSON.stringify(currenthead))
	if(!recursive){
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
		curposy=10;
        curposx=10;
		startposx=10;
		startposy=10;
    }else{
		startposx=curposx;
		startposy=curposy;
		recursiverotation=rotationcheck;	
	}
    for (var i = 0; i < input.length; i++) {	
		var isuppercase=(input.charAt(i) == input.charAt(i).toUpperCase())
		var onlyhead=(input.charAt(i)=="w" || input.charAt(i)=="W")
		//console.log(onlyhead)
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
                        console.log(rot)
                        horizontalspaceop=0;
                        verticalspaceop=0;
						scalemultiplier=1
						scalemultiplierForStrokeLength=1
						console.log(curposx+" - "+curposy)
						drawWedgeGeneric(curposx,curposy,ctx,true,isuppercase,true,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)],onlyhead,false);
						if(!recursiverotation){
                            console.log(curposx+" - "+curposy)
							drawWedgeGeneric(curposx,curposy,ctx2,true,isuppercase,true,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)],onlyhead,true);
							if(svgonly){
								scalemultiplier=15
								scalemultiplierForStrokeLength=scalemultiplier
								//mirror=!mirror
							}
							ot=true; mirror=!mirror;
							drawWedgeGeneric(curposx,curposy,ctx3,true,isuppercase,recursive,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)],onlyhead,false);
                            if(svgonly){
                                scalemultiplier=1
								scalemultiplierForStrokeLength=scalemultiplier
                            }
							ot=false;
                            if(!recursive){mirror=false;rot=0;}else{mirror=!mirror;}
                            
                        //}else{
                        }

                    }
                    break;
				case "x":
				case "X":
					drawSeal(curposx,curposy,ctx,true,isuppercase,false,false,true,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
					break;
				case "y":
				case "Y":
					drawSeal(curposx,curposy,ctx,true,isuppercase,false,true,false,operatorToLocalRot[input.charAt(i)],operatorToPositioning[input.charAt(i)],operatorToScaling[input.charAt(i)])
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
						curposy=startposy*scalemultiplier;
                    }
                        break;
                case "#":
                    if(bracket==0){
                        curposx+=5*scalemultiplier;
                        curposy=10*scalemultiplier;
                    }
                        break;
                case ":": 
                        console.log(verticalspaceop)
                        if(bracket==0){
                            scaleop=1;
                            curposy+=(7*scalemultiplier)*(verticalspaceop==0?1:verticalspaceop);
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
                    }
                        break;
				case "\"": 
                    if(bracket==0){
                        curposy=0*scalemultiplier;
                    }
                        break;
				case "~": 
                    if(bracket==0){
                        scaleop=1;
                        curposx-=10*scalemultiplier;
                        curposy=10*scalemultiplier;
                    }
                        break;
                case "/": 
                    if(bracket==0){
                        scaleop=1;
                        curposy+=3.5*scalemultiplier;
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
                    }
                        break;
                case ".": 
                    if(bracket==0){
                        scaleop=1;
                        curposy+=7*scalemultiplier;
                        curposx+=7*scalemultiplier;
                    }
                        break;
				case ">":
                    if(bracket==0){
				        rot-=rotationconstant;
                    }
                        break;
				case "<": 
						if(bracket==0){
                            rot+=rotationconstant;
                        }
                        break;
                case "\\": 
                    if(bracket==0){    
                        curposy+=7*scalemultiplier;
                        curposx-=7*scalemultiplier;
                    }
                        break;
                case ",": 
                        if(bracket==0){    
                            curposy-=7*scalemultiplier;
                            curposx-=7*scalemultiplier;
                        }
                        break;
                case "_": 
                    if(bracket==0){
                        scaleop=1;
                        curposx+=strokelength;
                        curposy=startposy*scalemultiplier;
                    }
                        break;
                case " ": 
                    if(bracket==0){
                        scaleop=1;
                        curposx+=1.5*strokelength*scalemultiplier;
                    }
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
						case "<":
							rot+=value
							break;
						case ">":
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
                            break;
                        case "-":
                            horizontalspaceop=0;
                            horizontalspaceop+=value;
                            console.log(horizontalspaceop)
                            console.log((10*scalemultiplier)*horizontalspaceop)
                            curposx+=(10*scalemultiplier)*horizontalspaceop;
                            curposy=startposy*scalemultiplier;
                            break;                        
                    }
					console.log(rot)
					factorbracketpositions[factorbracketpositions.length-1]["end"]=i+1;
                    roundbracket=false;
                    break;
                case "*":
                    if(bracket==0){
                        scaleop+=0.25
                    }
                        break;
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
                    bracket=false;
                    if(charnamebuffer in charNameToPaleoCode){
						if(rot!=0){
							//strokeParser(charNameToPaleoCode[charnamebuffer],svgonly,true,true)
							strokeParser(charNameToPaleoCode[charnamebuffer],svgonly,true,false)
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
                    break;
                default: 
        }
        if(bracket>0 && input.charAt(i)!="["){
            charnamebuffer+=input.charAt(i)
        }
		if(rotationcheck){
			var width=maxxbbox-minxbbox;
			var height=maxybbox-minybbox;
			var cx = (minxbbox+maxxbbox)/2
			var cy= (minybbox+maxybbox)/2
			globalCenterPoint={"x":cx,"y":cy}
		}else{
			maxxbbox=0
			minxbbox=1000000
			maxybbox=0
			minybbox=1000000
			globalCenterPoint=false
		}

        //console.log(input.charAt(i));
    }
}

function drawHead(points,canvas){
	if(recursiverotation){
		maxybbox=Math.max(points[0]["x"],points[1]["x"],points[2]["x"],points[3]["x"],maxybbox)
		maxxbbox=Math.max(points[0]["y"],points[1]["y"],points[2]["y"],points[3]["y"],maxxbbox)
		minybbox=Math.min(points[0]["x"],points[1]["x"],points[2]["x"],points[3]["x"],minybbox)
		minxbbox=Math.min(points[0]["y"],points[1]["y"],points[2]["y"],points[3]["y"],minxbbox)
	}else{
		for(drawit in points){
			if(points[drawit]["type"]=="M"){
				canvas.moveTo(points[drawit]["points"]["x"], points[drawit]["points"]["y"]);
			}else{
				canvas.lineTo(points[drawit]["points"]["x"], points[drawit]["points"]["y"]);
			}
		}
		/*canvas.moveTo(points[0]["x"], points[0]["y"]); // start at top left corner of canvas
		canvas.lineTo(points[1]["x"], points[1]["y"]); // go 200px to right (x), straight line from 0 to 0
		canvas.lineTo(points[2]["x"], points[2]["y"]); // go to horizontal 100 (x) and vertical 200 (y)
		canvas.lineTo(points[3]["x"], points[3]["y"]); */
	}
}

function getCoordinatesFromSVGPath(svgpath){
	result=[]
	points=svgpath.split(" ")
	newresult=null
	for(point in points){
		points[point]=points[point].trim();
		if(points[point].startsWith("Z")){
			continue;
		}
		if(points[point].startsWith("M") || points[point].startsWith("L")){
			if(newresult!=null){
				result.push(newresult)
			}
			newresult={type:points[point].substring(0,1),point:{"x":points[point].substring(1)}}
		}else{
			newresult["point"]["y"]=points[point]
		}
		console.log(points[point])
		console.log(points[point].split(" "))
	}
	result.push(newresult)
	return result;
}

function drawHeadArray(points,canvas){
	if(recursiverotation){
		maxybbox=Math.max(points[1],points[3],points[5],points[7],maxybbox)
		maxxbbox=Math.max(points[0],points[2],points[4],points[6],maxxbbox)
		minybbox=Math.min(points[1],points[3],points[5],points[7],minybbox)
		minxbbox=Math.min(points[0],points[2],points[4],points[6],minybbox)
	}else{
		canvas.moveTo(points[0], points[1]); // start at top left corner of canvas
		canvas.lineTo(points[2], points[3]); // go 200px to right (x), straight line from 0 to 0
		canvas.lineTo(points[4], points[5]); // go to horizontal 100 (x) and vertical 200 (y)
		canvas.lineTo(points[6], points[7]); 
	}
}

function drawWedgeGeneric(start,starty,canvas,strokeparse,big,keepconfig,localrot,localmov,localscale,onlyhead,uselastresult){
        if(strokeparse==false)
            curposx+=10
		pointarray=[]
		console.log(localrot)
        console.log(rot)
		if(mirror){
			localrot+=180
			localrot=parseInt(localrot)%360
			start+=lineLength+wedgelength
			console.log(localrot)
		}
		if(rot!=0){
			localrot=parseInt(localrot)+parseInt(rot);
		}
		console.log(rot)
		console.log(localrot)
		if(!keepconfig && smaller)
			smaller=false;
		if(!uselastresult || ot){
			if(big){
				length=multiplier*scalemultiplierForStrokeLength*strokelength*localscale;
				if(localmov){
					/*console.log(localmov[0])
					console.log(length)
					console.log(localmov[0]*length)
					console.log(start)*/
					start+=localmov[0]*length
					starty+=localmov[1]*length
					//console.log(start)
				}
				pointarray=[]
				for(point in currenthead){
					pointarray.push({"x":currenthead[point]["points"]["x"],"y":currenthead[point]["points"]["y"]})
				}
				pointarray=scalePointArray(pointarray,scalemultiplier,start,starty)
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier})
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier+length*scaleop})
			}else if(smaller){
				length=0.5*scalemultiplierForStrokeLength*strokelength*localscale;
				if(localmov){
					start+=localmov[0]*length
					starty+=localmov[1]*length
				}
				pointarray=[]
				for(point in currenthead){
					pointarray.push({"x":currenthead[point]["points"]["x"],"y":currenthead[point]["points"]["y"]})
				}
				pointarray=scalePointArray(pointarray,scalemultiplier,start,starty)
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier})
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier+length*scaleop})
				/*		pointarray=[{"x":start-5*scalemultiplier, "y":starty+15*scalemultiplier},
						   {"x":start+5*scalemultiplier, "y":starty+15*scalemultiplier},
						   {"x":start, "y":starty+20*scalemultiplier},
						   {"x":start-5*scalemultiplier, "y":starty+15*scalemultiplier},
						   {"x":start, "y":starty+lineLength*scalemultiplier},
						   {"x":start, "y":starty+lineLength*scalemultiplier+length*scaleop}]*/
			}else{
				length=scalemultiplierForStrokeLength*strokelength*localscale;
				if(localmov){
					start+=localmov[0]*length
					starty+=localmov[1]*length
				}
				//console.log(JSON.stringify(currenthead))
				pointarray=[]
				for(point in currenthead){
					//console.log(currenthead[point]["points"])
					pointarray.push({"x":currenthead[point]["points"]["x"],"y":currenthead[point]["points"]["y"]})
				}
				//console.log(JSON.stringify(pointarray))
				pointarray=scalePointArray(pointarray,scalemultiplier,start,starty)
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier})
				pointarray.push({"x":start, "y":starty+lineLength*scalemultiplier+length*scaleop})
				
				//console.log(JSON.stringify(pointarray))
				/*pointarray=[{"x":start-5*scalemultiplier, "y":starty+10*scalemultiplier},
						   {"x":start+5*scalemultiplier, "y":starty+10*scalemultiplier},
						   {"x":start, "y":starty+20*scalemultiplier},
						   {"x":start-5*scalemultiplier, "y":starty+10*scalemultiplier},
						   {"x":start, "y":starty+lineLength*scalemultiplier},
						   {"x":start, "y":starty+lineLength*scalemultiplier+length*scaleop}]*/
			}
			var centerwholewedge=getCenterOfWedge(pointarray)
			rotpoints=rotateHead(pointarray,localrot*-1,centerwholewedge)
			headdraw=[]
			for(rott in rotpoints){
				if(rott<currenthead.length)
					headdraw.push({"type":currenthead[rott]["type"],"points":rotpoints[rott]})
			}
		}
		//console.log(headdraw)
		drawHead(headdraw,canvas)
		//canvas.closePath()
		//console.log(ot)
		if(!onlyhead){
			if(!ot){
				canvas.fillStyle = fillColor;
                canvas.fill();
				canvas.strokeStyle=strokeColor
				canvas.stroke();
				if(!uselastresult){
					//currentstroke
					var insert=[pointarray[pointarray.length-2],pointarray[pointarray.length-1]]
					rotpoints2=rotateWedge(insert,localrot*-1,centerwholewedge)
				}				
				//console.log(rotpoints2)
				//console.log(rotpoints2[0]["x"]+" - "+rotpoints2[0]["y"])
				//console.log(rotpoints2[1]["x"]+" - "+rotpoints2[1]["y"])
				//console.log(centerwholewedge)
				if(recursiverotation){
					maxxbbox=Math.max(rotpoints2[0]["x"],rotpoints2[1]["x"],maxxbbox)
					minxbbox=Math.min(rotpoints2[0]["x"],rotpoints2[1]["x"],minxbbox)
					maxybbox=Math.max(rotpoints2[0]["y"],rotpoints2[1]["y"],maxybbox)
					minybbox=Math.min(rotpoints2[0]["y"],rotpoints2[1]["y"],minybbox)
				}else{
					canvas.moveTo(rotpoints2[0]["x"],rotpoints2[0]["y"]);
					canvas.lineTo(rotpoints2[1]["x"],rotpoints2[1]["y"]);
					canvas.strokeStyle=strokeColor
					canvas.stroke();
				}
			}else{
				rotpoints2=rotateWedge([
				{"x":start, "y":starty+lineLength*scalemultiplier-opentypestrokeWidth},
				{"x":start+length, "y":starty+lineLength*scalemultiplier-opentypestrokeWidth},
				{"x":start+length, "y":starty+lineLength*scalemultiplier+opentypestrokeWidth},
				{"x":start, "y":starty+lineLength*scalemultiplier+opentypestrokeWidth},	
				{"x":start, "y":starty+lineLength*scalemultiplier-opentypestrokeWidth}				
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
			if(!ot){
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
        strokeParser(character,false,false)
        document.getElementById('canvasinput').value=character
}
