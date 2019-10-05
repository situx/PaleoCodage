

function to_image(){
                var canvas = document.getElementById("myCanvas");
                document.getElementById("canvasImg").src = canvas.toDataURL();
                Canvas2Image.saveAsPNG(canvas);
                document.getElementById("canvasImg").style.visibility = 'hidden';
}

function createOpenTypeGlyph(charname,unicode,path){
    return new opentype.Glyph({
        name: charname,
        unicode: unicode.replace("0x",""),
        advanceWidth: 650,
        path: path
    });
}

function changeColors(colors){
	changeStrokeColor(colors.split(";")[0]);
	changeFillColor(colors.split(";")[1]);
	document.getElementById("strokeColor").value=colors.split(";")[0]
	document.getElementById("fillColor").value=colors.split(";")[1]
}

function changeStrokeColor(color){
	strokeColor=color; 
	console.log(color)
	strokeParser(document.getElementById('canvasinput').value)
}

function changeFillColor(color){
	fillColor=color; 
	console.log(color)
	strokeParser(document.getElementById('canvasinput').value)
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
	var counterr=0
	$('.codebutton').each(function(i, obj) {
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
	console.log(svglist)
	console.log(codepointlist)
	console.log(charnamelist)
	var glyphs=[]
	var coun=0
	for(svg in svglist){
	    if(svg<charnamelist.length && svg<=codepointlist.length && svg<svglist.length){
            glyphs.push(createOpenTypeGlyph(charnamelist[svg],codepointlist[svg],svglist[svg]))
            //opentype.gsub.add(charnamelist[svg])
        }
        console.log(coun++)
	}
    //glyphs.push(createOpenTypeGlyph([0],codepointlist[0],svglist[0]))
	console.log("Glyphs: "+glyphs)
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
        var ctx = createGlyphCanvas(glyph, 150);
        var x = 50;
        var y = 120;
        var fontSize = 72;
        glyph.draw(ctx, x, y, fontSize);
        glyph.drawPoints(ctx, x, y, fontSize);
        glyph.drawMetrics(ctx, x, y, fontSize);
    }
        //document.getElementById('jsonFont').innerHTML=stringify(font)
    clearCanvas();
}

    function createGlyphCanvas(glyph, size) {
        var canvasId, html, glyphsDiv, wrap, canvas, ctx;
        canvasId = 'c' + glyph.index;
        html = '<div class="wrapper" style="width:' + size + 'px"><canvas id="' + canvasId + '" width="' + size + '" height="' + size + '"></canvas><span>'+glyph.name+"[" + glyph.index+"]" + '</span></div>';
        glyphsDiv = document.getElementById('glyphs');
        wrap = document.createElement('div');
        wrap.innerHTML = html;
        glyphsDiv.appendChild(wrap);
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        return ctx;
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

var curposx=30;
var curposy=30;
var strokelength=30;
var wedgelength=10;
var multiplier=1.5;
var smallermultiplier=0.5
var rotmultiplier=5;
var scalemultiplier=1
var scalemultiplierForStrokeLength=1
var smaller=false;
var strokeColor="#000000"
var fillColor="#000000"
var lineLength=strokelength-wedgelength
var mirror=false;
var halfangle=false;
var opentypestrokeWidth=5
var ot=false;
var font;
var rot=0; mirror=false;
var ctx2width=170
var ctx2height=80
var ctx3=new opentype.Path();
var ctx2 = new C2S(ctx2width,ctx2height);


function paleoCodageToOpenTypePath(paleoCode){
        //ot=true;
        ctx3=new opentype.Path();
        ctx3.stroke="black"
        ctx3.strokeWidth=2
        strokeParser(paleoCode,true)
        //ot=false;
        return ctx3;
}

function paleoCodageToSVG(paleoCode,index){
	//console.log(paleoCode)
	strokeParser(paleoCode,false)
    //console.log(ctx2.getSerializedSvg())
	//ctx2.scale(10,10);
	svghtml=ctx2.getSerializedSvg();
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

//var canvasSVGContext = new CanvasSVG.Deferred();
//canvasSVGContext.wrapCanvas(document.getElementById("myCanvas"));
function strokeParser(input,svgonly){
    var ctx = document.getElementById("myCanvas").getContext("2d");
	clearCanvas(true);
    smaller=false;
    mirror=false;
    halfangle=false;
	curposy=10;
	curposx=10;
    for (var i = 0; i < input.length; i++) {	
        switch(input.charAt(i)){
                case "a":
					scalemultiplier=1
					scalemultiplierForStrokeLength=1
					drawVerticalLine(curposx,curposy,ctx,true,false,true);
					drawVerticalLine(curposx,curposy,ctx2,true,false,true);
					if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						//mirror=!mirror
					}
					ot=true; mirror=!mirror;
					drawVerticalLine(curposx,curposy,ctx3,true,false,false);
					ot=false;
					rot=0; mirror=false;
                    break;
                case "A":
					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
					drawVerticalLine(curposx,curposy,ctx,true,true,true);
					drawVerticalLine(curposx,curposy,ctx2,true,true,true);
                    if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						//mirror=!mirror
					}
					ot=true; mirror=!mirror;
					drawVerticalLine(curposx,curposy,ctx3,true,true,false);
					ot=false
					rot=0; mirror=false;
                    break;
                case "b":
					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
                        drawHorizontalLine(curposx,curposy,ctx,true,false,true);
						drawHorizontalLine(curposx,curposy,ctx2,true,false,true);
					if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						//mirror=!mirror
					}
						ot=true; //mirror=!mirror;
						drawHorizontalLine(curposx,curposy,ctx3,true,false,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "B":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawHorizontalLine(curposx,curposy,ctx,true,true,true);
					drawHorizontalLine(curposx,curposy,ctx2,true,true,true);
										if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						
					}
						ot=true; //mirror=!mirror;
						drawHorizontalLine(curposx,curposy,ctx3,true,true,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "c":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine1(curposx,curposy,ctx,false,true);
					drawDiagonalLine1(curposx,curposy,ctx2,false,true);
										if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine1(curposx,curposy,ctx3,false,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "C":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine1(curposx,curposy,ctx,true,true);
					drawDiagonalLine1(curposx,curposy,ctx2,true,true);
										if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine1(curposx,curposy,ctx3,true,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "d":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine2(curposx,curposy,ctx,false,true);
						drawDiagonalLine2(curposx,curposy,ctx2,false,true);
											if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine2(curposx,curposy,ctx3,false,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "D":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine2(curposx,curposy,ctx,true,true);
						drawDiagonalLine2(curposx,curposy,ctx2,true,true);
											if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine2(curposx,curposy,ctx3,true,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "e":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine3(curposx,curposy,ctx,false,true);
						drawDiagonalLine3(curposx,curposy,ctx2,false,true);
											if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine3(curposx,curposy,ctx3,false,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "E":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine3(curposx,curposy,ctx,true,true);
                        drawDiagonalLine3(curposx,curposy,ctx2,true,true);
										if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine3(curposx,curposy,ctx3,true,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "f":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine4(curposx,curposy,ctx,false,true);
						drawDiagonalLine4(curposx,curposy,ctx2,false,true);
											if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine4(curposx,curposy,ctx3,false,false);
						ot=false
						rot=0; mirror=false;
						break;
                case "F":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawDiagonalLine4(curposx,curposy,ctx,true,true);
						drawDiagonalLine4(curposx,curposy,ctx2,true,true);
											if(svgonly){
						scalemultiplier=10
						scalemultiplierForStrokeLength=0.25*scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawDiagonalLine4(curposx,curposy,ctx3,true,false);
						ot=false
						rot=0; mirror=false;
						break;
                case "s":
                        smaller=true;
                        break;
                case "w":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawWedge2(curposx,curposy,ctx,false);
						drawWedge2(curposx,curposy,ctx2,false);
											if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawWedge2(curposx,curposy,ctx3,false);
						ot=false
						rot=0; mirror=false;
                        break;
                case "W":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawWedge2(curposx,curposy,ctx,true);
						drawWedge2(curposx,curposy,ctx2,true);
											if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawWedge2(curposx,curposy,ctx3,true);
						ot=false
						rot=0; mirror=false;
                        break;
                case "w2":
                					scalemultiplier=1
                    scalemultiplierForStrokeLength=1
						drawWedge(curposx,curposy,ctx);
						drawWedge(curposx,curposy,ctx2);
											if(svgonly){
						scalemultiplier=15
						scalemultiplierForStrokeLength=scalemultiplier
						mirror=!mirror
					}
						ot=true; mirror=!mirror;
						drawWedge(curposx,curposy,ctx3);
						ot=false;
						rot=0; mirror=false;
                        break;
                case "-":
                        curposx+=10*scalemultiplier;
                        curposy=10*scalemultiplier;
                        break;
                case "#":
                        curposx+=5*scalemultiplier;
                        curposy=10*scalemultiplier;
                        break;
                case ":": curposy+=7*scalemultiplier;
                        break;
                case "!": //mirror character
                        mirror=true;
                        break;
                case "'": curposy=10*scalemultiplier;
                        break;
				case "\"": curposy=0*scalemultiplier;
                        break;
				case "~": curposx-=10*scalemultiplier;
                        curposy=10*scalemultiplier;
                        break;
                case "/": curposy+=3.5*scalemultiplier;
                    break;
                case "|": halfangle=true;
                        break;
                case ";": curposy+=strokelength;
                        break;
                case ".": curposy+=7*scalemultiplier;
                        curposx+=7*scalemultiplier;
                        break;
				case "<": 
				        rot--;
                        break;
				case ">": 
						rot++;
                        break;
                case "\\": curposy+=7*scalemultiplier;
                        curposx-=7*scalemultiplier;
                        break;
                case ",": curposy-=7*scalemultiplier;
                        curposx-=7*scalemultiplier;
                        break;
                case "_": curposx+=strokelength;
                        curposy=10*scalemultiplier;
                        break;
                case " ": curposx+=1.5*strokelength*scalemultiplier;
                        break;
                default: 
        }
        //console.log(input.charAt(i));
    }
}

function drawVerticalLine(start,starty,canvas,strokeparse,big,keepconfig){
        if(strokeparse==false)
            curposx+=10
        if(big){
            length=multiplier*scalemultiplierForStrokeLength*strokelength;
			console.log("LENGTH: "+length)
            if(mirror){
                        canvas.moveTo(start-5*scalemultiplier, starty+10*scalemultiplier+length); // start at top left corner of canvas
                        canvas.lineTo(start+5*scalemultiplier, starty+10*scalemultiplier+length); // go 200px to right (x), straight line from 0 to 0
                        canvas.lineTo(start, starty+length*scalemultiplier); // go to horizontal 100 (x) and vertical 200 (y)
						canvas.lineTo(start-5*scalemultiplier, starty+10*scalemultiplier+length); 
            }else{
                        canvas.moveTo(start-5*scalemultiplier, starty+10*scalemultiplier); // start at top left corner of canvas
                        canvas.lineTo(start+5*scalemultiplier, starty+10*scalemultiplier); // go 200px to right (x), straight line from 0 to 0
                        canvas.lineTo(start, starty+20*scalemultiplier); // go to horizontal 100 (x) and vertical 200 (y)
						canvas.lineTo(start-5*scalemultiplier, starty+10*scalemultiplier);
            }
             if(!ot)
                canvas.fill();
        }else if(smaller){
            length=0.5*scalemultiplierForStrokeLength*strokelength;
			console.log("LENGTH: "+length)
			if(!keepconfig)
				smaller=false;
            if(mirror){
                    canvas.moveTo(start-5*scalemultiplier, starty+5*scalemultiplier+length); // start at top left corner of canvas
                    canvas.lineTo(start+5*scalemultiplier, starty+5*scalemultiplier+length); // go 200px to right (x), straight line from 0 to 0
                    canvas.lineTo(start, starty+length*scalemultiplier); // go to horizontal 100 (x) and vertical 200 (y)
					canvas.lineTo(start-5*scalemultiplier, starty+5*scalemultiplier+length);
            }else{ 
                canvas.moveTo(start-5*scalemultiplier, starty+15*scalemultiplier); // start at top left corner of canvas
                canvas.lineTo(start+5*scalemultiplier, starty+15*scalemultiplier); // go 200px to right (x), straight line from 0 to 0
                canvas.lineTo(start, starty+20*scalemultiplier); // go to horizontal 100 (x) and vertical 200 (y)
				canvas.lineTo(start-5*scalemultiplier, starty+15*scalemultiplier);
            }
            if(!ot){
				canvas.fillStyle = fillColor;
                canvas.fill();
			}
        }else{
            length=scalemultiplierForStrokeLength*strokelength;
            if(mirror){
                        canvas.moveTo(start-5*scalemultiplier*1.5, starty+10*scalemultiplier*1.5+length); // start at top left corner of canvas
                        canvas.lineTo(start+5*scalemultiplier*1.5, starty+10*scalemultiplier*1.5+length); // go 200px to right (x), straight line from 0 to 0
                        canvas.lineTo(start, starty+10+length); // go to horizontal 100 (x) and vertical 200 (y)
						canvas.lineTo(start-5*scalemultiplier*1.5, starty+10*scalemultiplier*1.5+length)
            }else{
                        canvas.moveTo(start-5*scalemultiplier, starty+10*scalemultiplier); // start at top left corner of canvas
                        canvas.lineTo(start+5*scalemultiplier, starty+10*scalemultiplier); // go 200px to right (x), straight line from 0 to 0
                        canvas.lineTo(start, starty+20*scalemultiplier); // go to horizontal 100 (x) and vertical 200 (y)
						canvas.lineTo(start-5*scalemultiplier, starty+10*scalemultiplier)
            }
             if(!ot){
				canvas.fillStyle = fillColor;
                canvas.fill();
            }
        }
		
		
        if(mirror){
                     if(!ot){
                        canvas.moveTo(start,starty);
                        canvas.lineTo(start,starty+length);
						canvas.strokeStyle=strokeColor
                        canvas.stroke();
                    }else{
                                canvas.moveTo(start-opentypestrokeWidth,starty);
                                canvas.lineTo(start-opentypestrokeWidth,starty+length);
                                canvas.lineTo(start+opentypestrokeWidth,starty+lineLength*scalemultiplier+length);
                                canvas.lineTo(start+opentypestrokeWidth,starty+lineLength*scalemultiplier);
                                canvas.lineTo(start-opentypestrokeWidth,starty);
                    }
            if(!keepconfig)
				mirror=false;
        }else{

                     if(!ot){       
                        canvas.moveTo(start,starty+lineLength*scalemultiplier);
                        canvas.lineTo(start,starty+lineLength*scalemultiplier+length);
                        canvas.moveTo(start,starty+lineLength*scalemultiplier);
                        canvas.lineTo(start,starty+lineLength*scalemultiplier+length);
						canvas.strokeStyle=strokeColor
                        canvas.stroke();
                    }else{
                                canvas.moveTo(start-opentypestrokeWidth,starty+lineLength*scalemultiplier);
                                canvas.lineTo(start-opentypestrokeWidth,starty+lineLength*scalemultiplier+length);
                                canvas.lineTo(start+opentypestrokeWidth,starty+lineLength*scalemultiplier+length);
                                canvas.lineTo(start+opentypestrokeWidth,starty+lineLength*scalemultiplier);
                                canvas.lineTo(start-opentypestrokeWidth,starty+lineLength*scalemultiplier);
                    }
        }

}
function drawHorizontalLine(start,starty,canvas,strokeparse,big,keepconfig){
        if(strokeparse==false)
            curposy+=10
        if(big){
            length=multiplier*scalemultiplierForStrokeLength*strokelength;
            if(mirror){
                        canvas.moveTo(start+10*scalemultiplier+length, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
                        canvas.lineTo(start+10*scalemultiplier+length, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
                        canvas.lineTo(start+length, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
						canvas.lineTo(start+10*scalemultiplier+length, starty+15*scalemultiplier);
            }else{
                    canvas.moveTo(start-10*scalemultiplier, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
                    canvas.lineTo(start-10*scalemultiplier, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
                    canvas.lineTo(start, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
					canvas.lineTo(start-10*scalemultiplier, starty+15*scalemultiplier);
            }
             if(!ot){
				canvas.fillStyle = fillColor;
                canvas.fill(); // connect and fill
			 }
        }else if(smaller){
            length=smallermultiplier*scalemultiplierForStrokeLength*strokelength;
			if(!keepconfig)
				smaller=false;
            if(mirror){
                        canvas.moveTo(start+5*scalemultiplier+length, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
                        canvas.lineTo(start+5*scalemultiplier+length, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
                        canvas.lineTo(start+length, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
						canvas.lineTo(start+5*scalemultiplier+length, starty+15*scalemultiplier);
            }else{
                        canvas.moveTo(start-5*scalemultiplier, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
                        canvas.lineTo(start-5*scalemultiplier, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
                        canvas.lineTo(start, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
						canvas.lineTo(start-5*scalemultiplier, starty+15*scalemultiplier);
            }
            if(!ot){
				canvas.fillStyle = fillColor;
                canvas.fill(); // connect and fill
			}
        }else{
            length=scalemultiplierForStrokeLength*strokelength;
            if(mirror){
						canvas.moveTo(start+10*scalemultiplier+length, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
                        canvas.lineTo(start+10*scalemultiplier+length, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
                        canvas.lineTo(start+length, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
						canvas.lineTo(start+10*scalemultiplier+length, starty+15*scalemultiplier); 
            }else{
                        
						if(rot>0){
						   start2=start+Math.cos(rot)*length;
						   starty2=starty+Math.sin(rot)*length;
						   canvas.moveTo(start2-10, starty2+15); // pick up "pen," reposition at 300 (horiz), 0 (vert)
						   canvas.lineTo(start2-10, (starty+25)); // draw straight down (from 300,0) to 200px
                           canvas.lineTo(start2,(starty2+20)); // draw up toward right (100 half of 200)
						   canvas.lineTo(start2-10, starty2+15); 
						}else{
							canvas.moveTo(start-10*scalemultiplier, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
							canvas.lineTo(start-10*scalemultiplier, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
							canvas.lineTo(start, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
							canvas.lineTo(start-10*scalemultiplier, starty+15*scalemultiplier);
						}

            }
            if(!ot){
				canvas.fillStyle = fillColor;
                canvas.fill(); // connect and fill
			}
        }
        if(mirror){
                 if(!ot){
                    canvas.moveTo(start+length,starty+lineLength*scalemultiplier);
                    canvas.lineTo(start,starty+lineLength*scalemultiplier);
					canvas.strokeStyle=strokeColor
                    canvas.stroke();
                }else{
                                canvas.moveTo(start,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                                canvas.lineTo(start+length,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                                canvas.lineTo(start+length,starty+lineLength*scalemultiplier+opentypestrokeWidth);
                                canvas.lineTo(start,starty+lineLength*scalemultiplier+opentypestrokeWidth);
                                canvas.lineTo(start,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                    }
			if(!keepconfig)
				mirror=false;
        }else if(rot>0){
				console.log(rot)
				start2=start+Math.cos(rot)*length;
				starty2=starty+Math.sin(rot)*length;
				canvas.moveTo(start2,starty2+lineLength);
				canvas.lineTo(start2+Math.cos(rot)*length,starty2+lineLength+Math.sin(rot)*length*scalemultiplier);
                 if(!ot){
					canvas.fillStyle = fillColor;
                    canvas.stroke();
                }else{
                                canvas.moveTo(start+start2,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                                canvas.lineTo(start+length,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                                canvas.lineTo(start+length,starty+lineLength*scalemultiplier+opentypestrokeWidth);
                                canvas.lineTo(start,starty+lineLength*scalemultiplier+opentypestrokeWidth);
                                canvas.lineTo(start,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                    }
		}else{

                 if(!ot){
                        canvas.moveTo(start,starty+lineLength*scalemultiplier);
                        canvas.lineTo(start+length,starty+lineLength*scalemultiplier);
						canvas.strokeStyle=strokeColor
                        canvas.stroke();
                 }
                else{
                                canvas.moveTo(start,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                                canvas.lineTo(start+length,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                                canvas.lineTo(start+length,starty+lineLength*scalemultiplier+opentypestrokeWidth);
                                canvas.lineTo(start,starty+lineLength*scalemultiplier+opentypestrokeWidth);
                                canvas.lineTo(start,starty+lineLength*scalemultiplier-opentypestrokeWidth);
                    }
        }


}
function drawDiagonalLine1(start,starty,canvas,big,keepconfig){
        if(big){
            wlength=wedgelength
			if(halfangle)
                length=0.6*length
            length=multiplier*strokelength;
            canvas.moveTo(start+wlength-10*scalemultiplier, starty+wlength-10*scalemultiplier);
            canvas.lineTo(start+wlength-10*scalemultiplier, starty-10*scalemultiplier);
            canvas.lineTo(start-10, starty+wlength-10);
			canvas.lineTo(start+wlength-10*scalemultiplier, starty+wlength-10*scalemultiplier);
        }else if(smaller){
            length=smallermultiplier*strokelength;
            wlength=wedgelength-5
            canvas.moveTo(start+wlength-5*scalemultiplier, starty+wlength-5*scalemultiplier);
            canvas.lineTo(start+wlength-5*scalemultiplier, starty-5*scalemultiplier);
            canvas.lineTo(start-5*scalemultiplier, starty+wlength-5*scalemultiplier);
			canvas.lineTo(start+wlength-5*scalemultiplier, starty+wlength-5*scalemultiplier);
			if(!keepconfig)
				smaller=false;
        }else{
            length=scalemultiplierForStrokeLength*strokelength;
			wlength=wedgelength
            canvas.moveTo(start, starty);
            canvas.lineTo(start-wedgelength*scalemultiplier, starty);
            canvas.lineTo(start, starty-wedgelength*scalemultiplier);
			canvas.lineTo(start, starty);
        }
         if(!ot){
            canvas.fillStyle = fillColor;
            canvas.fill();
		 }
        canvas.moveTo(start,starty);
        if(halfangle){
                canvas.lineTo(start+length,starty+0.6*length);
        }else{
                canvas.lineTo(start+length*scalemultiplier,starty+length*scalemultiplier);
        }
         if(!ot){
			canvas.strokeStyle=strokeColor
            canvas.stroke();
        }else{
                canvas.moveTo(start,starty);
                canvas.lineTo(start-opentypestrokeWidth,starty-opentypestrokeWidth+lineLength*scalemultiplier);
                canvas.lineTo(start-opentypestrokeWidth,starty-opentypestrokeWidth+lineLength*scalemultiplier);
                canvas.lineTo(start-opentypestrokeWidth,starty-opentypestrokeWidth+lineLength*scalemultiplier+length);
        }
}

function drawDiagonalLine2(start,starty,canvas,big,keepconfig){
        if(big){
            length=multiplier*strokelength;
            if(halfangle)
                length=0.6*length
			canvas.moveTo(start, starty+length);
			canvas.lineTo(start, starty+length+10);
			canvas.lineTo(start-10, starty+length);
			canvas.lineTo(start, starty+length);
        }else if(smaller){
			length=smallermultiplier*strokelength;
            if(halfangle)
                length=0.6*length
			canvas.moveTo(start, starty+length);
			canvas.lineTo(start, starty+length+5);
			canvas.lineTo(start-5, starty+length);
			canvas.lineTo(start, starty+length);
			if(!keepconfig)
				smaller=false;
		}else{
             length=scalemultiplierForStrokeLength*strokelength;
             if(halfangle)
                length=0.6*length
			canvas.moveTo(start, starty+length);
			canvas.lineTo(start, starty+length+10);
			canvas.lineTo(start-10, starty+length);
			canvas.lineTo(start, starty+length);
        }
         if(!ot){
			canvas.fillStyle = fillColor;
            canvas.fill();
		 }
         if(!ot){
            canvas.moveTo(start+length*scalemultiplier,starty);
            canvas.lineTo(start,starty+length*scalemultiplier);
			canvas.strokeStyle=strokeColor
            canvas.stroke();
        }else{
            canvas.moveTo(start+length*scalemultiplier,starty);
            canvas.lineTo(start,starty+length*scalemultiplier);
        }
}

function drawDiagonalLine3(start,starty,canvas,big,keepconfig){
        if(big){
            length=multiplier*strokelength;
			canvas.moveTo(start+length,starty+length);
			canvas.lineTo(start+length+wedgelength, starty+length);
			canvas.lineTo(start+length, starty+length+wedgelength);
			canvas.lineTo(start+length,starty+length);
        }else if(smaller){
			length=smallermultiplier*strokelength;
			canvas.moveTo(start+length,starty+length);
			canvas.lineTo(start+length+wedgelength-5, starty+length);
			canvas.lineTo(start+length, starty+length+wedgelength-5);
			canvas.lineTo(start+length,starty+length);
			if(!keepconfig)
				smaller=false;
		}else{
            length=scalemultiplierForStrokeLength*strokelength;
			canvas.moveTo(start+length,starty+length);
			canvas.lineTo(start+length+wedgelength*scalemultiplier, starty+length);
			canvas.lineTo(start+length, starty+length+wedgelength*scalemultiplier);
			canvas.lineTo(start+length,starty+length);
        }
         if(!ot){
			canvas.fillStyle = fillColor;
            canvas.fill();
		 }
		canvas.moveTo(start,starty);
        canvas.lineTo(start+length,starty+length);
         if(!ot){
            canvas.moveTo(start,starty);
            canvas.lineTo(start+length,starty+length);
			canvas.strokeStyle=strokeColor
            canvas.stroke();
        }else{
            canvas.moveTo(start,starty);
            canvas.lineTo(start+length-opentypestrokeWidth,starty+length+opentypestrokeWidth);
            canvas.lineTo(start+length,starty+length);
            canvas.lineTo(start,starty);
        }
}

function drawDiagonalLine4(start,starty,canvas,big,keepconfig){
        if(big){
            length=multiplier*strokelength;
			canvas.moveTo(start+length,starty);
			canvas.lineTo(start+length, starty-wedgelength);
			canvas.lineTo(start+length+wedgelength, starty);
			canvas.lineTo(start+length,starty);
        }else if(smaller){
			length=smallermultiplier*strokelength;
			canvas.moveTo(start+length,starty);
			canvas.lineTo(start+length, starty-wedgelength+5);
			canvas.lineTo(start+length+wedgelength-5, starty);
			canvas.lineTo(start+length,starty);
			if(!keepconfig)
				smaller=false;
		}else{
            length=scalemultiplierForStrokeLength*strokelength;
			canvas.moveTo(start+length,starty);
			canvas.lineTo(start+length, starty-wedgelength);
			canvas.lineTo(start+length+wedgelength, starty);
			canvas.lineTo(start+length,starty);
        }
         if(!ot){
			canvas.fillStyle = fillColor;
            canvas.fill();
		 }
         if(!ot){
            canvas.moveTo(start+length*scalemultiplier,starty);
            canvas.lineTo(start,starty+length*scalemultiplier);
			canvas.strokeStyle=strokeColor
            canvas.stroke();
        }else{
            canvas.moveTo(start+length*scalemultiplier,starty);
            canvas.lineTo(start,starty+length*scalemultiplier);
        }
}

function clearCanvas(strokeParser){
    var c=document.getElementById("myCanvas");
    c.width = c.width;
	ctx2.clearRect(0,0,ctx2width,ctx2height);
	//document.getElementById("canvas").width=document.getElementById("canvas").width
    if(!strokeParser)
        document.getElementById('canvasinput').value=""
}



function drawWedge(start,starty,canvas){
        canvas.moveTo(start-10*scalemultiplier, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 0 (vert)
		canvas.lineTo(start-10*scalemultiplier, starty+25*scalemultiplier); // draw straight down (from 300,0) to 200px
		canvas.lineTo(start, starty+20*scalemultiplier); // draw up toward right (100 half of 200)
		canvas.lineTo(start-10*scalemultiplier, starty+15*scalemultiplier);
        if(!ot){
			canvas.strokeStyle=strokeColor
			canvas.stroke();
			canvas.fillStyle = fillColor;
            canvas.fill(); // connect and fill
		 }
}

function drawWedge2(start,starty,canvas,big){
    if(big){
        canvas.moveTo(start+10*scalemultiplier, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 200 (vert)
		canvas.lineTo(start+10*scalemultiplier, starty+30*scalemultiplier); // draw straight down by 200px (200 + 200)
		canvas.lineTo(start, starty+25*scalemultiplier); // draw up toward left (100 less than 300, so left)
		canvas.lineTo(start+10*scalemultiplier, starty+15*scalemultiplier);
    }else{
        canvas.moveTo(start+10*scalemultiplier, starty+15*scalemultiplier); // pick up "pen," reposition at 300 (horiz), 200 (vert)
		canvas.lineTo(start+10*scalemultiplier, starty+25*scalemultiplier); // draw straight down by 200px (200 + 200)
		canvas.lineTo(start, starty+20*scalemultiplier); // draw up toward left (100 less than 300, so left)
		canvas.lineTo(start+10*scalemultiplier, starty+15*scalemultiplier); 
    }
     if(!ot){
		canvas.strokeStyle=strokeColor
        canvas.stroke();
		canvas.fillStyle = fillColor;
        canvas.fill();
	 }
}

function showCharacter(character){
        strokeParser(character)
        document.getElementById('canvasinput').value=character
}
